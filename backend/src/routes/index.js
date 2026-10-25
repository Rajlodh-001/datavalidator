const express = require('express');

const uploadRoutes = require('./upload.routes');
const batchRoutes = require('./batch.routes');
const auditRoutes = require('./audit.routes');

const router = express.Router();

// Upload & sample CSV
router.use('/', uploadRoutes);

// Batches resource
router.use('/batches', batchRoutes);

// Audit logs resource
router.use('/audit-logs', auditRoutes);

// System health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
