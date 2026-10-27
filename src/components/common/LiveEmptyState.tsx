import React from 'react';
import { PackageOpen, RefreshCw, Database } from 'lucide-react';

interface LiveEmptyStateProps {
  baseUrl: string;
  onRefresh: () => void;
  onSwitchToDemo: () => void;
}

export const LiveEmptyState: React.FC<LiveEmptyStateProps> = ({
  baseUrl,
  onRefresh,
  onSwitchToDemo,
}) => {
  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-5 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
        <PackageOpen className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900">
          No Products in Live Backend
        </h3>
        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
          The FastAPI server at <code className="font-mono text-indigo-700 bg-slate-100 px-1 py-0.5 rounded">{baseUrl}</code> is connected and responded successfully, but returned an empty catalog (<code className="font-mono text-xs">[]</code>).
        </p>
      </div>

      <p className="text-xs text-slate-400">
        You can create products through your FastAPI <code className="font-mono text-slate-600">POST /api/v1/products</code> endpoint, or switch to Demo Mode to test with pre-seeded sample data.
      </p>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRefresh}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToDemo}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-amber-500" />
          <span>Switch to Demo Mode</span>
        </button>
      </div>
    </div>
  );
};
