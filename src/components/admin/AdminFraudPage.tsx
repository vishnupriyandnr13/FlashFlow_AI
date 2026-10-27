import React, { useState } from 'react';
import { FraudAlert, FraudStatus, FraudSeverity } from '../../types';
import { api } from '../../api/client';
import { RiskScoreBadge, Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  ShieldAlert,
  Search,
  Filter,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Cpu,
  Globe,
  Terminal,
  Activity,
  CheckCircle,
} from 'lucide-react';

interface AdminFraudPageProps {
  alerts: FraudAlert[];
  onRefresh: () => void;
}

export const AdminFraudPage: React.FC<AdminFraudPageProps> = ({ alerts, onRefresh }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = severityFilter === 'All' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSeverity && matchesStatus;
  });

  const handleUpdateStatus = async (alertId: string, newStatus: FraudStatus) => {
    setIsUpdating(true);
    try {
      await api.fraud.updateStatus(alertId, newStatus, reviewNote || `Status marked as ${newStatus}`);
      setIsUpdating(false);
      setSelectedAlert(null);
      setReviewNote('');
      onRefresh();
    } catch (err: any) {
      setIsUpdating(false);
      alert(err.message || 'Failed to update fraud alert status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (matching Reference 8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Fraud Detection & Bot Prevention
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-assisted traffic scoring, token bucket depletion alarms, and bot quarantine controls
          </p>
        </div>

        {/* Filters (All Severity, All Status matching Reference 8) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Severity</option>
            <option value="Critical">Critical Severity</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Review">Review</option>
            <option value="Blocked">Blocked</option>
            <option value="Allowed">Allowed</option>
          </select>
        </div>
      </div>

      {/* Fraud Alert Table (matching Reference 8) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Time</th>
                <th className="py-3.5 px-4 font-semibold">User / Account</th>
                <th className="py-3.5 px-4 font-semibold">IP Address</th>
                <th className="py-3.5 px-4 font-semibold text-center">Risk Score</th>
                <th className="py-3.5 px-4 font-semibold">Reason</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(alert.timestamp).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {alert.user}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-700">
                    {alert.ipAddress}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <RiskScoreBadge score={alert.riskScore} />
                  </td>

                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {alert.reason}
                  </td>

                  <td className="py-3 px-4">
                    {alert.status === 'Pending' && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                    {alert.status === 'Blocked' && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        Blocked
                      </span>
                    )}
                    {alert.status === 'Review' && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Review
                      </span>
                    )}
                    {alert.status === 'Allowed' && (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Allowed
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setReviewNote(alert.details.actionTaken || '');
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fraud Detailed Review Modal */}
      {selectedAlert && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAlert(null)}
          title={`AI Fraud Inspection: ${selectedAlert.user}`}
          subtitle={`Risk Score: ${selectedAlert.riskScore.toFixed(2)} (${selectedAlert.severity} Severity) • IP: ${selectedAlert.ipAddress}`}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs text-slate-700">
            {/* Top Risk Warning Card */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                selectedAlert.riskScore >= 0.8
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Primary Threat Trigger</div>
                <div className="mt-0.5 font-medium">{selectedAlert.reason}</div>
              </div>
            </div>

            {/* AI Diagnostics Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-400 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-slate-600" />
                  Client Fingerprint
                </div>
                <div className="font-mono text-slate-800 break-all">
                  {selectedAlert.details.deviceFingerprint}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-400 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-slate-600" />
                  Request Velocity
                </div>
                <div className="font-medium text-slate-800">
                  {selectedAlert.details.requestVelocity}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-400 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-600" />
                  Multi-Account Cluster
                </div>
                <div className="font-semibold text-slate-800">
                  {(selectedAlert.details.multiAccountConfidence * 100).toFixed(0)}% Bot Cluster Confidence
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="text-slate-400 font-semibold uppercase text-[10px] flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-slate-600" />
                  Geo IP Mismatch
                </div>
                <div className="font-semibold text-slate-800">
                  {selectedAlert.details.geoMismatch ? 'Detected (Proxy / VPN Node)' : 'Standard Domestic Network'}
                </div>
              </div>
            </div>

            {/* User Agent String */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="text-slate-400 font-semibold uppercase text-[10px]">User Agent</div>
              <div className="font-mono text-[11px] text-slate-700 break-all">
                {selectedAlert.details.userAgent}
              </div>
            </div>

            {/* Admin Action Note */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Security Officer Action Note:
              </label>
              <input
                type="text"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="e.g. Quarantined in Redis token bucket due to automated script behavior."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(selectedAlert.id, 'Allowed')}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Allow Request</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleUpdateStatus(selectedAlert.id, 'Blocked')}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <ShieldX className="w-4 h-4" />
                  <span>Block & Quarantine IP</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
