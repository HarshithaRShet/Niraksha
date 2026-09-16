import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTabId } from './components/Sidebar';
import { CommandDashboard } from './components/CommandDashboard';
import { RiskMap } from './components/RiskMap';
import { RiskAnalysis } from './components/RiskAnalysis';
import { FieldVerification } from './components/FieldVerification';
import { EmergencyPriority } from './components/EmergencyPriority';
import { AlertsManagement } from './components/AlertsManagement';
import { ReportsViewer } from './components/ReportsViewer';
import { SettingsAbout } from './components/SettingsAbout';
import { api } from './services/apiClient';
import {
  LandslideLocation,
  FieldReport,
  DisasterAlert,
  EmergencyPriorityItem,
  DashboardMetrics,
  RiskPredictionResult
} from './types';
import {
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  Info,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  // Navigation matching exact user specifications:
  // /dashboard, /risk-map, /risk-analysis, /field-verification, /emergency-priority, /alerts, /reports, /settings
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Connectivity & offline synchronization
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Core domain states
  const [locations, setLocations] = useState<LandslideLocation[]>([]);
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [priorities, setPriorities] = useState<EmergencyPriorityItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Data Loading & Error states
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selected items for inter-tab routing
  const [selectedLocationId, setSelectedLocationId] = useState<string | undefined>();
  const [preselectedRiskLevel, setPreselectedRiskLevel] = useState<'WATCH' | 'HIGH' | 'CRITICAL' | undefined>();

  // Confirmation modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
  } | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const loadData = async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      setLoadError(null);
      const [locs, reps, alts, prios, mets] = await Promise.all([
        api.getLocations(),
        api.getReports(),
        api.getAlerts(),
        api.getEmergencyPriorities(),
        api.getDashboardMetrics()
      ]);

      setLocations(locs);
      setReports(reps);
      setAlerts(alts);
      setPriorities(prios);
      setMetrics(mets);
      setOfflineCount(api.getOfflineReports().length);
    } catch (err: any) {
      console.error('NIR-RAKSHA API Fetch Error:', err);
      setLoadError('Failed to synchronize with the NIR-RAKSHA database. Displaying local operational cache.');
    } finally {
      setIsLoadingInitial(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncOffline = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncOfflineReports();
      await loadData(true);
      showToast(`Synchronized ${res.syncedCount} queued field inspection logs to command database!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Synchronization failed. Please check network connection.', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReportSubmitted = async (locName: string, delta: number) => {
    await loadData(true);
    showToast(`Ground observation for ${locName} logged. Risk score recalibrated.`, 'success');
  };

  const handleAlertCreated = async (newAlert: DisasterAlert) => {
    await loadData(true);
    showToast(`Emergency Warning #${newAlert.id} transmitted via CAP-NDMA and SMS gateway.`, 'warning');
  };

  const handleNavigateWithLocation = (tabId: string, locationId?: string) => {
    if (locationId) {
      setSelectedLocationId(locationId);
    }
    setActiveTab(tabId as NavTabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDispatchAlertFromPriority = (locationId: string, level: string) => {
    // Open confirmation dialog before broadcast
    const loc = locations.find(l => l.id === locationId);
    const locName = loc ? loc.name : locationId;

    setConfirmDialog({
      isOpen: true,
      title: 'Authorize Public Disaster Alert Broadcast',
      message: `You are authorizing an emergency ${level} alert broadcast for "${locName}". This will trigger automated SMS alerts to vulnerable settlements and CAP-NDMA feed propagation. Confirm dispatch?`,
      confirmLabel: 'Confirm & Open Alert Composer',
      onConfirm: () => {
        setSelectedLocationId(locationId);
        setPreselectedRiskLevel(level === 'CRITICAL' ? 'CRITICAL' : level === 'HIGH' ? 'HIGH' : 'WATCH');
        setActiveTab('alerts');
        setConfirmDialog(null);
      }
    });
  };

  const criticalAlerts = alerts.filter(a => a.risk_level === 'CRITICAL');

  // Page titles matching active tab
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Disaster Management Command Center';
      case 'risk-map':
        return 'GIS Landslide Risk & Hazard Zone Map';
      case 'risk-analysis':
        return 'AI Risk Engine & Explainability Model';
      case 'field-verification':
        return 'Ground Truth Field Recon & Vision Verification';
      case 'emergency-priority':
        return 'Emergency Resource Prioritization (DSS)';
      case 'alerts':
        return 'Multi-Channel Disaster Alerts & Bulletins';
      case 'reports':
        return 'Ground Incident Reports & Geotechnical Logs';
      case 'settings':
        return 'System Architecture & SIH 2026 Protocol';
      default:
        return 'NIR-RAKSHA Command Grid';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        pageTitle={getPageTitle()}
        onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        offlineCount={offlineCount}
        onSyncOffline={handleSyncOffline}
        isSyncing={isSyncing}
        criticalAlerts={criticalAlerts}
        onRefreshData={() => loadData(false)}
        isRefreshing={isRefreshing}
      />

      {/* Main Layout with Collapsible Desktop & Mobile Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={tab => {
            setActiveTab(tab);
            setIsMobileNavOpen(false);
          }}
          criticalAlertCount={criticalAlerts.length}
          isOpenMobile={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Dynamic Page Container */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Error Notification Banner if backend has trouble */}
            {loadError && (
              <div className="bg-amber-950/80 border border-amber-500/60 text-amber-200 p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{loadError}</span>
                </div>
                <button
                  onClick={() => loadData(false)}
                  className="px-3 py-1 bg-amber-900/70 hover:bg-amber-800 text-amber-100 rounded text-xs font-semibold border border-amber-600"
                >
                  Retry API
                </button>
              </div>
            )}

            {/* Loading State Skeleton */}
            {isLoadingInitial && !metrics ? (
              <div className="h-[500px] flex flex-col items-center justify-center space-y-4 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <div className="text-sm font-medium">Connecting to NIR-RAKSHA Database & Risk Services...</div>
                <div className="text-xs text-slate-500 font-mono">Loading 8 NER State Sensors & Elevation Grids</div>
              </div>
            ) : (
              <>
                {/* 1. /dashboard */}
                {activeTab === 'dashboard' && metrics && (
                  <CommandDashboard
                    metrics={metrics}
                    onNavigateTab={handleNavigateWithLocation}
                    onSelectZoneForDetails={loc => {
                      setSelectedLocationId(loc.id);
                    }}
                  />
                )}

                {/* 2. /risk-map */}
                {activeTab === 'risk-map' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-white">Geospatial Hazard Map (NER-8S Grid)</h2>
                        <p className="text-xs text-slate-400">
                          Cartographic visualization with GSI landslide susceptibility indices and real-time station data.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                        {locations.length} Stations Active
                      </span>
                    </div>

                    <RiskMap
                      locations={locations}
                      fieldReports={reports}
                      selectedLocationId={selectedLocationId}
                      onSelectLocation={loc => setSelectedLocationId(loc.id)}
                      onOpenReportModal={locId => handleNavigateWithLocation('field-verification', locId)}
                      onAnalyze={loc => handleNavigateWithLocation('risk-analysis', loc.id)}
                      onDispatchAlert={loc => handleDispatchAlertFromPriority(loc.id, loc.current_risk_level)}
                    />
                  </div>
                )}

                {/* 3. /risk-analysis */}
                {activeTab === 'risk-analysis' && (
                  <RiskAnalysis
                    locations={locations}
                    onApplyDynamicRisk={async () => {
                      await loadData(true);
                      showToast('Risk prediction calculated and synchronized with hazard grid.', 'info');
                    }}
                  />
                )}

                {/* 4. /field-verification */}
                {activeTab === 'field-verification' && (
                  <FieldVerification
                    locations={locations}
                    isOnline={isOnline}
                    preselectedLocationId={selectedLocationId}
                    onReportSubmitted={handleReportSubmitted}
                  />
                )}

                {/* 5. /emergency-priority */}
                {activeTab === 'emergency-priority' && (
                  <EmergencyPriority
                    priorities={priorities}
                    onDispatchAlert={handleDispatchAlertFromPriority}
                    onSelectPriority={prio => {
                      setSelectedLocationId(prio.location_id);
                    }}
                  />
                )}

                {/* 6. /alerts */}
                {activeTab === 'alerts' && (
                  <AlertsManagement
                    alerts={alerts}
                    locations={locations}
                    onAlertCreated={handleAlertCreated}
                    preselectedLocationId={selectedLocationId}
                    preselectedRiskLevel={preselectedRiskLevel}
                  />
                )}

                {/* 7. /reports */}
                {activeTab === 'reports' && (
                  <ReportsViewer
                    reports={reports}
                    onSelectReportLocation={locId => handleNavigateWithLocation('risk-map', locId)}
                  />
                )}

                {/* 8. /settings */}
                {activeTab === 'settings' && (
                  <SettingsAbout />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>{confirmDialog.title}</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="btn-confirm-cancel"
                onClick={() => setConfirmDialog(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-proceed"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="system-toast-banner"
          className={`fixed bottom-5 right-5 z-50 border px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-3 animate-fade-in max-w-md ${
            toastMessage.type === 'warning'
              ? 'bg-red-950/95 border-red-500 text-red-200'
              : toastMessage.type === 'info'
              ? 'bg-cyan-950/95 border-cyan-500 text-cyan-200'
              : 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 animate-ping ${
              toastMessage.type === 'warning'
                ? 'bg-red-400'
                : toastMessage.type === 'info'
                ? 'bg-cyan-400'
                : 'bg-emerald-400'
            }`}
          />
          <span className="font-medium">{toastMessage.text}</span>
          <button
            id="btn-toast-close"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-auto text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Disaster Command Grid Status Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3 px-6 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-300 font-semibold">NIR-RAKSHA EARLY WARNING SYSTEM</span>
          <span>•</span>
          <span>SIH 2026 Problem #26001</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Geological Survey of India (GSI) & NDMA Framework Baseline
        </div>
      </footer>
    </div>
  );
}
