const auditModel = require('../models/auditModel');

/**
 * GET /audit-logs - Retrieve all audit trail logs
 */
const getAuditLogs = async (req, res) => {
  try {
    const logs = await auditModel.getAll();
    res.json(logs);
  } catch (err) {
    console.error('[AuditController] getAuditLogs error:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
};

module.exports = {
  getAuditLogs,
};
