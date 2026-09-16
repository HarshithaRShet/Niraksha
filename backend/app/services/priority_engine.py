import datetime
from typing import List
from ..schemas.schemas import EmergencyPriorityResponse
from ..models.models import LocationModel

class PriorityEngineService:
    """
    Multi-Criteria Decision Analysis (MCDA) Emergency Priority Engine.
    Combines:
    - Hazard Risk Score (40%)
    - Exposed Civilian Population in Runout Zone (25%)
    - Lifeline Road Criticality (20%)
    - Critical Infrastructure at Risk (Hydro Dams, Power Pylons, Bridges) (15%)
    """

    @classmethod
    def evaluate_priority_list(cls, locations: List[LocationModel]) -> List[EmergencyPriorityResponse]:
        scored_locations = []

        for loc in locations:
            # 1. Hazard weight
            risk_wt = (loc.current_risk_score / 100.0) * 40.0

            # 2. Population weight (log-scaled up to 10,000 civilians)
            pop = loc.exposed_population or 0
            pop_ratio = min(1.0, pop / 8000.0)
            pop_wt = pop_ratio * 25.0

            # 3. Road criticality
            rc = loc.road_criticality or ""
            if "National Highway" in rc:
                road_wt = 20.0
            elif "State Strategic" in rc:
                road_wt = 16.0
            elif "District" in rc:
                road_wt = 12.0
            else:
                road_wt = 8.0

            # 4. Critical infrastructure
            infra_list = loc.critical_infrastructure_json or "[]"
            infra_count = max(1, infra_list.count(",")) if infra_list != "[]" else 0
            infra_wt = min(15.0, infra_count * 7.5)

            mcda_total = risk_wt + pop_wt + road_wt + infra_wt
            scored_locations.append((mcda_total, loc))

        # Sort descending by MCDA total score
        scored_locations.sort(key=lambda x: x[0], reverse=True)

        results: List[EmergencyPriorityResponse] = []
        for rank, (score, loc) in enumerate(scored_locations, start=1):
            if score >= 75:
                p_level = "P1 - Immediate Evacuation / BRO Action"
                agency = "NDRF 1st & 12th Bn + Border Roads Organisation (Project Swastik/Pushpak)"
                action = f"Immediate evacuation of {loc.exposed_population} civilians to designated relief shelters. Pre-position heavy hydraulic excavators and rock-clearing teams along {loc.road_name}."
            elif score >= 55:
                p_level = "P2 - Road Clearance / Pre-alert"
                agency = "Border Roads Organisation (BRO) + State Police"
                action = f"Impose one-way traffic restrictions on {loc.road_name}. Stage standby quick-response earthmovers at nearest depot."
            elif score >= 35:
                p_level = "P3 - Traffic Restriction / Observation"
                agency = "District Disaster Management Authority (DDMA)"
                action = "Erect warning signboards, deploy local village disaster volunteers for 2-hour slope monitoring, broadcast weather advisories."
            else:
                p_level = "P4 - Normal Patrol Monitoring"
                agency = "Local Police & PWD Patrols"
                action = "Maintain regular routine hydrological log monitoring."

            results.append(
                EmergencyPriorityResponse(
                    id=f"PRI-{loc.id}",
                    priority_rank=rank,
                    priority_level=p_level,
                    location_id=loc.id,
                    location_name=loc.name,
                    state=loc.state,
                    risk_score=loc.current_risk_score,
                    risk_level=loc.current_risk_level,
                    population_exposed=loc.exposed_population,
                    road_criticality=loc.road_name,
                    reason=f"Composite hazard score {loc.current_risk_score}/100 across slope ({loc.slope}°) with {loc.exposed_population:,} civilians in downstream zone.",
                    recommended_action=action,
                    decision_support_disclaimer="Advisory DSS Decision Matrix: Operational resource deployments require formal authorization from the District Magistrate / Incident Commander.",
                    assigned_agency=agency,
                    last_evaluated=loc.last_updated.strftime("%Y-%m-%d %H:%M IST") if loc.last_updated else datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M IST")
                )
            )

        return results
