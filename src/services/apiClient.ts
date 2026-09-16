import {
  LandslideLocation,
  FieldReport,
  DisasterAlert,
  EmergencyPriorityItem,
  DashboardMetrics,
  RiskPredictionResult
} from '../types';
import { INITIAL_LOCATIONS, INITIAL_REPORTS, INITIAL_ALERTS } from '../data/mockData';
import { computeLandslideRisk, calculateEmergencyPriorities, RiskInputParams } from './riskEngine';
import { analyzeFieldImage, AnalyzeImageParams } from './visionEngine';
import dbExportData from '../data/backendDbExport.json';

const STORAGE_LOCATIONS_KEY = 'nir_raksha_locations_v2';
const STORAGE_REPORTS_KEY = 'nir_raksha_reports_v2';
const STORAGE_ALERTS_KEY = 'nir_raksha_alerts_v2';
const STORAGE_OFFLINE_QUEUE_KEY = 'nir_raksha_offline_queue_v2';

class DataStoreService {
  private locations: LandslideLocation[] = [];
  private reports: FieldReport[] = [];
  private alerts: DisasterAlert[] = [];
  private isBackendLive: boolean = false;

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    try {
      const savedLocs = localStorage.getItem(STORAGE_LOCATIONS_KEY);
      if (savedLocs) {
        this.locations = JSON.parse(savedLocs);
      } else if (dbExportData && dbExportData.locations && dbExportData.locations.length > 0) {
        // Direct seed from SQLite database
        this.locations = dbExportData.locations as any[];
      } else {
        this.locations = INITIAL_LOCATIONS;
      }

      const savedReps = localStorage.getItem(STORAGE_REPORTS_KEY);
      if (savedReps) {
        this.reports = JSON.parse(savedReps);
      } else if (dbExportData && dbExportData.reports) {
        this.reports = dbExportData.reports as any[];
      } else {
        this.reports = INITIAL_REPORTS;
      }

      const savedAlerts = localStorage.getItem(STORAGE_ALERTS_KEY);
      if (savedAlerts) {
        this.alerts = JSON.parse(savedAlerts);
      } else if (dbExportData && dbExportData.alerts) {
        this.alerts = dbExportData.alerts as any[];
      } else {
        this.alerts = INITIAL_ALERTS;
      }
    } catch (err) {
      console.warn('Storage initial read error, defaulting to database export:', err);
      this.locations = (dbExportData?.locations as any[]) || [...INITIAL_LOCATIONS];
      this.reports = (dbExportData?.reports as any[]) || [...INITIAL_REPORTS];
      this.alerts = (dbExportData?.alerts as any[]) || [...INITIAL_ALERTS];
    }
  }

  private persistLocations() {
    try {
      localStorage.setItem(STORAGE_LOCATIONS_KEY, JSON.stringify(this.locations));
    } catch (e) {
      console.error(e);
    }
  }

  private persistReports() {
    try {
      localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(this.reports));
    } catch (e) {
      console.error(e);
    }
  }

  private persistAlerts() {
    try {
      localStorage.setItem(STORAGE_ALERTS_KEY, JSON.stringify(this.alerts));
    } catch (e) {
      console.error(e);
    }
  }

  // GET /api/locations
  public async getLocations(): Promise<LandslideLocation[]> {
    // Attempt FastAPI endpoint if available, fallback to SQLite-backed store
    try {
      const res = await fetch('/api/locations', { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.locations = data;
          this.persistLocations();
          this.isBackendLive = true;
          return data;
        }
      }
    } catch {
      // Backend not responding or timeout; continue with local persistent database
    }
    return [...this.locations];
  }

  // GET /api/risk/{location_id}
  public async getLocationById(id: string): Promise<LandslideLocation | null> {
    try {
      const res = await fetch(`/api/risk/${id}`, { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    const found = this.locations.find(l => l.id === id);
    return found ? { ...found } : null;
  }

  // POST /api/risk/predict
  public async predictRisk(input: RiskInputParams): Promise<RiskPredictionResult> {
    try {
      const res = await fetch('/api/risk/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(1800)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return computeLandslideRisk(input);
  }

  // GET /api/reports
  public async getReports(): Promise<FieldReport[]> {
    try {
      const res = await fetch('/api/reports', { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.reports = data;
          this.persistReports();
          return data;
        }
      }
    } catch {}
    return [...this.reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // POST /api/vision/analyze
  public async analyzeImage(params: AnalyzeImageParams) {
    try {
      const res = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return analyzeFieldImage(params);
  }

  // POST /api/reports - Dynamic Risk Update implementation
  public async submitReport(
    reportData: Omit<FieldReport, 'id' | 'created_at' | 'synced_online'>,
    isOnline: boolean
  ): Promise<{ report: FieldReport; locationUpdated: LandslideLocation | null }> {
    const reportId = `REP-${Date.now().toString().slice(-6)}`;
    const nowStr = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' IST';

    // Calculate dynamic risk delta if ground evidence present
    let delta = 0;
    if (reportData.observations.cracks) delta += 7;
    if (reportData.observations.soil_movement) delta += 9;
    if (reportData.observations.debris) delta += 5;
    if (reportData.observations.road_blockage) delta += 6;

    const newReport: FieldReport = {
      ...reportData,
      id: reportId,
      created_at: nowStr,
      synced_online: isOnline,
      risk_adjusted_delta: delta
    };

    if (!isOnline) {
      this.saveOfflineReport(newReport);
      return { report: newReport, locationUpdated: null };
    }

    // Try posting to FastAPI backend first
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport),
        signal: AbortSignal.timeout(1500)
      });
    } catch {}

    // Save report in main store
    this.reports.unshift(newReport);
    this.persistReports();

    // DYNAMIC RISK UPDATE: reflect ground verification on the corresponding location
    let updatedLocation: LandslideLocation | null = null;
    const locIdx = this.locations.findIndex(l => l.id === reportData.location_id);
    if (locIdx !== -1) {
      const loc = this.locations[locIdx];
      const recalculatedPrediction = computeLandslideRisk({
        rainfall: loc.rainfall_current_mm,
        soil_moisture: loc.soil_moisture_pct,
        slope: loc.slope,
        historical_events: loc.historical_events_count,
        forecast_rainfall: loc.forecast_rainfall_48h_mm,
        ground_evidence: {
          cracks: reportData.observations.cracks,
          soil_movement: reportData.observations.soil_movement,
          debris: reportData.observations.debris,
          road_blockage: reportData.observations.road_blockage
        }
      });

      this.locations[locIdx] = {
        ...loc,
        current_risk_score: recalculatedPrediction.risk_score,
        current_risk_level: recalculatedPrediction.risk_level,
        last_updated: nowStr,
        verification_status: 'Field Verified',
        latest_report_id: reportId
      };
      updatedLocation = this.locations[locIdx];
      this.persistLocations();
    }

    return { report: newReport, locationUpdated: updatedLocation };
  }

  // Offline queue management
  public getOfflineReports(): FieldReport[] {
    try {
      const q = localStorage.getItem(STORAGE_OFFLINE_QUEUE_KEY);
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  }

  public saveOfflineReport(report: FieldReport) {
    const queue = this.getOfflineReports();
    queue.push(report);
    localStorage.setItem(STORAGE_OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  public async syncOfflineReports(): Promise<{ syncedCount: number; updatedLocations: LandslideLocation[] }> {
    const queue = this.getOfflineReports();
    if (queue.length === 0) {
      return { syncedCount: 0, updatedLocations: [] };
    }

    const updatedLocations: LandslideLocation[] = [];
    for (const report of queue) {
      report.synced_online = true;
      this.reports.unshift(report);

      const locIdx = this.locations.findIndex(l => l.id === report.location_id);
      if (locIdx !== -1) {
        const loc = this.locations[locIdx];
        const recalculated = computeLandslideRisk({
          rainfall: loc.rainfall_current_mm,
          soil_moisture: loc.soil_moisture_pct,
          slope: loc.slope,
          historical_events: loc.historical_events_count,
          forecast_rainfall: loc.forecast_rainfall_48h_mm,
          ground_evidence: report.observations
        });

        this.locations[locIdx] = {
          ...loc,
          current_risk_score: recalculated.risk_score,
          current_risk_level: recalculated.risk_level,
          last_updated: 'Synced ' + new Date().toLocaleTimeString('en-IN') + ' IST',
          verification_status: 'Field Verified',
          latest_report_id: report.id
        };
        updatedLocations.push(this.locations[locIdx]);
      }
    }

    localStorage.removeItem(STORAGE_OFFLINE_QUEUE_KEY);
    this.persistReports();
    this.persistLocations();

    return { syncedCount: queue.length, updatedLocations };
  }

  // GET /api/alerts
  public async getAlerts(): Promise<DisasterAlert[]> {
    try {
      const res = await fetch('/api/alerts', { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.alerts = data;
          this.persistAlerts();
          return data;
        }
      }
    } catch {}
    return [...this.alerts];
  }

  // POST /api/alerts
  public async createAlert(alertData: Omit<DisasterAlert, 'id' | 'timestamp' | 'delivery_channels'>): Promise<DisasterAlert> {
    const newAlert: DisasterAlert = {
      ...alertData,
      id: `ALT-2026-${(this.alerts.length + 1).toString().padStart(3, '0')}`,
      timestamp: new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' IST',
      delivery_channels: {
        sms_broadcast: 'Simulated Sent',
        cap_ndma_feed: 'Active Feed',
        siren_relay: alertData.risk_level === 'CRITICAL' ? 'Armed' : 'Standby'
      }
    };

    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlert),
        signal: AbortSignal.timeout(1500)
      });
    } catch {}

    this.alerts.unshift(newAlert);
    this.persistAlerts();
    return newAlert;
  }

  // GET /api/emergency-priority
  public async getEmergencyPriorities(): Promise<EmergencyPriorityItem[]> {
    try {
      const res = await fetch('/api/emergency-priority', { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}
    return calculateEmergencyPriorities(this.locations);
  }

  // GET /api/dashboard
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await fetch('/api/dashboard', { signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        if (data && data.total_monitored_zones) return data;
      }
    } catch {}

    const total_monitored_zones = this.locations.length;
    let low = 0, watch = 0, high = 0, critical = 0;
    let vulnerable_villages_count = 0;
    let vulnerable_roads_count = 0;

    const roadSet = new Set<string>();
    this.locations.forEach(l => {
      if (l.current_risk_level === 'LOW') low++;
      else if (l.current_risk_level === 'WATCH') watch++;
      else if (l.current_risk_level === 'HIGH') high++;
      else if (l.current_risk_level === 'CRITICAL') critical++;

      vulnerable_villages_count += (l.vulnerable_villages?.length || 0);
      roadSet.add(l.road_name);
    });

    vulnerable_roads_count = roadSet.size;

    const highest_risk_zones = [...this.locations]
      .sort((a, b) => b.current_risk_score - a.current_risk_score)
      .slice(0, 4);

    const rainfall_trend = [
      { time: '00:00', avg_rainfall_mm: 24.5, soil_saturation_pct: 58 },
      { time: '04:00', avg_rainfall_mm: 42.0, soil_saturation_pct: 65 },
      { time: '08:00', avg_rainfall_mm: 78.5, soil_saturation_pct: 74 },
      { time: '12:00', avg_rainfall_mm: 112.0, soil_saturation_pct: 86 },
      { time: '16:00', avg_rainfall_mm: 145.2, soil_saturation_pct: 92 },
      { time: '20:00', avg_rainfall_mm: 138.0, soil_saturation_pct: 89 }
    ];

    const risk_trend = [
      { day: 'Mon (D-5)', critical_count: 0, high_count: 2, alerts_issued: 1 },
      { day: 'Tue (D-4)', critical_count: 1, high_count: 2, alerts_issued: 2 },
      { day: 'Wed (D-3)', critical_count: 1, high_count: 3, alerts_issued: 2 },
      { day: 'Thu (D-2)', critical_count: 2, high_count: 4, alerts_issued: 4 },
      { day: 'Fri (D-1)', critical_count: 2, high_count: 3, alerts_issued: 3 },
      { day: 'Today (Live)', critical_count: critical, high_count: high, alerts_issued: this.alerts.length }
    ];

    return {
      total_monitored_zones,
      risk_distribution: { low, watch, high, critical },
      active_warnings_count: this.alerts.length,
      vulnerable_villages_count,
      vulnerable_roads_count,
      highest_risk_zones,
      rainfall_trend,
      risk_trend
    };
  }

  public resetToDefault() {
    this.locations = (dbExportData?.locations as any[]) || [...INITIAL_LOCATIONS];
    this.reports = (dbExportData?.reports as any[]) || [...INITIAL_REPORTS];
    this.alerts = (dbExportData?.alerts as any[]) || [...INITIAL_ALERTS];
    localStorage.removeItem(STORAGE_LOCATIONS_KEY);
    localStorage.removeItem(STORAGE_REPORTS_KEY);
    localStorage.removeItem(STORAGE_ALERTS_KEY);
    localStorage.removeItem(STORAGE_OFFLINE_QUEUE_KEY);
  }
}

export const api = new DataStoreService();
