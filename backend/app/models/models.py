import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text
)
from sqlalchemy.orm import relationship
from ..database import Base

class LocationModel(Base):
    __tablename__ = "locations"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    elevation = Column(Float, nullable=False)
    slope = Column(Float, nullable=False)
    road_name = Column(String(150), nullable=False)
    road_criticality = Column(String(50), nullable=False)
    exposed_population = Column(Integer, default=0)
    vulnerable_villages_json = Column(Text, default="[]") # JSON list of village names
    critical_infrastructure_json = Column(Text, default="[]") # JSON list of infrastructure assets
    historical_events_count = Column(Integer, default=0)
    current_risk_score = Column(Integer, default=10)
    current_risk_level = Column(String(20), default="LOW")
    verification_status = Column(String(50), default="Unverified")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    sensors = relationship("SensorDataModel", back_populates="location", cascade="all, delete-orphan")
    predictions = relationship("RiskPredictionModel", back_populates="location", cascade="all, delete-orphan")
    reports = relationship("FieldReportModel", back_populates="location", cascade="all, delete-orphan")
    alerts = relationship("AlertModel", back_populates="location", cascade="all, delete-orphan")


class SensorDataModel(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(String(50), ForeignKey("locations.id"), nullable=False, index=True)
    rainfall_24h_mm = Column(Float, nullable=False, default=0.0)
    rainfall_7d_cumulative_mm = Column(Float, nullable=False, default=0.0)
    forecast_rainfall_48h_mm = Column(Float, nullable=False, default=0.0)
    soil_moisture_pct = Column(Float, nullable=False, default=0.0)
    pore_water_pressure_kpa = Column(Float, nullable=True, default=0.0)
    tilt_displacement_mm = Column(Float, nullable=True, default=0.0)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)

    location = relationship("LocationModel", back_populates="sensors")


class RiskPredictionModel(Base):
    __tablename__ = "risk_predictions"

    id = Column(String(50), primary_key=True, index=True)
    location_id = Column(String(50), ForeignKey("locations.id"), nullable=False, index=True)
    risk_score = Column(Integer, nullable=False) # 0-100
    probability = Column(Float, nullable=False) # 0.0-1.0
    risk_level = Column(String(20), nullable=False) # LOW, WATCH, HIGH, CRITICAL
    confidence = Column(Float, nullable=False) # 0.0-1.0
    contributing_factors_json = Column(Text, nullable=False) # JSON list
    calibrated_by = Column(String(100), default="GSI-Explainable-Scoring-Baseline")
    predicted_at = Column(DateTime, default=datetime.datetime.utcnow)

    location = relationship("LocationModel", back_populates="predictions")


class FieldReportModel(Base):
    __tablename__ = "field_reports"

    id = Column(String(50), primary_key=True, index=True)
    location_id = Column(String(50), ForeignKey("locations.id"), nullable=False, index=True)
    reporter_name = Column(String(100), nullable=False)
    reporter_role = Column(String(100), nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    cracks = Column(Boolean, default=False)
    soil_movement = Column(Boolean, default=False)
    debris = Column(Boolean, default=False)
    road_blockage = Column(Boolean, default=False)
    image_url = Column(String(500), nullable=True)
    image_name = Column(String(200), nullable=True)
    vision_analysis_json = Column(Text, nullable=True) # JSON of CV features
    notes = Column(Text, nullable=True)
    risk_adjusted_delta = Column(Integer, default=0)
    synced_online = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    location = relationship("LocationModel", back_populates="reports")


class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True, index=True)
    location_id = Column(String(50), ForeignKey("locations.id"), nullable=False, index=True)
    risk_level = Column(String(20), nullable=False) # WATCH, HIGH, CRITICAL
    severity = Column(String(30), nullable=False) # Warning, Severe, Extreme
    language = Column(String(30), nullable=False) # English, Hindi, Assamese, Bengali
    title = Column(String(250), nullable=False)
    message = Column(Text, nullable=False)
    author = Column(String(150), default="State Emergency Operations Centre (SEOC)")
    sms_status = Column(String(30), default="Simulated Sent")
    cap_feed_status = Column(String(30), default="Active Feed")
    siren_status = Column(String(30), default="Standby")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    location = relationship("LocationModel", back_populates="alerts")
