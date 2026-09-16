import React from 'react';
import { LandslideLocation } from '../types';
import { RiskBadge } from './RiskBadge';
import { MapPin, Droplets, Mountain, Users, ArrowRight, Route } from 'lucide-react';

interface RiskCardProps {
  location: LandslideLocation;
  onClick?: (loc: LandslideLocation) => void;
  onAnalyze?: (loc: LandslideLocation) => void;
  isSelected?: boolean;
}

export const RiskCard: React.FC<RiskCardProps> = ({
  location,
  onClick,
  onAnalyze,
  isSelected = false
}) => {
  const getBorderColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'border-red-500/50 hover:border-red-400 bg-red-950/10';
      case 'HIGH':
        return 'border-amber-500/50 hover:border-amber-400 bg-amber-950/10';
      case 'WATCH':
        return 'border-yellow-500/50 hover:border-yellow-400 bg-yellow-950/10';
      case 'LOW':
      default:
        return 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/10';
    }
  };

  return (
    <div
      id={`risk-card-${location.id}`}
      onClick={() => onClick && onClick(location)}
      className={`rounded-xl p-4 border transition-all cursor-pointer shadow-lg backdrop-blur-sm ${getBorderColor(
        location.current_risk_level
      )} ${
        isSelected ? 'ring-2 ring-cyan-400 border-cyan-400 shadow-cyan-950/50' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{location.district}, {location.state}</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-1 leading-tight line-clamp-1">
            {location.name}
          </h4>
        </div>
        <RiskBadge level={location.current_risk_level} score={location.current_risk_score} size="sm" />
      </div>

      <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-slate-800/80 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" /> 24h Rain
          </span>
          <span className="font-mono font-bold text-slate-200">
            {location.rainfall_current_mm} mm
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Mountain className="w-3 h-3 text-amber-400" /> Slope
          </span>
          <span className="font-mono font-bold text-slate-200">
            {location.slope}°
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" /> At Risk
          </span>
          <span className="font-mono font-bold text-slate-200">
            {location.exposed_population.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 truncate max-w-[170px]">
          <Route className="w-3 h-3 text-slate-500 shrink-0" /> {location.road_name}
        </span>
        {onAnalyze && (
          <button
            id={`btn-analyze-${location.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(location);
            }}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium ml-auto"
          >
            Predict <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
