import React from 'react';
import { Product, Order, SaleCampaign, FraudAlert } from '../../types';
import { OrderStatusBadge, SaleStatusBadge } from '../common/Badge';
import {
  ShoppingBag,
  Zap,
  Package,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity,
} from 'lucide-react';

interface AdminOverviewPageProps {
  products: Product[];
  orders: Order[];
  campaigns: SaleCampaign[];
  fraudAlerts: FraudAlert[];
  onNavigateTab: (tab: any) => void;
}

export const AdminOverviewPage: React.FC<AdminOverviewPageProps> = ({
  products,
  orders,
  campaigns,
  fraudAlerts,
  onNavigateTab,
}) => {
  const activeSales = products.filter((p) => p.saleStatus === 'live');
  const pendingFraud = fraudAlerts.filter((f) => f.status === 'Pending' || f.status === 'Review');

  return (
    <div className="space-y-8">
      {/* KPI Cards Row (matching Reference 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Orders */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {orders.length + 1230}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span className="bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +12%
              </span>
              <span className="text-slate-400 font-normal">vs yesterday</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Active Sales */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Sales
            </span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {activeSales.length}
            </div>
            <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live in high-demand ring</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Products
            </span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {products.length + 246}
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              {products.reduce((acc, p) => acc + p.totalStock, 0)} units cataloged
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Suspicious Requests */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Suspicious Requests
            </span>
            <div className="text-2xl font-extrabold text-rose-600 font-mono">
              {fraudAlerts.length + 18}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600">
              <span className="bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +5%
              </span>
              <span className="text-slate-400 font-normal">AI Bot alerts</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Visuals: Order Trends & Sales by Category (matching Reference 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Trends SVG Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Order Trends (Flash Sale Concurrency)</h3>
              <p className="text-xs text-slate-400">Order placement frequency during sale launch window</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Real-time Simulation
            </span>
          </div>

          {/* SVG Smooth Curve */}
          <div className="h-56 w-full pt-4">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="40" y1="70" x2="680" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="40" y1="120" x2="680" y2="120" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="40" y1="170" x2="680" y2="170" stroke="#f1f5f9" strokeDasharray="4 4" />

              {/* Y Axis Labels */}
              <text x="15" y="25" fill="#94a3b8" fontSize="10" fontFamily="monospace">150</text>
              <text x="15" y="75" fill="#94a3b8" fontSize="10" fontFamily="monospace">100</text>
              <text x="20" y="125" fill="#94a3b8" fontSize="10" fontFamily="monospace">50</text>
              <text x="25" y="175" fill="#94a3b8" fontSize="10" fontFamily="monospace">0</text>

              {/* Area */}
              <path
                d="M 50 170 C 120 170, 150 130, 220 125 C 290 120, 320 60, 400 45 C 470 30, 520 80, 590 65 C 640 55, 660 100, 680 90 L 680 170 L 50 170 Z"
                fill="url(#orderGrad)"
              />

              {/* Line */}
              <path
                d="M 50 170 C 120 170, 150 130, 220 125 C 290 120, 320 60, 400 45 C 470 30, 520 80, 590 65 C 640 55, 660 100, 680 90"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Peak Indicator Point */}
              <circle cx="400" cy="45" r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
              <text x="400" y="32" fill="#4f46e5" fontSize="11" fontWeight="bold" textAnchor="middle">
                Peak: 142 orders/min
              </text>

              {/* X Axis Labels */}
              <text x="50" y="190" fill="#94a3b8" fontSize="10">10:00</text>
              <text x="200" y="190" fill="#94a3b8" fontSize="10">10:15</text>
              <text x="350" y="190" fill="#94a3b8" fontSize="10">10:30</text>
              <text x="500" y="190" fill="#94a3b8" fontSize="10">10:45</text>
              <text x="660" y="190" fill="#94a3b8" fontSize="10">11:00</text>
            </svg>
          </div>
        </div>

        {/* Sales by Category Donut Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sales by Category</h3>
            <p className="text-xs text-slate-400">Volume distribution in active flash campaigns</p>
          </div>

          <div className="flex items-center justify-center py-2">
            <svg viewBox="0 0 160 160" className="w-36 h-36">
              {/* Electronics 45% */}
              <circle
                r="60"
                cx="80"
                cy="80"
                fill="transparent"
                stroke="#6366f1"
                strokeWidth="20"
                strokeDasharray="170 377"
                strokeDashoffset="0"
              />
              {/* Fashion 25% */}
              <circle
                r="60"
                cx="80"
                cy="80"
                fill="transparent"
                stroke="#38bdf8"
                strokeWidth="20"
                strokeDasharray="94 377"
                strokeDashoffset="-170"
              />
              {/* Home & Living 15% */}
              <circle
                r="60"
                cx="80"
                cy="80"
                fill="transparent"
                stroke="#34d399"
                strokeWidth="20"
                strokeDasharray="56 377"
                strokeDashoffset="-264"
              />
              {/* Beauty 10% */}
              <circle
                r="60"
                cx="80"
                cy="80"
                fill="transparent"
                stroke="#fbbf24"
                strokeWidth="20"
                strokeDasharray="38 377"
                strokeDashoffset="-320"
              />
              {/* Others 5% */}
              <circle
                r="60"
                cx="80"
                cy="80"
                fill="transparent"
                stroke="#94a3b8"
                strokeWidth="20"
                strokeDasharray="19 377"
                strokeDashoffset="-358"
              />
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 text-xs text-slate-600">
            {[
              { label: 'Smartphones & Tech', pct: '45%', color: 'bg-indigo-600' },
              { label: 'Fashion & Footwear', pct: '25%', color: 'bg-sky-400' },
              { label: 'Audio & Gadgets', pct: '15%', color: 'bg-emerald-400' },
              { label: 'Cameras & Gear', pct: '10%', color: 'bg-amber-400' },
              { label: 'Others', pct: '5%', color: 'bg-slate-400' },
            ].map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                  <span>{cat.label}</span>
                </span>
                <span className="font-mono font-semibold text-slate-800">{cat.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Tables: Recent Orders & Active Flash Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 4).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {o.orderNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{o.customerName}</td>
                    <td className="py-2.5 px-3 font-mono">₹{o.totalAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <OrderStatusBadge status={o.orderStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Flash Sales Table */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Active Flash Sales</h3>
            <button
              onClick={() => onNavigateTab('flash-sales')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
            >
              Manage
            </button>
          </div>

          <div className="space-y-3">
            {activeSales.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className="w-8 h-8 rounded-lg bg-white object-contain p-1 border border-slate-200"
                  />
                  <div>
                    <div className="font-semibold text-slate-800 line-clamp-1 max-w-[140px]">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {prod.availableStock} of {prod.totalStock} left
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <SaleStatusBadge status={prod.saleStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
