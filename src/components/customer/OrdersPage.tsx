import React, { useState } from 'react';
import { Order } from '../../types';
import { OrderStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Receipt,
  ExternalLink,
} from 'lucide-react';

interface OrdersPageProps {
  orders: Order[];
  onNavigateHome: () => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onNavigateHome }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'Processing' | 'Completed' | 'Cancelled'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'All') return true;
    return o.orderStatus === activeTab;
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500">
        <button onClick={onNavigateHome} className="hover:text-slate-900 transition-colors">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-800">My Orders</span>
      </nav>

      {/* Header & Tabs (matching Reference 4: My Orders - All, Processing, Completed, Cancelled) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status of flash sale allocations and delivery fulfillment
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {(['All', 'Processing', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition-all"
            >
              {/* Top Order bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono">
                    Order {order.orderNumber}
                  </span>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.orderStatus} />
                </div>
              </div>

              {/* Order items */}
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-14 h-14 rounded-xl bg-slate-50 object-contain p-1.5 border border-slate-100 shrink-0"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-1">
                          {item.productName}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                        ₹{(item.salePrice * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom bar with action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Total Amount:{' '}
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    ₹{order.totalAmount.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <p className="text-base font-semibold text-slate-800">No orders found in this status.</p>
          <p className="text-xs text-slate-500">Participate in a flash sale to acquire exclusive drops.</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: ${selectedOrder.orderNumber}`}
          subtitle={`Placed on ${new Date(selectedOrder.createdAt).toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-700">
            {/* Status Summary */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Order Status</div>
                <div className="mt-1">
                  <OrderStatusBadge status={selectedOrder.orderStatus} />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Reservation</div>
                <div className="mt-1 font-semibold text-indigo-700 font-mono">
                  {selectedOrder.reservationStatus}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-medium">Payment</div>
                <div className="mt-1 font-semibold text-emerald-700 font-mono">
                  {selectedOrder.paymentStatus}
                </div>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="space-y-3">
              <div className="font-semibold text-slate-900">Purchased Items</div>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl p-3">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={it.productImage} alt={it.productName} className="w-10 h-10 object-contain rounded-md" />
                      <div>
                        <div className="font-medium text-slate-800">{it.productName}</div>
                        <div className="text-slate-400">Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-bold font-mono">
                      ₹{(it.salePrice * it.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address */}
            {selectedOrder.deliveryAddress && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Shipping Address</div>
                <div>{selectedOrder.customerName}</div>
                <div>{selectedOrder.deliveryAddress.street}</div>
                <div>
                  {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} -{' '}
                  {selectedOrder.deliveryAddress.zipCode}
                </div>
                <div className="text-slate-500 mt-1">{selectedOrder.customerEmail}</div>
              </div>
            )}

            {/* Concurrency Audit Note */}
            <div className="flex items-center gap-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Verified Transaction: Tokenized in Redis memory buffer and synchronized to order database.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
