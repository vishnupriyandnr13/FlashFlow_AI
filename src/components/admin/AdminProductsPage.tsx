import React, { useState } from 'react';
import { Product } from '../../types';
import { api } from '../../api/client';
import { Modal } from '../common/Modal';
import {
  Plus,
  Search,
  Filter,
  Package,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface AdminProductsPageProps {
  products: Product[];
  onRefresh: () => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({ products, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Add / Edit
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Smartphones');
  const [originalPrice, setOriginalPrice] = useState<number>(49999);
  const [salePrice, setSalePrice] = useState<number>(39999);
  const [totalStock, setTotalStock] = useState<number>(50);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const categories = ['All', 'Smartphones', 'Laptops', 'Headphones', 'Cameras', 'Footwear', 'Televisions'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    let matchesStock = true;
    if (stockFilter === 'Available') matchesStock = p.availableStock > 10;
    if (stockFilter === 'Low Stock') matchesStock = p.availableStock > 0 && p.availableStock <= 10;
    if (stockFilter === 'Out of Stock') matchesStock = p.availableStock <= 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setBrand('');
    setCategory('Smartphones');
    setOriginalPrice(29999);
    setSalePrice(19999);
    setTotalStock(40);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBrand(p.brand);
    setCategory(p.category);
    setOriginalPrice(p.originalPrice);
    setSalePrice(p.salePrice);
    setTotalStock(p.totalStock);
    setDescription(p.description);
    setImageUrl(p.images[0] || '');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Product title is required.');
      return;
    }
    if (salePrice >= originalPrice) {
      setFormError('Sale price must be strictly lower than original price for flash discount calculation.');
      return;
    }
    if (totalStock <= 0) {
      setFormError('Total stock must be at least 1 unit.');
      return;
    }

    const discountPercentage = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

    setIsSaving(true);
    try {
      if (editingProduct) {
        const availableStock = Math.max(0, totalStock - editingProduct.reservedStock);
        await api.products.update(editingProduct.id, {
          name,
          sku,
          brand,
          category,
          originalPrice: Number(originalPrice),
          salePrice: Number(salePrice),
          discountPercentage,
          totalStock: Number(totalStock),
          availableStock,
          description: description || 'High-performance flash deal product item.',
          images: [imageUrl || editingProduct.images[0]],
        });
      } else {
        await api.products.create({
          sku,
          name,
          brand: brand || 'Generic Brand',
          category,
          originalPrice: Number(originalPrice),
          salePrice: Number(salePrice),
          discountPercentage,
          totalStock: Number(totalStock),
          reservedStock: 0,
          availableStock: Number(totalStock),
          images: [imageUrl],
          description: description || 'Premium product catalogued for flash sale event.',
          specs: { Brand: brand, Type: category },
          features: ['Authentic product', 'FlashGuard concurrency protection'],
          rating: 4.8,
          reviewsCount: 1,
          saleStartsAt: new Date().toISOString(),
          saleEndsAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          maxPerCustomer: 2,
        });
      }

      setIsSaving(false);
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err: any) {
      setIsSaving(false);
      setFormError(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (window.confirm(`Delete "${prodName}" from inventory database?`)) {
      await api.products.delete(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button (matching Reference 6) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Products & Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-ring inventory: total stock, Redis reservations, and available units
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filters toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or brand..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 flex-1 sm:flex-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 flex-1 sm:flex-none"
          >
            <option value="All">All Stock Statuses</option>
            <option value="Available">Healthy Stock (&gt;10)</option>
            <option value="Low Stock">Low Stock (≤10)</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table (matching Reference 6) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold text-right">Price</th>
                <th className="py-3.5 px-4 font-semibold text-center">Total Stock</th>
                <th className="py-3.5 px-4 font-semibold text-center">Reserved</th>
                <th className="py-3.5 px-4 font-semibold text-center">Available</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.availableStock <= 0;
                const isLow = p.availableStock > 0 && p.availableStock <= 10;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Product Cell */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg bg-slate-50 object-contain p-1 border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 line-clamp-1 max-w-[200px]">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.brand} • SKU: {p.sku}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-700">{p.category}</td>

                    {/* Pricing */}
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-slate-900">₹{p.salePrice.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 line-through">
                        ₹{p.originalPrice.toLocaleString()}
                      </div>
                    </td>

                    {/* Total Stock */}
                    <td className="py-3 px-4 text-center font-mono font-medium">{p.totalStock}</td>

                    {/* Reserved Stock */}
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[11px]">
                        {p.reservedStock}
                      </span>
                    </td>

                    {/* Available Stock */}
                    <td className="py-3 px-4 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          isOutOfStock
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isLow
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {p.availableStock}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingProduct ? 'Edit Inventory Item' : 'Add New Product to Inventory'}
          subtitle="Define flash sale parameters and atomic stock allocation"
          maxWidth="lg"
        >
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Sony"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {categories
                    .filter((c) => c !== 'All')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Stock Allocation *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={totalStock}
                  onChange={(e) => setTotalStock(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Original Price (₹) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Flash Sale Price (₹) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product specifications and flash highlights..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                {isSaving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
