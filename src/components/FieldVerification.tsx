import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  Sparkles,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Send,
  WifiOff,
  Crosshair,
  FileCheck,
  ShieldCheck,
  Eye,
  RefreshCw,
  Clock,
  Layers,
  HelpCircle,
  FileImage,
  X,
  AlertCircle
} from 'lucide-react';
import { LandslideLocation, VisionAnalysisResult, RiskLevel } from '../types';
import { api } from '../services/apiClient';

interface FieldVerificationProps {
  locations: LandslideLocation[];
  isOnline: boolean;
  preselectedLocationId?: string;
  onReportSubmitted: (locName: string, delta: number) => void;
}

const FORM_CACHE_KEY = 'nir_raksha_field_report_draft_v1';

interface SavedDraftState {
  selectedLocId: string;
  reporterName: string;
  reporterRole: 'District Disaster Officer' | 'NDRF Field Operative' | 'BRO Road Engineer' | 'Local Village Volunteer';
  lat: number;
  lng: number;
  isManualGps: boolean;
  cracks: boolean;
  soilMovement: boolean;
  debris: boolean;
  roadBlockage: boolean;
  severity: RiskLevel;
  notes: string;
  imageName: string;
  imagePreviewUrl: string;
  visionAnalysis: VisionAnalysisResult | null;
}

export const FieldVerification: React.FC<FieldVerificationProps> = ({
  locations,
  isOnline,
  preselectedLocationId,
  onReportSubmitted
}) => {
  // Restore cached form data if available so navigation doesn't lose progress
  const getInitialDraft = (): SavedDraftState => {
    try {
      const cached = localStorage.getItem(FORM_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          selectedLocId: preselectedLocationId || parsed.selectedLocId || locations[0]?.id || ''
        };
      }
    } catch {}

    const defaultLoc = locations.find(l => l.id === preselectedLocationId) || locations[0];
    return {
      selectedLocId: defaultLoc?.id || '',
      reporterName: 'Inspector K. Barman',
      reporterRole: 'NDRF Field Operative',
      lat: defaultLoc?.lat || 27.3789,
      lng: defaultLoc?.lng || 88.5284,
      isManualGps: false,
      cracks: true,
      soilMovement: true,
      debris: true,
      roadBlockage: false,
      severity: defaultLoc?.current_risk_level || 'HIGH',
      notes: 'Observed fresh tension cracks widening along hillside cutting. Scree and boulder spill noted on left shoulder.',
      imageName: 'geotechnical_fissure_evidence.jpg',
      imagePreviewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=800&q=80',
      visionAnalysis: null
    };
  };

  const initialDraft = useRef(getInitialDraft()).current;

  const [selectedLocId, setSelectedLocId] = useState<string>(initialDraft.selectedLocId);
  const selectedLocation = locations.find(l => l.id === selectedLocId) || locations[0];

  const [reporterName, setReporterName] = useState<string>(initialDraft.reporterName);
  const [reporterRole, setReporterRole] = useState<'District Disaster Officer' | 'NDRF Field Operative' | 'BRO Road Engineer' | 'Local Village Volunteer'>(
    initialDraft.reporterRole
  );

  // 1. GPS Location State
  const [lat, setLat] = useState<number>(initialDraft.lat);
  const [lng, setLng] = useState<number>(initialDraft.lng);
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [gpsStatus, setGpsStatus] = useState<{
    type: 'success' | 'error' | 'manual' | 'calibrated';
    message: string;
  }>({
    type: initialDraft.isManualGps ? 'manual' : 'calibrated',
    message: initialDraft.isManualGps ? 'Manual coordinates specified' : 'Target corridor station GPS active'
  });
  const [isManualGpsMode, setIsManualGpsMode] = useState<boolean>(initialDraft.isManualGps);

  // 2. Observation Checklist
  const [cracks, setCracks] = useState<boolean>(initialDraft.cracks);
  const [soilMovement, setSoilMovement] = useState<boolean>(initialDraft.soilMovement);
  const [debris, setDebris] = useState<boolean>(initialDraft.debris);
  const [roadBlockage, setRoadBlockage] = useState<boolean>(initialDraft.roadBlockage);

  // 3. Severity & 4. Notes
  const [severity, setSeverity] = useState<RiskLevel>(initialDraft.severity || 'HIGH');
  const [notes, setNotes] = useState<string>(initialDraft.notes);

  // 5. Image & Vision AI Analysis State
  const [imageName, setImageName] = useState<string>(initialDraft.imageName);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(initialDraft.imagePreviewUrl);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState<boolean>(false);
  const [visionAnalysis, setVisionAnalysis] = useState<VisionAnalysisResult | null>(initialDraft.visionAnalysis);
  const [visionError, setVisionError] = useState<string | null>(null);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{
    status: 'ONLINE_SUCCESS' | 'OFFLINE_SAVED' | 'ERROR';
    message: string;
    reportId?: string;
  } | null>(null);

  // Offline queue count
  const [offlineCount, setOfflineCount] = useState<number>(() => api.getOfflineReports().length);

  // Persist form state to localStorage on every change so user navigation never loses inputs
  useEffect(() => {
    const draft: SavedDraftState = {
      selectedLocId,
      reporterName,
      reporterRole,
      lat,
      lng,
      isManualGps: isManualGpsMode,
      cracks,
      soilMovement,
      debris,
      roadBlockage,
      severity,
      notes,
      imageName,
      imagePreviewUrl,
      visionAnalysis
    };
    try {
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(draft));
    } catch {}
  }, [
    selectedLocId,
    reporterName,
    reporterRole,
    lat,
    lng,
    isManualGpsMode,
    cracks,
    soilMovement,
    debris,
    roadBlockage,
    severity,
    notes,
    imageName,
    imagePreviewUrl,
    visionAnalysis
  ]);

  // Handle external preselectedLocationId changes
  useEffect(() => {
    if (preselectedLocationId && preselectedLocationId !== selectedLocId) {
      handleLocationChange(preselectedLocationId);
    }
  }, [preselectedLocationId]);

  const handleLocationChange = (locId: string) => {
    setSelectedLocId(locId);
    const loc = locations.find(l => l.id === locId);
    if (loc) {
      setLat(loc.lat);
      setLng(loc.lng);
      setSeverity(loc.current_risk_level);
      setGpsStatus({
        type: 'calibrated',
        message: `Station benchmark: Lat ${loc.lat.toFixed(4)}°, Lng ${loc.lng.toFixed(4)}°`
      });
    }
  };

  // Browser Geolocation Acquisition with fallback
  const handleAcquireGPS = () => {
    setIsGettingGps(true);
    setGpsStatus({ type: 'calibrated', message: 'Querying satellite/browser GPS sensors...' });

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const newLat = Number(position.coords.latitude.toFixed(5));
          const newLng = Number(position.coords.longitude.toFixed(5));
          setLat(newLat);
          setLng(newLng);
          setIsGettingGps(false);
          setIsManualGpsMode(false);
          setGpsStatus({
            type: 'success',
            message: `GPS fixed: Lat ${newLat}°, Lng ${newLng}° (Accuracy: ±${Math.round(position.coords.accuracy || 6)}m)`
          });
        },
        error => {
          setIsGettingGps(false);
          let reason = 'GPS unavailable';
          if (error.code === error.PERMISSION_DENIED) {
            reason = 'Geolocation permission denied by user/browser';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            reason = 'Position unavailable on this network';
          } else if (error.code === error.TIMEOUT) {
            reason = 'GPS query timed out';
          }
          // Enable manual fallback smoothly
          setIsManualGpsMode(true);
          setGpsStatus({
            type: 'manual',
            message: `${reason}. Manual GPS coordinates active.`
          });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } else {
      setIsGettingGps(false);
      setIsManualGpsMode(true);
      setGpsStatus({
        type: 'manual',
        message: 'Geolocation API not supported. Switched to manual entry.'
      });
    }
  };

  // Image Upload handler: immediately triggers POST /api/vision/analyze
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    const blobUrl = URL.createObjectURL(file);
    setImagePreviewUrl(blobUrl);
    setVisionAnalysis(null);
    setVisionError(null);

    // Automatically call POST /api/vision/analyze upon upload
    await runVisionAnalysis(file.name, blobUrl);
  };

  const runVisionAnalysis = async (imgName: string, imgBlob: string) => {
    setIsAnalyzingImage(true);
    setVisionError(null);
    try {
      const analysis: VisionAnalysisResult = await api.analyzeImage({
        imageName: imgName,
        image_name: imgName,
        imageBlobUrl: imgBlob,
        reportedObservations: {
          cracks,
          soil_movement: soilMovement,
          debris,
          road_blockage: roadBlockage
        }
      });

      setVisionAnalysis(analysis);

      // Reflect AI detections into observation checklist if detected
      if (analysis.crack_detected) setCracks(true);
      if (analysis.debris_detected) setDebris(true);
      if (analysis.road_blockage_detected) {
        setRoadBlockage(true);
        if (severity === 'LOW' || severity === 'WATCH') {
          setSeverity('HIGH');
        }
      }
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      setVisionError('Vision classifier returned an error. Using manual field inputs.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Submit report to POST /api/reports
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionFeedback(null);

    try {
      const result = await api.submitReport(
        {
          location_id: selectedLocId,
          location_name: selectedLocation?.name || 'Monitored NER Corridor',
          lat,
          lng,
          reporter_name: reporterName,
          reporter_role: reporterRole,
          observations: {
            cracks,
            soil_movement: soilMovement,
            debris,
            road_blockage: roadBlockage
          },
          severity,
          image_url: imagePreviewUrl,
          image_name: imageName,
          vision_analysis: visionAnalysis || undefined,
          notes
        },
        isOnline
      );

      setOfflineCount(api.getOfflineReports().length);

      if (isOnline) {
        setSubmissionFeedback({
          status: 'ONLINE_SUCCESS',
          message: 'Report submitted successfully',
          reportId: result.report.id
        });
      } else {
        setSubmissionFeedback({
          status: 'OFFLINE_SAVED',
          message: 'OFFLINE / SAVED LOCALLY. Report will automatically synchronize when connection returns.',
          reportId: result.report.id
        });
      }

      onReportSubmitted(
        selectedLocation?.name || 'Monitored Corridor',
        result.report.risk_adjusted_delta || 0
      );

      // Scroll to top of feedback
      window.scrollTo({ top: 180, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setSubmissionFeedback({
        status: 'ERROR',
        message: 'Failed to submit report. Please verify connection or retry.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncOffline = async () => {
    try {
      const syncResult = await api.syncOfflineReports();
      setOfflineCount(0);
      setSubmissionFeedback({
        status: 'ONLINE_SUCCESS',
        message: `Synchronized ${syncResult.syncedCount} queued reports successfully with NIR-RAKSHA master servers.`
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mobile-Friendly App Bar / Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Field Geotechnical Verification
              </h2>
              <p className="text-xs text-slate-400">
                Mobile Reconnaissance & Ground-Truth Reporting Interface
              </p>
            </div>
          </div>
        </div>

        {/* Connectivity Status & Offline Syncer */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {!isOnline ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/80 border border-amber-500/60 rounded-xl text-xs font-mono text-amber-300 shadow-sm animate-pulse">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span>OFFLINE MODE</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>ONLINE</span>
            </div>
          )}

          {offlineCount > 0 && (
            <button
              id="btn-field-sync-queue"
              onClick={handleSyncOffline}
              disabled={!isOnline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                isOnline
                  ? 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border-cyan-700 cursor-pointer'
                  : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Queue ({offlineCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Submission Feedback Banner */}
      {submissionFeedback && (
        <div
          id="report-submission-feedback"
          className={`p-4 rounded-2xl border text-xs shadow-xl transition-all ${
            submissionFeedback.status === 'ONLINE_SUCCESS'
              ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
              : submissionFeedback.status === 'OFFLINE_SAVED'
              ? 'bg-amber-950/90 border-amber-600 text-amber-200'
              : 'bg-red-950/90 border-red-600 text-red-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {submissionFeedback.status === 'ONLINE_SUCCESS' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : submissionFeedback.status === 'OFFLINE_SAVED' ? (
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-sm font-bold tracking-wide">
                  {submissionFeedback.status === 'ONLINE_SUCCESS' && 'Report submitted successfully'}
                  {submissionFeedback.status === 'OFFLINE_SAVED' && 'OFFLINE / SAVED LOCALLY'}
                  {submissionFeedback.status === 'ERROR' && 'Submission Error'}
                </div>
                <div className="text-xs leading-relaxed opacity-90">{submissionFeedback.message}</div>
                {submissionFeedback.reportId && (
                  <div className="font-mono text-[11px] opacity-75">
                    Report ID: <strong>{submissionFeedback.reportId}</strong>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setSubmissionFeedback(null)}
              className="p-1 rounded-lg hover:bg-black/20 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Verification Form */}
      <form onSubmit={handleSubmitReport} className="space-y-6">
        {/* 1. Corridor & GPS Location Section */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              1. Location & GPS Positioning
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              Corridor Grid
            </span>
          </div>

          {/* Monitored Location Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Hazard Corridor / Vulnerable Axis:
            </label>
            <select
              id="field-verification-location-select"
              value={selectedLocId}
              onChange={e => handleLocationChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.district}, {loc.state}) — [{loc.current_risk_level}] Risk: {loc.current_risk_score}
                </option>
              ))}
            </select>
          </div>

          {/* GPS Coordinates Box with Browser Geolocation */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                Coordinates (Latitude & Longitude)
              </span>

              <div className="flex items-center gap-2">
                <button
                  id="btn-acquire-gps"
                  type="button"
                  onClick={handleAcquireGPS}
                  disabled={isGettingGps}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
                  title="Obtain current browser/device GPS coordinates"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isGettingGps ? 'animate-spin' : ''}`} />
                  <span>{isGettingGps ? 'Locating...' : 'Get Browser GPS'}</span>
                </button>

                <button
                  id="btn-toggle-manual-gps"
                  type="button"
                  onClick={() => setIsManualGpsMode(!isManualGpsMode)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
                >
                  {isManualGpsMode ? 'Manual ON' : 'Manual Entry'}
                </button>
              </div>
            </div>

            {/* Lat / Lng Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Latitude (°N):
                </label>
                <input
                  id="input-gps-latitude"
                  type="number"
                  step="0.00001"
                  value={lat}
                  onChange={e => {
                    setLat(Number(e.target.value));
                    setIsManualGpsMode(true);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  placeholder="e.g. 27.3789"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Longitude (°E):
                </label>
                <input
                  id="input-gps-longitude"
                  type="number"
                  step="0.00001"
                  value={lng}
                  onChange={e => {
                    setLng(Number(e.target.value));
                    setIsManualGpsMode(true);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  placeholder="e.g. 88.5284"
                  required
                />
              </div>
            </div>

            {/* GPS Feedback Notice */}
            <div
              className={`text-[11px] flex items-center gap-1.5 font-mono ${
                gpsStatus.type === 'success'
                  ? 'text-emerald-400'
                  : gpsStatus.type === 'manual'
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              <span>●</span>
              <span>{gpsStatus.message}</span>
            </div>
          </div>

          {/* Reporter Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reconnaissance Officer Name:
              </label>
              <input
                id="input-field-reporter-name"
                type="text"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                placeholder="e.g. Inspector K. Barman"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Agency / Role:
              </label>
              <select
                id="select-field-reporter-role"
                value={reporterRole}
                onChange={e => setReporterRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="NDRF Field Operative">NDRF Field Operative</option>
                <option value="BRO Road Engineer">BRO Road Engineer</option>
                <option value="District Disaster Officer">District Disaster Officer</option>
                <option value="Local Village Volunteer">Local Village Volunteer</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Image Upload & POST /api/vision/analyze Pipeline */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-400" />
              2. Photographic Evidence & Vision AI (POST /api/vision/analyze)
            </h3>
            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
              YOLO / ResNet CV
            </span>
          </div>

          {/* Upload Area & Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Visual Preview */}
            <div className="md:col-span-6">
              <div className="relative w-full h-52 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group shadow-inner">
                {imagePreviewUrl ? (
                  <img
                    src={imagePreviewUrl}
                    alt="Geotechnical Evidence"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-500 text-xs flex flex-col items-center gap-1.5 p-4 text-center">
                    <FileImage className="w-10 h-10 text-slate-600" />
                    <span>No image uploaded</span>
                  </div>
                )}

                {/* AI Detected Overlay Highlights */}
                {visionAnalysis && (
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="bg-slate-900/90 text-white font-mono text-[10px] px-2 py-0.5 rounded border border-slate-700 backdrop-blur">
                      {imageName}
                    </span>
                    <span className="bg-purple-950/90 text-purple-300 font-mono font-bold text-[10px] px-2 py-0.5 rounded border border-purple-700">
                      Conf: {(visionAnalysis.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}

                {visionAnalysis?.crack_detected && (
                  <div className="absolute inset-x-6 top-10 bottom-10 border-2 border-dashed border-red-500 bg-red-500/10 rounded pointer-events-none flex items-start p-1.5">
                    <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      Crack Detected
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Button and Actions */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Upload Geotechnical Photo:
                </label>
                <label
                  htmlFor="field-photo-input"
                  className="w-full cursor-pointer bg-slate-950 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-cyan-500 text-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all group"
                >
                  <UploadCloud className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <div className="text-xs font-medium text-slate-200">
                    Click to browse or drop file here
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Supports JPG, PNG, WebP (camera or gallery)
                  </div>
                  <input
                    id="field-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Explicit Re-run CV Button */}
              <button
                id="btn-trigger-vision-analyze"
                type="button"
                onClick={() => runVisionAnalysis(imageName, imagePreviewUrl)}
                disabled={isAnalyzingImage || !imagePreviewUrl}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                <span>
                  {isAnalyzingImage
                    ? 'Calling POST /api/vision/analyze...'
                    : 'Run Vision Analysis (POST /api/vision/analyze)'}
                </span>
              </button>
            </div>
          </div>

          {/* AI Vision Results Display (Required 4 items) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-purple-900/60 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Vision AI Classifier Output:
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Endpoint: <strong className="text-purple-300">POST /api/vision/analyze</strong>
              </span>
            </div>

            {visionAnalysis ? (
              <div className="space-y-3">
                {/* 4 Required Display Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* 1. Crack detected */}
                  <div
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      visionAnalysis.crack_detected
                        ? 'bg-red-950/60 text-red-300 border-red-700/80 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono text-slate-400">Crack Detected</div>
                    <div className="text-xs font-bold mt-0.5">
                      {visionAnalysis.crack_detected ? 'YES (Detected)' : 'NO (Clear)'}
                    </div>
                  </div>

                  {/* 2. Debris detected */}
                  <div
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      visionAnalysis.debris_detected
                        ? 'bg-orange-950/60 text-orange-300 border-orange-700/80 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono text-slate-400">Debris Detected</div>
                    <div className="text-xs font-bold mt-0.5">
                      {visionAnalysis.debris_detected ? 'YES (Detected)' : 'NO (Clear)'}
                    </div>
                  </div>

                  {/* 3. Road blockage */}
                  <div
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      visionAnalysis.road_blockage_detected
                        ? 'bg-red-950/60 text-red-300 border-red-700/80 shadow-sm'
                        : 'bg-slate-900/60 text-slate-400 border-slate-800'
                    }`}
                  >
                    <div className="text-[10px] uppercase font-mono text-slate-400">Road Blockage</div>
                    <div className="text-xs font-bold mt-0.5">
                      {visionAnalysis.road_blockage_detected ? 'YES (Blocked)' : 'NO (Clear)'}
                    </div>
                  </div>

                  {/* 4. Confidence */}
                  <div className="p-2.5 rounded-lg border border-purple-800/80 bg-purple-950/40 text-center">
                    <div className="text-[10px] uppercase font-mono text-purple-300">Confidence</div>
                    <div className="text-sm font-black font-mono text-white mt-0.5">
                      {(visionAnalysis.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Detected Features Bullet List */}
                <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider font-mono">
                    Extracted Geotechnical Features:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {visionAnalysis.features_summary.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : isAnalyzingImage ? (
              <div className="flex items-center justify-center py-4 text-xs text-purple-300 gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
                <span>Performing neural vision inference on uploaded imagery...</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic text-center py-2">
                Upload a photo or click "Run Vision Analysis" to inspect features.
              </div>
            )}
          </div>
        </div>

        {/* 3. Observation Checklist */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              3. Physical Observation Checklist
            </h3>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
              Ground Evidence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Crack */}
            <label
              htmlFor="chk-observation-crack"
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                cracks
                  ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Crack</span>
                  {cracks && <span className="text-[10px] font-mono text-amber-400 font-bold">• Active</span>}
                </div>
                <div className="text-[10px] text-slate-400">
                  Tension fissures, headscarp cracking, crown subsidence
                </div>
              </div>
              <input
                id="chk-observation-crack"
                type="checkbox"
                checked={cracks}
                onChange={e => setCracks(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </label>

            {/* Soil movement */}
            <label
              htmlFor="chk-observation-soil"
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                soilMovement
                  ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Soil Movement</span>
                  {soilMovement && <span className="text-[10px] font-mono text-amber-400 font-bold">• Active</span>}
                </div>
                <div className="text-[10px] text-slate-400">
                  Slumping, toe bulges, mud seepage, leaning vegetation
                </div>
              </div>
              <input
                id="chk-observation-soil"
                type="checkbox"
                checked={soilMovement}
                onChange={e => setSoilMovement(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </label>

            {/* Debris */}
            <label
              htmlFor="chk-observation-debris"
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                debris
                  ? 'bg-amber-950/40 border-amber-500/70 text-amber-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Debris</span>
                  {debris && <span className="text-[10px] font-mono text-amber-400 font-bold">• Active</span>}
                </div>
                <div className="text-[10px] text-slate-400">
                  Loose scree, rolling boulders, rockfall accumulation
                </div>
              </div>
              <input
                id="chk-observation-debris"
                type="checkbox"
                checked={debris}
                onChange={e => setDebris(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </label>

            {/* Road blockage */}
            <label
              htmlFor="chk-observation-blockage"
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                roadBlockage
                  ? 'bg-red-950/50 border-red-500/80 text-red-200 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Road Blockage</span>
                  {roadBlockage && <span className="text-[10px] font-mono text-red-400 font-bold">• Blocked</span>}
                </div>
                <div className="text-[10px] text-slate-400">
                  Total or partial obstruction of lifeline carriageway
                </div>
              </div>
              <input
                id="chk-observation-blockage"
                type="checkbox"
                checked={roadBlockage}
                onChange={e => setRoadBlockage(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 4. Severity Assessment */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              4. Field Evaluated Severity Tier
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Evaluator Assessment
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {(['LOW', 'WATCH', 'HIGH', 'CRITICAL'] as const).map(tier => {
              const isSelected = severity === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  id={`btn-severity-${tier.toLowerCase()}`}
                  onClick={() => setSeverity(tier)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? tier === 'CRITICAL'
                        ? 'bg-red-600 text-white font-bold border-red-400 shadow-lg shadow-red-600/30'
                        : tier === 'HIGH'
                        ? 'bg-orange-600 text-white font-bold border-orange-400 shadow-lg shadow-orange-600/30'
                        : tier === 'WATCH'
                        ? 'bg-yellow-500 text-slate-950 font-bold border-yellow-300 shadow-lg shadow-yellow-500/30'
                        : 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-950/80 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{tier}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">
                    {tier === 'LOW' && 'Stable / Minor'}
                    {tier === 'WATCH' && 'Active Monitoring'}
                    {tier === 'HIGH' && 'Imminent Threat'}
                    {tier === 'CRITICAL' && 'Immediate Hazard'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Notes */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              5. Field Recon Notes
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Context</span>
          </div>

          <div>
            <textarea
              id="field-report-notes"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Record ground context (e.g. crack dimensions, water discharge rates, nearby bridges, BRO plant requests)..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none leading-relaxed"
              required
            />
          </div>
        </div>

        {/* 6. Submit Report Button */}
        <div className="pt-2">
          <button
            id="btn-submit-field-report"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl text-sm disabled:opacity-50 cursor-pointer"
          >
            <Send className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>
              {isSubmitting
                ? 'Posting Report to /api/reports...'
                : isOnline
                ? 'Submit Complete Report (POST /api/reports)'
                : 'Save Report Locally (Offline Queue)'}
            </span>
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-2.5">
            {isOnline ? (
              <span>
                Submission automatically updates live zone hazard metrics and transmits to NDMA/GSI logs.
              </span>
            ) : (
              <span className="text-amber-400">
                Offline Mode: Report will be securely cached on device and synchronized when network connectivity returns.
              </span>
            )}
          </p>
        </div>
      </form>
    </div>
  );
};

export default FieldVerification;
