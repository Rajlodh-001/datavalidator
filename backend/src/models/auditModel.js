const { query } = require('../config/db');

const auditModel = {
  // Grab all logs, newest on top
  getAll: async () => {
    const result = await query(
      `SELECT * FROM audit_logs ORDER BY timestamp DESC`
    );
    return result.rows;
  },

  // Save audit entry (supports passing existing transaction client)
  create: async (action, details, client = null) => {
    const sql = `INSERT INTO audit_logs (action, details) VALUES ($1, $2) RETURNING *`;
    const params = [action, details];

    if (client) {
      const res = await client.query(sql, params);
      return res.rows[0];
    }
    const res = await query(sql, params);
    return res.rows[0];
  },
};

module.exports = auditModel;
