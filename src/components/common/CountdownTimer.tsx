import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  variant?: 'hero' | 'card' | 'compact' | 'detail' | 'upcoming';
  onExpire?: () => void;
  labelPrefix?: string;
  expiredLabel?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  variant = 'card',
  onExpire,
  labelPrefix,
  expiredLabel = 'Sale Ended',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return <span className="text-xs font-semibold text-slate-500">{expiredLabel}</span>;
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  // Upcoming readable variant (e.g. "02 days 04 hours 15 minutes 32 seconds")
  if (variant === 'upcoming') {
    return (
      <span className="font-mono text-xs font-semibold text-slate-800">
        {timeLeft.days > 0 ? `${pad(timeLeft.days)} days ` : ''}
        {pad(timeLeft.hours)} hours {pad(timeLeft.minutes)} minutes {pad(timeLeft.seconds)} seconds
      </span>
    );
  }

  // Hero variant (large rounded box counters like in reference)
  if (variant === 'hero') {
    return (
      <div className="flex items-center gap-2 sm:gap-3 text-slate-900">
        {[
          { val: pad(timeLeft.days), label: 'Days' },
          { val: pad(timeLeft.hours), label: 'Hours' },
          { val: pad(timeLeft.minutes), label: 'Minutes' },
          { val: pad(timeLeft.seconds), label: 'Seconds' },
        ].map((unit, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border border-slate-200/80 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[54px] sm:min-w-[62px] shadow-xs"
          >
            <span className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {unit.val}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wider">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Detail page banner variant (4 segmented white cards inside alert)
  if (variant === 'detail') {
    return (
      <div className="flex items-center gap-2">
        {[
          { val: pad(timeLeft.days), label: 'Days' },
          { val: pad(timeLeft.hours), label: 'Hours' },
          { val: pad(timeLeft.minutes), label: 'Minutes' },
          { val: pad(timeLeft.seconds), label: 'Seconds' },
        ].map((unit, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-white border border-rose-100 rounded-lg px-2.5 py-1 min-w-[52px] shadow-xs"
          >
            <span className="text-base font-bold text-rose-600 font-mono leading-none">
              {unit.val}
            </span>
            <span className="text-[9px] font-semibold text-slate-500 uppercase mt-0.5">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Compact card variant: 01 : 32 : 15
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
        {labelPrefix && <span className="font-sans text-[11px] text-slate-500 mr-1">{labelPrefix}</span>}
        <span>{pad(timeLeft.hours + timeLeft.days * 24)}</span>
        <span className="text-slate-400">:</span>
        <span>{pad(timeLeft.minutes)}</span>
        <span className="text-slate-400">:</span>
        <span className="text-indigo-600">{pad(timeLeft.seconds)}</span>
      </div>
    );
  }

  // Default card variant
  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-mono font-medium">
      {labelPrefix && <span className="font-sans text-slate-500">{labelPrefix}</span>}
      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{pad(timeLeft.days * 24 + timeLeft.hours)}h</span>
      <span>:</span>
      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{pad(timeLeft.minutes)}m</span>
      <span>:</span>
      <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold">{pad(timeLeft.seconds)}s</span>
    </div>
  );
};
