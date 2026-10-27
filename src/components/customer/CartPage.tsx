import React, { useState } from 'react';
import { Product, Order } from '../../types';
import { api } from '../../api/client';
import {
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  CreditCard,
  Building,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
  reservationId?: string;
  reservationExpiresAt?: string;
}

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onOrderSuccess: (order: Order) => void;
  onNavigateHome: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onOrderSuccess,
  onNavigateHome,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Delivery Form State
  const [customerName, setCustomerName] = useState('John Doe');
  const [customerEmail, setCustomerEmail] = useState('john.doe@example.com');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [street, setStreet] = useState('42 Silicon Avenue, Tech Park');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [zipCode, setZipCode] = useState('560100');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.salePrice * item.quantity,
    0
  );
  const shipping = 0; // Free flash delivery
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const newOrder = await api.orders.create({
        customerName,
        customerEmail,
        customerPhone,
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          productName: ci.product.name,
          productImage: ci.product.images[0],
          originalPrice: ci.product.originalPrice,
          salePrice: ci.product.salePrice,
          quantity: ci.quantity,
        })),
        subtotal,
        shipping,
        totalAmount: total,
        reservationStatus: 'Held',
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        deliveryAddress: {
          street,
          city,
          state,
          zipCode,
          country: 'India',
        },
      });

      setIsSubmitting(false);
      onOrderSuccess(newOrder);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(`Could not process order: ${err.message}`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          High-concurrency flash sale inventory is reserved only upon selecting "Buy Now" or "Add to Cart".
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          Explore Live Flash Sales
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Checkout Stepper (matching Reference 4: 1. Cart -> 2. Delivery -> 3. Payment -> 4. Review) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

          {[
            { step: 1, label: 'Cart' },
            { step: 2, label: 'Delivery' },
            { step: 3, label: 'Payment' },
            { step: 4, label: 'Review' },
          ].map((s) => (
            <div key={s.step} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  if (s.step < currentStep) setCurrentStep(s.step as any);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === s.step
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : currentStep > s.step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {currentStep > s.step ? <CheckCircle2 className="w-4 h-4" /> : s.step}
              </button>
              <span
                className={`mt-1.5 text-xs font-semibold ${
                  currentStep === s.step ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Current Step Content */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: CART ITEMS */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Cart Items ({cartItems.length})
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Stock Hold Active (09:42)</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl bg-slate-50 object-contain p-2 border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase">
                            {item.product.brand}
                          </div>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1">
                            {item.product.name}
                          </h4>
                          {item.reservationId && (
                            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
                              Lock Ticket: {item.reservationId}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-950 font-mono">
                            ₹{(item.product.salePrice * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-slate-400 line-through font-mono">
                            ₹{(item.product.originalPrice * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                            }
                            className="px-2.5 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold font-mono text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                Math.min(
                                  item.product.maxPerCustomer,
                                  item.product.availableStock,
                                  item.quantity + 1
                                )
                              )
                            }
                            className="px-2.5 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Delivery Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: DELIVERY DETAILS */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Delivery Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (For reservation ticket)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN / Zip Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {currentStep === 3 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Payment Method
              </h3>

              <div className="space-y-3">
                {[
                  { id: 'upi', label: 'UPI / Instant QR', desc: 'Google Pay, PhonePe, Paytm, BHIM', icon: Smartphone },
                  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, MasterCard, RuPay (3DS Verified)', icon: CreditCard },
                  { id: 'netbanking', label: 'Net Banking', desc: 'All major Indian banking gateways', icon: Building },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-4 rounded-xl border-2 flex items-center gap-3.5 cursor-pointer transition-all ${
                        paymentMethod === pm.id
                          ? 'border-indigo-600 bg-indigo-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-900">{pm.label}</div>
                        <div className="text-[11px] text-slate-500">{pm.desc}</div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === pm.id}
                        onChange={() => {}}
                        className="text-indigo-600"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Demonstration Notice:</span> In Phase 1 frontend, clicking "Review Order" validates checkout parameters and records the transaction into the demo orders and inventory ledger.
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Review Final Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PLACE ORDER */}
          {currentStep === 4 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
                Final Order Review
              </h3>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-700">
                <div className="font-semibold text-slate-900">Delivery Address:</div>
                <div>{customerName} • {customerPhone}</div>
                <div>{street}, {city}, {state} - {zipCode}</div>
                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span>Selected Payment:</span>
                  <span className="font-semibold uppercase">{paymentMethod}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Securing Transaction...' : `Confirm & Place Order (₹${total.toLocaleString()})`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary (matching Reference 4) */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((acc, ci) => acc + ci.quantity, 0)} items)</span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Flash Express Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>

              <div className="flex justify-between">
                <span>Anti-Bot Shield Guarantee</span>
                <span className="font-semibold text-indigo-600">Included</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-bold text-slate-950">
                <span>Total</span>
                <span className="font-mono text-indigo-600 text-lg">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Concurrency Safe Checkout
              </div>
              <p className="text-[11px] text-indigo-700">
                Your stock allocation is held in atomic lock memory until payment validation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
