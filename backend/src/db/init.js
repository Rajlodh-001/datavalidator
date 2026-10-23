const { initDB, pool } = require('../config/db');

async function main() {
  try {
    console.log('[Migration] Running database schema setup...');
    await initDB(3, 1000);
    console.log('[Migration] Database schema setup complete.');
  } catch (err) {
    console.error('[Migration] Failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
