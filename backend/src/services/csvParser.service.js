const { Readable } = require('stream');
const csv = require('csv-parser');

// Convert raw buffer into array of rows with lowercase header keys
const parseCsvBuffer = (buffer) => {
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

module.exports = {
  parseCsvBuffer,
};
