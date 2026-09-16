import React from 'react';
import { LandslideLocation } from '../types';
import { RiskBadge } from './RiskBadge';
import {
  MapPin,
  Mountain,
  Droplets,
  Layers,
  Users,
  Route,
  Building,
  ShieldCheck,
  AlertTriangle,
  X,
  Radio,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
} from 'lucide-react';

interface MapDetailPanelProps {
  location: LandslideLocation;
  onClose: () => void;
  onAnalyze?: (location: LandslideLocation) => void;
  onVerify?: (location: LandslideLocation) => void;
  onDispatchAlert?: (location: LandslideLocation) => void;
}

export const MapDetailPanel: React.FC<MapDetailPanelProps> = ({
  location,
  onClose,
  onAnalyze,
  onVerify,
  onDispatchAlert
}) => {
  const getRiskBorderColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-red-500/80 shadow-red-950/40';
      case 'HIGH':
        return 'border-orange-500/80 shadow-orange-950/40';
      case 'WATCH':
        return 'border-yellow-500/80 shadow-yellow-950/40';
      case 'LOW':
      default:
        return 'border-emerald-500/80 shadow-emerald-950/40';
    }
  };

  return (
    <div
      id={`gis-detail-panel-${location.id}`}
      className={`bg-slate-900/95 border ${getRiskBorderColor(
        location.current_risk_level
      )} rounded-2xl p-5 shadow-2xl backdrop-blur-md text-slate-200 flex flex-col h-full overflow-y-auto max-h-[720px] transition-all`}
    >
      {/* Header bar */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              {location.id}
            </span>
            <span>•</span>
            <span className="text-slate-300 font-semibold">{location.district}, {location.state}</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 leading-snug">
            {location.name}
          </h3>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>Lat: {location.lat.toFixed(4)}°N, Lng: {location.lng.toFixed(4)}°E</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RiskBadge
            level={location.current_risk_level}
            score={location.current_risk_score}
            size="md"
            showPulse
          />
          <button
            id="btn-close-map-detail-panel"
            onClick={onClose}
            aria-label="Close details"
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Core Telemetry Matrix (Required fields) */}
      <div className="grid grid-cols-2 gap-2.5 my-4 shrink-0">
        {/* Risk Score */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-400" /> Risk Score
          </div>
          <div className="text-xl font-black text-white font-mono mt-0.5 flex items-baseline gap-1">
            <span>{location.current_risk_score}</span>
            <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
            Level: <strong className="text-slate-200">{location.current_risk_level}</strong>
          </div>
        </div>

        {/* 24h Rainfall */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" /> Rainfall (24h)
          </div>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            {location.rainfall_current_mm} <span className="text-xs text-slate-400 font-normal">mm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            7d: {location.rainfall_7d_cumulative_mm}mm | Fc 48h: {location.forecast_rainfall_48h_mm}mm
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Layers className="w-3 h-3 text-indigo-400" /> Soil Moisture
          </div>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            {location.soil_moisture_pct}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Saturation Index: {location.soil_moisture_pct > 80 ? 'Critical' : 'Sub-critical'}
          </div>
        </div>

        {/* Slope & Elevation */}
        <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Mountain className="w-3 h-3 text-amber-400" /> Slope Angle
          </div>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            {location.slope}°
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Elevation: {location.elevation}m MSL
          </div>
        </div>
      </div>

      {/* Exposed Population & Road Criticality */}
      <div className="space-y-2 text-xs shrink-0">
        {/* Exposed Population */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Users className="w-3.5 h-3.5 text-purple-400" /> Exposed Population
            </div>
            <span className="font-mono font-bold text-white text-sm">
              {location.exposed_population.toLocaleString()} people
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Villages: {location.vulnerable_villages.join(', ') || 'No proximate settlements'}
          </div>
        </div>

        {/* Road Criticality */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
              <Route className="w-3.5 h-3.5 text-cyan-400" /> Road Criticality
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                location.road_criticality === 'National Highway'
                  ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                  : location.road_criticality === 'State Strategic Border'
                  ? 'bg-orange-950/80 text-orange-400 border border-orange-800/60'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              {location.road_criticality}
            </span>
          </div>
          <div className="text-slate-200 font-semibold text-xs mt-1">
            {location.road_name}
          </div>
        </div>

        {/* Critical Infrastructure */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-1">
            <Building className="w-3.5 h-3.5 text-emerald-400" /> Strategic Assets
          </div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            {location.critical_infrastructure.map((asset, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                <span>{asset}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Field Verification Badge */}
        <div className="flex items-center justify-between bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-800/60 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Verification Status:
          </span>
          <span
            className={`font-mono font-semibold ${
              location.verification_status === 'Field Verified'
                ? 'text-emerald-400'
                : location.verification_status === 'Urgent Inspection Required'
                ? 'text-red-400'
                : 'text-amber-400'
            }`}
          >
            {location.verification_status}
          </span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2 shrink-0">
        {onAnalyze && (
          <button
            id={`btn-panel-analyze-${location.id}`}
            onClick={() => onAnalyze(location)}
            className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            ML Assessment
          </button>
        )}
        {onVerify && (
          <button
            id={`btn-panel-verify-${location.id}`}
            onClick={() => onVerify(location)}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Field Recon
          </button>
        )}
        {onDispatchAlert && (
          <button
            id={`btn-panel-alert-${location.id}`}
            onClick={() => onDispatchAlert(location)}
            className="py-2 px-3 bg-red-600/90 hover:bg-red-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Alert Team
          </button>
        )}
      </div>
    </div>
  );
};
