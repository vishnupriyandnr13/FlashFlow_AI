import React from 'react';
import { AlertTriangle, RefreshCw, Database, Server, Settings } from 'lucide-react';
import { ApiErrorPayload } from '../../types';

interface LiveErrorStateProps {
  error: ApiErrorPayload;
  baseUrl: string;
  onRetry: () => void;
  onSwitchToDemo: () => void;
  onOpenSettings: () => void;
}

export const LiveErrorState: React.FC<LiveErrorStateProps> = ({
  error,
  baseUrl,
  onRetry,
  onSwitchToDemo,
  onOpenSettings,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-white border border-rose-200 rounded-3xl shadow-sm text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-wider">
          <Server className="w-3.5 h-3.5" />
          Live Backend Unreachable
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Cannot Connect to FastAPI Server
        </h2>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          FlashGuard is currently running in <span className="font-semibold text-slate-800">Live API Mode</span> without mock fallback. The configured backend at{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-xs text-indigo-700">
            {baseUrl}
          </code>{' '}
          did not respond to requests.
        </p>
      </div>

      {/* Technical Diagnostics Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left font-mono text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-200 font-sans text-[11px] font-semibold uppercase tracking-wider">
          <span>Connection Diagnostics</span>
          <span>HTTP Status: {error.statusCode || 'Network Failed'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <span className="text-slate-500 font-sans text-xs">Target Endpoint:</span>
          <span className="sm:col-span-2 text-slate-800 font-semibold break-all">
            {baseUrl}{error.endpoint || '/api/v1/products'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <span className="text-slate-500 font-sans text-xs">Error Detail:</span>
          <span className="sm:col-span-2 text-rose-700 break-all">{error.message}</span>
        </div>
        {error.timestamp && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-400 text-[11px]">
            <span className="font-sans">Timestamp:</span>
            <span className="sm:col-span-2">{new Date(error.timestamp).toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* Helpful developer advice */}
      <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-left text-xs text-indigo-900 space-y-1.5">
        <div className="font-semibold text-indigo-950 flex items-center gap-1.5">
          <span>How to resolve this in development:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
          <li>Start your Python FastAPI backend: <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-indigo-700">uvicorn main:app --reload --port 8000</code></li>
          <li>Ensure CORS headers allow origin <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono text-indigo-700">{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}</code></li>
          <li>Or switch back to Demo Mode below to preview with verified sample data.</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToDemo}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Switch to Demo Mode</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>API Base URL</span>
        </button>
      </div>
    </div>
  );
};
