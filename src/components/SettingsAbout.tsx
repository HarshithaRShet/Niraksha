import React from 'react';
import {
  Code,
  Terminal,
  Database,
  Cpu,
  Layers,
  Award,
  Globe2,
  CheckCircle,
  Shield,
  FileCode2,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const SettingsAbout: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* SIH 2026 Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-xl p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/40">
                SMART INDIA HACKATHON 2026
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/40">
                Problem Statement #26001
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              NIR-RAKSHA: AI-Based Early Warning and Landslide Risk Monitoring System in NER
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              An end-to-end, multi-source geotechnical intelligence grid built for the North Eastern Region of India, bridging remote meteorological telemetry, explainable risk modeling, real-time field reconnaissance, and multi-criteria emergency response prioritization.
            </p>
          </div>
        </div>

        {/* 6-Stage Core Workflow Architecture */}
        <div className="mt-6">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Core Operational Lifecycle:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <div className="font-bold text-cyan-400 mb-1">1. MULTI-SOURCE</div>
              <div className="text-[11px] text-slate-400">Rainfall, DEM, Saturation, Road Grids</div>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <div className="font-bold text-amber-400 mb-1">2. AI RISK ENGINE</div>
              <div className="text-[11px] text-slate-400">Explainable Scoring & XGBoost Vector</div>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <div className="font-bold text-emerald-400 mb-1">3. GIS RISK MAP</div>
              <div className="text-[11px] text-slate-400">Leaflet Geotagged Hazard Layers</div>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <div className="font-bold text-purple-400 mb-1">4. FIELD TRUTH</div>
              <div className="text-[11px] text-slate-400">Offline PWA & CV Crack Classifier</div>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <div className="font-bold text-orange-400 mb-1">5. EARLY WARNING</div>
              <div className="text-[11px] text-slate-400">Vernacular 4-Lang CAP Broadcast</div>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <div className="font-bold text-red-400 mb-1">6. PRIORITY DSS</div>
              <div className="text-[11px] text-slate-400">MCDA Lifeline Response Matrix</div>
            </div>
          </div>
        </div>
      </div>

      {/* Judges Demo Flow Walkthrough */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Recommended 3-Minute Presentation Flow For SIH Judges
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
            <div className="font-mono font-bold text-amber-400 text-sm">STEP 1: Command Radar</div>
            <div className="font-semibold text-white">Macro Situational Awareness</div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Open the <strong>Command Dashboard</strong>. Highlight how 8 key NER corridors (NH-10 Sikkim, Mawkdok Meghalaya, Haflong Assam) are monitored in real time with rainfall and risk trends.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
            <div className="font-mono font-bold text-amber-400 text-sm">STEP 2: Explainable AI</div>
            <div className="font-semibold text-white">Risk Scoring & Feature Weights</div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Navigate to <strong>Risk Analysis</strong>. Adjust the rainfall slider from 40mm to 180mm. Click <em>"Predict Landslide Risk"</em> to demonstrate instant recalibration with explainable feature importance.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
            <div className="font-mono font-bold text-amber-400 text-sm">STEP 3: Ground Verification</div>
            <div className="font-semibold text-white">CV Image Classifier & Offline Sync</div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Go to <strong>Field Verification</strong>. Click <em>"Analyze Image (CV)"</em> to show tension crack detection. Toggle <em>"Offline Simulation"</em> in the header, submit a report, and sync it when reconnected.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-1.5">
            <div className="font-mono font-bold text-amber-400 text-sm">STEP 4: Response Matrix</div>
            <div className="font-semibold text-white">Multilingual Alerts & MCDA Priority</div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Show <strong>Emergency Priority</strong> ranking BRO and NDRF dispatch orders. Conclude by broadcasting a verified warning in <strong>Assamese or Bengali</strong> to local population cells.
            </p>
          </div>
        </div>
      </div>

      {/* Backend & Deployment Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Python FastAPI Blueprint */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Python FastAPI Backend & ML Specification
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              FastAPI + SQLite/PostGIS
            </span>
          </div>

          <p className="text-slate-400 leading-relaxed">
            The platform architecture features modular REST contracts that mirror the included Python service:
          </p>

          <div className="bg-slate-950 p-3 rounded font-mono text-[11px] text-slate-300 space-y-1">
            <div><span className="text-amber-400 font-bold">GET</span>  /api/locations</div>
            <div><span className="text-amber-400 font-bold">GET</span>  /api/risk/:id</div>
            <div><span className="text-emerald-400 font-bold">POST</span> /api/risk/predict (ELHSA / XGBoost)</div>
            <div><span className="text-amber-400 font-bold">GET</span>  /api/reports</div>
            <div><span className="text-emerald-400 font-bold">POST</span> /api/reports (Dynamic hazard update)</div>
            <div><span className="text-emerald-400 font-bold">POST</span> /api/vision/analyze (CV feature detector)</div>
            <div><span className="text-emerald-400 font-bold">POST</span> /api/alerts (Vernacular CAP relay)</div>
            <div><span className="text-amber-400 font-bold">GET</span>  /api/emergency-priority (MCDA matrix)</div>
          </div>
        </div>

        {/* Production Execution Commands */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Execution & Deployment Commands
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              Live Verified
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-slate-400 font-semibold mb-1">1. Frontend (React + Vite + Tailwind + Leaflet):</div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-amber-300">
                npm install<br />
                npm run dev
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-semibold mb-1">2. Standalone Python Backend Option (FastAPI):</div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-[11px] text-cyan-300">
                pip install fastapi uvicorn pydantic scikit-learn<br />
                uvicorn backend.main:app --reload --port 8000
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
