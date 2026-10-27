import React, { useState } from 'react';
import { Product } from '../../types';
import { CountdownTimer } from '../common/CountdownTimer';
import { SaleStatusBadge } from '../common/Badge';
import {
  ChevronRight,
  Star,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import { getProductSaleStatus, isProductSoldOut, formatLocalDateTime } from '../../utils/saleStatus';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onBuyNow,
  onAddToCart,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'reviews'>('overview');
  const [addedToast, setAddedToast] = useState(false);

  const currentStatus = getProductSaleStatus(product);
  const isSoldOut = isProductSoldOut(product);
  const isLive = currentStatus === 'live' && !isSoldOut;
  const isUpcoming = currentStatus === 'upcoming';
  const isEnded = currentStatus === 'ended';

  const handleIncrement = () => {
    if (quantity < Math.min(product.maxPerCustomer, product.availableStock)) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const stockPercentage = Math.round((product.availableStock / product.totalStock) * 100);

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs border border-slate-700 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Added {quantity} unit(s) of {product.name} to cart</span>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <button onClick={onBack} className="hover:text-slate-900 transition-colors">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="hover:text-slate-900 cursor-pointer" onClick={onBack}>
          {product.category}
        </span>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-800 line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-8 overflow-hidden">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <SaleStatusBadge status={currentStatus} />
              {isSoldOut && currentStatus !== 'upcoming' && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-white shadow-2xs">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl border-2 p-1.5 bg-slate-50 overflow-hidden transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-indigo-600 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Flash Sale Engine */}
        <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {product.brand}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                <span className="text-xs text-slate-400">({product.reviewsCount.toLocaleString()} reviews)</span>
              </div>
            </div>

            {/* Pricing Row */}
            <div className="flex items-baseline gap-3 py-2 border-y border-slate-100">
              <span className="text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
                ₹{product.salePrice.toLocaleString()}
              </span>
              <span className="text-base text-slate-400 line-through font-mono">
                ₹{product.originalPrice.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                {product.discountPercentage}% OFF
              </span>
            </div>

            {/* Flash Sale Banner (matching Reference 3) */}
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 fill-current text-rose-600" />
                  Flash Sale Event
                </div>
                <div className="text-[11px] text-slate-500">
                  SKU: <span className="font-mono text-slate-700">{product.sku}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Starts:</span>
                  <span className="font-medium text-slate-700">
                    {formatLocalDateTime(product.saleStartsAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Ends:</span>
                  <span className="font-medium text-slate-700">
                    {formatLocalDateTime(product.saleEndsAt)}
                  </span>
                </div>
              </div>

              {/* Countdown Component */}
              <div className="pt-1">
                <div className="text-[11px] font-semibold text-rose-800 flex items-center gap-1 mb-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {isUpcoming ? 'Countdown to Sale Launch:' : 'Time Remaining in Flash Sale:'}
                </div>
                <CountdownTimer
                  targetDate={isUpcoming ? product.saleStartsAt : product.saleEndsAt}
                  variant="detail"
                />
              </div>
            </div>

            {/* Stock Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Available Stock:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {product.availableStock} of {product.totalStock} left
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
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

            {/* Anti-Fraud Protection Notice */}
            <div className="flex items-center gap-2 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong className="font-semibold">FlashGuard Fairness:</strong> Max {product.maxPerCustomer} units per verified account. Bot tokens quarantined automatically.
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-700">
                Quantity (Max {product.maxPerCustomer} per customer)
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isSoldOut}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base font-semibold"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= Math.min(product.maxPerCustomer, product.availableStock) || isSoldOut}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-base font-semibold"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-slate-500">
                  Subtotal:{' '}
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{(product.salePrice * quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4">
            {isLive ? (
              <button
                type="button"
                onClick={() => onBuyNow(product, quantity)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now (Enter Fast Queue)</span>
              </button>
            ) : isUpcoming ? (
              <button
                type="button"
                disabled
                className="w-full py-3.5 bg-amber-100 text-amber-800 font-semibold text-sm rounded-xl cursor-not-allowed text-center"
              >
                Sale Starts Soon
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3.5 bg-slate-100 text-slate-400 font-semibold text-sm rounded-xl cursor-not-allowed text-center border border-slate-200"
              >
                Sold Out / Sale Ended
              </button>
            )}

            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={isSoldOut}
              className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 hover:border-slate-400 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Overview, Specifications, Reviews (matching Reference 3) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="flex border-b border-slate-200 px-6 sm:px-8">
          {(['overview', 'specifications', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-4 text-xs sm:text-sm font-semibold capitalize border-b-2 -mb-px transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {product.description}
              </p>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                  Key Highlights
                </h4>
                <ul className="space-y-2">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-semibold">Priority Express Shipping</div>
                    <div className="text-[11px] text-slate-400">Direct from bonded warehouse</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
                  <RotateCcw className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-semibold">7-Day Replacement</div>
                    <div className="text-[11px] text-slate-400">Guaranteed authentic units</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-semibold">1 Year Brand Warranty</div>
                    <div className="text-[11px] text-slate-400">Authorized manufacturer coverage</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-2xl divide-y divide-slate-100 text-xs sm:text-sm">
              {Object.entries(product.specs).map(([specKey, specVal]) => (
                <div key={specKey} className="py-2.5 grid grid-cols-3 gap-4">
                  <span className="font-semibold text-slate-500">{specKey}</span>
                  <span className="col-span-2 text-slate-800 font-medium">{specVal}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">{product.rating} / 5.0</div>
                  <div className="text-xs text-slate-500">Based on {product.reviewsCount} verified purchase reviews</div>
                </div>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              {/* Sample Verified Reviews */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Aditya Roy (Verified Flash Buyer)</span>
                    <span className="text-slate-400">Yesterday</span>
                  </div>
                  <p className="text-slate-600">
                    "Was able to lock the stock token in less than a second during peak flash rush. Fantastic experience!"
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Meera Sen</span>
                    <span className="text-slate-400">3 days ago</span>
                  </div>
                  <p className="text-slate-600">
                    "Authentic product with sealed box packaging. Price was lower than anywhere else."
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
