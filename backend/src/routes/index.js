const express = require('express');
const multer = require('multer');

const { uploadCsv, downloadSampleCsv } = require('../controllers/uploadController');
const { getBatches, getBatchById, approveBatch } = require('../controllers/batchController');
const { getAuditLogs } = require('../controllers/auditController');

const router = express.Router();

// In-memory multer storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Upload & sample routes
router.post('/upload', upload.single('file'), uploadCsv);
router.get('/sample-csv', downloadSampleCsv);

// Batch routes
router.get('/batches', getBatches);
router.get('/batches/:id', getBatchById);
router.post('/batches/:id/approve', approveBatch);

// Audit logs
router.get('/audit-logs', getAuditLogs);

// System health
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
