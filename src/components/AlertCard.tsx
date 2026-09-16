import React from 'react';
import { DisasterAlert } from '../types';
import { RiskBadge } from './RiskBadge';
import { Radio, Send, Bell, Globe, Clock, User, ShieldAlert } from 'lucide-react';

interface AlertCardProps {
  alert: DisasterAlert;
  onSelect?: (alert: DisasterAlert) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onSelect }) => {
  return (
    <div
      id={`alert-card-${alert.id}`}
      onClick={() => onSelect && onSelect(alert)}
      className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all shadow-md text-slate-200"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {alert.id}
          </span>
          <span className="text-xs text-cyan-400 font-medium">
            {alert.location_name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
            {alert.language}
          </span>
          <RiskBadge level={alert.risk_level} size="sm" />
        </div>
      </div>

      <h4 className="text-sm font-bold text-white mb-2 leading-snug">
        {alert.title}
      </h4>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mb-3">
        {alert.message}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" /> {alert.timestamp}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-500" /> {alert.author}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded">
            <Radio className="w-2.5 h-2.5" /> {alert.delivery_channels.sms_broadcast}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-blue-950/60 text-blue-400 border border-blue-800/50 px-1.5 py-0.5 rounded">
            <Globe className="w-2.5 h-2.5" /> {alert.delivery_channels.cap_ndma_feed}
          </span>
        </div>
      </div>
    </div>
  );
};
