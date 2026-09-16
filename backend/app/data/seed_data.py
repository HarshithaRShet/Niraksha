import json
import datetime
from sqlalchemy.orm import Session
from ..models.models import (
    LocationModel,
    SensorDataModel,
    RiskPredictionModel,
    FieldReportModel,
    AlertModel
)

SEED_LOCATIONS = [
    {
        "id": "NER-SK-01",
        "name": "Dikchu - Singtam Highway Corridor (NH-10)",
        "district": "East Sikkim & Pakyong",
        "state": "Sikkim",
        "lat": 27.3789,
        "lng": 88.5284,
        "elevation": 1420.0,
        "slope": 48.5,
        "road_name": "NH-10 (Sikkim Lifeline Corridor)",
        "road_criticality": "National Highway",
        "exposed_population": 8450,
        "vulnerable_villages": ["Lower Dikchu", "Rakdong Tintek", "Singtam Outskirts"],
        "critical_infrastructure": ["Teesta Hydro Dam Stage V Substation", "Army Logistics Convoy Bridge 04"],
        "historical_events_count": 14,
        "current_risk_score": 91,
        "current_risk_level": "CRITICAL",
        "verification_status": "Urgent Inspection Required",
        "sensor": {
            "rainfall_24h_mm": 148.2,
            "rainfall_7d_cumulative_mm": 382.0,
            "forecast_rainfall_48h_mm": 92.5,
            "soil_moisture_pct": 88.4,
            "pore_water_pressure_kpa": 142.5,
            "tilt_displacement_mm": 18.2
        }
    },
    {
        "id": "NER-MG-02",
        "name": "Cherrapunji - Shella Escarpment & Mawkdok Valley",
        "district": "East Khasi Hills",
        "state": "Meghalaya",
        "lat": 25.2986,
        "lng": 91.7323,
        "elevation": 1290.0,
        "slope": 42.0,
        "road_name": "SH-5 Cherra-Shella Road",
        "road_criticality": "State Strategic Border",
        "exposed_population": 5200,
        "vulnerable_villages": ["Mawkdok", "Laitkynsew", "Nongkroh"],
        "critical_infrastructure": ["Mawkdok Bridge Pier #2", "High-tension Power Pylon 11B"],
        "historical_events_count": 22,
        "current_risk_score": 87,
        "current_risk_level": "CRITICAL",
        "verification_status": "Action In Progress",
        "sensor": {
            "rainfall_24h_mm": 212.0,
            "rainfall_7d_cumulative_mm": 520.4,
            "forecast_rainfall_48h_mm": 130.0,
            "soil_moisture_pct": 94.2,
            "pore_water_pressure_kpa": 168.0,
            "tilt_displacement_mm": 24.5
        }
    },
    {
        "id": "NER-AS-03",
        "name": "Jatinga - Haflong Pass Hill Section",
        "district": "Dima Hasao",
        "state": "Assam",
        "lat": 25.1235,
        "lng": 93.0315,
        "elevation": 980.0,
        "slope": 38.0,
        "road_name": "NH-54E Lumding-Silchar Mountain Highway",
        "road_criticality": "National Highway",
        "exposed_population": 12400,
        "vulnerable_villages": ["Jatinga Valley", "Mahur Trackside", "Lower Haflong"],
        "critical_infrastructure": ["NFR Hill Railway Tunnel #7", "Barak Valley Optical Fiber Trunk"],
        "historical_events_count": 18,
        "current_risk_score": 79,
        "current_risk_level": "HIGH",
        "verification_status": "Field Verified",
        "sensor": {
            "rainfall_24h_mm": 115.5,
            "rainfall_7d_cumulative_mm": 290.8,
            "forecast_rainfall_48h_mm": 70.0,
            "soil_moisture_pct": 82.1,
            "pore_water_pressure_kpa": 110.2,
            "tilt_displacement_mm": 12.0
        }
    },
    {
        "id": "NER-AR-04",
        "name": "Sela Pass Approach & Bhalukpong-Tawang Axis",
        "district": "West Kameng & Tawang",
        "state": "Arunachal Pradesh",
        "lat": 27.5034,
        "lng": 92.1038,
        "elevation": 2850.0,
        "slope": 52.0,
        "road_name": "NH-13 Trans-Arunachal Strategic Highway",
        "road_criticality": "National Highway",
        "exposed_population": 4100,
        "vulnerable_villages": ["Dirang Basti", "Senge Village", "Baisakhi Military Camp"],
        "critical_infrastructure": ["Sela Tunnel South Portal Drainage", "BRO Project Vartak Machinery Depot"],
        "historical_events_count": 12,
        "current_risk_score": 74,
        "current_risk_level": "HIGH",
        "verification_status": "Field Verified",
        "sensor": {
            "rainfall_24h_mm": 88.0,
            "rainfall_7d_cumulative_mm": 210.0,
            "forecast_rainfall_48h_mm": 65.0,
            "soil_moisture_pct": 79.5,
            "pore_water_pressure_kpa": 98.4,
            "tilt_displacement_mm": 9.1
        }
    },
    {
        "id": "NER-NL-05",
        "name": "Phesama Landslip Zone (NH-29 Kohima-Dimapur)",
        "district": "Kohima",
        "state": "Nagaland",
        "lat": 25.6421,
        "lng": 94.1124,
        "elevation": 1440.0,
        "slope": 36.5,
        "road_name": "NH-29 Asian Highway 1 Lifeline",
        "road_criticality": "National Highway",
        "exposed_population": 9800,
        "vulnerable_villages": ["Phesama Upper", "Kigwema Ridge", "New Reserve Colony"],
        "critical_infrastructure": ["BPCL Fuel Transit Pipeline", "State Grid 132kV Sub-Transmission"],
        "historical_events_count": 27,
        "current_risk_score": 71,
        "current_risk_level": "HIGH",
        "verification_status": "Urgent Inspection Required",
        "sensor": {
            "rainfall_24h_mm": 94.5,
            "rainfall_7d_cumulative_mm": 240.2,
            "forecast_rainfall_48h_mm": 54.0,
            "soil_moisture_pct": 76.8,
            "pore_water_pressure_kpa": 105.0,
            "tilt_displacement_mm": 11.5
        }
    },
    {
        "id": "NER-MN-06",
        "name": "Noney - Tupul Railway Cutting Zone",
        "district": "Noney",
        "state": "Manipur",
        "lat": 24.8167,
        "lng": 93.6542,
        "elevation": 720.0,
        "slope": 44.0,
        "road_name": "NH-37 Imphal - Jiribam Highway",
        "road_criticality": "National Highway",
        "exposed_population": 3600,
        "vulnerable_villages": ["Marangching", "Tupul Yard", "Awangkhul"],
        "critical_infrastructure": ["Ijai River Dam Barrier (Flash Flood Risk)", "Pier 134 Tallest Rail Bridge"],
        "historical_events_count": 16,
        "current_risk_score": 58,
        "current_risk_level": "WATCH",
        "verification_status": "Field Verified",
        "sensor": {
            "rainfall_24h_mm": 64.0,
            "rainfall_7d_cumulative_mm": 165.0,
            "forecast_rainfall_48h_mm": 45.0,
            "soil_moisture_pct": 68.0,
            "pore_water_pressure_kpa": 72.0,
            "tilt_displacement_mm": 4.2
        }
    },
    {
        "id": "NER-MZ-07",
        "name": "Hunthar Ridge & Chite Veng Slopes",
        "district": "Aizawl",
        "state": "Mizoram",
        "lat": 23.7412,
        "lng": 92.7158,
        "elevation": 1132.0,
        "slope": 41.0,
        "road_name": "NH-54 (Silchar - Aizawl Entry)",
        "road_criticality": "National Highway",
        "exposed_population": 15200,
        "vulnerable_villages": ["Hunthar Ward", "Bawngkawn", "Durtlang Leitan"],
        "critical_infrastructure": ["Aizawl Urban Water Main Intake", "Civil Hospital Access Route"],
        "historical_events_count": 21,
        "current_risk_score": 46,
        "current_risk_level": "WATCH",
        "verification_status": "Unverified",
        "sensor": {
            "rainfall_24h_mm": 48.0,
            "rainfall_7d_cumulative_mm": 130.0,
            "forecast_rainfall_48h_mm": 35.0,
            "soil_moisture_pct": 61.2,
            "pore_water_pressure_kpa": 55.0,
            "tilt_displacement_mm": 3.0
        }
    },
    {
        "id": "NER-TR-08",
        "name": "Baramura Gas Corridor & Champaknagar Slopes",
        "district": "West Tripura & Khowai",
        "state": "Tripura",
        "lat": 23.8542,
        "lng": 91.5642,
        "elevation": 320.0,
        "slope": 22.0,
        "road_name": "NH-8 (Tripura Main Arterial)",
        "road_criticality": "National Highway",
        "exposed_population": 4300,
        "vulnerable_villages": ["Champaknagar", "Barmura Hill Colony"],
        "critical_infrastructure": ["ONGC Gas Compression Trunk 1", "Thermal Power Plant Evacuation Line"],
        "historical_events_count": 5,
        "current_risk_score": 24,
        "current_risk_level": "LOW",
        "verification_status": "Field Verified",
        "sensor": {
            "rainfall_24h_mm": 22.0,
            "rainfall_7d_cumulative_mm": 55.0,
            "forecast_rainfall_48h_mm": 18.0,
            "soil_moisture_pct": 42.0,
            "pore_water_pressure_kpa": 24.0,
            "tilt_displacement_mm": 0.5
        }
    }
]

SEED_REPORTS = [
    {
        "id": "REP-2026-081",
        "location_id": "NER-SK-01",
        "reporter_name": "Capt. R. Sharma",
        "reporter_role": "BRO Project Swastik Executive Engineer",
        "lat": 27.3802,
        "lng": 88.5295,
        "cracks": True,
        "soil_movement": True,
        "debris": True,
        "road_blockage": True,
        "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        "image_name": "NH10_dikchu_tension_crack_km42.jpg",
        "vision_analysis": {
            "crack_detected": True,
            "debris_detected": True,
            "road_blockage_detected": True,
            "confidence": 0.94,
            "features_summary": [
                "Continuous transverse fracture traced for 45 meters along roadway shoulder",
                "Toe erosion from swollen Teesta River destabilizing retaining gabion"
            ]
        },
        "notes": "Severe tension cracks opening up at Km 42.2 on NH-10. Heavy silt and rock fragments blocking eastern lane. Immediate earthmover and diversion required.",
        "risk_adjusted_delta": 12,
        "synced_online": True
    },
    {
        "id": "REP-2026-082",
        "location_id": "NER-MG-02",
        "reporter_name": "D. Sangma",
        "reporter_role": "District Disaster Management Officer",
        "lat": 25.2995,
        "lng": 91.7335,
        "cracks": True,
        "soil_movement": True,
        "debris": True,
        "road_blockage": False,
        "image_url": "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80",
        "image_name": "mawkdok_scarp_fissure.jpg",
        "vision_analysis": {
            "crack_detected": True,
            "debris_detected": True,
            "road_blockage_detected": False,
            "confidence": 0.91,
            "features_summary": [
                "Crown fissure expansion detected ~22cm wide",
                "Continuous cascading groundwater seepage observed on face"
            ]
        },
        "notes": "Heavy continuous precipitation for past 36 hours. Water seepage gushing out from sandstone strata. High risk of debris flow towards lower valley hamlets.",
        "risk_adjusted_delta": 10,
        "synced_online": True
    }
]

SEED_ALERTS = [
    {
        "id": "ALT-2026-001",
        "location_id": "NER-SK-01",
        "risk_level": "CRITICAL",
        "severity": "Extreme",
        "language": "English",
        "title": "URGENT DISASTER WARNING: Extreme Landslide Threat on NH-10 Sikkim Corridor",
        "message": "Immediate danger of slope collapse along Dikchu-Singtam axis. 24h rainfall (148.2mm) has triggered critical soil saturation. Civilian evacuation ordered for lower hamlets. Avoid NH-10.",
        "author": "Sikkim State Disaster Management Authority (SSDMA)",
        "sms_status": "Broadcasted to 8,450 Local SIMs",
        "cap_feed_status": "NDMA CAP v1.2 Live",
        "siren_status": "Armed"
    },
    {
        "id": "ALT-2026-002",
        "location_id": "NER-MG-02",
        "risk_level": "CRITICAL",
        "severity": "Extreme",
        "language": "English",
        "title": "EMERGENCY EVACUATION NOTICE: Mawkdok Valley Escarpment",
        "message": "Continuous torrential cloudburst has saturated Khasi Hills escarpment (212mm). Active rockfalls and soil slips reported. Downstream settlements are advised to move to designated civil defense shelters immediately.",
        "author": "East Khasi Hills DDMA Emergency Operations Room",
        "sms_status": "Broadcasted to 5,200 Local SIMs",
        "cap_feed_status": "NDMA CAP v1.2 Live",
        "siren_status": "Armed"
    }
]

def seed_database(db: Session):
    """Seed initial realistic NER locations, telemetry sensors, field reports, and alerts if empty."""
    loc_count = db.query(LocationModel).count()
    if loc_count > 0:
        return

    now = datetime.datetime.utcnow()

    # 1. Seed Locations & Sensor Data
    for loc_data in SEED_LOCATIONS:
        sensor_info = loc_data.get("sensor", {})
        loc = LocationModel(
            id=loc_data["id"],
            name=loc_data["name"],
            district=loc_data["district"],
            state=loc_data["state"],
            lat=loc_data["lat"],
            lng=loc_data["lng"],
            elevation=loc_data["elevation"],
            slope=loc_data["slope"],
            road_name=loc_data["road_name"],
            road_criticality=loc_data["road_criticality"],
            exposed_population=loc_data["exposed_population"],
            vulnerable_villages_json=json.dumps(loc_data["vulnerable_villages"]),
            critical_infrastructure_json=json.dumps(loc_data["critical_infrastructure"]),
            historical_events_count=loc_data["historical_events_count"],
            current_risk_score=loc_data["current_risk_score"],
            current_risk_level=loc_data["current_risk_level"],
            verification_status=loc_data["verification_status"],
            last_updated=now
        )
        db.add(loc)
        db.flush()

        # Add Sensor reading
        sensor = SensorDataModel(
            location_id=loc.id,
            rainfall_24h_mm=sensor_info.get("rainfall_24h_mm", 0.0),
            rainfall_7d_cumulative_mm=sensor_info.get("rainfall_7d_cumulative_mm", 0.0),
            forecast_rainfall_48h_mm=sensor_info.get("forecast_rainfall_48h_mm", 0.0),
            soil_moisture_pct=sensor_info.get("soil_moisture_pct", 0.0),
            pore_water_pressure_kpa=sensor_info.get("pore_water_pressure_kpa", 0.0),
            tilt_displacement_mm=sensor_info.get("tilt_displacement_mm", 0.0),
            recorded_at=now
        )
        db.add(sensor)

    # 2. Seed Reports
    for rep in SEED_REPORTS:
        report = FieldReportModel(
            id=rep["id"],
            location_id=rep["location_id"],
            reporter_name=rep["reporter_name"],
            reporter_role=rep["reporter_role"],
            lat=rep["lat"],
            lng=rep["lng"],
            cracks=rep["cracks"],
            soil_movement=rep["soil_movement"],
            debris=rep["debris"],
            road_blockage=rep["road_blockage"],
            image_url=rep["image_url"],
            image_name=rep["image_name"],
            vision_analysis_json=json.dumps(rep["vision_analysis"]),
            notes=rep["notes"],
            risk_adjusted_delta=rep["risk_adjusted_delta"],
            synced_online=rep["synced_online"],
            created_at=now
        )
        db.add(report)

    # 3. Seed Alerts
    for alt in SEED_ALERTS:
        alert = AlertModel(
            id=alt["id"],
            location_id=alt["location_id"],
            risk_level=alt["risk_level"],
            severity=alt["severity"],
            language=alt["language"],
            title=alt["title"],
            message=alt["message"],
            author=alt["author"],
            sms_status=alt["sms_status"],
            cap_feed_status=alt["cap_feed_status"],
            siren_status=alt["siren_status"],
            created_at=now
        )
        db.add(alert)

    db.commit()
