import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Product } from '../../types';
import { api } from '../../api/client';
import { ShieldCheck, CheckCircle2, ArrowRight, Loader2, Sparkles, Clock } from 'lucide-react';

interface QueueReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  quantity: number;
  onProceedToCheckout: (reservationData: {
    reservationId: string;
    product: Product;
    quantity: number;
    expiresAt: string;
  }) => void;
}

export const QueueReservationModal: React.FC<QueueReservationModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity,
  onProceedToCheckout,
}) => {
  const [step, setStep] = useState<'queueing' | 'verifying' | 'reserved' | 'failed'>('queueing');
  const [queuePosition, setQueuePosition] = useState(14);
  const [reservation, setReservation] = useState<{
    reservationId: string;
    expiresAt: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !product) {
      setStep('queueing');
      setQueuePosition(14);
      setReservation(null);
      return;
    }

    let isMounted = true;

    // Simulate fast queue token acquisition
    const t1 = setTimeout(() => {
      if (!isMounted) return;
      setQueuePosition(3);
      setStep('verifying');
    }, 900);

    const t2 = setTimeout(async () => {
      if (!isMounted) return;
      try {
        const res = await api.reservations.create(product.id, quantity);
        if (isMounted) {
          setReservation({
            reservationId: res.reservationId,
            expiresAt: res.expiresAt,
          });
          setStep('reserved');
        }
      } catch (e) {
        if (isMounted) setStep('failed');
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, product, quantity]);

  if (!isOpen || !product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="FlashGuard Reservation Engine"
      subtitle="High-Concurrency Stock Locking & Bot Verification"
      maxWidth="md"
    >
      <div className="py-2 space-y-6">
        {step === 'queueing' && (
          <div className="text-center py-6 space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-800">
                Position #{queuePosition} in Queue
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Acquiring atomic token from Redis ring buffer to prevent overselling of{' '}
                <span className="font-semibold text-slate-700">{product.name}</span>.
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full w-2/5 animate-pulse" />
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="text-center py-6 space-y-4">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-800">
                AI Fraud & Anti-Bot Inspection
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Verifying device fingerprint, request cadence, and user quota (Risk Score: 0.08 • Safe).
              </p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full w-4/5 animate-pulse" />
            </div>
          </div>
        )}

        {step === 'reserved' && reservation && (
          <div className="py-2 space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-900">
                  Stock Reserved Successfully!
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Ticket <span className="font-mono font-bold">{reservation.reservationId}</span> locked in Redis memory.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                <span className="text-slate-500">Reserved Product:</span>
                <span className="font-semibold text-slate-800 text-right line-clamp-1 max-w-[200px]">
                  {product.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Quantity Locked:</span>
                <span className="font-semibold text-slate-800">{quantity} unit(s)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Flash Price:</span>
                <span className="font-semibold text-indigo-700 font-mono text-sm">
                  ₹{(product.salePrice * quantity).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 text-rose-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Hold Window:
                </span>
                <span className="font-semibold font-mono">10:00 minutes remaining</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Complete checkout before the hold window expires to avoid stock forfeiture.
            </p>

            <button
              onClick={() => {
                onProceedToCheckout({
                  reservationId: reservation.reservationId,
                  product,
                  quantity,
                  expiresAt: reservation.expiresAt,
                });
              }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'failed' && (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm font-semibold text-rose-600">
              Could not secure stock reservation.
            </p>
            <p className="text-xs text-slate-500">
              Item sold out or maximum campaign quota reached.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
