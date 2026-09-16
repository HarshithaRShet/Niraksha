import json
import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import FieldReportModel, LocationModel
from ..schemas.schemas import (
    FieldReportCreate,
    FieldReportResponse,
    GroundEvidence,
    VisionAnalyzeRequest
)
from ..services.vision_service import VisionService

router = APIRouter(prefix="/api/reports", tags=["Field Verification"])

def model_to_report_response(rep: FieldReportModel) -> FieldReportResponse:
    v_analysis = None
    if rep.vision_analysis_json:
        try:
            v_analysis = json.loads(rep.vision_analysis_json)
        except Exception:
            pass

    return FieldReportResponse(
        id=rep.id,
        location_id=rep.location_id,
        location_name=rep.location.name if rep.location else rep.location_id,
        reporter_name=rep.reporter_name,
        reporter_role=rep.reporter_role,
        lat=rep.lat,
        lng=rep.lng,
        observations=GroundEvidence(
            cracks=rep.cracks,
            soil_movement=rep.soil_movement,
            debris=rep.debris,
            road_blockage=rep.road_blockage
        ),
        image_url=rep.image_url,
        image_name=rep.image_name,
        vision_analysis=v_analysis,
        notes=rep.notes,
        risk_adjusted_delta=rep.risk_adjusted_delta,
        synced_online=rep.synced_online,
        created_at=rep.created_at.strftime("%Y-%m-%d %H:%M IST") if rep.created_at else "Live"
    )

@router.get("", response_model=List[FieldReportResponse])
def get_all_reports(db: Session = Depends(get_db)):
    reports = db.query(FieldReportModel).order_by(FieldReportModel.created_at.desc()).all()
    return [model_to_report_response(r) for r in reports]

@router.post("", response_model=FieldReportResponse)
def create_field_report(req: FieldReportCreate, db: Session = Depends(get_db)):
    loc = db.query(LocationModel).filter(LocationModel.id == req.location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Target location '{req.location_id}' not found")

    rep_id = f"REP-{datetime.datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"

    # Calculate dynamic risk delta
    delta = 0
    if req.observations.cracks: delta += 4
    if req.observations.soil_movement: delta += 5
    if req.observations.debris: delta += 3
    if req.observations.road_blockage: delta += 3

    # If photo provided, analyze with VisionService
    vision_result = None
    if req.image_url or req.image_name:
        v_req = VisionAnalyzeRequest(
            image_name=req.image_name,
            image_url=req.image_url,
            reported_observations=req.observations
        )
        vision_analysis = VisionService.analyze_evidence_image(v_req)
        vision_result = vision_analysis.model_dump()
        if vision_analysis.crack_detected:
            delta += 2

    new_report = FieldReportModel(
        id=rep_id,
        location_id=req.location_id,
        reporter_name=req.reporter_name,
        reporter_role=req.reporter_role,
        lat=req.lat,
        lng=req.lng,
        cracks=req.observations.cracks,
        soil_movement=req.observations.soil_movement,
        debris=req.observations.debris,
        road_blockage=req.observations.road_blockage,
        image_url=req.image_url,
        image_name=req.image_name,
        vision_analysis_json=json.dumps(vision_result) if vision_result else None,
        notes=req.notes,
        risk_adjusted_delta=delta,
        synced_online=True,
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_report)

    # Dynamic risk recalculation on Location
    loc.verification_status = "Field Verified"
    loc.last_updated = datetime.datetime.utcnow()
    loc.current_risk_score = min(99, loc.current_risk_score + delta)
    if loc.current_risk_score >= 80:
        loc.current_risk_level = "CRITICAL"
    elif loc.current_risk_score >= 65:
        loc.current_risk_level = "HIGH"
    elif loc.current_risk_score >= 40:
        loc.current_risk_level = "WATCH"

    db.commit()
    db.refresh(new_report)

    return model_to_report_response(new_report)
