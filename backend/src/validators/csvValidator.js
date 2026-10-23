/**
 * Pure validator for transaction rows from CSV
 */

const validateTransactionRows = (rawRows, existingDbTxIds = new Set()) => {
  const seenInFile = new Set();
  const evaluatedRows = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const rowNumber = i + 1;

    // Normalize and trim input fields
    const txId = (row.transaction_id || '').trim();
    const customerName = (row.customer_name || '').trim();
    const accountNumber = (row.account_number || '').trim();
    const rawAmount = (row.amount || '').trim();

    const errors = [];

    // Rule 1: All fields are mandatory
    if (!txId) errors.push('transaction_id is required');
    if (!customerName) errors.push('customer_name is required');
    if (!accountNumber) errors.push('account_number is required');
    if (!rawAmount) errors.push('amount is required');

    // Rule 2: Amount must be numeric and > 0
    const parsedAmount = parseFloat(rawAmount);
    if (rawAmount && (isNaN(parsedAmount) || parsedAmount <= 0)) {
      errors.push('amount must be a valid number greater than 0');
    }

    // Rule 3: Uniqueness in CSV file & Uniqueness in Database
    if (txId) {
      if (seenInFile.has(txId)) {
        errors.push(`Duplicate transaction_id "${txId}" in CSV file`);
      } else if (existingDbTxIds.has(txId)) {
        errors.push(`transaction_id "${txId}" already exists in database`);
      }
      seenInFile.add(txId);
    }

    const isValid = errors.length === 0;

    if (isValid) {
      validCount++;
      evaluatedRows.push({
        rowNumber,
        transaction_id: txId,
        customer_name: customerName,
        account_number: accountNumber,
        amount: parsedAmount,
        status: 'PENDING',
        error_reason: null,
      });
    } else {
      invalidCount++;
      evaluatedRows.push({
        rowNumber,
        transaction_id: txId || `UNKNOWN_ROW_${rowNumber}`,
        customer_name: customerName || 'N/A',
        account_number: accountNumber || 'N/A',
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
        status: 'FAILED',
        error_reason: errors.join('; '),
      });
    }
  }

  return {
    evaluatedRows,
    validCount,
    invalidCount,
    totalCount: rawRows.length,
  };
};

module.exports = {
  validateTransactionRows,
};
