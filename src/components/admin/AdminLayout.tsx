import React from 'react';
import {
  LayoutDashboard,
  Package,
  Zap,
  ShoppingBag,
  ShieldAlert,
  Activity,
  FileText,
  Sliders,
  ExternalLink,
  Server,
  User,
  LogOut,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'products'
  | 'flash-sales'
  | 'orders'
  | 'fraud'
  | 'monitoring'
  | 'audit-logs'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSwitchToCustomer: () => void;
  onOpenApiConfig: () => void;
  isDemoMode: boolean;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onSwitchToCustomer,
  onOpenApiConfig,
  isDemoMode,
  children,
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Inventory', icon: Package },
    { id: 'flash-sales', label: 'Flash Sales', icon: Zap },
    { id: 'orders', label: 'Orders & Reservations', icon: ShoppingBag },
    { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert },
    { id: 'monitoring', label: 'System Monitoring', icon: Activity },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Sidebar (Deep Navy / Slate styling matching Reference 5-9) */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex flex-col shrink-0 border-r border-slate-900 select-none">
        {/* Brand Area */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Flash<span className="text-indigo-400">Guard</span></span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/40">
                  Admin
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">Operations Center</div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Switcher & Backend status */}
        <div className="p-4 border-t border-slate-900 space-y-2 text-xs">
          <button
            onClick={onOpenApiConfig}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isDemoMode ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span className="text-[11px] font-medium">
                {isDemoMode ? 'Demo Simulation' : 'Live FastAPI Bridge'}
              </span>
            </div>
            <Server className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={onSwitchToCustomer}
            className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Customer Storefront</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {menuItems.find((m) => m.id === currentTab)?.label || 'Console'}
            </h2>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500">BTech High-Concurrency Engine</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenApiConfig}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center gap-1.5 transition-colors"
            >
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>Backend API</span>
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                A
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">
                Admin Officer
              </span>
            </div>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
