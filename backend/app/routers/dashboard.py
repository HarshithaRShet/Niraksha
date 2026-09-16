from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.models import LocationModel, AlertModel
from ..schemas.schemas import DashboardMetricsResponse
from .locations import model_to_location_response

router = APIRouter(prefix="/api/dashboard", tags=["Command Dashboard"])

@router.get("", response_model=DashboardMetricsResponse)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    locations = db.query(LocationModel).all()
    alerts = db.query(AlertModel).all()

    crit_count = sum(1 for l in locations if l.current_risk_level == "CRITICAL")
    high_count = sum(1 for l in locations if l.current_risk_level == "HIGH")
    watch_count = sum(1 for l in locations if l.current_risk_level == "WATCH")
    low_count = sum(1 for l in locations if l.current_risk_level == "LOW")

    total_villages = sum(loc.vulnerable_villages_json.count(",") + 1 for loc in locations if loc.vulnerable_villages_json and loc.vulnerable_villages_json != "[]")
    unique_roads = len(set(loc.road_name for loc in locations))

    # Top 4 highest risk zones
    top_zones = sorted(locations, key=lambda l: l.current_risk_score, reverse=True)[:4]
    top_zone_resps = [model_to_location_response(z, db) for z in top_zones]

    # Realistic Hydrological Time Series (Past 24h)
    rainfall_trend = [
        {"time": "00:00", "avg_rainfall_mm": 24.5, "soil_saturation_pct": 58},
        {"time": "04:00", "avg_rainfall_mm": 42.0, "soil_saturation_pct": 65},
        {"time": "08:00", "avg_rainfall_mm": 78.5, "soil_saturation_pct": 74},
        {"time": "12:00", "avg_rainfall_mm": 112.0, "soil_saturation_pct": 86},
        {"time": "16:00", "avg_rainfall_mm": 145.2, "soil_saturation_pct": 92},
        {"time": "20:00", "avg_rainfall_mm": 138.0, "soil_saturation_pct": 89}
    ]

    # 6-Day Hazard Progression
    risk_trend = [
        {"day": "Mon (D-5)", "critical_count": 0, "high_count": 2, "alerts_issued": 1},
        {"day": "Tue (D-4)", "critical_count": 1, "high_count": 2, "alerts_issued": 2},
        {"day": "Wed (D-3)", "critical_count": 1, "high_count": 3, "alerts_issued": 2},
        {"day": "Thu (D-2)", "critical_count": 2, "high_count": 4, "alerts_issued": 4},
        {"day": "Fri (D-1)", "critical_count": 2, "high_count": 3, "alerts_issued": 3},
        {"day": "Today (Live)", "critical_count": crit_count, "high_count": high_count, "alerts_issued": len(alerts)}
    ]

    return DashboardMetricsResponse(
        total_monitored_zones=len(locations),
        risk_distribution={
            "critical": crit_count,
            "high": high_count,
            "watch": watch_count,
            "low": low_count
        },
        active_warnings_count=len(alerts),
        vulnerable_villages_count=total_villages,
        vulnerable_roads_count=unique_roads,
        highest_risk_zones=top_zone_resps,
        rainfall_trend=rainfall_trend,
        risk_trend=risk_trend
    )
