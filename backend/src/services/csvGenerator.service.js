const { Readable } = require('stream');

// Generates CSV rows on the fly using a stream so we don't hog RAM or freeze the event loop
const createCsvGeneratorStream = ({
  totalRows = 10,
  invalidRows = 0,
  duplicateRows = 0,
}) => {
  const total = Math.max(1, parseInt(totalRows, 10) || 10);
  const invalidTarget = Math.min(total, Math.max(0, parseInt(invalidRows, 10) || 0));
  const remainingSlots = total - invalidTarget;
  const duplicateTarget = Math.min(remainingSlots, Math.max(0, parseInt(duplicateRows, 10) || 0));

  let currentIndex = 0;
  let sentHeader = false;
  let duplicatesProduced = 0;
  let invalidsProduced = 0;

  const sampleNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Evan Wright'];
  const baseTimestamp = Date.now();

  const stream = new Readable({
    read() {
      // Header first
      if (!sentHeader) {
        sentHeader = true;
        this.push('transaction_id,customer_name,account_number,amount\n');
        return;
      }

      // Done when reaching total count
      if (currentIndex >= total) {
        this.push(null);
        return;
      }

      // Send in small batches of 50 to let Node breathe between ticks
      const chunkSize = 50;
      let bufferChunk = '';
      let chunkCount = 0;

      while (currentIndex < total && chunkCount < chunkSize) {
        currentIndex++;
        chunkCount++;

        let txId = `TXN_${baseTimestamp}_${currentIndex}`;
        let name = sampleNames[currentIndex % sampleNames.length];
        let account = `ACC-${100000 + (currentIndex % 900000)}`;
        let amount = (50 + (currentIndex * 13.75) % 4500).toFixed(2);

        // Toss in duplicate ID if requested
        if (duplicatesProduced < duplicateTarget && currentIndex > 1) {
          txId = `TXN_${baseTimestamp}_1`;
          duplicatesProduced++;
        }
        // Toss in bad data if requested
        else if (invalidsProduced < invalidTarget) {
          const issueType = invalidsProduced % 3;
          if (issueType === 0) {
            name = ''; // missing name
          } else if (issueType === 1) {
            amount = '-25.00'; // negative
          } else {
            account = ''; // missing account & bad string
            amount = 'INVALID_AMT';
          }
          invalidsProduced++;
        }

        bufferChunk += `${txId},${name},${account},${amount}\n`;
      }

      setImmediate(() => {
        this.push(bufferChunk);
      });
    },
  });

  return stream;
};

module.exports = {
  createCsvGeneratorStream,
};
