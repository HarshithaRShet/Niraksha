import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Layers, Activity } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      id="gis-map-legend"
      className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl text-[11px] text-slate-300 max-w-xs transition-all select-none"
    >
      <div
        className="flex items-center justify-between cursor-pointer border-b border-slate-800/80 pb-1.5 mb-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-cyan-400" />
          Landslide Hazard Tier
        </span>
        <button className="text-slate-400 hover:text-white p-0.5" aria-label="Toggle legend">
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="space-y-2">
          {/* Risk Levels according to specification */}
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
            <div className="flex items-center gap-2 p-1 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 border border-emerald-300/40" />
              <div>
                <div className="text-emerald-400 font-bold">LOW</div>
                <div className="text-slate-500 text-[9px]">Score: 0–30</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="w-3 h-3 rounded-full bg-yellow-500 shrink-0 border border-yellow-300/40" />
              <div>
                <div className="text-yellow-400 font-bold">WATCH</div>
                <div className="text-slate-500 text-[9px]">Score: 31–50</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0 border border-orange-300/40" />
              <div>
                <div className="text-orange-400 font-bold">HIGH</div>
                <div className="text-slate-500 text-[9px]">Score: 51–75</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0 border border-red-300/40 animate-pulse" />
              <div>
                <div className="text-red-400 font-bold">CRITICAL</div>
                <div className="text-slate-500 text-[9px]">Score: 76–100</div>
              </div>
            </div>
          </div>

          {/* Additional GIS Map Symbols */}
          <div className="pt-1.5 border-t border-slate-800/60 space-y-1 text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-cyan-400 border-dashed border-b inline-block" />
              <span>National Highway / Lifeline Corridor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-red-500 bg-red-500/20 inline-block" />
              <span>Catchment Vulnerability Radius</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">⚠️</span>
              <span>Active Roadway Blockage / Fissures</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
