import React, { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  Truck,
  Users,
  CheckCircle2,
  PhoneCall,
  Clock,
  Info,
  Radio,
  Filter,
  Check
} from 'lucide-react';
import { EmergencyPriorityItem } from '../types';
import { PriorityTable } from './PriorityTable';
import { RiskBadge } from './RiskBadge';

interface EmergencyPriorityProps {
  priorities: EmergencyPriorityItem[];
  onDispatchAlert: (locationId: string, level: string) => void;
  onSelectPriority?: (item: EmergencyPriorityItem) => void;
}

export const EmergencyPriority: React.FC<EmergencyPriorityProps> = ({
  priorities,
  onDispatchAlert,
  onSelectPriority
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'P1' | 'P2' | 'P3'>('ALL');
  const [acknowledgedList, setAcknowledgedList] = useState<Record<string, boolean>>({});
  const [activeItem, setActiveItem] = useState<EmergencyPriorityItem | null>(null);

  const filtered = priorities.filter(p => {
    if (selectedFilter === 'P1') return p.priority_level.startsWith('P1');
    if (selectedFilter === 'P2') return p.priority_level.startsWith('P2');
    if (selectedFilter === 'P3') return p.priority_level.startsWith('P3');
    return true;
  });

  const handleAcknowledge = (id: string) => {
    setAcknowledgedList(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner with Strict Decision Support Disclaimer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Emergency Resource Prioritization Engine (Priority DSS)</span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded">
                  NDRF / BRO / SDRF Joint Protocol
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ranks vulnerable North Eastern corridors by compound risk: slope angle + 24h deluge + arterial connectivity + downstream census.
              </p>
            </div>
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" /> Tier:
            </span>
            {(['ALL', 'P1', 'P2', 'P3'] as const).map(tier => (
              <button
                key={tier}
                id={`btn-prio-filter-${tier.toLowerCase()}`}
                onClick={() => setSelectedFilter(tier)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedFilter === tier
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tier === 'ALL' ? 'All Tiers' : tier}
              </button>
            ))}
          </div>
        </div>

        {/* Mandatory Decision Support Disclaimer */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-amber-300">Statutory Operational Notice:</strong> Priority ranks serve strictly as an operational decision-support recommendation under National Disaster Management Authority (NDMA) guidelines. Incident Commanders and District Magistrates retain absolute discretion for on-ground deployment.
          </p>
        </div>
      </div>

      {/* Main Priority Table Reusable Component */}
      <PriorityTable
        priorities={filtered}
        onDispatchAlert={onDispatchAlert}
        onSelectPriority={(item) => {
          setActiveItem(item);
          if (onSelectPriority) onSelectPriority(item);
        }}
      />

      {/* Expanded Priority Detail Modal/Drawer if item is clicked */}
      {activeItem && (
        <div
          id="priority-detail-drawer"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
        >
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  RANK #{activeItem.priority_rank}
                </span>
                <span>•</span>
                <span>{activeItem.state}</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {activeItem.location_name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge level={activeItem.risk_level} score={activeItem.risk_score} size="md" />
              <button
                id="btn-close-priority-detail"
                onClick={() => setActiveItem(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-semibold text-slate-300">Geotechnical Assessment Rationale</div>
              <p className="text-slate-400 leading-relaxed">{activeItem.reason}</p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="font-semibold text-cyan-300">Recommended Executive Directive</div>
              <p className="text-slate-300 leading-relaxed font-medium">{activeItem.recommended_action}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              id={`btn-ack-${activeItem.id}`}
              onClick={() => handleAcknowledge(activeItem.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                acknowledgedList[activeItem.id]
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{acknowledgedList[activeItem.id] ? 'Action Acknowledged by DM' : 'Acknowledge Directive'}</span>
            </button>

            <button
              id={`btn-broadcast-prio-${activeItem.id}`}
              onClick={() => onDispatchAlert(activeItem.location_id, activeItem.risk_level)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Public Alert</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
