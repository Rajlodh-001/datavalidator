const batchModel = require('../models/batchModel');
const { validateTransactionRows } = require('../validators/csvValidator');
const { parseCsvBuffer } = require('../services/csvParser.service');
const { createCsvGeneratorStream } = require('../services/csvGenerator.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Handle CSV upload, validate each transaction row, and save to database
const uploadCsv = async (req, res, next) => {
  if (!req.file) {
    return sendError(res, 'Please upload a CSV file', 400);
  }

  try {
    const rawRows = await parseCsvBuffer(req.file.buffer);

    if (rawRows.length === 0) {
      return sendError(res, 'The uploaded CSV file is empty', 400);
    }

    // Pull already registered transaction IDs to catch cross-batch duplicates
    const existingDbTxIds = await batchModel.getActiveTransactionIds();

    // Run our validation checks across all rows
    const { evaluatedRows, validCount, invalidCount, totalCount } =
      validateTransactionRows(rawRows, existingDbTxIds);

    // If there's at least one good record, mark batch PENDING for review; otherwise REJECT it
    const batchStatus = validCount > 0 ? 'PENDING' : 'REJECTED';

    // Save batch, rows, and audit entry in a single DB transaction
    const batch = await batchModel.createWithTransactions({
      filename: req.file.originalname,
      totalCount,
      validCount,
      invalidCount,
      status: batchStatus,
      evaluatedRows,
    });

    const invalidRecords = evaluatedRows.filter((r) => r.status === 'FAILED');

    return sendSuccess(
      res,
      {
        message: 'Batch uploaded and validated successfully',
        batch,
        summary: {
          total: totalCount,
          valid: validCount,
          invalid: invalidCount,
        },
        invalid_records: invalidRecords,
      },
      201
    );
  } catch (err) {
    next(err);
  }
};

// Return a quick hardcoded sample CSV for users to test uploads
const downloadSampleCsv = (req, res) => {
  const sampleData = `transaction_id,customer_name,account_number,amount
TXN_1001,Alice Johnson,ACC-882104,1500.50
TXN_1002,Bob Smith,ACC-551920,320.00
TXN_1003,,ACC-992311,750.25
TXN_1004,Charlie Brown,ACC-110293,-50.00
TXN_1001,Duplicate Person,ACC-771122,1200.00
TXN_1005,Diana Prince,ACC-449102,4800.75`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sample_transactions.csv"');
  res.send(sampleData);
};

// Stream dynamically generated CSV files without tying up Node's event loop
const generateCsv = (req, res, next) => {
  try {
    const totalRows = Math.min(100000, Math.max(1, parseInt(req.query.rows, 10) || 10));
    const invalidRows = Math.max(0, parseInt(req.query.invalid, 10) || 0);
    const duplicateRows = Math.max(0, parseInt(req.query.duplicates, 10) || 0);

    const filename = `transactions_${totalRows}_rows.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Transfer-Encoding', 'chunked');

    const csvStream = createCsvGeneratorStream({
      totalRows,
      invalidRows,
      duplicateRows,
    });

    csvStream.on('error', (streamErr) => {
      console.error('[CSV Stream Error]:', streamErr);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to generate CSV stream' });
      } else {
        res.end();
      }
    });

    // Stream chunks directly out to the response
    csvStream.pipe(res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadCsv,
  downloadSampleCsv,
  generateCsv,
};
