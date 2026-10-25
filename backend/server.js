require('dotenv').config();

const app = require('./src/app');
const { initDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Start Server and verify DB tables
app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`Backend Server running on: http://localhost:${PORT}`);
  console.log(`===============================================`);
  await initDB();
});
