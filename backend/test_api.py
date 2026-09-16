import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def run_api_tests():
    print("=========================================================")
    print("Starting NIR-RAKSHA Production FastAPI Test Suite")
    print("=========================================================")

    client = TestClient(app)

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print(" [1/10] GET /api/health: OK", res.json()["status"])

    # 2. GET /api/locations
    res = client.get("/api/locations")
    assert res.status_code == 200, f"GET /api/locations failed: {res.text}"
    locations = res.json()
    assert len(locations) >= 8, f"Expected >= 8 seeded locations, got {len(locations)}"
    print(f" [2/10] GET /api/locations: OK (Found {len(locations)} seeded NER locations)")
    sample_loc_id = locations[0]["id"]

    # 3. GET /api/risk
    res = client.get("/api/risk")
    assert res.status_code == 200, f"GET /api/risk failed: {res.text}"
    risk_list = res.json()
    assert len(risk_list) > 0, "Risk list is empty"
    print(f" [3/10] GET /api/risk: OK ({len(risk_list)} risk summaries)")

    # 4. GET /api/risk/{location_id}
    res = client.get(f"/api/risk/{sample_loc_id}")
    assert res.status_code == 200, f"GET /api/risk/{sample_loc_id} failed: {res.text}"
    loc_risk = res.json()
    assert "risk_score" in loc_risk
    assert "contributing_factors" in loc_risk
    print(f" [4/10] GET /api/risk/{sample_loc_id}: OK (Score: {loc_risk['risk_score']}, Level: {loc_risk['risk_level']})")

    # 5. POST /api/risk/predict
    predict_payload = {
        "rainfall": 165.0,
        "soil_moisture": 92.0,
        "slope": 48.0,
        "historical_events": 15,
        "forecast_rainfall": 90.0,
        "ground_evidence": {
            "cracks": True,
            "soil_movement": True,
            "debris": True,
            "road_blockage": False
        },
        "location_id": sample_loc_id
    }
    res = client.post("/api/risk/predict", json=predict_payload)
    assert res.status_code == 200, f"POST /api/risk/predict failed: {res.text}"
    pred_res = res.json()
    assert pred_res["risk_level"] in ["HIGH", "CRITICAL"]
    print(f" [5/10] POST /api/risk/predict: OK (Calibrated Score: {pred_res['risk_score']}/100, Level: {pred_res['risk_level']})")

    # 6. GET /api/reports & POST /api/reports
    res = client.get("/api/reports")
    assert res.status_code == 200, f"GET /api/reports failed: {res.text}"
    reports_before = res.json()

    report_payload = {
        "location_id": sample_loc_id,
        "reporter_name": "Major A. Gogoi",
        "reporter_role": "NDRF 1st Bn Team Commander",
        "lat": 27.3820,
        "lng": 88.5310,
        "observations": {
            "cracks": True,
            "soil_movement": True,
            "debris": True,
            "road_blockage": True
        },
        "image_name": "dikchu_crown_crack_field.jpg",
        "notes": "Verified fresh shear failure line widening near Culvert 14."
    }
    res = client.post("/api/reports", json=report_payload)
    assert res.status_code == 200, f"POST /api/reports failed: {res.text}"
    created_rep = res.json()
    assert created_rep["id"].startswith("REP-")
    assert created_rep["vision_analysis"] is not None
    print(f" [6/10] POST /api/reports & GET /api/reports: OK (Created: {created_rep['id']})")

    # 7. POST /api/vision/analyze
    vision_payload = {
        "image_name": "nh10_fissure_tension.jpg",
        "reported_observations": {
            "cracks": True,
            "soil_movement": False,
            "debris": True,
            "road_blockage": True
        }
    }
    res = client.post("/api/vision/analyze", json=vision_payload)
    assert res.status_code == 200, f"POST /api/vision/analyze failed: {res.text}"
    vis_res = res.json()
    assert vis_res["crack_detected"] is True
    assert len(vis_res["features_summary"]) > 0
    print(f" [7/10] POST /api/vision/analyze: OK (Crack: {vis_res['crack_detected']}, Conf: {vis_res['confidence']})")

    # 8. GET /api/emergency-priority
    res = client.get("/api/emergency-priority")
    assert res.status_code == 200, f"GET /api/emergency-priority failed: {res.text}"
    priorities = res.json()
    assert len(priorities) > 0
    assert priorities[0]["priority_rank"] == 1
    print(f" [8/10] GET /api/emergency-priority: OK (Top Priority: {priorities[0]['location_name']}, Rank 1)")

    # 9. GET /api/alerts & POST /api/alerts
    alert_payload = {
        "location_id": sample_loc_id,
        "risk_level": "CRITICAL",
        "severity": "Extreme",
        "language": "Assamese",
        "title": "জৰুৰী সতৰ্কবাণী: চৰম ভূমিস্খলনৰ আশংকা",
        "message": "NH-10 ডিকচু অঞ্চলত ধাৰাসাৰ বৰষুণৰ বাবে ভূমিস্খলনৰ তীব্ৰ আশংকা। সুৰক্ষিত আশ্ৰয়স্থললৈ স্থানান্তৰিত হওক।",
        "author": "Sikkim State Disaster Management Authority"
    }
    res = client.post("/api/alerts", json=alert_payload)
    assert res.status_code == 200, f"POST /api/alerts failed: {res.text}"
    created_alert = res.json()
    assert created_alert["id"].startswith("ALT-")

    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    print(f" [9/10] POST /api/alerts & GET /api/alerts: OK (Total Alerts: {len(alerts)}, Created: {created_alert['id']})")

    # 10. GET /api/dashboard
    res = client.get("/api/dashboard")
    assert res.status_code == 200, f"GET /api/dashboard failed: {res.text}"
    dash = res.json()
    assert dash["total_monitored_zones"] >= 8
    assert "risk_distribution" in dash
    assert len(dash["rainfall_trend"]) == 6
    print(f" [10/10] GET /api/dashboard: OK (Monitored Zones: {dash['total_monitored_zones']}, Critical: {dash['risk_distribution']['critical']})")

    print("=========================================================")
    print(" ALL 10 REST API ENDPOINTS TESTED AND VERIFIED SUCCESSFULLY!")
    print("=========================================================")

if __name__ == "__main__":
    run_api_tests()
