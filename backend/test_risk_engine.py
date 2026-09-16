import unittest
import sys
import os

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.risk_engine import (
    RiskEngine,
    RiskInput,
    GroundEvidence,
    calculate_landslide_risk
)

class TestRiskEngineThresholds(unittest.TestCase):
    """
    Unit test suite verifying classification thresholds:
    0–30   = LOW
    31–50  = WATCH
    51–75  = HIGH
    76–100 = CRITICAL
    as well as explainable contributing_factors and the future ML model interface.
    """

    def setUp(self):
        self.engine = RiskEngine()

    def test_low_risk_case(self):
        """
        Gentle slope, minimal precipitation, low soil saturation, no ground evidence.
        Must evaluate to 0-30 = LOW.
        """
        inp = RiskInput(
            rainfall=5.0,            # 5mm gentle drizzle
            soil_moisture=20.0,      # 20% dry soil
            slope=8.0,               # 8° gentle foothills
            historical_events=0,     # No prior events
            forecast_rainfall=5.0,   # Clear weather ahead
            ground_evidence=GroundEvidence(cracks=False, soil_movement=False, debris=False, road_blockage=False)
        )
        res = self.engine.calculate_risk(inp)

        self.assertLessEqual(res.risk_score, 30, f"Score {res.risk_score} should be <= 30 for LOW")
        self.assertGreaterEqual(res.risk_score, 0)
        self.assertEqual(res.risk_level, "LOW")
        self.assertLessEqual(res.probability, 0.30)
        self.assertIn("rainfall", res.contributing_factors)
        self.assertEqual(res.contributing_factors["rainfall"], "Low")
        self.assertEqual(res.contributing_factors["slope"], "Low")
        self.assertEqual(res.contributing_factors["soil_moisture"], "Low")

    def test_watch_risk_case(self):
        """
        Moderate slope with steady rain and rising soil saturation.
        Must evaluate to 31-50 = WATCH.
        """
        inp = RiskInput(
            rainfall=45.0,           # 45mm steady rain
            soil_moisture=58.0,      # 58% rising saturation
            slope=24.0,              # 24° moderate slope
            historical_events=2,     # 2 legacy events
            forecast_rainfall=35.0,  # 35mm incoming rain
            ground_evidence=GroundEvidence(cracks=False, soil_movement=False, debris=False, road_blockage=False)
        )
        res = self.engine.calculate_risk(inp)

        self.assertGreaterEqual(res.risk_score, 31, f"Score {res.risk_score} should be >= 31 for WATCH")
        self.assertLessEqual(res.risk_score, 50, f"Score {res.risk_score} should be <= 50 for WATCH")
        self.assertEqual(res.risk_level, "WATCH")
        self.assertGreaterEqual(res.probability, 0.31)
        self.assertLessEqual(res.probability, 0.50)
        self.assertIn(res.contributing_factors["soil_moisture"], ["Moderate", "Low"])

    def test_high_risk_case(self):
        """
        Steep slope (>35°), heavy rainfall (100mm), high soil moisture (>75%), history of slides.
        Must evaluate to 51-75 = HIGH.
        """
        inp = RiskInput(
            rainfall=105.0,          # 105mm heavy monsoon downpour
            soil_moisture=78.0,      # 78% high saturation
            slope=37.0,              # 37° steep mountain slope
            historical_events=6,     # 6 prior occurrences
            forecast_rainfall=60.0,  # 60mm forecasted
            ground_evidence=GroundEvidence(cracks=False, soil_movement=False, debris=True, road_blockage=False)
        )
        res = self.engine.calculate_risk(inp)

        self.assertGreaterEqual(res.risk_score, 51, f"Score {res.risk_score} should be >= 51 for HIGH")
        self.assertLessEqual(res.risk_score, 75, f"Score {res.risk_score} should be <= 75 for HIGH")
        self.assertEqual(res.risk_level, "HIGH")
        self.assertGreaterEqual(res.probability, 0.51)
        self.assertLessEqual(res.probability, 0.75)
        self.assertEqual(res.contributing_factors["slope"], "High")

    def test_critical_risk_case(self):
        """
        Very steep terrain, extreme cloudburst rainfall (>150mm), saturated soil (>90%),
        and confirmed active ground tension cracks & soil movement.
        Must evaluate to 76-100 = CRITICAL.
        """
        inp = RiskInput(
            rainfall=170.0,          # 170mm extreme cloudburst precipitation
            soil_moisture=94.0,      # 94% completely saturated
            slope=48.0,              # 48° very steep slope
            historical_events=16,    # Chronic active zone
            forecast_rainfall=105.0, # Continued heavy torrential downpour
            ground_evidence=GroundEvidence(
                cracks=True,
                soil_movement=True,
                debris=True,
                road_blockage=True
            )
        )
        res = self.engine.calculate_risk(inp)

        self.assertGreaterEqual(res.risk_score, 76, f"Score {res.risk_score} should be >= 76 for CRITICAL")
        self.assertLessEqual(res.risk_score, 100, f"Score {res.risk_score} should be <= 100 for CRITICAL")
        self.assertEqual(res.risk_level, "CRITICAL")
        self.assertGreaterEqual(res.probability, 0.76)
        self.assertEqual(res.contributing_factors["rainfall"], "High")
        self.assertEqual(res.contributing_factors["soil_moisture"], "High")
        self.assertEqual(res.contributing_factors["slope"], "High")
        self.assertEqual(res.contributing_factors["ground_evidence"], "High")

    def test_standard_feature_vector_for_xgboost(self):
        """
        Verifies that input converts into a clean 9-dimension numerical feature vector
        suitable for feeding into xgboost.DMatrix or model.predict_proba.
        """
        inp = RiskInput(
            rainfall=120.5,
            soil_moisture=84.0,
            slope=42.0,
            historical_events=8,
            forecast_rainfall=75.0,
            ground_evidence=GroundEvidence(cracks=True, soil_movement=False, debris=True, road_blockage=False)
        )
        vec = self.engine.to_feature_vector(inp)

        self.assertEqual(len(vec), 9)
        self.assertEqual(vec[0], 120.5)  # rainfall
        self.assertEqual(vec[1], 84.0)   # moisture
        self.assertEqual(vec[2], 42.0)   # slope
        self.assertEqual(vec[3], 8.0)    # history
        self.assertEqual(vec[4], 75.0)   # forecast
        self.assertEqual(vec[5], 1.0)    # cracks (True -> 1.0)
        self.assertEqual(vec[6], 0.0)    # movement (False -> 0.0)
        self.assertEqual(vec[7], 1.0)    # debris (True -> 1.0)
        self.assertEqual(vec[8], 0.0)    # blockage (False -> 0.0)

    def test_mock_xgboost_injection(self):
        """
        Demonstrates that custom ML models adhering to MLModelInterface can be injected
        seamlessly without altering callers or API endpoints.
        """
        class MockXGBoostModel:
            def predict_risk(self, features):
                # Simple linear combination mock for XGBoost inference
                return 0.82  # Returns 82% predicted probability

        ml_engine = RiskEngine(custom_model=MockXGBoostModel())
        inp = RiskInput(
            rainfall=110.0,
            soil_moisture=80.0,
            slope=35.0,
            historical_events=5,
            forecast_rainfall=40.0
        )
        res = ml_engine.calculate_risk(inp)

        self.assertEqual(res.risk_score, 82)
        self.assertEqual(res.probability, 0.82)
        self.assertEqual(res.risk_level, "CRITICAL")


if __name__ == "__main__":
    unittest.main(verbosity=2)
