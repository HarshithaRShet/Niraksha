import React, { useState } from 'react';
import { LandslideLocation, FieldReport, FieldObservationItem } from '../types';
import {
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  FileText,
  MapPin,
  Send,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/apiClient';

interface FieldReportFormProps {
  locations: LandslideLocation[];
  isOnline: boolean;
  preselectedLocationId?: string;
  onSubmitted: (locationName: string, delta: number) => void;
  onCancel?: () => void;
}

export const FieldReportForm: React.FC<FieldReportFormProps> = ({
  locations,
  isOnline,
  preselectedLocationId,
  onSubmitted,
  onCancel
}) => {
  const [locationId, setLocationId] = useState<string>(preselectedLocationId || locations[0]?.id || '');
  const [reporterName, setReporterName] = useState<string>('Inspector R. Debbarma');
  const [reporterRole, setReporterRole] = useState<FieldReport['reporter_role']>('NDRF Field Operative');
  const [notes, setNotes] = useState<string>('');

  const [observations, setObservations] = useState<FieldObservationItem>({
    cracks: true,
    soil_movement: false,
    debris: true,
    road_blockage: false
  });

  const [selectedImage, setSelectedImage] = useState<string>('nh10_tension_fissure.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [visionAnalysis, setVisionAnalysis] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedLoc = locations.find(l => l.id === locationId) || locations[0];

  const handleToggleObservation = (key: keyof FieldObservationItem) => {
    setObservations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRunVisionAnalysis = async () => {
    setIsAnalyzing(true);
    setSubmitError(null);
    try {
      const res = await api.analyzeImage({
        image_name: selectedImage
      });
      setVisionAnalysis(res);
      // Auto-update observations from AI vision
      setObservations(prev => ({
        ...prev,
        cracks: res.crack_detected ?? prev.cracks,
        debris: res.debris_detected ?? prev.debris,
        road_blockage: res.road_blockage_detected ?? prev.road_blockage
      }));
    } catch (err: any) {
      console.error(err);
      setSubmitError('Failed to complete AI vision inference: ' + (err.message || 'Unknown'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoc) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await api.submitReport(
        {
          location_id: selectedLoc.id,
          location_name: selectedLoc.name,
          lat: selectedLoc.lat,
          lng: selectedLoc.lng,
          reporter_name: reporterName,
          reporter_role: reporterRole,
          observations,
          image_name: selectedImage,
          vision_analysis: visionAnalysis || undefined,
          notes: notes || 'Routine reconnaissance patrol logged during active monsoon alert.'
        },
        isOnline
      );

      onSubmitted(selectedLoc.name, res.report.risk_adjusted_delta || 0);
    } catch (err: any) {
      setSubmitError('Error saving inspection report: ' + (err.message || 'Internal error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="field-report-form"
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 text-slate-200"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>Field Reconnaissance & Verification Report</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            On-the-ground observations feed directly into the NIR-RAKSHA risk calibration pipeline
          </p>
        </div>
        <span
          className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
            isOnline
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : 'bg-amber-950 text-amber-400 border-amber-800'
          }`}
        >
          {isOnline ? 'Online Sync' : 'Local Queue'}
        </span>
      </div>

      {submitError && (
        <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Target Location Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Target Hazard Corridor / Critical Axis
          </label>
          <select
            id="select-report-location"
            value={locationId}
            onChange={e => setLocationId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.district}, {loc.state}) [{loc.current_risk_level}]
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Reconnaissance Agency / Officer Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="input-reporter-name"
              type="text"
              value={reporterName}
              onChange={e => setReporterName(e.target.value)}
              placeholder="Officer Name"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
            <select
              id="select-reporter-role"
              value={reporterRole}
              onChange={e => setReporterRole(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="NDRF Field Operative">NDRF Field Operative</option>
              <option value="BRO Road Engineer">BRO Road Engineer</option>
              <option value="District Disaster Officer">District Disaster Officer</option>
              <option value="Local Village Volunteer">Local Village Volunteer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ground Evidence Checkboxes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Ground-Truth Geotechnical Evidence (Triggers Dynamic Risk Delta)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            id="toggle-crack"
            onClick={() => handleToggleObservation('cracks')}
            className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
              observations.cracks
                ? 'bg-red-950/60 border-red-500 text-red-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Tension Cracks</span>
              <span className={`w-2 h-2 rounded-full ${observations.cracks ? 'bg-red-400' : 'bg-slate-700'}`} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Fissures on crown / slope</span>
          </button>

          <button
            type="button"
            id="toggle-soil-movement"
            onClick={() => handleToggleObservation('soil_movement')}
            className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
              observations.soil_movement
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Active Creep</span>
              <span className={`w-2 h-2 rounded-full ${observations.soil_movement ? 'bg-amber-400' : 'bg-slate-700'}`} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Tilting poles / toe bulging</span>
          </button>

          <button
            type="button"
            id="toggle-debris"
            onClick={() => handleToggleObservation('debris')}
            className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
              observations.debris
                ? 'bg-yellow-950/60 border-yellow-500 text-yellow-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Colluvial Debris</span>
              <span className={`w-2 h-2 rounded-full ${observations.debris ? 'bg-yellow-400' : 'bg-slate-700'}`} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Fresh scree & rockfall</span>
          </button>

          <button
            type="button"
            id="toggle-road-blockage"
            onClick={() => handleToggleObservation('road_blockage')}
            className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
              observations.road_blockage
                ? 'bg-purple-950/60 border-purple-500 text-purple-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Carriageway Block</span>
              <span className={`w-2 h-2 rounded-full ${observations.road_blockage ? 'bg-purple-400' : 'bg-slate-700'}`} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">Traffic halted / diverted</span>
          </button>
        </div>
      </div>

      {/* AI Computer Vision Section */}
      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Geotechnical Computer Vision Inference</span>
          </div>
          <button
            type="button"
            id="btn-run-vision-ai"
            onClick={handleRunVisionAnalysis}
            disabled={isAnalyzing}
            className="px-3 py-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Inference...</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Analyze Geotagged Photo</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Field Drone / Handheld Photo Reference
            </label>
            <select
              id="select-recon-photo"
              value={selectedImage}
              onChange={e => setSelectedImage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="nh10_tension_fissure.jpg">nh10_tension_fissure.jpg (East Sikkim)</option>
              <option value="cherrapunji_shear_scarp.jpg">cherrapunji_shear_scarp.jpg (Meghalaya)</option>
              <option value="haflong_mudslide_toe.jpg">haflong_mudslide_toe.jpg (Dima Hasao, Assam)</option>
              <option value="sela_scree_apron.jpg">sela_scree_apron.jpg (Arunachal Tawang)</option>
            </select>
          </div>

          {visionAnalysis && (
            <div className="bg-slate-900 p-2.5 rounded-lg border border-cyan-800/60 text-xs space-y-1">
              <div className="flex items-center justify-between text-cyan-300 font-semibold text-[11px]">
                <span>Inference Confidence: {(visionAnalysis.confidence * 100).toFixed(0)}%</span>
                <span className="font-mono text-emerald-400">Crack Detected: {visionAnalysis.crack_detected ? 'YES' : 'NO'}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                {visionAnalysis.features_summary?.join(' • ') || 'Evidence verified by model.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Field Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">
          Ground Reconnaissance Field Notes & Observations
        </label>
        <textarea
          id="input-report-notes"
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. 15cm tension crack expanding along upper embankment shoulder; seepages visible at toe; BRO bulldozer standing by."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        {onCancel && (
          <button
            type="button"
            id="btn-cancel-report"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          id="btn-submit-report"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Report...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Commit Ground Verification</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
