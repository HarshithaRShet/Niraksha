import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  onToggle: (online: boolean) => void;
  offlineCount?: number;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  onToggle,
  offlineCount = 0,
  onSync,
  isSyncing = false
}) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <button
        id="btn-toggle-online-mode"
        onClick={() => onToggle(!isOnline)}
        title={isOnline ? 'Switch to Offline Field Recon Mode' : 'Switch to Connected Command Mode'}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all font-mono font-medium ${
          isOnline
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
            : 'bg-amber-950/80 text-amber-300 border-amber-500/50 hover:bg-amber-900 animate-pulse'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">SAT-ONLINE</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">OFFLINE MODE</span>
          </>
        )}
      </button>

      {offlineCount > 0 && (
        <button
          id="btn-sync-offline-queue"
          onClick={onSync}
          disabled={!isOnline || isSyncing}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono transition-all ${
            isOnline
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500 hover:bg-cyan-900'
              : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync ({offlineCount})</span>
        </button>
      )}
    </div>
  );
};
