import React, { useState } from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ChevronRight, Filter, SlidersHorizontal, Search, X } from 'lucide-react';
import { getProductSaleStatus, isProductSoldOut } from '../../utils/saleStatus';

interface FlashSalesPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onNavigateHome: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const FlashSalesPage: React.FC<FlashSalesPageProps> = ({
  products,
  onSelectProduct,
  onBuyNow,
  onNavigateHome,
  searchQuery = '',
  onSearchChange,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'discount' | 'price-asc' | 'price-desc' | 'stock'>('discount');
  const [notified, setNotified] = useState<Record<string, boolean>>({});

  const categories = ['all', 'Smartphones', 'Laptops', 'Headphones', 'Cameras', 'Footwear', 'Televisions'];

  // Counts based on consistent sale status definition
  const liveCount = products.filter((p) => getProductSaleStatus(p) === 'live' && !isProductSoldOut(p)).length;
  const upcomingCount = products.filter((p) => getProductSaleStatus(p) === 'upcoming').length;
  const endedCount = products.filter((p) => getProductSaleStatus(p) === 'ended' || isProductSoldOut(p)).length;

  const handleNotifyToggle = (id: string) => {
    setNotified((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const normalizedQuery = (searchQuery || '').trim().toLowerCase();

  // Filter products: search works together with sale-status and category filters
  const filtered = products.filter((p) => {
    const status = getProductSaleStatus(p);
    const isSoldOut = isProductSoldOut(p);

    // 1. Sale status filter
    if (activeTab === 'live' && (status !== 'live' || isSoldOut)) return false;
    if (activeTab === 'upcoming' && status !== 'upcoming') return false;
    if (activeTab === 'ended' && (status !== 'ended' && !isSoldOut)) return false;

    // 2. Category filter
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

    // 3. Search query filter (matches name, brand, category case-insensitively)
    if (normalizedQuery) {
      const matchName = p.name ? p.name.toLowerCase().includes(normalizedQuery) : false;
      const matchBrand = p.brand ? p.brand.toLowerCase().includes(normalizedQuery) : false;
      const matchCategory = p.category ? p.category.toLowerCase().includes(normalizedQuery) : false;
      if (!matchName && !matchBrand && !matchCategory) return false;
    }

    return true;
  });

  // Sort products
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
    if (sortBy === 'price-asc') return a.salePrice - b.salePrice;
    if (sortBy === 'price-desc') return b.salePrice - a.salePrice;
    if (sortBy === 'stock') return a.availableStock - b.availableStock;
    return 0;
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <button onClick={onNavigateHome} className="hover:text-slate-900 transition-colors">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-800">Flash Sales</span>
      </nav>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Flash Sales
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Limited stock. Limited time. Don't miss out! High-speed queue protection active.
          </p>
        </div>

        {/* Filter Tabs (All, Live, Upcoming, Ended) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'live' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live ({liveCount})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'upcoming' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setActiveTab('ended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ended' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ended ({endedCount})
          </button>
        </div>
      </div>

      {/* Filter, Search, and Sort Toolbar */}
      <div className="flex flex-col gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* In-page Search Input */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative w-full md:w-72"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search by name, brand, category..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            >
              <option value="discount">Highest Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock">Stock Remaining</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1 border-t border-slate-200/60">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" />
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Indicators */}
      {(searchQuery || selectedCategory !== 'all' || activeTab !== 'all') && (
        <div className="flex items-center justify-between text-xs text-slate-600 bg-indigo-50/60 border border-indigo-100 px-3 py-2 rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-indigo-900">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 text-[11px] font-medium">
                Search: &ldquo;{searchQuery}&rdquo;
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeTab !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 text-[11px] font-medium capitalize">
                Status: {activeTab}
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 text-[11px] font-medium">
                Category: {selectedCategory}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <span className="text-slate-400 font-mono text-[11px]">({sorted.length} results)</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSearchChange) onSearchChange('');
              setActiveTab('all');
              setSelectedCategory('all');
            }}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Product List Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sorted.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onBuyNow={onBuyNow}
              onNotifyToggle={handleNotifyToggle}
              isNotified={!!notified[product.id]}
            />
          ))}
        </div>
      ) : (
        /* Empty Search / Filter State (Task 1: Clear "No products found" message and a way to clear search) */
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-slate-800">No products found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No products match "${searchQuery}" with the selected filters.`
              : 'No items match the chosen filter.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            {searchQuery && onSearchChange && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
            {(selectedCategory !== 'all' || activeTab !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('all');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
