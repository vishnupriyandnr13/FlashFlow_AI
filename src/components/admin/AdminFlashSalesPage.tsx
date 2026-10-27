import React, { useState } from 'react';
import { SaleCampaign, Product } from '../../types';
import { api } from '../../api/client';
import { Modal } from '../common/Modal';
import {
  Plus,
  Zap,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AdminFlashSalesPageProps {
  campaigns: SaleCampaign[];
  products: Product[];
  onRefresh: () => void;
}

export const AdminFlashSalesPage: React.FC<AdminFlashSalesPageProps> = ({
  campaigns,
  products,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountBadge, setDiscountBadge] = useState('Up to 50% OFF');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [allocatedStock, setAllocatedStock] = useState(150);
  const [formError, setFormError] = useState('');

  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setTitle('');
    setDescription('');
    setDiscountBadge('Flat 40% OFF');
    const start = new Date();
    const end = new Date(Date.now() + 12 * 3600 * 1000);
    setStartsAt(start.toISOString().slice(0, 16));
    setEndsAt(end.toISOString().slice(0, 16));
    setSelectedProductIds(products.slice(0, 2).map((p) => p.id));
    setAllocatedStock(100);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Campaign title is required.');
      return;
    }
    if (!startsAt || !endsAt) {
      setFormError('Start and End times are required.');
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError('End time must be after Start time.');
      return;
    }
    if (selectedProductIds.length === 0) {
      setFormError('Select at least one product for this campaign.');
      return;
    }

    const startDate = new Date(startsAt);
    const now = new Date();
    let status: 'Live' | 'Upcoming' | 'Scheduled' | 'Ended' = 'Live';
    if (startDate > now) status = 'Upcoming';

    try {
      await api.campaigns.create({
        title,
        description: description || 'High-concurrency flash promotion event.',
        bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
        discountBadge,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        status,
        productCount: selectedProductIds.length,
        productIds: selectedProductIds,
        totalStockAllocated: Number(allocatedStock),
        totalSold: 0,
      });

      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create campaign');
    }
  };

  const toggleProductSelect = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (matching Reference 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Flash Sale Campaigns
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure flash windows, product token pools, and automated concurrency limits
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns by name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Campaigns Table (matching Reference 7) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Campaign</th>
                <th className="py-3.5 px-4 font-semibold text-center">Products</th>
                <th className="py-3.5 px-4 font-semibold text-center">Allocated Stock</th>
                <th className="py-3.5 px-4 font-semibold">Start Time</th>
                <th className="py-3.5 px-4 font-semibold">End Time</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCampaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{camp.title}</div>
                    <div className="text-[11px] text-indigo-600 font-medium">
                      {camp.discountBadge}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono font-medium">
                    {camp.productCount} items
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="font-bold text-slate-800">{camp.totalSold}</span> /{' '}
                    <span className="text-slate-500">{camp.totalStockAllocated}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-mono">
                    {new Date(camp.startsAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-mono">
                    {new Date(camp.endsAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3.5 px-4">
                    {camp.status === 'Live' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Live
                      </span>
                    )}
                    {camp.status === 'Upcoming' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        Upcoming
                      </span>
                    )}
                    {camp.status === 'Scheduled' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        Scheduled
                      </span>
                    )}
                    {camp.status === 'Ended' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        Ended
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Flash Sale Campaign"
          subtitle="Configure time window, pricing rules, and stock reservation quotas"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight Lightning Deal 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discount Tagline</label>
                <input
                  type="text"
                  value={discountBadge}
                  onChange={(e) => setDiscountBadge(e.target.value)}
                  placeholder="e.g. Up to 60% OFF"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Total Allocated Stock Pool *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={allocatedStock}
                  onChange={(e) => setAllocatedStock(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
                />
              </div>

              {/* Product Multi-selector */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Select Included Products ({selectedProductIds.length} selected)
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 p-1">
                  {products.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleProductSelect(p.id)}
                        className={`p-2 flex items-center justify-between cursor-pointer rounded-md transition-colors ${
                          isChecked ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-indigo-600 pointer-events-none"
                          />
                          <span className="font-medium text-slate-800">{p.name}</span>
                        </div>
                        <span className="text-slate-400 font-mono">Stock: {p.availableStock}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Launch Campaign
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
