export type RiskLevel = 'LOW' | 'WATCH' | 'HIGH' | 'CRITICAL';

export interface ContributingFactor {
  name: string;
  weight: number; // contribution percentage or relative weight 0-100
  value: string | number;
  thresholdImpact: 'nominal' | 'moderate' | 'high' | 'severe';
  explanation: string;
}

export interface RiskPredictionResult {
  risk_score: number; // 0 - 100
  probability: number; // 0.0 - 1.0
  risk_level: RiskLevel;
  confidence: number; // 0.0 - 1.0 (e.g. 0.89)
  contributing_factors: ContributingFactor[];
  calibrated_by?: string;
  timestamp: string;
}

export interface LandslideLocation {
  id: string;
  name: string;
  district: string;
  state: 'Assam' | 'Meghalaya' | 'Sikkim' | 'Arunachal Pradesh' | 'Nagaland' | 'Manipur' | 'Mizoram' | 'Tripura';
  lat: number;
  lng: number;
  elevation: number; // meters
  slope: number; // degrees
  rainfall_current_mm: number; // last 24h
  rainfall_7d_cumulative_mm: number;
  forecast_rainfall_48h_mm: number;
  soil_moisture_pct: number; // 0-100%
  historical_events_count: number;
  exposed_population: number;
  vulnerable_villages: string[];
  road_name: string;
  road_criticality: 'National Highway' | 'State Strategic Border' | 'District Lifeline' | 'Local Access';
  critical_infrastructure: string[];
  current_risk_score: number;
  current_risk_level: RiskLevel;
  last_updated: string;
  verification_status: 'Unverified' | 'Field Verified' | 'Urgent Inspection Required' | 'Action In Progress';
  latest_report_id?: string;
}

export interface FieldObservationItem {
  cracks: boolean;
  soil_movement: boolean;
  debris: boolean;
  road_blockage: boolean;
}

export interface VisionAnalysisResult {
  crack_detected: boolean;
  debris_detected: boolean;
  road_blockage_detected: boolean;
  confidence: number;
  features_summary: string[];
  model_notice: string;
}

export interface FieldReport {
  id: string;
  location_id: string;
  location_name: string;
  lat: number;
  lng: number;
  reporter_name: string;
  reporter_role: 'District Disaster Officer' | 'NDRF Field Operative' | 'BRO Road Engineer' | 'Local Village Volunteer';
  observations: FieldObservationItem;
  severity?: 'LOW' | 'WATCH' | 'HIGH' | 'CRITICAL';
  image_url?: string;
  image_name?: string;
  vision_analysis?: VisionAnalysisResult;
  notes: string;
  created_at: string;
  synced_online: boolean;
  client_id?: string; // for offline uuid
  risk_adjusted_delta?: number;
}

export interface EmergencyPriorityItem {
  id: string;
  priority_rank: number;
  priority_level: 'P1 - Immediate Evacuation / BRO Action' | 'P2 - Road Clearance / Pre-alert' | 'P3 - Active Watch & Drone Survey' | 'P4 - Standard Monitoring';
  location_id: string;
  location_name: string;
  state: string;
  risk_score: number;
  risk_level: RiskLevel;
  population_exposed: number;
  road_criticality: string;
  reason: string;
  recommended_action: string;
  decision_support_disclaimer: string;
  assigned_agency: 'NDRF 1st Bn' | 'BRO Border Roads' | 'SDRF Quick Response' | 'District Magistrate Disaster Cell';
  last_evaluated: string;
}

export interface DisasterAlert {
  id: string;
  location_id: string;
  location_name: string;
  risk_level: 'WATCH' | 'HIGH' | 'CRITICAL';
  severity: 'Warning' | 'Severe' | 'Extreme';
  language: 'English' | 'Hindi' | 'Assamese' | 'Bengali';
  title: string;
  message: string;
  timestamp: string;
  delivery_channels: {
    sms_broadcast: 'Simulated Sent' | 'Pending';
    cap_ndma_feed: 'Active Feed' | 'Draft';
    siren_relay: 'Armed' | 'Standby';
  };
  author: string;
}

export interface DashboardMetrics {
  total_monitored_zones: number;
  risk_distribution: {
    low: number;
    watch: number;
    high: number;
    critical: number;
  };
  active_warnings_count: number;
  vulnerable_villages_count: number;
  vulnerable_roads_count: number;
  highest_risk_zones: LandslideLocation[];
  rainfall_trend: { time: string; avg_rainfall_mm: number; soil_saturation_pct: number }[];
  risk_trend: { day: string; critical_count: number; high_count: number; alerts_issued: number }[];
}
