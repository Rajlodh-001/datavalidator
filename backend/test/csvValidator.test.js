const test = require('node:test');
const assert = require('node:assert/strict');
const { validateTransactionRows } = require('../src/validators/csvValidator');

test('Validator: should mark complete, valid rows as PENDING with no errors', () => {
  const sampleRows = [
    {
      transaction_id: 'TX_101',
      customer_name: 'Alice Cooper',
      account_number: 'ACC-111',
      amount: '500.00',
    },
    {
      transaction_id: 'TX_102',
      customer_name: 'Bob Marley',
      account_number: 'ACC-222',
      amount: '1250.50',
    },
  ];

  const result = validateTransactionRows(sampleRows, new Set());

  assert.equal(result.totalCount, 2);
  assert.equal(result.validCount, 2);
  assert.equal(result.invalidCount, 0);
  assert.equal(result.evaluatedRows[0].status, 'PENDING');
  assert.equal(result.evaluatedRows[0].error_reason, null);
});

test('Validator: should fail rows with missing mandatory fields', () => {
  const sampleRows = [
    {
      transaction_id: '',
      customer_name: 'Missing ID',
      account_number: 'ACC-333',
      amount: '100.00',
    },
    {
      transaction_id: 'TX_104',
      customer_name: '',
      account_number: 'ACC-444',
      amount: '200.00',
    },
  ];

  const result = validateTransactionRows(sampleRows, new Set());

  assert.equal(result.validCount, 0);
  assert.equal(result.invalidCount, 2);
  assert.match(result.evaluatedRows[0].error_reason, /transaction_id is required/);
  assert.match(result.evaluatedRows[1].error_reason, /customer_name is required/);
});

test('Validator: should fail rows with amount <= 0 or invalid numbers', () => {
  const sampleRows = [
    {
      transaction_id: 'TX_105',
      customer_name: 'Zero Dollar',
      account_number: 'ACC-555',
      amount: '0',
    },
    {
      transaction_id: 'TX_106',
      customer_name: 'Negative Dollar',
      account_number: 'ACC-666',
      amount: '-25.50',
    },
    {
      transaction_id: 'TX_107',
      customer_name: 'Not A Number',
      account_number: 'ACC-777',
      amount: 'INVALID_NUM',
    },
  ];

  const result = validateTransactionRows(sampleRows, new Set());

  assert.equal(result.validCount, 0);
  assert.equal(result.invalidCount, 3);
  result.evaluatedRows.forEach((r) => {
    assert.match(r.error_reason, /amount must be a valid number greater than 0/);
  });
});

test('Validator: should detect duplicate transaction_id within the same CSV', () => {
  const sampleRows = [
    {
      transaction_id: 'TX_DUP_1',
      customer_name: 'First Person',
      account_number: 'ACC-111',
      amount: '100',
    },
    {
      transaction_id: 'TX_DUP_1',
      customer_name: 'Second Person Duplicate',
      account_number: 'ACC-222',
      amount: '200',
    },
  ];

  const result = validateTransactionRows(sampleRows, new Set());

  assert.equal(result.validCount, 1);
  assert.equal(result.invalidCount, 1);
  assert.match(result.evaluatedRows[1].error_reason, /Duplicate transaction_id "TX_DUP_1" in CSV file/);
});

test('Validator: should detect duplicate transaction_id against existing DB records', () => {
  const existingInDb = new Set(['TX_ALREADY_IN_DB']);

  const sampleRows = [
    {
      transaction_id: 'TX_ALREADY_IN_DB',
      customer_name: 'Collision User',
      account_number: 'ACC-999',
      amount: '350.00',
    },
  ];

  const result = validateTransactionRows(sampleRows, existingInDb);

  assert.equal(result.validCount, 0);
  assert.equal(result.invalidCount, 1);
  assert.match(result.evaluatedRows[0].error_reason, /already exists in database/);
});
