const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDB } = require('./src/config/db');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred on the server',
  });
});

// Start Server and verify DB tables
app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`Backend Server running on: http://localhost:${PORT}`);
  console.log(`===============================================`);
  await initDB();
});
