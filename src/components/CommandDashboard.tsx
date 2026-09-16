import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Droplets,
  Users,
  Route,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Clock,
  Radio,
  FileCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { DashboardMetrics, LandslideLocation } from '../types';
import { RiskBadge } from './RiskBadge';
import { RiskCard } from './RiskCard';
import { RiskChart } from './RiskChart';

interface CommandDashboardProps {
  metrics: DashboardMetrics;
  onNavigateTab: (tabId: string, locationId?: string) => void;
  onSelectZoneForDetails: (loc: LandslideLocation) => void;
}

export const CommandDashboard: React.FC<CommandDashboardProps> = ({
  metrics,
  onNavigateTab,
  onSelectZoneForDetails
}) => {
  const {
    total_monitored_zones,
    risk_distribution,
    active_warnings_count,
    vulnerable_villages_count,
    vulnerable_roads_count,
    highest_risk_zones,
    rainfall_trend,
    risk_trend
  } = metrics;

  return (
    <div className="space-y-6">
      {/* Metrics Row: 5 High-Impact Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Monitored Zones */}
        <div
          id="metric-card-zones"
          onClick={() => onNavigateTab('risk-map')}
          className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px]">Monitored Zones</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {total_monitored_zones}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>8 NER States Active</span>
            <ArrowUpRight className="w-3 h-3 text-cyan-400" />
          </div>
        </div>

        {/* Critical & High Counts */}
        <div
          id="metric-card-critical"
          onClick={() => onNavigateTab('emergency-priority')}
          className="bg-slate-900/90 border border-red-900/50 hover:border-red-500 rounded-xl p-3.5 shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-red-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px]">Critical Hazard</span>
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono mt-1">
            {risk_distribution.critical}
            <span className="text-xs text-orange-400 font-normal ml-1.5 font-mono">
              + {risk_distribution.high} High
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Immediate Response</span>
            <ArrowUpRight className="w-3 h-3 text-red-400" />
          </div>
        </div>

        {/* Active Warnings */}
        <div
          id="metric-card-alerts"
          onClick={() => onNavigateTab('alerts')}
          className="bg-slate-900/90 border border-amber-900/50 hover:border-amber-500 rounded-xl p-3.5 shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px]">Active Warnings</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {active_warnings_count}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>CAP-NDMA Relays</span>
            <ArrowUpRight className="w-3 h-3 text-amber-400" />
          </div>
        </div>

        {/* Exposed Citizens */}
        <div
          id="metric-card-villages"
          onClick={() => onNavigateTab('risk-map')}
          className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-indigo-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px]">Exposed Villages</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono mt-1">
            {vulnerable_villages_count}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>In Catchment Footprint</span>
            <ArrowUpRight className="w-3 h-3 text-indigo-400" />
          </div>
        </div>

        {/* Lifeline Corridors */}
        <div
          id="metric-card-roads"
          onClick={() => onNavigateTab('emergency-priority')}
          className="col-span-2 sm:col-span-1 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-3.5 shadow-md cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span className="uppercase tracking-wider font-semibold text-[10px]">Highways at Risk</span>
            <Route className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono mt-1">
            {vulnerable_roads_count}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>NH-10, NH-54E, NH-29</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Corridor Table & Rainfall Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Highest Risk Zones List */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Current Highest Landslide Risk Zones (Priority Watch)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Real-time geotechnical evaluation combining 24h precipitation, slope degree, and ground tension crack reports.
              </p>
            </div>
            <button
              id="btn-goto-risk-map"
              onClick={() => onNavigateTab('risk-map')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors shrink-0"
            >
              <span>Explore Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highest_risk_zones.map((loc) => (
              <RiskCard
                key={loc.id}
                location={loc}
                onClick={() => {
                  onSelectZoneForDetails(loc);
                  onNavigateTab('risk-map', loc.id);
                }}
                onAnalyze={() => onNavigateTab('risk-analysis', loc.id)}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Total 8 Critical Corridors in Active Surveillance</span>
            <button
              onClick={() => onNavigateTab('emergency-priority')}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
            >
              View Prioritized Resource Dispatch <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Hydrological Trigger Profile Chart */}
        <div className="lg:col-span-5 space-y-4">
          <RiskChart rainfallData={rainfall_trend} />

          {/* Quick Action Decision Support Module */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl text-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Standard Operating Procedures (SOP) Quick Dispatch</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-quick-recon"
                onClick={() => onNavigateTab('field-verification')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Field Recon
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Log ground tension fissures & scree
                </div>
              </button>

              <button
                id="btn-quick-alert"
                onClick={() => onNavigateTab('alerts')}
                className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-red-400" />
                  Issue Warning
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  CAP-NDMA & Multi-lingual SMS
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
