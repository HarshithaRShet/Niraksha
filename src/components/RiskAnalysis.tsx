import React, { useState } from 'react';
import {
  ShieldAlert,
  Sliders,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Cpu,
  RefreshCw,
  Info,
  Loader2
} from 'lucide-react';
import { LandslideLocation, RiskPredictionResult } from '../types';
import { computeLandslideRisk, RiskInputParams } from '../services/riskEngine';
import { RiskBadge } from './RiskBadge';
import { api } from '../services/apiClient';

interface RiskAnalysisProps {
  locations: LandslideLocation[];
  onApplyDynamicRisk?: (locId: string, result: RiskPredictionResult) => void;
}

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
  locations,
  onApplyDynamicRisk
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || '');
  const selectedLoc = locations.find(l => l.id === selectedLocId) || locations[0];

  // Interactive risk prediction parameters
  const [rainfall, setRainfall] = useState<number>(selectedLoc?.rainfall_current_mm || 120);
  const [soilMoisture, setSoilMoisture] = useState<number>(selectedLoc?.soil_moisture_pct || 82);
  const [slope, setSlope] = useState<number>(selectedLoc?.slope || 45);
  const [forecastRainfall, setForecastRainfall] = useState<number>(selectedLoc?.forecast_rainfall_48h_mm || 75);
  const [historicalEvents, setHistoricalEvents] = useState<number>(selectedLoc?.historical_events_count || 12);

  // Ground evidence toggles
  const [hasCracks, setHasCracks] = useState<boolean>(true);
  const [hasSoilMovement, setHasSoilMovement] = useState<boolean>(false);
  const [hasDebris, setHasDebris] = useState<boolean>(true);
  const [hasRoadBlockage, setHasRoadBlockage] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<RiskPredictionResult>(() =>
    computeLandslideRisk({
      rainfall: selectedLoc?.rainfall_current_mm || 120,
      soil_moisture: selectedLoc?.soil_moisture_pct || 82,
      slope: selectedLoc?.slope || 45,
      historical_events: selectedLoc?.historical_events_count || 12,
      forecast_rainfall: selectedLoc?.forecast_rainfall_48h_mm || 75,
      ground_evidence: {
        cracks: true,
        soil_movement: false,
        debris: true,
        road_blockage: false
      }
    })
  );

  const handleLocationPresetChange = (locId: string) => {
    setSelectedLocId(locId);
    const loc = locations.find(l => l.id === locId);
    if (loc) {
      setRainfall(loc.rainfall_current_mm);
      setSoilMoisture(loc.soil_moisture_pct);
      setSlope(loc.slope);
      setForecastRainfall(loc.forecast_rainfall_48h_mm);
      setHistoricalEvents(loc.historical_events_count);
    }
  };

  const handleRunPrediction = async () => {
    setIsLoading(true);
    try {
      const res = await api.predictRisk({
        rainfall,
        soil_moisture: soilMoisture,
        slope,
        historical_events: historicalEvents,
        forecast_rainfall: forecastRainfall,
        ground_evidence: {
          cracks: hasCracks,
          soil_movement: hasSoilMovement,
          debris: hasDebris,
          road_blockage: hasRoadBlockage
        }
      });
      setPrediction(res);
      if (onApplyDynamicRisk && selectedLoc) {
        onApplyDynamicRisk(selectedLoc.id, res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>NIR-RAKSHA AI Risk Evaluation & Explainability Engine</span>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                XGBoost Model Architecture Ready
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explainable prototype hazard scoring (0–100) calibrated with geotechnical weights and live sensor inputs.
            </p>
          </div>
        </div>

        {/* Location Preset Picker */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Load Station:</span>
          <select
            id="select-risk-preset-location"
            value={selectedLocId}
            onChange={e => handleLocationPresetChange(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            {locations.map(l => (
              <option key={l.id} value={l.id}>
                {l.name} [{l.current_risk_level} {l.current_risk_score}/100]
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Feature Sliders */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Multi-Source Feature Inputs</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Dynamic Normalization</span>
          </div>

          {/* Rainfall 24h Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">24h Cumulative Precipitation:</span>
              <span className="font-mono text-cyan-400 font-bold">{rainfall} mm</span>
            </div>
            <input
              id="slider-rainfall"
              type="range"
              min="0"
              max="250"
              step="1"
              value={rainfall}
              onChange={e => setRainfall(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0mm (Dry)</span>
              <span>80mm (Moderate)</span>
              <span>150mm+ (Extreme Cloudburst)</span>
            </div>
          </div>

          {/* Soil Moisture Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Sub-surface Soil Moisture Saturation:</span>
              <span className="font-mono text-emerald-400 font-bold">{soilMoisture}%</span>
            </div>
            <input
              id="slider-soil-moisture"
              type="range"
              min="0"
              max="100"
              step="1"
              value={soilMoisture}
              onChange={e => setSoilMoisture(Number(e.target.value))}
              className="w-full accent-emerald-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% (Pore suction)</span>
              <span>65% (Plastic limit)</span>
              <span>100% (Liquefaction)</span>
            </div>
          </div>

          {/* Slope Angle Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Slope Inclination (Gradient):</span>
              <span className="font-mono text-amber-400 font-bold">{slope}°</span>
            </div>
            <input
              id="slider-slope"
              type="range"
              min="5"
              max="70"
              step="1"
              value={slope}
              onChange={e => setSlope(Number(e.target.value))}
              className="w-full accent-amber-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10° (Gentle)</span>
              <span>35° (GSI Threshold)</span>
              <span>65° (Cliff Face)</span>
            </div>
          </div>

          {/* 48h Weather Forecast */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">IMD Doppler 48h Forecast:</span>
              <span className="font-mono text-blue-400 font-bold">{forecastRainfall} mm</span>
            </div>
            <input
              id="slider-forecast"
              type="range"
              min="0"
              max="200"
              step="1"
              value={forecastRainfall}
              onChange={e => setForecastRainfall(Number(e.target.value))}
              className="w-full accent-blue-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          {/* Historical Landslides Frequency */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Historical Slide Occurrences:</span>
              <span className="font-mono text-purple-400 font-bold">{historicalEvents} recorded</span>
            </div>
            <input
              id="slider-history"
              type="range"
              min="0"
              max="30"
              step="1"
              value={historicalEvents}
              onChange={e => setHistoricalEvents(Number(e.target.value))}
              className="w-full accent-purple-400 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
            />
          </div>

          {/* Ground Evidence Checkboxes */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="block text-xs font-semibold text-slate-300">
              Ground Evidence Multipliers:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCracks}
                  onChange={e => setHasCracks(e.target.checked)}
                  className="rounded text-red-500 focus:ring-0"
                />
                <span>Tension Cracks</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSoilMovement}
                  onChange={e => setHasSoilMovement(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Active Creep</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDebris}
                  onChange={e => setHasDebris(e.target.checked)}
                  className="rounded text-yellow-500 focus:ring-0"
                />
                <span>Colluvial Debris</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasRoadBlockage}
                  onChange={e => setHasRoadBlockage(e.target.checked)}
                  className="rounded text-purple-500 focus:ring-0"
                />
                <span>Highway Blockage</span>
              </label>
            </div>
          </div>

          <button
            id="btn-run-model-inference"
            onClick={handleRunPrediction}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
            <span>Calculate Landslide Risk Score</span>
          </button>
        </div>

        {/* Right Output & Explainability Dashboard */}
        <div className="lg:col-span-7 space-y-4">
          {/* Prediction Result Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-slate-400 text-xs uppercase tracking-wider">Evaluation Output</span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>Hazard Status:</span>
                  <RiskBadge level={prediction.risk_level} size="lg" showPulse />
                </h3>
              </div>

              <div className="flex items-center gap-4 text-right font-mono">
                <div>
                  <div className="text-[11px] text-slate-400">Risk Score</div>
                  <div className="text-2xl font-black text-white">
                    {prediction.risk_score}
                    <span className="text-xs text-slate-400 font-normal"> / 100</span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Probability</div>
                  <div className="text-2xl font-black text-amber-400">
                    {(prediction.probability * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Confidence</div>
                  <div className="text-2xl font-black text-emerald-400">
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Gauge Progress Bar */}
            <div className="space-y-1">
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    prediction.risk_level === 'CRITICAL'
                      ? 'bg-red-500'
                      : prediction.risk_level === 'HIGH'
                      ? 'bg-orange-500'
                      : prediction.risk_level === 'WATCH'
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${prediction.risk_score}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span className="text-emerald-400">0–30 (LOW)</span>
                <span className="text-yellow-400">31–50 (WATCH)</span>
                <span className="text-orange-400">51–75 (HIGH)</span>
                <span className="text-red-400">76–100 (CRITICAL)</span>
              </div>
            </div>

            {/* Scientific Disclaimer Note */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong>Engineering Prototype Disclaimer:</strong> This explainable prototype algorithm scores slope stability based on empirical thresholds. It does not claim certified scientific geotechnical validation. The service interface is structured for drop-in replacement with an XGBoost/LightGBM model.
              </p>
            </div>
          </div>

          {/* Explainable Contributing Factors Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Explainable Contributing Factors (Feature Importance)</span>
            </h4>

            <div className="space-y-2.5">
              {prediction.contributing_factors.map((factor, idx) => {
                const impactBadge = {
                  severe: 'text-red-400 bg-red-950/80 border-red-800',
                  high: 'text-orange-400 bg-orange-950/80 border-orange-800',
                  moderate: 'text-yellow-400 bg-yellow-950/80 border-yellow-800',
                  nominal: 'text-emerald-400 bg-emerald-950/80 border-emerald-800'
                }[factor.thresholdImpact] || 'text-slate-400 bg-slate-950 border-slate-800';

                return (
                  <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{factor.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">({factor.weight}% weight)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300 font-bold">{factor.value}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${impactBadge}`}>
                          {factor.thresholdImpact}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {factor.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
