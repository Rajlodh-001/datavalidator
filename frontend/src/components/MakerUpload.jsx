import React, { useState } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Loader2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function MakerUpload({ onUploadSuccess, showNotification }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadResult, setUploadResult] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        setSelectedFile(file);
        setUploadError('');
      } else {
        setUploadError('Only CSV files are accepted');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a CSV file first');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadResult(null);

    try {
      const result = await api.uploadCsv(selectedFile);
      setUploadResult(result);
      showNotification(`Batch #${result.batch.id} uploaded successfully`);
      if (onUploadSuccess) onUploadSuccess();
      setSelectedFile(null);
      const input = document.getElementById('maker-csv-input');
      if (input) input.value = '';
    } catch (err) {
      setUploadError(err.message);
      showNotification(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Upload Transaction Batch</h2>
          <p className="text-xs text-neutral-500">
            Maker: Upload a CSV file. Valid rows are saved as PENDING; invalid rows return error reasons.
          </p>
        </div>
        <a
          href={api.getSampleCsvUrl()}
          download="sample_transactions.csv"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-neutral-500" />
          Download Sample CSV
        </a>
      </div>

      {/* Upload Box Card */}
      <div className="bg-white rounded-lg border border-neutral-200 p-5">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('maker-csv-input').click()}
            className={`border border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
              isDragging
                ? 'border-neutral-900 bg-neutral-100'
                : selectedFile
                ? 'border-neutral-400 bg-neutral-50'
                : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/50 hover:bg-neutral-50'
            }`}
          >
            <input
              id="maker-csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center">
              {selectedFile ? (
                <>
                  <div className="p-2 bg-neutral-200 text-neutral-700 rounded-full mb-2">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to change
                  </p>
                </>
              ) : (
                <>
                  <div className="p-2 bg-neutral-100 text-neutral-500 rounded-full mb-2">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-neutral-800">
                    Click to browse or drop CSV here
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Columns: transaction_id, customer_name, account_number, amount
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Error Banner */}
          {uploadError && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-neutral-800 bg-neutral-100 border border-neutral-300 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-neutral-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  Process & Upload Batch
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Upload Results Summary Card */}
      {uploadResult && (
        <div className="bg-white rounded-lg border border-neutral-200 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-2">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Batch #{uploadResult.batch.id} Processed
              </h3>
              <p className="text-xs text-neutral-500">File: {uploadResult.batch.filename}</p>
            </div>
            <span className="px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200 self-start sm:self-auto">
              Status: {uploadResult.batch.status}
            </span>
          </div>

          {/* Simple Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">
                Total Rows
              </span>
              <p className="text-xl font-semibold text-neutral-900 mt-1">
                {uploadResult.summary.total}
              </p>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">
                Valid (Pending)
              </span>
              <p className="text-xl font-semibold text-neutral-900 mt-1">
                {uploadResult.summary.valid}
              </p>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
              <span className="text-xs text-neutral-500 uppercase tracking-wide">
                Invalid (Rejected)
              </span>
              <p className="text-xl font-semibold text-neutral-900 mt-1">
                {uploadResult.summary.invalid}
              </p>
            </div>
          </div>

          {/* Invalid Records Detail Table */}
          {uploadResult.invalid_records && uploadResult.invalid_records.length > 0 ? (
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold text-neutral-800">
                Invalid Records & Reasons ({uploadResult.invalid_records.length})
              </h4>
              <div className="overflow-x-auto border border-neutral-200 rounded-md">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600">
                    <tr>
                      <th className="px-3 py-2">Row #</th>
                      <th className="px-3 py-2">Transaction ID</th>
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Account</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Error Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {uploadResult.invalid_records.map((r, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/60">
                        <td className="px-3 py-2 text-neutral-500">{r.rowNumber}</td>
                        <td className="px-3 py-2 font-mono text-neutral-800">{r.transaction_id}</td>
                        <td className="px-3 py-2 text-neutral-700">{r.customer_name}</td>
                        <td className="px-3 py-2 text-neutral-600">{r.account_number}</td>
                        <td className="px-3 py-2 text-neutral-700">
                          {r.amount ? `$${Number(r.amount).toFixed(2)}` : '-'}
                        </td>
                        <td className="px-3 py-2 text-neutral-600">
                          {r.error_reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-700 text-xs">
              All records passed validation and are saved as <strong>PENDING</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
