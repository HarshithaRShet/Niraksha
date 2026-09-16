import React from 'react';
import { RiskLevel } from '../types';

interface RiskChartProps {
  rainfallData?: Array<{ time: string; avg_rainfall_mm: number; soil_saturation_pct: number }>;
  riskTrendData?: Array<{ day: string; critical_count: number; high_count: number; alerts_issued: number }>;
  riskDistribution?: { low: number; watch: number; high: number; critical: number };
}

export const RiskChart: React.FC<RiskChartProps> = ({
  rainfallData = [
    { time: '00:00', avg_rainfall_mm: 24, soil_saturation_pct: 58 },
    { time: '04:00', avg_rainfall_mm: 42, soil_saturation_pct: 65 },
    { time: '08:00', avg_rainfall_mm: 78, soil_saturation_pct: 74 },
    { time: '12:00', avg_rainfall_mm: 112, soil_saturation_pct: 86 },
    { time: '16:00', avg_rainfall_mm: 145, soil_saturation_pct: 92 },
    { time: '20:00', avg_rainfall_mm: 138, soil_saturation_pct: 89 }
  ],
  riskTrendData,
  riskDistribution
}) => {
  const maxRain = Math.max(...rainfallData.map(d => d.avg_rainfall_mm), 150);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Hydro-Meteorological Trigger Profile</span>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
              IMD Doppler 24h
            </span>
          </h4>
          <p className="text-[11px] text-slate-400">
            Rainfall accumulation (mm) vs. sub-surface pore saturation (%)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
            <span className="text-slate-300">Rainfall (mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
            <span className="text-slate-300">Saturation (%)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="h-48 w-full relative">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
          {/* Horizontal Grid lines */}
          <line x1="0" y1="20" x2="500" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="0" y1="60" x2="500" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="0" y1="140" x2="500" y2="140" stroke="#334155" />

          {/* Bar & line graph combination */}
          {rainfallData.map((d, i) => {
            const x = 40 + i * 82;
            const barHeight = (d.avg_rainfall_mm / maxRain) * 110;
            const barY = 140 - barHeight;
            const moistY = 140 - (d.soil_saturation_pct / 100) * 110;

            return (
              <g key={i}>
                {/* Rainfall bar */}
                <rect
                  x={x - 14}
                  y={barY}
                  width="28"
                  height={barHeight}
                  rx="3"
                  className="fill-cyan-500/40 hover:fill-cyan-400/70 transition-colors"
                />

                {/* Bar top value */}
                <text
                  x={x}
                  y={barY - 4}
                  textAnchor="middle"
                  className="text-[10px] fill-cyan-300 font-mono font-bold"
                >
                  {d.avg_rainfall_mm}
                </text>

                {/* X axis time */}
                <text
                  x={x}
                  y="155"
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {d.time}
                </text>
              </g>
            );
          })}

          {/* Moisture trend polyline */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            points={rainfallData
              .map((d, i) => `${40 + i * 82},${140 - (d.soil_saturation_pct / 100) * 110}`)
              .join(' ')}
          />

          {/* Moisture dots */}
          {rainfallData.map((d, i) => {
            const cx = 40 + i * 82;
            const cy = 140 - (d.soil_saturation_pct / 100) * 110;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r="4"
                className="fill-amber-400 stroke-slate-900 stroke-2"
              />
            );
          })}
        </svg>
      </div>

      {/* Footer warning limit notice */}
      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
          <span>GSI Infiltration Critical Limit Threshold: <strong>&gt;100 mm / 24h</strong></span>
        </span>
        <span className="font-mono text-amber-400 font-medium">Pore Pressure Saturation Peak: 92%</span>
      </div>
    </div>
  );
};
