import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function BatchDetailsModal({
  batch,
  transactions,
  loading,
  onClose,
  onApproveSuccess,
  showNotification,
}) {
  const [filter, setFilter] = useState('ALL');
  const [approving, setApproving] = useState(false);

  if (!batch) return null;

  const handleApprove = async () => {
    if (!window.confirm(`Approve Batch #${batch.id}?`)) {
      return;
    }

    setApproving(true);
    try {
      const result = await api.approveBatch(batch.id);
      showNotification(`Batch #${batch.id} approved successfully`);
      if (onApproveSuccess) onApproveSuccess();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setApproving(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'ALL') return true;
    return tx.status === filter;
  });

  const pendingCount = transactions.filter((t) => t.status === 'PENDING').length;
  const authorizedCount = transactions.filter((t) => t.status === 'AUTHORIZED').length;
  const failedCount = transactions.filter((t) => t.status === 'FAILED').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg border border-neutral-300 shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              Batch #{batch.id} Transactions
              <span className="text-[11px] px-2 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-700 font-medium">
                {batch.status}
              </span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              File: {batch.filename} &bull; Total: {batch.total_records} records
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'ALL', label: `All (${transactions.length})` },
              { id: 'PENDING', label: `Pending (${pendingCount})` },
              { id: 'AUTHORIZED', label: `Authorized (${authorizedCount})` },
              { id: 'FAILED', label: `Failed (${failedCount})` },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                  filter === btn.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-200/60'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {batch.status === 'PENDING' && batch.valid_records > 0 && (
            <button
              onClick={handleApprove}
              disabled={approving}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded transition"
            >
              {approving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              Authorize Batch
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-6 h-6 text-neutral-500 animate-spin mb-2" />
              <p className="text-xs text-neutral-500">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No transactions matching the filter.
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Transaction ID</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Account</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Validation Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredTransactions.map((tx, idx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/60">
                      <td className="px-3 py-2 text-neutral-400 font-mono">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono text-neutral-800">{tx.transaction_id || '-'}</td>
                      <td className="px-3 py-2 text-neutral-700">{tx.customer_name || '-'}</td>
                      <td className="px-3 py-2 text-neutral-600">{tx.account_number || '-'}</td>
                      <td className="px-3 py-2 font-medium text-neutral-900">
                        ${Number(tx.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <span className="inline-block px-1.5 py-0.5 text-[11px] font-medium rounded border border-neutral-300 bg-neutral-100 text-neutral-700">
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-neutral-600">
                        {tx.error_reason || 'Valid'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded hover:bg-neutral-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
