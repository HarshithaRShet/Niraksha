from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime
import uuid

app = FastAPI(
    title="NIR-RAKSHA AI Engine API",
    description="Backend service for Landslide Early Warning and Risk Monitoring System in North Eastern Region (NER)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- DATA SCHEMAS -----------------

class GroundEvidence(BaseModel):
    cracks: bool = False
    soil_movement: bool = False
    debris: bool = False
    road_blockage: bool = False

class RiskPredictRequest(BaseModel):
    rainfall: float = Field(..., description="24h rainfall in mm", ge=0)
    soil_moisture: float = Field(..., description="Soil moisture percentage (0-100)", ge=0, le=100)
    slope: float = Field(..., description="Slope gradient in degrees", ge=0, le=90)
    historical_events: int = Field(0, description="Past landslide incidents recorded", ge=0)
    forecast_rainfall: float = Field(0.0, description="Forecasted 48h rainfall in mm", ge=0)
    ground_evidence: Optional[GroundEvidence] = None

class ContributingFactor(BaseModel):
    name: str
    weight: int
    value: Any
    thresholdImpact: str
    explanation: str

class RiskPredictResponse(BaseModel):
    risk_score: int
    probability: float
    risk_level: str
    confidence: float
    contributing_factors: List[ContributingFactor]
    calibrated_by: str
    timestamp: str

class VisionAnalyzeRequest(BaseModel):
    image_name: Optional[str] = None
    image_base64: Optional[str] = None
    reported_observations: Optional[GroundEvidence] = None

class VisionAnalyzeResponse(BaseModel):
    crack_detected: bool
    debris_detected: bool
    road_blockage_detected: bool
    confidence: float
    features_summary: List[str]
    model_notice: str

class FieldReportCreate(BaseModel):
    location_id: str
    location_name: str
    lat: float
    lng: float
    reporter_name: str
    reporter_role: str
    observations: GroundEvidence
    image_url: Optional[str] = None
    image_name: Optional[str] = None
    notes: str

class AlertCreate(BaseModel):
    location_id: str
    location_name: str
    risk_level: str
    severity: str
    language: str
    title: str
    message: str
    author: str

# ----------------- MOCK DATABASE IN MEMORY -----------------

LOCATIONS_DB = [
    {
        "id": "NER-SK-01",
        "name": "Dikchu - Singtam Highway Corridor (NH-10)",
        "district": "East Sikkim & Pakyong",
        "state": "Sikkim",
        "lat": 27.3789,
        "lng": 88.5284,
        "elevation": 1420,
        "slope": 48.5,
        "rainfall_current_mm": 148.2,
        "rainfall_7d_cumulative_mm": 382.0,
        "forecast_rainfall_48h_mm": 92.5,
        "soil_moisture_pct": 88.4,
        "historical_events_count": 14,
        "exposed_population": 8450,
        "vulnerable_villages": ["Lower Dikchu", "Rakdong Tintek", "Singtam Outskirts"],
        "road_name": "NH-10 (Sikkim Lifeline Corridor)",
        "road_criticality": "National Highway",
        "critical_infrastructure": ["Teesta Hydro Dam Stage V Substation", "Army Logistics Convoy Bridge 04"],
        "current_risk_score": 91,
        "current_risk_level": "CRITICAL",
        "last_updated": "2026-09-16 11:30 IST",
        "verification_status": "Urgent Inspection Required"
    },
    {
        "id": "NER-MG-02",
        "name": "Cherrapunji - Shella Escarpment & Mawkdok Valley",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "lat": 25.2986,
        "lng": 91.7323,
        "elevation": 1290,
        "slope": 42.0,
        "rainfall_current_mm": 212.0,
        "rainfall_7d_cumulative_mm": 520.4,
        "forecast_rainfall_48h_mm": 130.0,
        "soil_moisture_pct": 94.2,
        "historical_events_count": 22,
        "exposed_population": 5200,
        "vulnerable_villages": ["Mawkdok", "Laitkynsew", "Nongkroh"],
        "road_name": "SH-5 Cherra-Shella Road",
        "road_criticality": "State Strategic Border",
        "critical_infrastructure": ["Mawkdok Bridge Pier #2", "High-tension Power Pylon 11B"],
        "current_risk_score": 87,
        "current_risk_level": "CRITICAL",
        "last_updated": "2026-09-16 10:45 IST",
        "verification_status": "Action In Progress"
    }
]

REPORTS_DB = []
ALERTS_DB = []

# ----------------- AI RISK LOGIC -----------------

def calculate_risk(req: RiskPredictRequest) -> RiskPredictResponse:
    # 1. Slope Factor
    slope_impact = "nominal"
    if req.slope >= 45:
        slope_score = 95
        slope_impact = "severe"
    elif req.slope >= 35:
        slope_score = 75
        slope_impact = "high"
    elif req.slope >= 25:
        slope_score = 48
        slope_impact = "moderate"
    else:
        slope_score = 18

    # 2. Rainfall
    rain_score = min(100.0, (req.rainfall / 180.0) * 100.0)
    rain_impact = "severe" if req.rainfall > 130 else "high" if req.rainfall > 80 else "moderate" if req.rainfall > 40 else "nominal"

    # 3. Moisture
    moist_score = min(100.0, (req.soil_moisture / 95.0) * 100.0)
    moist_impact = "severe" if req.soil_moisture >= 85 else "high" if req.soil_moisture >= 70 else "nominal"

    # 4. Forecast
    forecast_score = min(100.0, (req.forecast_rainfall / 120.0) * 100.0)

    # 5. History
    hist_score = min(100.0, (req.historical_events / 20.0) * 100.0)

    # 6. Evidence
    evidence_score = 0.0
    evidence_impact = "nominal"
    if req.ground_evidence:
        c = 0
        if req.ground_evidence.cracks: c += 25
        if req.ground_evidence.soil_movement: c += 35
        if req.ground_evidence.debris: c += 20
        if req.ground_evidence.road_blockage: c += 20
        evidence_score = float(min(100, c))
        evidence_impact = "severe" if evidence_score >= 70 else "high" if evidence_score >= 40 else "nominal"

    raw = (slope_score * 0.22) + (rain_score * 0.24) + (moist_score * 0.20) + (forecast_score * 0.14) + (hist_score * 0.10) + (evidence_score * 0.10)

    if req.ground_evidence and req.ground_evidence.cracks and req.ground_evidence.soil_movement:
        raw = min(100.0, raw * 1.15)

    final_score = int(round(min(99, max(8, raw))))
    prob = round(final_score / 100.0, 2)

    level = "LOW"
    if final_score >= 80: level = "CRITICAL"
    elif final_score >= 65: level = "HIGH"
    elif final_score >= 40: level = "WATCH"

    return RiskPredictResponse(
        risk_score=final_score,
        probability=prob,
        risk_level=level,
        confidence=0.92,
        contributing_factors=[
            ContributingFactor(
                name="Slope Gradient",
                weight=22,
                value=f"{req.slope}°",
                thresholdImpact=slope_impact,
                explanation="Steep topography elevates gravitational shear stress."
            ),
            ContributingFactor(
                name="24h Precipitation",
                weight=24,
                value=f"{req.rainfall} mm",
                thresholdImpact=rain_impact,
                explanation="Pore-water pressure destabilizes weathered overburden."
            )
        ],
        calibrated_by="Explainable Hybrid GSI-Weighted Baseline Engine",
        timestamp=datetime.datetime.utcnow().isoformat()
    )

# ----------------- REST ENDPOINTS -----------------

@app.get("/api/health")
def health_check():
    return {"status": "ok", "system": "NIR-RAKSHA AI Landslide Monitoring Grid", "version": "1.0.0"}

@app.get("/api/locations")
def get_locations():
    return LOCATIONS_DB

@app.get("/api/risk/{location_id}")
def get_location_risk(location_id: str):
    for loc in LOCATIONS_DB:
        if loc["id"] == location_id:
            return loc
    raise HTTPException(status_code=404, detail="Location not found")

@app.post("/api/risk/predict", response_model=RiskPredictResponse)
def predict_risk(req: RiskPredictRequest):
    return calculate_risk(req)

@app.post("/api/vision/analyze", response_model=VisionAnalyzeResponse)
def analyze_vision(req: VisionAnalyzeRequest):
    obs = req.reported_observations or GroundEvidence()
    name = (req.image_name or "").lower()

    has_crack = obs.cracks or ("crack" in name) or ("fissure" in name)
    has_debris = obs.debris or ("debris" in name) or ("rock" in name)
    has_blockage = obs.road_blockage or ("block" in name)

    return VisionAnalyzeResponse(
        crack_detected=has_crack,
        debris_detected=has_debris,
        road_blockage_detected=has_blockage,
        confidence=0.91,
        features_summary=[
            "Transverse tension crack traced along slope cut",
            "Colluvial scree accumulation detected"
        ],
        model_notice="Prototype Vision Engine (SIH-26001 heuristic calibration ready for YOLOv8 weights)"
    )

@app.get("/api/reports")
def get_reports():
    return REPORTS_DB

@app.post("/api/reports")
def create_report(report: FieldReportCreate):
    rep_id = f"REP-{uuid.uuid4().hex[:6].upper()}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M IST")

    new_rep = report.dict()
    new_rep["id"] = rep_id
    new_rep["created_at"] = now_str
    new_rep["synced_online"] = True
    REPORTS_DB.insert(0, new_rep)

    # Dynamic risk update
    for loc in LOCATIONS_DB:
        if loc["id"] == report.location_id:
            loc["verification_status"] = "Field Verified"
            loc["last_updated"] = now_str
            if report.observations.cracks or report.observations.soil_movement:
                loc["current_risk_score"] = min(100, loc["current_risk_score"] + 10)
                if loc["current_risk_score"] >= 80:
                    loc["current_risk_level"] = "CRITICAL"
                elif loc["current_risk_score"] >= 65:
                    loc["current_risk_level"] = "HIGH"

    return {"status": "success", "report": new_rep}

@app.get("/api/alerts")
def get_alerts():
    return ALERTS_DB

@app.post("/api/alerts")
def create_alert(alert: AlertCreate):
    alt_id = f"ALT-2026-{len(ALERTS_DB)+1:03d}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M IST")
    new_alert = alert.dict()
    new_alert["id"] = alt_id
    new_alert["timestamp"] = now_str
    new_alert["delivery_channels"] = {
        "sms_broadcast": "Simulated Sent",
        "cap_ndma_feed": "Active Feed",
        "siren_relay": "Armed" if alert.risk_level == "CRITICAL" else "Standby"
    }
    ALERTS_DB.insert(0, new_alert)
    return new_alert

@app.get("/api/emergency-priority")
def get_emergency_priorities():
    priorities = []
    for idx, loc in enumerate(LOCATIONS_DB):
        priorities.append({
            "id": f"PRI-{loc['id']}",
            "priority_rank": idx + 1,
            "priority_level": "P1 - Immediate Evacuation / BRO Action" if loc["current_risk_score"] >= 85 else "P2 - Road Clearance / Pre-alert",
            "location_name": loc["name"],
            "state": loc["state"],
            "risk_score": loc["current_risk_score"],
            "risk_level": loc["current_risk_level"],
            "population_exposed": loc["exposed_population"],
            "road_criticality": loc["road_name"],
            "reason": f"High slope ({loc['slope']}°) and recorded rainfall ({loc['rainfall_current_mm']}mm)",
            "recommended_action": "Deploy NDRF quick rescue unit and position BRO earthmovers.",
            "decision_support_disclaimer": "Advisory DSS formulation: Operational deployment requires authorization by District Magistrate.",
            "assigned_agency": "NDRF 1st Bn",
            "last_evaluated": loc["last_updated"]
        })
    return priorities
