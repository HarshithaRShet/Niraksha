import React from 'react';
import { EmergencyPriorityItem } from '../types';
import { RiskBadge } from './RiskBadge';
import {
  ShieldAlert,
  ArrowRight,
  Route,
  Users,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PriorityTableProps {
  priorities: EmergencyPriorityItem[];
  onDispatchAlert?: (locationId: string, level: string) => void;
  onSelectPriority?: (item: EmergencyPriorityItem) => void;
}

export const PriorityTable: React.FC<PriorityTableProps> = ({
  priorities,
  onDispatchAlert,
  onSelectPriority
}) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-red-500 text-white font-black';
      case 2:
        return 'bg-orange-500 text-white font-bold';
      case 3:
        return 'bg-amber-500 text-slate-950 font-bold';
      default:
        return 'bg-slate-700 text-slate-200 font-semibold';
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
          <tr>
            <th className="py-3 px-4 text-center">Rank</th>
            <th className="py-3 px-4">Hazard Zone & State</th>
            <th className="py-3 px-4">Risk Level</th>
            <th className="py-3 px-4">Priority & Assigned Force</th>
            <th className="py-3 px-4">Catchment Vulnerability</th>
            <th className="py-3 px-4">Action Directive</th>
            <th className="py-3 px-4 text-right">Dispatch</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-sans">
          {priorities.map((item) => (
            <tr
              key={item.id}
              onClick={() => onSelectPriority && onSelectPriority(item)}
              className="hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <td className="py-3.5 px-4 text-center">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono ${getRankBadge(
                    item.priority_rank
                  )}`}
                >
                  #{item.priority_rank}
                </span>
              </td>

              <td className="py-3.5 px-4">
                <div className="font-bold text-white leading-tight">
                  {item.location_name}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>{item.state} • {item.location_id}</span>
                </div>
              </td>

              <td className="py-3.5 px-4">
                <RiskBadge level={item.risk_level} score={item.risk_score} size="sm" showPulse={item.priority_rank <= 2} />
              </td>

              <td className="py-3.5 px-4">
                <div className="font-semibold text-slate-200">
                  {item.priority_level}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  {item.assigned_agency}
                </div>
              </td>

              <td className="py-3.5 px-4">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-mono">{item.population_exposed.toLocaleString()} citizens</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Route className="w-3 h-3 text-slate-500" />
                  <span>{item.road_criticality}</span>
                </div>
              </td>

              <td className="py-3.5 px-4 max-w-xs">
                <div className="text-slate-200 font-medium line-clamp-2">
                  {item.recommended_action}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                  {item.reason}
                </div>
              </td>

              <td className="py-3.5 px-4 text-right">
                {onDispatchAlert && (
                  <button
                    id={`btn-dispatch-alert-${item.location_id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDispatchAlert(item.location_id, item.risk_level);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors"
                  >
                    Broadcast <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
