const test = require('node:test');
const assert = require('node:assert/strict');
const { createCsvGeneratorStream } = require('../src/services/csvGenerator.service');

test('CSV Generator: streams valid CSV with correct row count and headers', async () => {
  const stream = createCsvGeneratorStream({ totalRows: 5, invalidRows: 0, duplicateRows: 0 });
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const csvOutput = chunks.join('');
  const lines = csvOutput.trim().split('\n');

  // 1 header + 5 rows
  assert.equal(lines.length, 6);
  assert.equal(lines[0], 'transaction_id,customer_name,account_number,amount');
});

test('CSV Generator: accurately creates bad/invalid rows and duplicates based on params', async () => {
  const stream = createCsvGeneratorStream({
    totalRows: 10,
    invalidRows: 3,
    duplicateRows: 2,
  });

  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const csvOutput = chunks.join('');
  const lines = csvOutput.trim().split('\n');
  assert.equal(lines.length, 11); // 1 header + 10 rows

  // Verify bad/invalid content or duplicates exist
  const dataRows = lines.slice(1);
  const duplicates = dataRows.filter((r) => r.startsWith('TXN_') && r.split(',')[0].endsWith('_1'));
  // At least the original and the injected duplicates
  assert.ok(duplicates.length >= 2, 'Should contain duplicated transaction IDs');

  const invalidRowsFound = dataRows.filter(
    (r) => r.includes(',,') || r.includes('-25.00') || r.includes('INVALID_AMT')
  );
  assert.equal(invalidRowsFound.length, 3, 'Should have exactly 3 invalid rows');
});
