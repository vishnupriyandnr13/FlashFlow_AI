import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../api/client';
import { OrderStatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface AdminOrdersPageProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ orders, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await api.orders.updateStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Orders & Reservations
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Atomic inventory reservation status, payment validation, and dispatch queue
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer, or email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 flex-1 sm:flex-none"
          >
            <option value="All">All Order Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Order ID</th>
                <th className="py-3.5 px-4 font-semibold">Customer</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold text-center">Reservation</th>
                <th className="py-3.5 px-4 font-semibold text-center">Payment</th>
                <th className="py-3.5 px-4 font-semibold">Order Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {o.orderNumber}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{o.customerName}</div>
                    <div className="text-[11px] text-slate-400">{o.customerEmail}</div>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    ₹{o.totalAmount.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        o.reservationStatus === 'Fulfilled'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : o.reservationStatus === 'Held'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {o.reservationStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : o.paymentStatus === 'Pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <OrderStatusBadge status={o.orderStatus} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedOrder(null)}
          title={`Order Management: ${selectedOrder.orderNumber}`}
          subtitle={`Placed by ${selectedOrder.customerName} on ${new Date(selectedOrder.createdAt).toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-700">
            {/* Quick Status Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 font-medium">Current Status:</span>{' '}
                <OrderStatusBadge status={selectedOrder.orderStatus} className="ml-1" />
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.orderStatus !== 'Completed' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Completed')}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Mark Fulfilled</span>
                  </button>
                )}
                {selectedOrder.orderStatus !== 'Cancelled' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'Cancelled')}
                    className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel & Release Stock</span>
                  </button>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="font-semibold text-slate-800 mb-2">Purchased Items</div>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl p-3">
                {selectedOrder.items.map((it, i) => (
                  <div key={i} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img src={it.productImage} alt={it.productName} className="w-8 h-8 object-contain rounded" />
                      <div>
                        <div className="font-medium text-slate-800">{it.productName}</div>
                        <div className="text-slate-400">Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold">
                      ₹{(it.salePrice * it.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            {selectedOrder.deliveryAddress && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">Customer & Delivery Info</div>
                <div>{selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
                <div>{selectedOrder.customerEmail}</div>
                <div className="text-slate-500 mt-1">
                  {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.city},{' '}
                  {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.zipCode}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold"
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
