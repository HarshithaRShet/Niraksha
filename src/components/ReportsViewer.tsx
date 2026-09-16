import React, { useState } from 'react';
import {
  FileText,
  Filter,
  CheckCircle,
  WifiOff,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  Layers
} from 'lucide-react';
import { FieldReport } from '../types';

interface ReportsProps {
  reports: FieldReport[];
  onSelectReportLocation?: (locId: string) => void;
}

export const ReportsViewer: React.FC<ReportsProps> = ({
  reports,
  onSelectReportLocation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(reports[0] || null);

  const filtered = reports.filter(r => {
    const matchSearch =
      r.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === 'ALL' || r.reporter_role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Geotechnical Field Incident & Verification Log
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
              GET /api/reports ({reports.length} Records)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical catalog of on-the-ground reconnaissance logs, AI computer vision inferences, crack metrics, and dynamic hazard score calibrations.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by zone, officer, keyword..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs"
          >
            <option value="ALL">All Agencies</option>
            <option value="NDRF Field Operative">NDRF</option>
            <option value="BRO Road Engineer">BRO</option>
            <option value="District Disaster Officer">District Officer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
          {filtered.map(report => {
            const isSelected = selectedReport?.id === report.id;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/60 shadow'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-amber-400">{report.id}</span>
                  <div className="flex items-center gap-2">
                    {report.severity && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                          report.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : report.severity === 'HIGH'
                            ? 'bg-orange-950 text-orange-300 border-orange-800'
                            : report.severity === 'WATCH'
                            ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {report.severity}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{report.created_at}</span>
                    </div>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white leading-snug truncate">
                  {report.location_name}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {report.notes}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                  <span className="text-slate-300 font-medium">
                    {report.reporter_name} ({report.reporter_role})
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${report.synced_online ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {report.synced_online ? 'Synced' : 'Saved Offline'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4">
          {selectedReport ? (
            <div className="space-y-4 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">{selectedReport.id}</span>
                    {selectedReport.severity && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                          selectedReport.severity === 'CRITICAL'
                            ? 'bg-red-950 text-red-300 border-red-800'
                            : selectedReport.severity === 'HIGH'
                            ? 'bg-orange-950 text-orange-300 border-orange-800'
                            : selectedReport.severity === 'WATCH'
                            ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        Severity: {selectedReport.severity}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {selectedReport.location_name}
                  </h3>
                  <div className="text-slate-400 mt-0.5">
                    Coordinates: {selectedReport.lat.toFixed(4)}°N, {selectedReport.lng.toFixed(4)}°E
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${selectedReport.synced_online ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700' : 'bg-amber-950/70 text-amber-300 border-amber-700'}`}>
                    {selectedReport.synced_online ? 'Synchronized to Command DB' : 'Queued Offline'}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    Dynamic Delta: +{selectedReport.risk_adjusted_delta || 0} Risk Pts
                  </div>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Field Officer</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedReport.reporter_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Agency</div>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedReport.reporter_role}</div>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <div className="text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Ground Truth Observations:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded border ${selectedReport.observations.cracks ? 'bg-red-500/10 border-red-500/30 text-red-300 font-semibold' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    • Tension Cracks: {selectedReport.observations.cracks ? 'CONFIRMED' : 'NONE'}
                  </div>
                  <div className={`p-2 rounded border ${selectedReport.observations.soil_movement ? 'bg-orange-500/10 border-orange-500/30 text-orange-300 font-semibold' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    • Soil Movement: {selectedReport.observations.soil_movement ? 'ACTIVE SLIP' : 'STABLE'}
                  </div>
                  <div className={`p-2 rounded border ${selectedReport.observations.debris ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    • Scree Debris: {selectedReport.observations.debris ? 'ACCUMULATED' : 'CLEARED'}
                  </div>
                  <div className={`p-2 rounded border ${selectedReport.observations.road_blockage ? 'bg-red-500/10 border-red-500/30 text-red-300 font-semibold' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    • Road Blockage: {selectedReport.observations.road_blockage ? 'BLOCKED' : 'OPEN'}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Reconnaissance Notes:
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 text-slate-200 leading-relaxed font-sans">
                  {selectedReport.notes}
                </div>
              </div>

              {/* Image & Vision AI Analysis if available */}
              {selectedReport.image_url && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Field Photographic Evidence:
                  </div>

                  <div className="w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                    <img
                      src={selectedReport.image_url}
                      alt="Field evidence"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {selectedReport.vision_analysis && (
                    <div className="p-3 bg-purple-950/40 border border-purple-900/60 rounded space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-purple-300 font-bold">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Vision Detection Inference
                        </span>
                        <span className="font-mono">
                          Conf: {(selectedReport.vision_analysis.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                        {selectedReport.vision_analysis.features_summary.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Select an incident report from the left list to review detailed ground telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
