import React from 'react';
import {
  Layers,
  Check,
  AlertTriangle,
  ShieldCheck,
  Ban,
  Activity,
  Maximize2,
  RefreshCw,
  Eye,
  Route
} from 'lucide-react';
import { RiskLevel } from '../types';

export type MapFilterType = 'ALL' | RiskLevel | 'ROAD_BLOCKAGE' | 'FIELD_VERIFIED';

interface MapControlsProps {
  currentFilter: MapFilterType;
  onFilterChange: (filter: MapFilterType) => void;
  onFitBounds: () => void;
  filteredCount: number;
  totalCount: number;
  showSusceptibilityLayer: boolean;
  onToggleSusceptibility: () => void;
  showHighwaysLayer: boolean;
  onToggleHighways: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  currentFilter,
  onFilterChange,
  onFitBounds,
  filteredCount,
  totalCount,
  showSusceptibilityLayer,
  onToggleSusceptibility,
  showHighwaysLayer,
  onToggleHighways
}) => {
  const filters: { id: MapFilterType; label: string; icon?: React.ReactNode; activeClass: string }[] = [
    {
      id: 'ALL',
      label: 'All Zones',
      activeClass: 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-500/20'
    },
    {
      id: 'LOW',
      label: 'Low',
      activeClass: 'bg-emerald-500 text-slate-950 font-bold shadow-emerald-500/20'
    },
    {
      id: 'WATCH',
      label: 'Watch',
      activeClass: 'bg-yellow-500 text-slate-950 font-bold shadow-yellow-500/20'
    },
    {
      id: 'HIGH',
      label: 'High',
      activeClass: 'bg-orange-500 text-white font-bold shadow-orange-500/20'
    },
    {
      id: 'CRITICAL',
      label: 'Critical',
      activeClass: 'bg-red-500 text-white font-bold shadow-red-500/20'
    },
    {
      id: 'ROAD_BLOCKAGE',
      label: 'Road Blockage',
      icon: <Ban className="w-3 h-3 text-red-300" />,
      activeClass: 'bg-red-600 text-white font-bold shadow-red-600/20'
    },
    {
      id: 'FIELD_VERIFIED',
      label: 'Field Verified',
      icon: <ShieldCheck className="w-3 h-3 text-emerald-300" />,
      activeClass: 'bg-indigo-600 text-white font-bold shadow-indigo-600/20'
    }
  ];

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Filters group */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-1 flex items-center gap-1">
          <Activity className="w-3 h-3 text-cyan-400" />
          Filter:
        </span>

        {filters.map(item => {
          const isActive = currentFilter === item.id;
          return (
            <button
              key={item.id}
              id={`map-filter-${item.id.toLowerCase().replace('_', '-')}`}
              onClick={() => onFilterChange(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 shadow-sm ${
                isActive
                  ? item.activeClass
                  : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right controls: GIS Layer Toggles + Fit to Monitored Zones Button */}
      <div className="flex items-center gap-2 flex-wrap ml-auto">
        {/* Layer Toggles for future PostGIS / GeoServer WMS integration */}
        <div className="hidden sm:flex items-center gap-2 px-2 py-0.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-300">
          <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
            <input
              type="checkbox"
              id="toggle-gis-susceptibility"
              checked={showSusceptibilityLayer}
              onChange={onToggleSusceptibility}
              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 w-3 h-3"
            />
            <span className="text-[10px] font-mono text-cyan-400">GSI Buffer</span>
          </label>
          <span className="text-slate-700">|</span>
          <label className="flex items-center gap-1 cursor-pointer hover:text-white select-none">
            <input
              type="checkbox"
              id="toggle-gis-highways"
              checked={showHighwaysLayer}
              onChange={onToggleHighways}
              className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3 h-3"
            />
            <span className="text-[10px] font-mono text-amber-400">Highways</span>
          </label>
        </div>

        {/* Fit to Monitored Zones Button */}
        <button
          id="btn-fit-monitored-zones"
          onClick={onFitBounds}
          className="px-3 py-1 bg-cyan-950 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          title="Fit view to all North Eastern Region monitored locations"
        >
          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fit to monitored zones</span>
        </button>

        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
          {filteredCount}/{totalCount} Visible
        </span>
      </div>
    </div>
  );
};
