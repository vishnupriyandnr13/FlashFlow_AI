import React, { useState } from 'react';
import { Product, SaleCampaign } from '../../types';
import { ProductCard } from './ProductCard';
import { CountdownTimer } from '../common/CountdownTimer';
import { Bell, Calendar, ChevronRight, Check, Clock } from 'lucide-react';
import { getProductSaleStatus, formatLocalDateTime } from '../../utils/saleStatus';

interface UpcomingSalesPageProps {
  products: Product[];
  campaigns: SaleCampaign[];
  onSelectProduct: (product: Product) => void;
  onNavigateHome: () => void;
  searchQuery?: string;
}

export const UpcomingSalesPage: React.FC<UpcomingSalesPageProps> = ({
  products,
  campaigns,
  onSelectProduct,
  onNavigateHome,
  searchQuery = '',
}) => {
  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Use consistent definition: Upcoming = current time is before start time
  const upcomingProducts = products.filter((p) => {
    const isUpcoming = getProductSaleStatus(p) === 'upcoming';
    if (!isUpcoming) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      const matchCategory = p.category?.toLowerCase().includes(q);
      return matchName || matchBrand || matchCategory;
    }
    return true;
  });

  const upcomingCampaigns = campaigns.filter((c) => {
    const start = new Date(c.startsAt).getTime();
    return Date.now() < start;
  });

  const handleNotifyToggle = (id: string) => {
    const isNowNotified = !notified[id];
    setNotified((prev) => ({ ...prev, [id]: isNowNotified }));

    const prod = products.find((p) => p.id === id);
    if (isNowNotified && prod) {
      setToastMessage(`Reminder scheduled! We'll alert you before the sale drops for ${prod.name}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs max-w-md border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Bell className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <button onClick={onNavigateHome} className="hover:text-slate-900 transition-colors">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-800">Upcoming Sales</span>
      </nav>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-2">
          <Clock className="w-3.5 h-3.5" />
          Scheduled Flash Events
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Upcoming Sales & Drops
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Get prepared before high-concurrency traffic floods the gates. Set reminders to receive an instant reservation link prior to drop time.
        </p>
      </div>

      {/* Featured Campaign Timeline Cards (Displaying both Starts and Ends times) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingCampaigns.map((camp) => (
          <div
            key={camp.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  {camp.discountBadge}
                </span>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  UPCOMING
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{camp.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{camp.description}</p>
            </div>

            {/* Campaign Starts, Ends, and Countdown */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Starts:</span>
                <span className="font-semibold text-slate-900 font-mono text-[11px]">
                  {formatLocalDateTime(camp.startsAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Ends:</span>
                <span className="font-semibold text-slate-900 font-mono text-[11px]">
                  {formatLocalDateTime(camp.endsAt)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-1 text-slate-800">
                <span className="font-semibold text-amber-900">Starts in:</span>
                <CountdownTimer
                  targetDate={camp.startsAt}
                  variant="upcoming"
                  expiredLabel="Sale Live Now!"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{camp.productCount} Exclusive Items</span>
              </div>
              <span className="font-mono text-slate-500 text-[11px]">
                Quota: {camp.totalStockAllocated} units
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Upcoming Items for Reservation</h2>
          <span className="text-xs text-slate-500">
            {upcomingProducts.length} product{upcomingProducts.length !== 1 ? 's' : ''} scheduled
          </span>
        </div>

        {upcomingProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {upcomingProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onBuyNow={() => {}}
                onNotifyToggle={handleNotifyToggle}
                isNotified={!!notified[product.id]}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
            No upcoming items match at this moment.
          </div>
        )}
      </div>
    </div>
  );
};
