import json
import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import LocationModel, SensorDataModel, RiskPredictionModel
from ..schemas.schemas import RiskPredictRequest, RiskPredictResponse
from ..services.risk_engine import default_risk_engine, RiskInput, GroundEvidence as ServiceGroundEvidence

router = APIRouter(prefix="/api/risk", tags=["Risk Engine"])

@router.get("", response_model=List[dict])
def get_all_risk_summaries(db: Session = Depends(get_db)):
    """Returns composite risk evaluations across all monitored corridors."""
    locations = db.query(LocationModel).order_by(LocationModel.current_risk_score.desc()).all()
    results = []
    for loc in locations:
        results.append({
            "location_id": loc.id,
            "location_name": loc.name,
            "state": loc.state,
            "current_risk_score": loc.current_risk_score,
            "current_risk_level": loc.current_risk_level,
            "slope": loc.slope,
            "exposed_population": loc.exposed_population,
            "road_name": loc.road_name,
            "verification_status": loc.verification_status,
            "last_updated": loc.last_updated.strftime("%Y-%m-%d %H:%M IST") if loc.last_updated else "Live"
        })
    return results

@router.get("/{location_id}", response_model=RiskPredictResponse)
def get_location_risk(location_id: str, db: Session = Depends(get_db)):
    """
    Evaluates or retrieves the live calibrated risk prediction for a specific location.
    Pulls real-time sensor measurements from the database to run the explainable scoring engine.
    """
    loc = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location {location_id} not found")

    sensor = (
        db.query(SensorDataModel)
        .filter(SensorDataModel.location_id == location_id)
        .order_by(SensorDataModel.recorded_at.desc())
        .first()
    )

    ev = None
    if loc.reports:
        latest_rep = loc.reports[-1]
        ev = ServiceGroundEvidence(
            cracks=latest_rep.cracks,
            soil_movement=latest_rep.soil_movement,
            debris=latest_rep.debris,
            road_blockage=latest_rep.road_blockage
        )

    risk_inp = RiskInput(
        rainfall=sensor.rainfall_24h_mm if sensor else 50.0,
        soil_moisture=sensor.soil_moisture_pct if sensor else 60.0,
        slope=loc.slope,
        historical_events=loc.historical_events_count,
        forecast_rainfall=sensor.forecast_rainfall_48h_mm if sensor else 40.0,
        ground_evidence=ev
    )

    pred = default_risk_engine.calculate_risk(risk_inp)
    return RiskPredictResponse(
        risk_score=pred.risk_score,
        probability=pred.probability,
        risk_level=pred.risk_level,
        confidence=pred.confidence,
        contributing_factors=pred.contributing_factors,
        calibrated_by="NIR-RAKSHA Prototype Risk Engine (XGBoost Contract)",
        timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    )

@router.post("/predict", response_model=RiskPredictResponse)
def predict_custom_risk(req: RiskPredictRequest, db: Session = Depends(get_db)):
    """
    Simulates or recalibrates risk using custom or field-adjusted parameters.
    If location_id is provided, automatically records the prediction in the audit table and updates the location's score.
    """
    ev = None
    if req.ground_evidence:
        ev = ServiceGroundEvidence(
            cracks=req.ground_evidence.cracks,
            soil_movement=req.ground_evidence.soil_movement,
            debris=req.ground_evidence.debris,
            road_blockage=req.ground_evidence.road_blockage
        )

    risk_inp = RiskInput(
        rainfall=req.rainfall,
        soil_moisture=req.soil_moisture,
        slope=req.slope,
        historical_events=req.historical_events,
        forecast_rainfall=req.forecast_rainfall,
        ground_evidence=ev
    )

    result = default_risk_engine.calculate_risk(risk_inp)

    # If linked to an existing location, update its current status
    if req.location_id:
        loc = db.query(LocationModel).filter(LocationModel.id == req.location_id).first()
        if loc:
            loc.current_risk_score = result.risk_score
            loc.current_risk_level = result.risk_level
            loc.last_updated = datetime.datetime.utcnow()

            # Record in risk_predictions table
            pred_id = f"PRED-{uuid.uuid4().hex[:8].upper()}"
            pred_record = RiskPredictionModel(
                id=pred_id,
                location_id=loc.id,
                risk_score=result.risk_score,
                probability=result.probability,
                risk_level=result.risk_level,
                confidence=result.confidence,
                contributing_factors_json=json.dumps(result.contributing_factors),
                calibrated_by="NIR-RAKSHA Prototype Risk Engine (XGBoost Contract)",
                predicted_at=datetime.datetime.utcnow()
            )
            db.add(pred_record)
            db.commit()

    return RiskPredictResponse(
        risk_score=result.risk_score,
        probability=result.probability,
        risk_level=result.risk_level,
        confidence=result.confidence,
        contributing_factors=result.contributing_factors,
        calibrated_by="NIR-RAKSHA Prototype Risk Engine (XGBoost Contract)",
        timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    )
