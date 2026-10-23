import React, { useState } from 'react';
import { RefreshCw, Eye, FileText, Loader2, Check } from 'lucide-react';
import { api } from '../services/api';

export default function CheckerBatches({
  batches,
  loading,
  onRefresh,
  onViewBatch,
  showNotification,
}) {
  const [approvingId, setApprovingId] = useState(null);

  const handleApprove = async (batchId) => {
    if (!window.confirm(`Approve Batch #${batchId}? All pending transactions will become AUTHORIZED.`)) {
      return;
    }

    setApprovingId(batchId);
    try {
      const result = await api.approveBatch(batchId);
      showNotification(`Batch #${batchId} authorized (${result.authorized_count} transactions)`);
      if (onRefresh) onRefresh();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Batches & Approvals</h2>
          <p className="text-xs text-neutral-500">
            Checker: Review batches, inspect transactions, and approve pending batches.
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
      {loading && batches.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-neutral-500 animate-spin mb-2" />
          <p className="text-xs text-neutral-500">Loading batches...</p>
        </div>
      ) : batches.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="p-2.5 bg-neutral-100 text-neutral-500 rounded-full mb-2">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-medium text-neutral-800">No Batches Uploaded</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm">
            Go to the Maker (Upload) tab to upload and validate a CSV batch.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600">
                <tr>
                  <th className="px-3.5 py-2.5">Batch ID</th>
                  <th className="px-3.5 py-2.5">Filename</th>
                  <th className="px-3.5 py-2.5">Total</th>
                  <th className="px-3.5 py-2.5">Valid</th>
                  <th className="px-3.5 py-2.5">Invalid</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5">Uploaded Date</th>
                  <th className="px-3.5 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {batches.map((batch) => {
                  const isPending = batch.status === 'PENDING';
                  const canApprove = isPending && batch.valid_records > 0;

                  return (
                    <tr key={batch.id} className="hover:bg-neutral-50/60 transition">
                      <td className="px-3.5 py-2.5 font-medium text-neutral-900">#{batch.id}</td>
                      <td className="px-3.5 py-2.5 text-neutral-700">{batch.filename}</td>
                      <td className="px-3.5 py-2.5 text-neutral-600">{batch.total_records}</td>
                      <td className="px-3.5 py-2.5 text-neutral-700">{batch.valid_records}</td>
                      <td className="px-3.5 py-2.5 text-neutral-500">{batch.invalid_records}</td>
                      <td className="px-3.5 py-2.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium border border-neutral-300 bg-neutral-100 text-neutral-800">
                          {batch.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-neutral-500">
                        {new Date(batch.created_at).toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewBatch(batch.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-50 transition"
                          >
                            <Eye className="w-3 h-3 text-neutral-500" />
                            View
                          </button>

                          {canApprove && (
                            <button
                              disabled={approvingId === batch.id}
                              onClick={() => handleApprove(batch.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded transition"
                            >
                              {approvingId === batch.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : null}
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
