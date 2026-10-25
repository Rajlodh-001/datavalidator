const auditModel = require('../models/auditModel');

// Fetch the audit log timeline
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
