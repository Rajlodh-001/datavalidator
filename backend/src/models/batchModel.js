const { pool, query } = require('../config/db');
const auditModel = require('./auditModel');

const batchModel = {
  // Grab active IDs so we don't allow duplicate transactions across files
  getActiveTransactionIds: async () => {
    const res = await query(
      `SELECT transaction_id FROM transactions WHERE status IN ('PENDING', 'AUTHORIZED')`
    );
    return new Set(res.rows.map((r) => (r.transaction_id || '').trim()));
  },

  // Get list of batches, newest first
  getAll: async () => {
    const res = await query(
      `SELECT * FROM batches ORDER BY created_at DESC`
    );
    return res.rows;
  },

  // Lookup batch by its ID
  getById: async (id) => {
    const res = await query(`SELECT * FROM batches WHERE id = $1`, [id]);
    return res.rows[0] || null;
  },

  // All transactions belonging to a given batch
  getTransactionsByBatchId: async (batchId) => {
    const res = await query(
      `SELECT * FROM transactions WHERE batch_id = $1 ORDER BY id ASC`,
      [batchId]
    );
    return res.rows;
  },

  // Wrap batch header, all rows, and the audit log in a single transaction
  createWithTransactions: async ({
    filename,
    totalCount,
    validCount,
    invalidCount,
    status,
    evaluatedRows,
  }) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Save the batch header
      const batchRes = await client.query(
        `INSERT INTO batches (filename, total_records, valid_records, invalid_records, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [filename, totalCount, validCount, invalidCount, status]
      );
      const batch = batchRes.rows[0];

      // 2. Insert each row with its evaluated validation status
      for (const row of evaluatedRows) {
        await client.query(
          `INSERT INTO transactions (batch_id, transaction_id, customer_name, account_number, amount, status, error_reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            batch.id,
            row.transaction_id,
            row.customer_name,
            row.account_number,
            row.amount,
            row.status,
            row.error_reason,
          ]
        );
      }

      // 3. Record upload action in audit history
      const auditDetails = `Batch #${batch.id} ("${batch.filename}") uploaded by Maker. Total: ${totalCount}, Valid: ${validCount}, Invalid: ${invalidCount}.`;
      await auditModel.create('BATCH_UPLOADED', auditDetails, client);

      await client.query('COMMIT');
      return batch;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  // Checker approval: update status to AUTHORIZED and log audit
  approve: async (batchId) => {
    const client = await pool.connect();
    try {
      const batchRes = await client.query(`SELECT * FROM batches WHERE id = $1`, [batchId]);
      const batch = batchRes.rows[0];

      if (!batch) {
        throw new Error(`Batch #${batchId} not found`);
      }

      if (batch.status === 'AUTHORIZED') {
        throw new Error('This batch is already AUTHORIZED');
      }

      if (batch.valid_records === 0) {
        throw new Error('Cannot approve a batch with 0 valid records');
      }

      await client.query('BEGIN');

      // Flip all pending records in this batch to authorized
      const txRes = await client.query(
        `UPDATE transactions 
         SET status = 'AUTHORIZED' 
         WHERE batch_id = $1 AND status = 'PENDING'
         RETURNING id`,
        [batchId]
      );

      // Mark batch header authorized
      const updatedBatchRes = await client.query(
        `UPDATE batches 
         SET status = 'AUTHORIZED' 
         WHERE id = $1 
         RETURNING *`,
        [batchId]
      );

      // Keep audit record of who/what approved it
      const auditDetails = `Batch #${batchId} ("${batch.filename}") approved by Checker. ${txRes.rowCount} transactions transitioned to AUTHORIZED.`;
      await auditModel.create('BATCH_APPROVED', auditDetails, client);

      await client.query('COMMIT');

      return {
        batch: updatedBatchRes.rows[0],
        authorizedCount: txRes.rowCount,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = batchModel;
