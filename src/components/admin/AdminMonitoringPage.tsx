import React, { useState, useEffect } from 'react';
import { SystemMetrics } from '../../types';
import { api } from '../../api/client';
import {
  Activity,
  Clock,
  AlertTriangle,
  Layers,
  Cpu,
  Database,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';

interface AdminMonitoringPageProps {
  initialMetrics: SystemMetrics;
}

export const AdminMonitoringPage: React.FC<AdminMonitoringPageProps> = ({ initialMetrics }) => {
  const [metrics, setMetrics] = useState<SystemMetrics>(initialMetrics);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLive = async () => {
    setIsRefreshing(true);
    const updated = await api.metrics.getMetrics();
    setMetrics(updated);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      fetchLive();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Demonstration Data Alert Banner */}
      <div className="bg-indigo-50/80 border border-indigo-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-900">
        <div className="flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <span className="font-bold">Demonstration Data Notice:</span> Metrics shown are simulated telemetry for high-concurrency architecture evaluation.
          </div>
        </div>

        <button
          onClick={fetchLive}
          disabled={isRefreshing}
          className="px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5 self-end sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Top 4 KPI Cards (matching Reference 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Request Rate */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Request Rate
            </span>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {metrics.requestRatePerMin.toLocaleString()} req/min
            </div>
            <div className="text-[10px] text-slate-400">FastAPI ingress gateway</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Avg Latency
            </span>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {metrics.avgLatencyMs} ms
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">P95: 185 ms • P99: 220 ms</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Error Rate
            </span>
            <div className="text-xl font-bold text-rose-600 font-mono">
              {metrics.errorRatePercent}%
            </div>
            <div className="text-[10px] text-slate-400">HTTP 5xx & timeouts</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Queue Depth */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Queue Depth
            </span>
            <div className="text-xl font-bold text-indigo-600 font-mono">
              {metrics.queueDepth} waiting
            </div>
            <div className="text-[10px] text-slate-400">Redis async order token ring</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4 Mini Charts Grid (matching Reference 9: Request Rate, Latency, Error Rate, Queue Depth) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Request Rate Mini Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-800">Request Rate</div>
          <div className="h-24 w-full">
            <svg viewBox="0 0 200 80" className="w-full h-full">
              <path
                d="M 10 70 L 40 60 L 70 45 L 100 20 L 130 15 L 160 30 L 190 35"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="190" cy="35" r="3" fill="#6366f1" />
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>10:00</span>
            <span>Current</span>
          </div>
        </div>

        {/* Latency Mini Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-800">Latency (ms)</div>
          <div className="h-24 w-full">
            <svg viewBox="0 0 200 80" className="w-full h-full">
              <path
                d="M 10 65 L 40 55 L 70 48 L 100 30 L 130 25 L 160 35 L 190 38"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="190" cy="38" r="3" fill="#10b981" />
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>10:00</span>
            <span>Current</span>
          </div>
        </div>

        {/* Error Rate Mini Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-800">Error Rate (%)</div>
          <div className="h-24 w-full">
            <svg viewBox="0 0 200 80" className="w-full h-full">
              <path
                d="M 10 75 L 40 72 L 70 68 L 100 45 L 130 40 L 160 55 L 190 60"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="190" cy="60" r="3" fill="#f43f5e" />
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>10:00</span>
            <span>Current</span>
          </div>
        </div>

        {/* Queue Depth Mini Chart */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-800">Queue Depth</div>
          <div className="h-24 w-full">
            <svg viewBox="0 0 200 80" className="w-full h-full">
              <path
                d="M 10 75 L 40 68 L 70 50 L 100 25 L 130 18 L 160 35 L 190 42"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="190" cy="42" r="3" fill="#8b5cf6" />
            </svg>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>10:00</span>
            <span>Current</span>
          </div>
        </div>
      </div>

      {/* Cluster Health & Architecture Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>FastAPI Worker Pool</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500">Active Coroutines:</span>
            <span className="font-mono font-bold text-emerald-600">
              {metrics.activeWorkers} / {metrics.totalWorkers} Healthy
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full w-full" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Redis Cache & Tokens</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500">Cache Hit Ratio:</span>
            <span className="font-mono font-bold text-slate-900">
              {metrics.redisCacheHitPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-1.5 rounded-full w-[96%]" />
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span>Peak Concurrency Capacity</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-slate-500">Simulated Threshold:</span>
            <span className="font-mono font-bold text-indigo-700">
              {metrics.concurrencyPeakReqSec} req/sec
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full w-[65%]" />
          </div>
        </div>
      </div>
    </div>
  );
};
