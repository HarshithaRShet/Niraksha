import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import LocationModel, SensorDataModel
from ..schemas.schemas import LocationResponse, LocationDetailResponse, SensorDataResponse

router = APIRouter(prefix="/api/locations", tags=["Locations"])

def model_to_location_response(loc: LocationModel, db: Session) -> LocationResponse:
    # Get latest sensor data
    latest_sensor = (
        db.query(SensorDataModel)
        .filter(SensorDataModel.location_id == loc.id)
        .order_by(SensorDataModel.recorded_at.desc())
        .first()
    )

    rain_curr = latest_sensor.rainfall_24h_mm if latest_sensor else 0.0
    rain_7d = latest_sensor.rainfall_7d_cumulative_mm if latest_sensor else 0.0
    rain_fc = latest_sensor.forecast_rainfall_48h_mm if latest_sensor else 0.0
    moisture = latest_sensor.soil_moisture_pct if latest_sensor else 0.0

    v_villages = []
    try:
        v_villages = json.loads(loc.vulnerable_villages_json or "[]")
    except Exception:
        pass

    c_infra = []
    try:
        c_infra = json.loads(loc.critical_infrastructure_json or "[]")
    except Exception:
        pass

    return LocationResponse(
        id=loc.id,
        name=loc.name,
        district=loc.district,
        state=loc.state,
        lat=loc.lat,
        lng=loc.lng,
        elevation=loc.elevation,
        slope=loc.slope,
        road_name=loc.road_name,
        road_criticality=loc.road_criticality,
        exposed_population=loc.exposed_population,
        vulnerable_villages=v_villages,
        critical_infrastructure=c_infra,
        historical_events_count=loc.historical_events_count,
        current_risk_score=loc.current_risk_score,
        current_risk_level=loc.current_risk_level,
        verification_status=loc.verification_status,
        last_updated=loc.last_updated.strftime("%Y-%m-%d %H:%M IST") if loc.last_updated else "Live",
        rainfall_current_mm=round(rain_curr, 1),
        rainfall_7d_cumulative_mm=round(rain_7d, 1),
        forecast_rainfall_48h_mm=round(rain_fc, 1),
        soil_moisture_pct=round(moisture, 1)
    )

@router.get("", response_model=List[LocationResponse])
def get_all_locations(
    state: Optional[str] = Query(None, description="Filter by NER State e.g. Sikkim, Meghalaya"),
    risk_level: Optional[str] = Query(None, description="Filter by Risk Level e.g. CRITICAL, HIGH"),
    db: Session = Depends(get_db)
):
    query = db.query(LocationModel)
    if state:
        query = query.filter(LocationModel.state.ilike(f"%{state}%"))
    if risk_level:
        query = query.filter(LocationModel.current_risk_level == risk_level.upper())

    locations = query.order_by(LocationModel.current_risk_score.desc()).all()
    return [model_to_location_response(loc, db) for loc in locations]

@router.get("/{location_id}", response_model=LocationDetailResponse)
def get_location_details(location_id: str, db: Session = Depends(get_db)):
    loc = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found in database")

    base_resp = model_to_location_response(loc, db)

    recent_sensors = (
        db.query(SensorDataModel)
        .filter(SensorDataModel.location_id == location_id)
        .order_by(SensorDataModel.recorded_at.desc())
        .limit(10)
        .all()
    )

    sensor_resps = [
        SensorDataResponse(
            id=s.id,
            location_id=s.location_id,
            rainfall_24h_mm=s.rainfall_24h_mm,
            rainfall_7d_cumulative_mm=s.rainfall_7d_cumulative_mm,
            forecast_rainfall_48h_mm=s.forecast_rainfall_48h_mm,
            soil_moisture_pct=s.soil_moisture_pct,
            pore_water_pressure_kpa=s.pore_water_pressure_kpa,
            tilt_displacement_mm=s.tilt_displacement_mm,
            recorded_at=s.recorded_at
        )
        for s in recent_sensors
    ]

    return LocationDetailResponse(
        **base_resp.model_dump(),
        recent_sensor_readings=sensor_resps,
        latest_report_id=loc.reports[-1].id if loc.reports else None
    )
