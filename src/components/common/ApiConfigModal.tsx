import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../../api/client';
import { Server, CheckCircle2, AlertTriangle, RefreshCw, Database } from 'lucide-react';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const ApiConfigModal: React.FC<ApiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const currentConfig = api.getConfig();
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl);
  const [isDemoMode, setIsDemoMode] = useState(currentConfig.isDemoMode);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latency?: number } | null>(null);

  const handleSave = () => {
    api.updateConfig({ baseUrl, isDemoMode });
    onConfigChanged();
    onClose();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    // Temporarily apply current test url
    api.updateConfig({ baseUrl, isDemoMode });
    const result = await api.checkHealth();
    setTestResult({ ok: result.ok, message: result.message, latency: result.latencyMs });
    setTesting(false);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all sample products, campaigns, orders, and fraud alerts to initial state?')) {
      api.resetDemoData();
      onConfigChanged();
      setTestResult({ ok: true, message: 'Sample dataset reset to default initial state.' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Backend API Configuration & Status"
      subtitle="FastAPI & Redis Architecture Bridge (BTech Project Phase 1)"
      maxWidth="lg"
    >
      <div className="space-y-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <Server className="w-4 h-4 text-indigo-600" />
            FastAPI Backend Specification
          </div>
          <p>
            In Phase 1, the entire frontend runs with realistic typed demo models. When your Python FastAPI backend is started on{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-indigo-700">http://localhost:8000</code>, you can disable Demo Mode to test live HTTP endpoints.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            FastAPI Backend Base URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
              Ping API
            </button>
          </div>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <div className="text-sm font-semibold text-slate-800">Demo Simulation Mode</div>
            <div className="text-xs text-slate-500">
              {isDemoMode
                ? 'Active: Serving verified realistic sample datasets in localStorage'
                : 'Inactive: Sending real HTTP requests to FastAPI base URL'}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDemoMode}
              onChange={(e) => setIsDemoMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-lg text-xs flex items-start gap-2 border ${
              testResult.ok
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">{testResult.ok ? 'Connection Diagnostic' : 'Connection Failed'}</div>
              <div>{testResult.message}</div>
              {testResult.latency !== undefined && (
                <div className="text-[11px] text-slate-500 mt-0.5">Roundtrip latency: {testResult.latency} ms</div>
              )}
            </div>
          </div>
        )}

        {/* Reset Demo Data Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetData}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            Reset Demo Dataset
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
