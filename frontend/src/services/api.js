const API_BASE = 'http://localhost:5000';

export const api = {
  // Upload CSV File (Maker)
  uploadCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload and validate CSV file');
    }
    return data;
  },

  // Get all batches (Checker)
  getBatches: async () => {
    const res = await fetch(`${API_BASE}/batches`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch batches');
    }
    return res.json();
  },

  // Get single batch with transactions
  getBatchDetails: async (batchId) => {
    const res = await fetch(`${API_BASE}/batches/${batchId}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch batch details');
    }
    return res.json();
  },

  // Approve a batch (Checker)
  approveBatch: async (batchId) => {
    const res = await fetch(`${API_BASE}/batches/${batchId}/approve`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to approve batch');
    }
    return data;
  },

  // Get system audit logs
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/audit-logs`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to fetch audit logs');
    }
    return res.json();
  },

  // Get sample CSV URL
  getSampleCsvUrl: () => `${API_BASE}/sample-csv`,

  // Get dynamic generated CSV URL
  getGenerateCsvUrl: ({ rows = 10, invalid = 0, duplicates = 0 } = {}) =>
    `${API_BASE}/generate-csv?rows=${rows}&invalid=${invalid}&duplicates=${duplicates}`,
};

