import React from 'react';
import { Product } from '../../types';
import { SaleStatusBadge } from '../common/Badge';
import { CountdownTimer } from '../common/CountdownTimer';
import { Heart, Bell, ShoppingCart, Eye, Check } from 'lucide-react';
import { getProductSaleStatus, isProductSoldOut, formatLocalDateTime } from '../../utils/saleStatus';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onNotifyToggle?: (productId: string) => void;
  isNotified?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onBuyNow,
  onNotifyToggle,
  isNotified = false,
}) => {
  // Use consistent definition of sale status:
  // - Upcoming: current time is before the start time.
  // - Live: current time is at or after the start time and before the end time.
  // - Ended: current time is at or after the end time.
  // - Sold Out: inventory is unavailable (separate inventory condition).
  const currentStatus = getProductSaleStatus(product);
  const isSoldOut = isProductSoldOut(product);
  const isUpcoming = currentStatus === 'upcoming';
  const isLive = currentStatus === 'live' && !isSoldOut;
  const isEnded = currentStatus === 'ended';

  // Stock percentage for progress bar
  const stockPercentage = Math.round((product.availableStock / product.totalStock) * 100);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top badges & Wishlist */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-1.5">
          <SaleStatusBadge status={currentStatus} />
          {isSoldOut && currentStatus !== 'upcoming' && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-white shadow-2xs">
              Sold Out
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="pointer-events-auto w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200/70 text-slate-400 hover:text-rose-500 hover:border-rose-200 flex items-center justify-center transition-colors shadow-2xs"
          title="Save to Wishlist"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Product Image Area */}
      <div
        onClick={() => onSelect(product)}
        className="relative pt-[85%] bg-slate-50 overflow-hidden cursor-pointer group-hover:opacity-95 transition-opacity"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-6 transform group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Quick View Hover overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Brand */}
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            {product.brand} • {product.category}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelect(product)}
            className="text-sm font-semibold text-slate-900 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Pricing Row */}
          <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-slate-950 font-mono tracking-tight">
              ₹{product.salePrice.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 line-through font-mono">
              ₹{product.originalPrice.toLocaleString()}
            </span>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
              {product.discountPercentage}% OFF
            </span>
          </div>

          {/* UPCOMING FLASH SALE DISPLAY (Task 2: Both Starts & Ends times + Starts in countdown) */}
          {isUpcoming ? (
            <div className="mt-3 p-3 bg-amber-50/70 rounded-xl text-xs border border-amber-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 font-medium">Starts:</span>
                <span className="font-semibold text-slate-900 font-mono text-[11px]">
                  {formatLocalDateTime(product.saleStartsAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500 font-medium">Ends:</span>
                <span className="font-semibold text-slate-900 font-mono text-[11px]">
                  {formatLocalDateTime(product.saleEndsAt)}
                </span>
              </div>
              <div className="pt-1.5 border-t border-amber-200/70 flex flex-wrap items-center justify-between gap-1 text-slate-800">
                <span className="text-[11px] font-semibold text-amber-900">Starts in:</span>
                <CountdownTimer
                  targetDate={product.saleStartsAt}
                  variant="upcoming"
                  expiredLabel="Sale Live Now!"
                />
              </div>
            </div>
          ) : isLive ? (
            /* LIVE SALE DISPLAY */
            <div className="mt-3 py-1.5 px-2.5 bg-slate-50 rounded-lg text-xs flex items-center justify-between border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">Ends in</span>
              <CountdownTimer targetDate={product.saleEndsAt} variant="compact" />
            </div>
          ) : (
            /* ENDED SALE DISPLAY */
            <div className="mt-3 py-1.5 px-2.5 bg-slate-50 rounded-lg text-xs text-center border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">
                Flash Sale Concluded
              </span>
            </div>
          )}

          {/* Stock remaining bar (for live / active sales) */}
          {!isUpcoming && (
            <div className="mt-2.5 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">
                  {isSoldOut ? 'Stock exhausted' : `Only ${product.availableStock} left`}
                </span>
                {!isSoldOut && (
                  <span className="font-semibold text-slate-700 font-mono">
                    {product.availableStock} / {product.totalStock}
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    stockPercentage <= 20
                      ? 'bg-rose-500'
                      : stockPercentage <= 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, stockPercentage)}%` }}
                />
              </div>
            </div>
          )}

          {isUpcoming && (
            <div className="mt-2 text-[11px] text-slate-500">
              Stock allocation: <span className="font-semibold text-slate-700 font-mono">{product.totalStock} units</span>
            </div>
          )}
        </div>

        {/* Action Button (Context-sensitive) */}
        <div className="pt-2">
          {isLive && (
            <button
              type="button"
              onClick={() => onBuyNow(product)}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </button>
          )}

          {isUpcoming && (
            <button
              type="button"
              onClick={() => onNotifyToggle && onNotifyToggle(product.id)}
              className={`w-full py-2.5 px-4 font-semibold text-xs rounded-xl border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isNotified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
              }`}
            >
              {isNotified ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reminder Set</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-slate-500" />
                  <span>Notify Me</span>
                </>
              )}
            </button>
          )}

          {isSoldOut && currentStatus !== 'upcoming' && (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed text-center border border-slate-200"
            >
              Sold Out
            </button>
          )}

          {isEnded && !isSoldOut && (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 font-semibold text-xs rounded-xl cursor-not-allowed text-center border border-slate-200"
            >
              Sale Ended
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
