const { query } = require('../config/db');

/**
 * Audit Log Data Access Layer
 */
const auditModel = {
  // Fetch all audit logs in reverse chronological order
  getAll: async () => {
    const result = await query(
      `SELECT * FROM audit_logs ORDER BY timestamp DESC`
    );
    return result.rows;
  },

  // Insert a single audit record
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
