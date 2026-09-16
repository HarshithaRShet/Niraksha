import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  score?: number;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showPulse = false,
  score
}) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const styles = {
    CRITICAL: {
      bg: 'bg-red-500/15 border-red-500 text-red-400',
      dot: 'bg-red-500',
      pulse: 'bg-red-400'
    },
    HIGH: {
      bg: 'bg-amber-500/15 border-amber-500 text-amber-400',
      dot: 'bg-amber-500',
      pulse: 'bg-amber-400'
    },
    WATCH: {
      bg: 'bg-yellow-500/15 border-yellow-500 text-yellow-400',
      dot: 'bg-yellow-500',
      pulse: 'bg-yellow-400'
    },
    LOW: {
      bg: 'bg-emerald-500/15 border-emerald-500 text-emerald-400',
      dot: 'bg-emerald-500',
      pulse: 'bg-emerald-400'
    }
  }[normLevel] || {
    bg: 'bg-slate-800 border-slate-700 text-slate-300',
    dot: 'bg-slate-400',
    pulse: 'bg-slate-300'
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  }[size];

  return (
    <span
      id={`risk-badge-${normLevel.toLowerCase()}`}
      className={`inline-flex items-center rounded-full font-mono font-medium border tracking-wide uppercase ${styles.bg} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {(showPulse || normLevel === 'CRITICAL') && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.pulse}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${styles.dot}`} />
      </span>
      <span>{normLevel}</span>
      {score !== undefined && (
        <span className="opacity-80 pl-1 border-l border-current/30 font-bold">
          {score}/100
        </span>
      )}
    </span>
  );
};
