import React from 'react';
import { LandslideLocation } from '../types';
import { RiskBadge } from './RiskBadge';
import {
  MapPin,
  Mountain,
  Droplets,
  Wind,
  Layers,
  Users,
  Route,
  Building,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  X
} from 'lucide-react';

interface LocationDetailsProps {
  location: LandslideLocation;
  onClose?: () => void;
  onAnalyze?: (location: LandslideLocation) => void;
  onVerify?: (location: LandslideLocation) => void;
  onDispatchAlert?: (location: LandslideLocation) => void;
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({
  location,
  onClose,
  onAnalyze,
  onVerify,
  onDispatchAlert
}) => {
  return (
    <div
      id={`location-details-${location.id}`}
      className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-slate-200"
    >
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              {location.id}
            </span>
            <span>•</span>
            <span className="text-slate-300 font-medium">{location.district}, {location.state}</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 leading-snug">
            {location.name}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RiskBadge level={location.current_risk_level} score={location.current_risk_score} size="md" showPulse />
          {onClose && (
            <button
              id="btn-close-location-details"
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" /> 24h Rainfall
          </div>
          <div className="text-base font-black text-white font-mono mt-0.5">
            {location.rainfall_current_mm} mm
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            7d: {location.rainfall_7d_cumulative_mm} mm
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" /> Soil Saturation
          </div>
          <div className="text-base font-black text-white font-mono mt-0.5">
            {location.soil_moisture_pct}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            IMD 48h Fc: {location.forecast_rainfall_48h_mm} mm
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Mountain className="w-3.5 h-3.5 text-amber-400" /> Slope Angle
          </div>
          <div className="text-base font-black text-white font-mono mt-0.5">
            {location.slope}°
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Elevation: {location.elevation}m
          </div>
        </div>

        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> Vulnerable Pop.
          </div>
          <div className="text-base font-black text-white font-mono mt-0.5">
            {location.exposed_population.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            History: {location.historical_events_count} slides
          </div>
        </div>
      </div>

      <div className="space-y-2.5 text-xs text-slate-300">
        <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          <Route className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">Transport Lifeline: {location.road_name}</div>
            <div className="text-slate-400 text-[11px]">Classification: {location.road_criticality}</div>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          <Building className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">Critical Infrastructure Assets</div>
            <div className="text-slate-400 text-[11px]">
              {location.critical_infrastructure.join(', ') || 'No registered heavy dams/substations'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">Exposed Villages in Catchment</div>
            <div className="text-slate-400 text-[11px]">
              {location.vulnerable_villages.join(', ') || 'Remote uninhabited mountain section'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
        {onAnalyze && (
          <button
            id={`btn-details-analyze-${location.id}`}
            onClick={() => onAnalyze(location)}
            className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Run ML Recalibration
          </button>
        )}
        {onVerify && (
          <button
            id={`btn-details-verify-${location.id}`}
            onClick={() => onVerify(location)}
            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Submit Field Recon
          </button>
        )}
        {onDispatchAlert && (
          <button
            id={`btn-details-alert-${location.id}`}
            onClick={() => onDispatchAlert(location)}
            className="py-2 px-3 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            Broadcast Alert
          </button>
        )}
      </div>
    </div>
  );
};
