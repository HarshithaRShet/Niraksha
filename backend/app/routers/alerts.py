import uuid
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import AlertModel, LocationModel
from ..schemas.schemas import AlertCreate, AlertResponse, AlertDeliveryChannels
from ..services.alert_service import AlertService

router = APIRouter(prefix="/api/alerts", tags=["Disaster Alerts"])

def model_to_alert_response(alt: AlertModel) -> AlertResponse:
    loc_name = alt.location.name if alt.location else alt.location_id
    state = alt.location.state if alt.location else ""
    full_loc = f"{loc_name}, {state}" if state else loc_name

    return AlertResponse(
        id=alt.id,
        location_id=alt.location_id,
        location_name=full_loc,
        risk_level=alt.risk_level,
        severity=alt.severity,
        language=alt.language,
        title=alt.title,
        message=alt.message,
        timestamp=alt.created_at.strftime("%Y-%m-%d %H:%M IST") if alt.created_at else "Live",
        delivery_channels=AlertDeliveryChannels(
            sms_broadcast=alt.sms_status or "Simulated Sent",
            cap_ndma_feed=alt.cap_feed_status or "NDMA CAP v1.2 Live",
            siren_relay=alt.siren_status or "Standby"
        ),
        author=alt.author or "State Emergency Operations Centre (SEOC)"
    )

@router.get("", response_model=List[AlertResponse])
def get_all_alerts(db: Session = Depends(get_db)):
    alerts = db.query(AlertModel).order_by(AlertModel.created_at.desc()).all()
    return [model_to_alert_response(a) for a in alerts]

@router.post("", response_model=AlertResponse)
def create_disaster_alert(req: AlertCreate, db: Session = Depends(get_db)):
    loc = db.query(LocationModel).filter(LocationModel.id == req.location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{req.location_id}' not found")

    alt_id = f"ALT-{datetime.datetime.utcnow().year}-{uuid.uuid4().hex[:3].upper()}"

    # Auto-format vernacular message if blank or custom
    title = req.title
    message = req.message
    if not title or not message:
        tmpl = AlertService.get_vernacular_template(
            language=req.language,
            risk_level=req.risk_level,
            location_name=loc.name,
            rainfall=120.0
        )
        title = title or tmpl["title"]
        message = message or tmpl["body"]

    sms_status = f"Broadcasted to {loc.exposed_population:,} Local SIMs" if loc.exposed_population else "Simulated Sent"
    siren_status = "Armed & Triggered" if req.risk_level.value == "CRITICAL" else "Standby"

    new_alert = AlertModel(
        id=alt_id,
        location_id=loc.id,
        risk_level=req.risk_level.value,
        severity=req.severity,
        language=req.language.value,
        title=title,
        message=message,
        author=req.author,
        sms_status=sms_status,
        cap_feed_status="NDMA CAP v1.2 Active Relay",
        siren_status=siren_status,
        created_at=datetime.datetime.utcnow()
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return model_to_alert_response(new_alert)
