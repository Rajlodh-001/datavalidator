const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5435', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgrespassword',
  database: process.env.PGDATABASE || 'datavalidator',
});

// Helper for executing queries
const query = (text, params) => pool.query(text, params);

// Path to single source-of-truth schema file
const SCHEMA_FILE_PATH = path.join(__dirname, '../db/schema.sql');

// Automatic DB initialization with connection retries
const initDB = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`[Database] Connecting to PostgreSQL (Attempt ${i + 1}/${retries})...`);
      await pool.query('SELECT NOW()');
      console.log('[Database] PostgreSQL connected successfully.');

      // Read and execute schema.sql directly
      const schemaSql = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');
      await pool.query(schemaSql);

      console.log('[Database] Schema verified and applied from schema.sql.');
      return;
    } catch (err) {
      console.error(`[Database] Connection attempt failed: ${err.message}`);
      if (i < retries - 1) {
        console.log(`[Database] Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('[Database] Maximum retries reached. Verify that Docker container is running.');
      }
    }
  }
};

module.exports = {
  pool,
  query,
  initDB,
};
