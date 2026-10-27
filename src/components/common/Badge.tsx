import React from 'react';
import { SaleStatus, OrderStatus, FraudSeverity, FraudStatus } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?:
    | 'live'
    | 'upcoming'
    | 'ended'
    | 'processing'
    | 'completed'
    | 'cancelled'
    | 'critical'
    | 'high'
    | 'medium'
    | 'low'
    | 'pending'
    | 'blocked'
    | 'review'
    | 'allowed'
    | 'neutral';
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 font-medium',
    sm: 'text-xs px-2.5 py-0.5 font-semibold',
    md: 'text-sm px-3 py-1 font-semibold',
  }[size];

  const variantStyles: Record<string, { bg: string; border: string; dotColor?: string }> = {
    live: {
      bg: 'bg-emerald-500 text-white',
      border: 'border-emerald-600',
      dotColor: 'bg-white animate-pulse',
    },
    upcoming: {
      bg: 'bg-amber-100 text-amber-800',
      border: 'border-amber-200',
      dotColor: 'bg-amber-500',
    },
    ended: {
      bg: 'bg-rose-50 text-rose-700',
      border: 'border-rose-200',
      dotColor: 'bg-rose-500',
    },
    processing: {
      bg: 'bg-blue-50 text-blue-700',
      border: 'border-blue-200',
      dotColor: 'bg-blue-500',
    },
    completed: {
      bg: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-200',
      dotColor: 'bg-emerald-500',
    },
    cancelled: {
      bg: 'bg-rose-50 text-rose-700',
      border: 'border-rose-200',
      dotColor: 'bg-rose-500',
    },
    critical: {
      bg: 'bg-rose-100 text-rose-800',
      border: 'border-rose-300',
      dotColor: 'bg-rose-600',
    },
    high: {
      bg: 'bg-orange-100 text-orange-800',
      border: 'border-orange-300',
      dotColor: 'bg-orange-500',
    },
    medium: {
      bg: 'bg-amber-100 text-amber-800',
      border: 'border-amber-300',
      dotColor: 'bg-amber-500',
    },
    low: {
      bg: 'bg-slate-100 text-slate-700',
      border: 'border-slate-200',
      dotColor: 'bg-slate-400',
    },
    pending: {
      bg: 'bg-amber-50 text-amber-700',
      border: 'border-amber-200',
      dotColor: 'bg-amber-500',
    },
    blocked: {
      bg: 'bg-rose-50 text-rose-700',
      border: 'border-rose-200',
      dotColor: 'bg-rose-500',
    },
    review: {
      bg: 'bg-indigo-50 text-indigo-700',
      border: 'border-indigo-200',
      dotColor: 'bg-indigo-500',
    },
    allowed: {
      bg: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-200',
      dotColor: 'bg-emerald-500',
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-700',
      border: 'border-slate-200',
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.border} ${sizeClasses} ${className}`}
    >
      {(dot || variant === 'live') && (
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dotColor || 'bg-current'}`} />
      )}
      {children}
    </span>
  );
};

export const SaleStatusBadge: React.FC<{ status: SaleStatus; className?: string }> = ({ status, className }) => {
  const map: Record<SaleStatus, { label: string; variant: 'live' | 'upcoming' | 'ended' }> = {
    live: { label: 'Live', variant: 'live' },
    upcoming: { label: 'Upcoming', variant: 'upcoming' },
    ended: { label: 'Ended', variant: 'ended' },
  };

  const current = map[status] || { label: status, variant: 'neutral' };
  return (
    <Badge variant={current.variant} size="xs" dot className={className}>
      {current.label}
    </Badge>
  );
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus; className?: string }> = ({ status, className }) => {
  const map: Record<OrderStatus, 'processing' | 'completed' | 'cancelled'> = {
    Processing: 'processing',
    Completed: 'completed',
    Cancelled: 'cancelled',
  };
  return (
    <Badge variant={map[status] || 'neutral'} size="xs" className={className}>
      {status}
    </Badge>
  );
};

export const RiskScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let color = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (score >= 0.85) color = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  else if (score >= 0.7) color = 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
  else if (score >= 0.5) color = 'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${color}`}>
      {score.toFixed(2)}
    </span>
  );
};
