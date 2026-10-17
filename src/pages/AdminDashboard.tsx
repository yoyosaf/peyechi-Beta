import React, { useState } from 'react';
import { ShieldAlert, Trash2, CheckCircle2, AlertTriangle, Eye, Layers } from 'lucide-react';
import { apiClient, LostFoundItem, FlaggedReport } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AdminDashboardProps {
  onSelectItem: (item: LostFoundItem) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectItem }) => {
  const { user, isAdmin } = useAuth();
  const { language } = useLanguage();

  const [items, setItems] = useState<LostFoundItem[]>(() => apiClient.getItems());
  const [reports, setReports] = useState<FlaggedReport[]>(() => apiClient.getFlaggedReports());

  const totalItems = items.length;
  const activeLost = items.filter((i) => i.type === 'lost' && i.status === 'active').length;
  const activeFound = items.filter((i) => i.type === 'found' && i.status === 'active').length;
  const resolvedCount = items.filter((i) => i.status === 'resolved').length;
  const pendingReports = reports.filter((r) => !r.resolved).length;

  const handleResolveReport = (reportId: string) => {
    apiClient.resolveReport(reportId);
    setReports(apiClient.getFlaggedReports());
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Delete this listing permanently?')) {
      apiClient.deleteItem(itemId);
      setItems(apiClient.getItems());
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
            Admin Console
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Platform Moderation & Security
          </h1>
          <p className="text-xs text-slate-500">
            Review community reports, filter fraudulent listings, and inspect safety metrics.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-mono">
          Logged in as: <strong>{user?.name || 'Administrator'}</strong>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <p className="text-xs text-slate-500 font-medium">Total Listings</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalItems}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <p className="text-xs text-rose-600 font-medium">Active Lost</p>
          <p className="text-2xl font-bold text-rose-700 font-mono tabular-nums">{activeLost}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <p className="text-xs text-emerald-600 font-medium">Active Found</p>
          <p className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">{activeFound}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <p className="text-xs text-slate-600 font-medium">Returned / Solved</p>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{resolvedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
          <p className="text-xs text-amber-600 font-medium">Flagged Reports</p>
          <p className="text-2xl font-bold text-amber-700 font-mono tabular-nums">{pendingReports}</p>
        </div>
      </div>

      {/* Flagged Scam / Spam Reports */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">
              User Reports & Scam Alerts ({pendingReports} Pending)
            </h2>
          </div>
        </div>

        {reports.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {reports.map((report) => (
              <div key={report.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-700 uppercase tracking-wide text-[10px] bg-rose-50 px-2 py-0.5 rounded-md">
                      {report.reason}
                    </span>
                    <span className="font-semibold text-slate-900">{report.itemTitle}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">Reported by {report.reportedBy}</span>
                  </div>
                  <p className="text-slate-600 italic">"{report.details}"</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!report.resolved ? (
                    <button
                      onClick={() => handleResolveReport(report.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolved</span>
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteItem(report.itemId)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    title="Delete Flagged Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3">
            No active reports or scam flags at this moment.
          </p>
        )}
      </div>

      {/* All Post Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">
          All Published Items ({items.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'lost'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {item.thana}, {item.district}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">
                    {item.contactName} ({item.contactPhone})
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {item.date}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'resolved'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectItem(item)}
                        className="p-1 text-slate-500 hover:text-emerald-700 cursor-pointer"
                        title="View item"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
