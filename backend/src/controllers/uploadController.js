const { Readable } = require('stream');
const csv = require('csv-parser');
const batchModel = require('../models/batchModel');
const { validateTransactionRows } = require('../validators/csvValidator');

// Helper to parse CSV buffer into row objects
const parseCsv = (buffer) => {
  return new Promise((resolve, reject) => {
    const records = [];
    const stream = Readable.from(buffer);

    stream
      .pipe(
        csv({
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
        })
      )
      .on('data', (data) => records.push(data))
      .on('end', () => resolve(records))
      .on('error', (err) => reject(err));
  });
};

/**
 * POST /upload - Process CSV upload, validate, insert batch & transactions, log audit
 */
const uploadCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file' });
  }

  try {
    const rawRows = await parseCsv(req.file.buffer);

    if (rawRows.length === 0) {
      return res.status(400).json({ error: 'The uploaded CSV file is empty' });
    }

    // Retrieve existing active transaction IDs to check uniqueness across batches
    const existingDbTxIds = await batchModel.getActiveTransactionIds();

    // Validate rows
    const { evaluatedRows, validCount, invalidCount, totalCount } =
      validateTransactionRows(rawRows, existingDbTxIds);

    // Initial batch status: PENDING if any valid rows, REJECTED if all failed
    const batchStatus = validCount > 0 ? 'PENDING' : 'REJECTED';

    // Persist batch, transactions, and audit log atomically via model
    const batch = await batchModel.createWithTransactions({
      filename: req.file.originalname,
      totalCount,
      validCount,
      invalidCount,
      status: batchStatus,
      evaluatedRows,
    });

    const invalidRecords = evaluatedRows.filter((r) => r.status === 'FAILED');

    return res.status(201).json({
      message: 'Batch uploaded and validated successfully',
      batch,
      summary: {
        total: totalCount,
        valid: validCount,
        invalid: invalidCount,
      },
      invalid_records: invalidRecords,
    });
  } catch (err) {
    console.error('[UploadController] Error:', err);
    return res.status(500).json({ error: 'Failed to process file: ' + err.message });
  }
};

/**
 * GET /sample-csv - Download sample CSV for quick testing
 */
const downloadSampleCsv = (req, res) => {
  const sampleData = `transaction_id,customer_name,account_number,amount
TXN_1001,Alice Johnson,ACC-882104,1500.50
TXN_1002,Bob Smith,ACC-551920,320.00
TXN_1003,,ACC-992311,750.25
TXN_1004,Charlie Brown,ACC-110293,-50.00
TXN_1001,Duplicate Person,ACC-771122,1200.00
TXN_1005,Diana Prince,ACC-449102,4800.75`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="sample_transactions.csv"');
  res.send(sampleData);
};

module.exports = {
  uploadCsv,
  downloadSampleCsv,
};
