import React, { useState } from 'react';
import {
  Bell,
  Send,
  Radio,
  Globe,
  AlertOctagon,
  CheckCircle,
  MessageSquare,
  Volume2,
  Share2,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { DisasterAlert, LandslideLocation } from '../types';
import { MULTILINGUAL_TEMPLATES } from '../data/mockData';
import { api } from '../services/apiClient';

interface AlertsProps {
  alerts: DisasterAlert[];
  locations: LandslideLocation[];
  onAlertCreated: (alert: DisasterAlert) => void;
  preselectedLocationId?: string;
  preselectedRiskLevel?: 'WATCH' | 'HIGH' | 'CRITICAL';
}

export const AlertsManagement: React.FC<AlertsProps> = ({
  alerts,
  locations,
  onAlertCreated,
  preselectedLocationId,
  preselectedRiskLevel
}) => {
  const [selectedLocId, setSelectedLocId] = useState<string>(
    preselectedLocationId || locations[0]?.id || ''
  );
  const selectedLocation = locations.find(l => l.id === selectedLocId) || locations[0];

  const [riskLevel, setRiskLevel] = useState<'WATCH' | 'HIGH' | 'CRITICAL'>(
    preselectedRiskLevel || (selectedLocation?.current_risk_level === 'LOW' ? 'WATCH' : (selectedLocation?.current_risk_level as any) || 'CRITICAL')
  );

  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Assamese' | 'Bengali'>('English');
  const [author, setAuthor] = useState<string>('State Emergency Operations Centre (SEOC)');

  // Auto-generate template text according to language & risk level
  const template = MULTILINGUAL_TEMPLATES[language][riskLevel];
  const [title, setTitle] = useState<string>(template.title);
  const [message, setMessage] = useState<string>(
    template.body(selectedLocation?.name || 'Corridor', selectedLocation?.rainfall_current_mm || 120)
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastDispatched, setLastDispatched] = useState<string | null>(null);

  // Sync title & message when language, location, or risk level changes
  const handleLanguageOrLevelChange = (
    newLang: 'English' | 'Hindi' | 'Assamese' | 'Bengali',
    newLevel: 'WATCH' | 'HIGH' | 'CRITICAL',
    locId: string
  ) => {
    setLanguage(newLang);
    setRiskLevel(newLevel);
    setSelectedLocId(locId);
    const loc = locations.find(l => l.id === locId) || locations[0];
    const tmpl = MULTILINGUAL_TEMPLATES[newLang][newLevel];
    setTitle(tmpl.title);
    setMessage(tmpl.body(loc.name, loc.rainfall_current_mm));
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLastDispatched(null);

    try {
      const newAlert = await api.createAlert({
        location_id: selectedLocId,
        location_name: `${selectedLocation.name}, ${selectedLocation.state}`,
        risk_level: riskLevel,
        severity: riskLevel === 'CRITICAL' ? 'Extreme' : riskLevel === 'HIGH' ? 'Severe' : 'Warning',
        language,
        title,
        message,
        author
      });

      onAlertCreated(newAlert);
      setLastDispatched(
        `Disaster Warning #${newAlert.id} successfully queued! Simulated SMS broadcast dispatched to ${selectedLocation.exposed_population.toLocaleString('en-IN')} local subscriber SIMs.`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAlertBadgeClass = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/60';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/60';
      case 'WATCH':
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              Multilingual Disaster Warning Broadcast Console
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
              POST /api/alerts & GET /api/alerts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compliant with Common Alerting Protocol (CAP) / NDMA specifications. Formulates localized early warnings in English, Hindi, Assamese, and Bengali with simulated SMS & Siren triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-slate-400 font-mono">
          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
          <span>CAP-NDMA GATEWAY ACTIVE</span>
        </div>
      </div>

      {lastDispatched && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-200 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-emerald-300">Emergency Alert Broadcasted</div>
            <div>{lastDispatched}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Create Alert */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
            <Send className="w-4 h-4 text-red-400" />
            Generate New Public Warning
          </h3>

          <form onSubmit={handleBroadcastAlert} className="space-y-4 text-xs">
            {/* Target Location */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Vulnerable Region / Corridor:
              </label>
              <select
                id="alert-location-select"
                value={selectedLocId}
                onChange={e => handleLanguageOrLevelChange(language, riskLevel, e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-red-500"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.district}, {loc.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Level Selector */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Alert Severity Category:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['WATCH', 'HIGH', 'CRITICAL'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleLanguageOrLevelChange(language, lvl, selectedLocId)}
                    className={`py-2 px-1 text-center rounded font-bold transition-all ${
                      riskLevel === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-red-600 text-white shadow'
                          : lvl === 'HIGH'
                          ? 'bg-orange-500 text-white shadow'
                          : 'bg-yellow-400 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection: English, Hindi, Assamese, Bengali */}
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Target Language (NER Vernacular):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['English', 'Hindi', 'Assamese', 'Bengali'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageOrLevelChange(lang, riskLevel, selectedLocId)}
                    className={`p-2 rounded text-xs font-semibold transition-all border ${
                      language === lang
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'English' && 'English'}
                    {lang === 'Hindi' && 'हिन्दी (Hindi)'}
                    {lang === 'Assamese' && 'অসমীয়া (Assamese)'}
                    {lang === 'Bengali' && 'বাংলা (Bengali)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Alert Title */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Warning Headline / Title:
              </label>
              <input
                id="alert-title-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-xs"
              />
            </div>

            {/* Alert Body */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Broadcast Directive Text:
              </label>
              <textarea
                id="alert-message-textarea"
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-xs focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Authoring Authority */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Authoring Control Room:
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-xs"
              />
            </div>

            {/* Submit Button */}
            <button
              id="generate-alert-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg text-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Transmitting Alert...' : 'Broadcast Multi-Channel Warning (Simulated SMS)'}</span>
            </button>
          </form>
        </div>

        {/* Right Section: Active Warning Feeds */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Active Disaster Bulletin History ({alerts.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                CAP-v1.2 Standard XML/JSON Feed
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {alerts.map(alt => (
                <div
                  key={alt.id}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-lg p-4 space-y-2.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{alt.id}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${getAlertBadgeClass(alt.risk_level)}`}>
                        {alt.risk_level} • {alt.severity}
                      </span>
                      <span className="text-[10px] bg-slate-900 text-cyan-300 px-2 py-0.5 rounded border border-slate-800">
                        {alt.language}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {alt.timestamp}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {alt.title}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                      {alt.message}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] pt-1 text-slate-400">
                    <div>
                      Target Zone: <strong className="text-slate-200">{alt.location_name}</strong> • Authority: {alt.author}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        SMS: {alt.delivery_channels.sms_broadcast}
                      </span>
                      <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        CAP Feed: {alt.delivery_channels.cap_ndma_feed}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
