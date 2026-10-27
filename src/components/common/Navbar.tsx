import React from 'react';
import { Zap, Search, ShoppingBag, User as UserIcon, LayoutDashboard, X, Server } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'flash-sales' | 'upcoming' | 'categories' | 'product-detail' | 'cart' | 'orders';
  onNavigate: (tab: 'home' | 'flash-sales' | 'upcoming' | 'categories' | 'cart' | 'orders') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onSwitchToAdmin: () => void;
  onOpenApiConfig: () => void;
  isDemoMode: boolean;
  user: { name: string; email: string; role: string } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onSwitchToAdmin,
  onOpenApiConfig,
  isDemoMode,
  user,
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pressing Enter keeps current search and ensures we are on a searchable view if needed
    if (currentTab !== 'home' && currentTab !== 'flash-sales' && currentTab !== 'upcoming') {
      onNavigate('flash-sales');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Flash<span className="text-indigo-600">Guard</span>
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'home'
                ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('flash-sales')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'flash-sales'
                ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>Flash Sales</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          <button
            onClick={() => onNavigate('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'upcoming'
                ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'orders'
                ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            My Orders
          </button>
        </nav>

        {/* Search Bar with Form submission support & Clear button */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, brands, categories..."
              aria-label="Search products"
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                title="Clear search"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Backend Status / Mode Toggle */}
          <button
            onClick={onOpenApiConfig}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
            title="Backend API Configuration & Status"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isDemoMode ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="hidden lg:inline text-[11px] font-semibold text-slate-600">
              {isDemoMode ? 'Demo Mode' : 'Live API'}
            </span>
            <Server className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Cart / Active Reservation Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold text-xs">
              {user ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="hidden sm:inline font-semibold">
              {user ? user.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>

          {/* Admin Switcher */}
          <button
            onClick={onSwitchToAdmin}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Open Operations Dashboard"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
