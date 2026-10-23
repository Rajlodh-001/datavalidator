import React from 'react';
import { RefreshCw, Loader2, History } from 'lucide-react';

export default function AuditTrail({ auditLogs, loading, onRefresh }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Audit Trail</h2>
          <p className="text-xs text-neutral-500">
            Log of batch upload and approval actions.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 disabled:opacity-50 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Content */}
      {loading && auditLogs.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-neutral-500 animate-spin mb-2" />
          <p className="text-xs text-neutral-500">Loading audit logs...</p>
        </div>
      ) : auditLogs.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="p-2.5 bg-neutral-100 text-neutral-500 rounded-full mb-2">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-neutral-800">No Audit Logs</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Actions performed in Maker and Checker will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600">
                <tr>
                  <th className="px-3.5 py-2.5">Log ID</th>
                  <th className="px-3.5 py-2.5">Timestamp</th>
                  <th className="px-3.5 py-2.5">Action</th>
                  <th className="px-3.5 py-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/60 transition">
                    <td className="px-3.5 py-2.5 font-mono text-neutral-500">#{log.id}</td>
                    <td className="px-3.5 py-2.5 text-neutral-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium border border-neutral-300 bg-neutral-100 text-neutral-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-neutral-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
