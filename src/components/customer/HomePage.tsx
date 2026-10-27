import React, { useState } from 'react';
import { Product, SaleCampaign } from '../../types';
import { ProductCard } from './ProductCard';
import { CountdownTimer } from '../common/CountdownTimer';
import { ArrowRight, Flame, Clock, Search, X } from 'lucide-react';
import { getProductSaleStatus, isProductSoldOut } from '../../utils/saleStatus';

interface HomePageProps {
  products: Product[];
  campaigns: SaleCampaign[];
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onNavigateToTab: (tab: 'flash-sales' | 'upcoming' | 'orders') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  campaigns,
  onSelectProduct,
  onBuyNow,
  onNavigateToTab,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [notifiedProducts, setNotifiedProducts] = useState<Record<string, boolean>>({});

  const featuredCampaign = campaigns.find((c) => c.status === 'Live') || campaigns[0];

  const categories = ['All', 'Smartphones', 'Laptops', 'Headphones', 'Cameras', 'Footwear', 'Televisions'];

  const handleNotifyToggle = (id: string) => {
    setNotifiedProducts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const normalizedQuery = (searchQuery || '').trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  // Filter products by search query and category (case-insensitive across name, brand, category)
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !normalizedQuery ||
      (p.name && p.name.toLowerCase().includes(normalizedQuery)) ||
      (p.brand && p.brand.toLowerCase().includes(normalizedQuery)) ||
      (p.category && p.category.toLowerCase().includes(normalizedQuery));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter live and upcoming products using the consistent status definition
  const liveProducts = filteredProducts.filter((p) => getProductSaleStatus(p) === 'live' && !isProductSoldOut(p));
  const upcomingProducts = filteredProducts.filter((p) => getProductSaleStatus(p) === 'upcoming');

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero Banner (Mega Flash Sale) - only shown when not actively searching */}
      {!isSearching && (
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

          <div className="relative px-6 py-10 sm:px-12 sm:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Limited Time Offer
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Mega Flash Sale
                </h1>
                <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-xl font-normal">
                  Top brands. Unbeatable prices.
                </p>
              </div>

              {/* Countdown Box */}
              <div className="pt-1">
                <CountdownTimer
                  targetDate={featuredCampaign?.endsAt || new Date(Date.now() + 8 * 3600 * 1000).toISOString()}
                  variant="hero"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateToTab('flash-sales')}
                  className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <div className="relative w-full max-w-md aspect-4/3 flex items-center justify-center">
                <div className="absolute inset-0 bg-radial from-indigo-500/20 to-transparent blur-2xl rounded-full" />
                <img
                  src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"
                  alt="Flash Sale Featured Flagship"
                  className="relative z-10 w-4/5 h-auto object-contain drop-shadow-2xl rounded-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 z-20 bg-rose-600 text-white font-black text-xs sm:text-sm px-3.5 py-2 rounded-2xl shadow-lg transform rotate-12 flex flex-col items-center leading-none">
                  <span className="text-[10px] font-normal uppercase">Up to</span>
                  <span className="text-base font-extrabold mt-0.5">70% OFF</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SEARCH RESULTS VIEW (when search query is present) */}
      {isSearching ? (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Search Results for &ldquo;{searchQuery}&rdquo;
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching your search
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Search</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills (working together with search) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Filter by Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Result Cards Grid or Empty State */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onBuyNow={onBuyNow}
                  onNotifyToggle={handleNotifyToggle}
                  isNotified={!!notifiedProducts[product.id]}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-base font-semibold text-slate-800">No products found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No products match &ldquo;{searchQuery}&rdquo;
                {selectedCategory !== 'All' ? ` in category "${selectedCategory}"` : ''}.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
                {selectedCategory !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Reset Category
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      ) : (
        /* STANDARD HOME PAGE VIEW (Featured Flash Deals & Upcoming Drops) */
        <>
          {/* Featured Flash Deals Header & Category Pills */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Featured Flash Deals
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Limited-time discounts on trending electronics and gear
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigateToTab('flash-sales')}
                  className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group cursor-pointer"
                >
                  <span>View All Deals</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Products Grid */}
            {liveProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {liveProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                    onBuyNow={onBuyNow}
                    onNotifyToggle={handleNotifyToggle}
                    isNotified={!!notifiedProducts[product.id]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-700">No active flash sales found in this category.</p>
                <p className="text-xs text-slate-500 mt-1">Check out our upcoming sales dropping soon.</p>
              </div>
            )}
          </section>

          {/* Upcoming Sales Section (Showing both Starts and Ends times + Start countdown) */}
          {upcomingProducts.length > 0 && (
            <section className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    Dropping Soon
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    Upcoming Flash Drops
                  </h2>
                </div>

                <button
                  onClick={() => onNavigateToTab('upcoming')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>See Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {upcomingProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                    onBuyNow={onBuyNow}
                    onNotifyToggle={handleNotifyToggle}
                    isNotified={!!notifiedProducts[product.id]}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};
