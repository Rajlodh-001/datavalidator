const batchModel = require('../models/batchModel');

/**
 * GET /batches - List all batches in descending order
 */
const getBatches = async (req, res) => {
  try {
    const batches = await batchModel.getAll();
    res.json(batches);
  } catch (err) {
    console.error('[BatchController] getBatches error:', err);
    res.status(500).json({ error: 'Failed to retrieve batches' });
  }
};

/**
 * GET /batches/:id - Get batch info and its transactions
 */
const getBatchById = async (req, res) => {
  const { id } = req.params;
  try {
    const batch = await batchModel.getById(id);
    if (!batch) {
      return res.status(404).json({ error: `Batch #${id} not found` });
    }

    const transactions = await batchModel.getTransactionsByBatchId(id);

    res.json({
      batch,
      transactions,
    });
  } catch (err) {
    console.error('[BatchController] getBatchById error:', err);
    res.status(500).json({ error: 'Failed to retrieve batch details' });
  }
};

/**
 * POST /batches/:id/approve - Approve batch and authorize all pending transactions
 */
const approveBatch = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await batchModel.approve(id);

    res.json({
      message: 'Batch approved successfully',
      batch: result.batch,
      authorized_count: result.authorizedCount,
    });
  } catch (err) {
    console.error('[BatchController] approveBatch error:', err);
    const status = err.message.includes('not found')
      ? 404
      : err.message.includes('already') || err.message.includes('0 valid')
      ? 400
      : 500;
    res.status(status).json({ error: err.message });
  }
};

module.exports = {
  getBatches,
  getBatchById,
  approveBatch,
};
