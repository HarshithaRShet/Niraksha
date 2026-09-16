import React from 'react';
import {
  Menu,
  Shield,
  Activity,
  Bell,
  RefreshCw,
  Clock,
  Radio
} from 'lucide-react';
import { DisasterAlert } from '../types';
import { OfflineIndicator } from './OfflineIndicator';

interface HeaderProps {
  pageTitle?: string;
  onOpenMobileMenu?: () => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  offlineCount: number;
  onSyncOffline: () => void;
  isSyncing: boolean;
  criticalAlerts: DisasterAlert[];
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle = 'Landslide Early Warning & Risk Command Grid',
  onOpenMobileMenu,
  isOnline,
  setIsOnline,
  offlineCount,
  onSyncOffline,
  isSyncing,
  criticalAlerts,
  onRefreshData,
  isRefreshing = false
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between gap-3 shadow-md">
      {/* Left side: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            id="btn-mobile-sidebar-toggle"
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
            title="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{pageTitle}</span>
              <span className="hidden xl:inline text-[10px] font-mono font-normal text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                NER-8S GRID
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              AI-Powered Landslide Risk Monitoring & Decision Support System • SIH 2026 #26001
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Telemetry sync + Offline indicator + Force refresh */}
      <div className="flex items-center gap-2.5">
        {criticalAlerts.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 bg-red-950/70 border border-red-500/50 text-red-300 px-2.5 py-1 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
            <span>{criticalAlerts.length} CRITICAL WARN</span>
          </div>
        )}

        <OfflineIndicator
          isOnline={isOnline}
          onToggle={setIsOnline}
          offlineCount={offlineCount}
          onSync={onSyncOffline}
          isSyncing={isSyncing}
        />

        {onRefreshData && (
          <button
            id="btn-refresh-telemetry"
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 transition-colors disabled:opacity-50"
            title="Refresh Live Telemetry from Database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        )}
      </div>
    </header>
  );
};
