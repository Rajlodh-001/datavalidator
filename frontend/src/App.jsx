import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import MakerUpload from './components/MakerUpload';
import CheckerBatches from './components/CheckerBatches';
import BatchDetailsModal from './components/BatchDetailsModal';
import AuditTrail from './components/AuditTrail';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('maker'); // 'maker' | 'checker' | 'audit'

  // Batches State
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Batch Details Modal State
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchTransactions, setBatchTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Toast Notification State
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch batches
  const fetchBatches = async () => {
    setLoadingBatches(true);
    try {
      const data = await api.getBatches();
      setBatches(data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoadingBatches(false);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const data = await api.getAuditLogs();
      setAuditLogs(data);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoadingAudit(false);
    }
  };

  // View batch details
  const handleViewBatch = async (batchId) => {
    setLoadingTransactions(true);
    try {
      const data = await api.getBatchDetails(batchId);
      setSelectedBatch(data.batch);
      setBatchTransactions(data.transactions);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Reload current tab data when switching
  useEffect(() => {
    if (activeTab === 'checker') {
      fetchBatches();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
      <Toast notification={notification} />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'maker' && (
          <MakerUpload
            onUploadSuccess={() => {
              // Pre-fetch batches in background so Checker tab is up-to-date
              fetchBatches();
            }}
            showNotification={showNotification}
          />
        )}

        {activeTab === 'checker' && (
          <CheckerBatches
            batches={batches}
            loading={loadingBatches}
            onRefresh={fetchBatches}
            onViewBatch={handleViewBatch}
            showNotification={showNotification}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrail
            auditLogs={auditLogs}
            loading={loadingAudit}
            onRefresh={fetchAuditLogs}
          />
        )}
      </main>

      {/* Batch Details Modal */}
      {selectedBatch && (
        <BatchDetailsModal
          batch={selectedBatch}
          transactions={batchTransactions}
          loading={loadingTransactions}
          onClose={() => setSelectedBatch(null)}
          onApproveSuccess={() => {
            fetchBatches();
            handleViewBatch(selectedBatch.id);
          }}
          showNotification={showNotification}
        />
      )}
    </div>
  );
}
