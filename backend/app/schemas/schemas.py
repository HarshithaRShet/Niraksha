from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from enum import Enum
import datetime

class RiskLevelEnum(str, Enum):
    LOW = "LOW"
    WATCH = "WATCH"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RoadCriticalityEnum(str, Enum):
    NATIONAL_HIGHWAY = "National Highway"
    STATE_STRATEGIC = "State Strategic Border"
    DISTRICT_LIFELINE = "District Lifeline"
    LOCAL_ACCESS = "Local Access"

class LanguageEnum(str, Enum):
    ENGLISH = "English"
    HINDI = "Hindi"
    ASSAMESE = "Assamese"
    BENGALI = "Bengali"

class GroundEvidence(BaseModel):
    cracks: bool = False
    soil_movement: bool = False
    debris: bool = False
    road_blockage: bool = False

class ContributingFactor(BaseModel):
    name: str
    weight: int
    value: Any
    thresholdImpact: str
    explanation: str

# ----------------- RISK PREDICTION SCHEMAS -----------------

class RiskPredictRequest(BaseModel):
    rainfall: float = Field(..., description="24-hour rainfall in mm", ge=0.0)
    soil_moisture: float = Field(..., description="Soil moisture saturation % (0-100)", ge=0.0, le=100.0)
    slope: float = Field(..., description="Slope gradient in degrees (0-90)", ge=0.0, le=90.0)
    historical_events: int = Field(0, description="Past landslide events recorded in catalog", ge=0)
    forecast_rainfall: float = Field(0.0, description="Next 48h forecasted precipitation in mm", ge=0.0)
    ground_evidence: Optional[GroundEvidence] = None
    location_id: Optional[str] = Field(None, description="Optional target location ID to link/update")

class RiskPredictResponse(BaseModel):
    risk_score: int
    probability: float
    risk_level: RiskLevelEnum
    confidence: float
    contributing_factors: Dict[str, Any]
    detailed_factors: Optional[List[ContributingFactor]] = None
    calibrated_by: Optional[str] = "NIR-RAKSHA Explainable Prototype Engine (XGBoost Contract)"
    timestamp: Optional[str] = None

# ----------------- SENSOR SCHEMAS -----------------

class SensorDataCreate(BaseModel):
    location_id: str
    rainfall_24h_mm: float
    rainfall_7d_cumulative_mm: float
    forecast_rainfall_48h_mm: float
    soil_moisture_pct: float
    pore_water_pressure_kpa: Optional[float] = 0.0
    tilt_displacement_mm: Optional[float] = 0.0

class SensorDataResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    location_id: str
    rainfall_24h_mm: float
    rainfall_7d_cumulative_mm: float
    forecast_rainfall_48h_mm: float
    soil_moisture_pct: float
    pore_water_pressure_kpa: Optional[float] = None
    tilt_displacement_mm: Optional[float] = None
    recorded_at: datetime.datetime

# ----------------- LOCATION SCHEMAS -----------------

class LocationResponse(BaseModel):
    id: str
    name: str
    district: str
    state: str
    lat: float
    lng: float
    elevation: float
    slope: float
    road_name: str
    road_criticality: str
    exposed_population: int
    vulnerable_villages: List[str]
    critical_infrastructure: List[str]
    historical_events_count: int
    current_risk_score: int
    current_risk_level: str
    verification_status: str
    last_updated: str
    rainfall_current_mm: float
    rainfall_7d_cumulative_mm: float
    forecast_rainfall_48h_mm: float
    soil_moisture_pct: float

class LocationDetailResponse(LocationResponse):
    recent_sensor_readings: List[SensorDataResponse] = []
    latest_report_id: Optional[str] = None

# ----------------- FIELD REPORT SCHEMAS -----------------

class FieldReportCreate(BaseModel):
    location_id: str = Field(..., description="ID of monitored location")
    reporter_name: str = Field(..., min_length=2)
    reporter_role: str = Field(..., description="Agency role e.g. NDRF, BRO, Volunteer")
    lat: float
    lng: float
    observations: GroundEvidence
    image_url: Optional[str] = None
    image_name: Optional[str] = None
    notes: Optional[str] = ""

class FieldReportResponse(BaseModel):
    id: str
    location_id: str
    location_name: str
    reporter_name: str
    reporter_role: str
    lat: float
    lng: float
    observations: GroundEvidence
    image_url: Optional[str] = None
    image_name: Optional[str] = None
    vision_analysis: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    risk_adjusted_delta: int
    synced_online: bool
    created_at: str

# ----------------- COMPUTER VISION SCHEMAS -----------------

class VisionAnalyzeRequest(BaseModel):
    image_name: Optional[str] = None
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    reported_observations: Optional[GroundEvidence] = None

class VisionAnalyzeResponse(BaseModel):
    crack_detected: bool
    debris_detected: bool
    road_blockage_detected: bool
    confidence: float
    features_summary: List[str]
    model_notice: str

# ----------------- ALERT SCHEMAS -----------------

class AlertCreate(BaseModel):
    location_id: str
    risk_level: RiskLevelEnum
    severity: str = Field("Severe", description="Warning, Severe, Extreme")
    language: LanguageEnum = Field(LanguageEnum.ENGLISH)
    title: str
    message: str
    author: Optional[str] = "State Emergency Operations Centre (SEOC)"

class AlertDeliveryChannels(BaseModel):
    sms_broadcast: str
    cap_ndma_feed: str
    siren_relay: str

class AlertResponse(BaseModel):
    id: str
    location_id: str
    location_name: str
    risk_level: str
    severity: str
    language: str
    title: str
    message: str
    timestamp: str
    delivery_channels: AlertDeliveryChannels
    author: str

# ----------------- EMERGENCY PRIORITY & DASHBOARD SCHEMAS -----------------

class EmergencyPriorityResponse(BaseModel):
    id: str
    priority_rank: int
    priority_level: str
    location_id: str
    location_name: str
    state: str
    risk_score: int
    risk_level: str
    population_exposed: int
    road_criticality: str
    reason: str
    recommended_action: str
    decision_support_disclaimer: str
    assigned_agency: str
    last_evaluated: str

class DashboardMetricsResponse(BaseModel):
    total_monitored_zones: int
    risk_distribution: Dict[str, int]
    active_warnings_count: int
    vulnerable_villages_count: int
    vulnerable_roads_count: int
    highest_risk_zones: List[LocationResponse]
    rainfall_trend: List[Dict[str, Any]]
    risk_trend: List[Dict[str, Any]]
