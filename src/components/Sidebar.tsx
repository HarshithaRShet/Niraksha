import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  Activity,
  CheckSquare,
  AlertOctagon,
  Bell,
  FileText,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { RiskLevel } from '../types';

export type NavTabId =
  | 'dashboard'
  | 'risk-map'
  | 'risk-analysis'
  | 'field-verification'
  | 'emergency-priority'
  | 'alerts'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTabId | string;
  onSelectTab: (tab: NavTabId) => void;
  criticalAlertCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  criticalAlertCount = 0,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const navItems: Array<{ id: NavTabId; label: string; icon: any; badge?: number; badgeColor?: string }> = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'risk-map', label: 'GIS Risk Map', icon: Map },
    { id: 'risk-analysis', label: 'AI Risk Engine', icon: Activity },
    { id: 'field-verification', label: 'Field Recon', icon: CheckSquare },
    { id: 'emergency-priority', label: 'Emergency DSS', icon: AlertOctagon },
    {
      id: 'alerts',
      label: 'Early Warnings',
      icon: Bell,
      badge: criticalAlertCount,
      badgeColor: 'bg-red-500 text-white'
    },
    { id: 'reports', label: 'Ground Reports', icon: FileText },
    { id: 'settings', label: 'System Architecture', icon: Settings }
  ];

  const handleNav = (tabId: NavTabId) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-slate-950/95 md:bg-slate-950 border-r border-slate-800/80 transition-all duration-200 ${
          collapsed ? 'w-18' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow">
              <Shield className="w-4 h-4 text-slate-950 fill-slate-950" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-mono font-black text-sm text-white tracking-wider">NIR-RAKSHA</span>
                <span className="block text-[9px] font-mono text-cyan-400 -mt-0.5">NER COMMAND DSS</span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Link List */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Operational System Status Pill */}
        <div className="p-3 border-t border-slate-800/80">
          {!collapsed ? (
            <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-slate-200">GSI Core Active</span>
                </span>
                <span className="font-mono text-[9px] text-slate-500">v2.4-PROD</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                8 NER States Telemetry Synced
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="System Operational">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
