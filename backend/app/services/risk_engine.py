"""
NIR-RAKSHA Landslide Risk Engine Service.

This service implements an explainable prototype risk scoring algorithm for the
North Eastern Region (NER) of India, designed with a clean abstraction layer
allowing seamless drop-in replacement by a trained machine learning model
(such as XGBoost or LightGBM) without changing the API contract.

NOTE: This is an explainable engineering prototype for decision support and demonstration,
not a certified geotechnical instrument.
"""

from typing import Dict, Any, List, Optional, Protocol
from pydantic import BaseModel, Field


class GroundEvidence(BaseModel):
    cracks: bool = False
    soil_movement: bool = False
    debris: bool = False
    road_blockage: bool = False


class RiskInput(BaseModel):
    rainfall: float = Field(..., description="24h precipitation in mm", ge=0.0)
    soil_moisture: float = Field(..., description="Soil moisture saturation percentage (0-100)", ge=0.0, le=100.0)
    slope: float = Field(..., description="Slope gradient in degrees (0-90)", ge=0.0, le=90.0)
    historical_events: int = Field(0, description="Past recorded landslide occurrences in zone", ge=0)
    forecast_rainfall: float = Field(0.0, description="Forecasted 48h rainfall in mm", ge=0.0)
    ground_evidence: Optional[GroundEvidence] = None


class RiskPredictionOutput(BaseModel):
    risk_score: int
    probability: float
    risk_level: str  # LOW, WATCH, HIGH, CRITICAL
    confidence: float
    contributing_factors: Dict[str, str]


class MLModelInterface(Protocol):
    """
    Interface definition for interchangeable risk models.
    Any future XGBoost / ONNX / LightGBM model implements predict_risk(features).
    """
    def predict_risk(self, features: List[float]) -> float:
        ...


class PrototypeHeuristicModel:
    """
    Weighted multi-criteria prototype scoring model with explicit normalization
    and domain-informed geotechnical weights for the Himalayan and Indo-Burma mountain belts.
    """

    # Model Weights (Sum to 1.00)
    WEIGHT_SLOPE = 0.25
    WEIGHT_RAINFALL = 0.25
    WEIGHT_SOIL_MOISTURE = 0.20
    WEIGHT_FORECAST = 0.15
    WEIGHT_HISTORICAL = 0.08
    WEIGHT_GROUND_EVIDENCE = 0.07

    @staticmethod
    def normalize_slope(slope_deg: float) -> float:
        """
        Normalize slope angle (0-90°).
        Critical slope threshold in NER geotechnical surveys is 35°+.
        """
        if slope_deg <= 10.0:
            return 0.10
        elif slope_deg <= 25.0:
            return 0.10 + ((slope_deg - 10.0) / 15.0) * 0.35  # 24° -> ~0.43
        elif slope_deg <= 40.0:
            return 0.45 + ((slope_deg - 25.0) / 15.0) * 0.35  # 35° -> ~0.68, 37° -> ~0.73
        else:
            return min(1.0, 0.80 + ((slope_deg - 40.0) / 20.0) * 0.20)

    @staticmethod
    def normalize_rainfall(rain_mm: float) -> float:
        """
        Normalize 24h rainfall (0-200mm).
        In NER, < 15mm is low, 40-70mm is moderate, > 100mm is high, > 150mm is extreme.
        """
        if rain_mm <= 15.0:
            return 0.10
        elif rain_mm <= 60.0:
            return 0.10 + ((rain_mm - 15.0) / 45.0) * 0.35  # 45mm -> ~0.33
        elif rain_mm <= 120.0:
            return 0.45 + ((rain_mm - 60.0) / 60.0) * 0.35  # 105mm -> ~0.71
        else:
            return min(1.0, 0.80 + ((rain_mm - 120.0) / 80.0) * 0.20)

    @staticmethod
    def normalize_soil_moisture(moist_pct: float) -> float:
        """
        Normalize soil moisture saturation (0-100%).
        """
        if moist_pct <= 35.0:
            return 0.10
        elif moist_pct <= 65.0:
            return 0.10 + ((moist_pct - 35.0) / 30.0) * 0.35  # 58mm -> ~0.37
        elif moist_pct <= 85.0:
            return 0.45 + ((moist_pct - 65.0) / 20.0) * 0.35  # 78% -> ~0.68
        else:
            return min(1.0, 0.80 + ((moist_pct - 85.0) / 15.0) * 0.20)

    @staticmethod
    def normalize_forecast_rainfall(rain_mm: float) -> float:
        """
        Normalize 48h forecasted precipitation (0-150mm).
        """
        if rain_mm <= 10.0:
            return 0.10
        elif rain_mm <= 50.0:
            return 0.10 + ((rain_mm - 10.0) / 40.0) * 0.35  # 35mm -> ~0.32
        elif rain_mm <= 100.0:
            return 0.45 + ((rain_mm - 50.0) / 50.0) * 0.35  # 60mm -> ~0.52
        else:
            return min(1.0, 0.80 + ((rain_mm - 100.0) / 50.0) * 0.20)

    @staticmethod
    def normalize_historical(events_count: int) -> float:
        """
        Normalize historical landslide occurrences (0-25).
        """
        if events_count <= 0:
            return 0.05
        elif events_count <= 4:
            return 0.30
        elif events_count <= 10:
            return 0.65
        elif events_count <= 18:
            return 0.85
        else:
            return 1.0

    @staticmethod
    def normalize_ground_evidence(evidence: Optional[GroundEvidence]) -> float:
        """
        Normalize ground observations: cracks, soil displacement, scree debris, road obstruction.
        """
        if not evidence:
            return 0.0

        score = 0.0
        if evidence.cracks:
            score += 0.35
        if evidence.soil_movement:
            score += 0.35
        if evidence.debris:
            score += 0.15
        if evidence.road_blockage:
            score += 0.15

        return min(1.0, score)


class RiskEngine:
    """
    Main entry point for Landslide Risk Evaluation in NIR-RAKSHA.
    Handles feature engineering, scoring calculation, thresholds categorization,
    and factor explanations.
    """

    def __init__(self, custom_model: Optional[MLModelInterface] = None):
        """
        Allows injecting a pre-trained XGBoost / ML model.
        Defaults to the PrototypeHeuristicModel if none provided.
        """
        self.custom_model = custom_model
        self.prototype = PrototypeHeuristicModel()

    @staticmethod
    def to_feature_vector(inputs: RiskInput) -> List[float]:
        """
        Converts the domain input into a standardized numerical feature vector.
        This provides a standardized signature for future XGBoost models:
        [rainfall, soil_moisture, slope, historical_events, forecast_rainfall, cracks, movement, debris, blockage]
        """
        cracks_val = 1.0 if (inputs.ground_evidence and inputs.ground_evidence.cracks) else 0.0
        movement_val = 1.0 if (inputs.ground_evidence and inputs.ground_evidence.soil_movement) else 0.0
        debris_val = 1.0 if (inputs.ground_evidence and inputs.ground_evidence.debris) else 0.0
        blockage_val = 1.0 if (inputs.ground_evidence and inputs.ground_evidence.road_blockage) else 0.0

        return [
            float(inputs.rainfall),
            float(inputs.soil_moisture),
            float(inputs.slope),
            float(inputs.historical_events),
            float(inputs.forecast_rainfall),
            cracks_val,
            movement_val,
            debris_val,
            blockage_val
        ]

    def _determine_factor_qualitative(self, normalized_val: float) -> str:
        if normalized_val >= 0.65:
            return "High"
        elif normalized_val >= 0.35:
            return "Moderate"
        else:
            return "Low"

    def calculate_risk(self, inputs: RiskInput) -> RiskPredictionOutput:
        """
        Executes the risk evaluation workflow:
        1. Feature extraction and normalization
        2. Score computation (0-100)
        3. Risk level categorization:
           0–30 = LOW
           31–50 = WATCH
           51–75 = HIGH
           76–100 = CRITICAL
        4. Factor explanation generation
        """
        # 1. Normalization
        norm_slope = self.prototype.normalize_slope(inputs.slope)
        norm_rain = self.prototype.normalize_rainfall(inputs.rainfall)
        norm_moist = self.prototype.normalize_soil_moisture(inputs.soil_moisture)
        norm_forecast = self.prototype.normalize_forecast_rainfall(inputs.forecast_rainfall)
        norm_hist = self.prototype.normalize_historical(inputs.historical_events)
        norm_evidence = self.prototype.normalize_ground_evidence(inputs.ground_evidence)

        # 2. Score Calculation
        if self.custom_model is not None:
            # Future XGBoost pipeline
            features = self.to_feature_vector(inputs)
            prob = self.custom_model.predict_risk(features)
            raw_score = prob * 100.0
        else:
            # Heuristic explainable prototype calculation
            raw_score = (
                (norm_slope * self.prototype.WEIGHT_SLOPE) +
                (norm_rain * self.prototype.WEIGHT_RAINFALL) +
                (norm_moist * self.prototype.WEIGHT_SOIL_MOISTURE) +
                (norm_forecast * self.prototype.WEIGHT_FORECAST) +
                (norm_hist * self.prototype.WEIGHT_HISTORICAL) +
                (norm_evidence * self.prototype.WEIGHT_GROUND_EVIDENCE)
            ) * 100.0

            # Compound modifier: Co-occurrence of active tension cracks and saturation
            if inputs.ground_evidence and inputs.ground_evidence.cracks and norm_moist >= 0.65:
                raw_score = min(100.0, raw_score * 1.15)

        # Bound score between 0 and 100
        risk_score = int(round(max(0.0, min(100.0, raw_score))))
        probability = round(risk_score / 100.0, 2)

        # 3. Categorization (Strictly aligned with problem guidelines)
        # 0–30 = LOW
        # 31–50 = WATCH
        # 51–75 = HIGH
        # 76–100 = CRITICAL
        if risk_score <= 30:
            risk_level = "LOW"
        elif risk_score <= 50:
            risk_level = "WATCH"
        elif risk_score <= 75:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        # 4. Confidence Estimation
        confidence = 0.85
        if inputs.rainfall > 0 and inputs.soil_moisture > 0 and inputs.slope > 0:
            confidence += 0.05
        if inputs.ground_evidence is not None:
            confidence += 0.05
        confidence = round(min(0.96, confidence), 2)

        # 5. Explainable Contributing Factors
        contributing_factors = {
            "rainfall": self._determine_factor_qualitative(norm_rain),
            "soil_moisture": self._determine_factor_qualitative(norm_moist),
            "slope": self._determine_factor_qualitative(norm_slope),
            "forecast_precipitation": self._determine_factor_qualitative(norm_forecast),
            "historical_activity": self._determine_factor_qualitative(norm_hist)
        }

        if inputs.ground_evidence:
            contributing_factors["ground_evidence"] = self._determine_factor_qualitative(norm_evidence)

        return RiskPredictionOutput(
            risk_score=risk_score,
            probability=probability,
            risk_level=risk_level,
            confidence=confidence,
            contributing_factors=contributing_factors
        )


# Global default instance
default_risk_engine = RiskEngine()

def calculate_landslide_risk(
    rainfall: float,
    soil_moisture: float,
    slope: float,
    historical_events: int = 0,
    forecast_rainfall: float = 0.0,
    ground_evidence: Optional[GroundEvidence] = None,
    engine: Optional[RiskEngine] = None
) -> Dict[str, Any]:
    """Convenience function returning the dictionary payload."""
    eng = engine or default_risk_engine
    inp = RiskInput(
        rainfall=rainfall,
        soil_moisture=soil_moisture,
        slope=slope,
        historical_events=historical_events,
        forecast_rainfall=forecast_rainfall,
        ground_evidence=ground_evidence
    )
    return eng.calculate_risk(inp).model_dump()
