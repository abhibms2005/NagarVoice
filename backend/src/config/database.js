const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20
});

async function initializePool() {
  try {
    console.log('🔗 Connecting to Supabase...');
    await pool.query('SELECT NOW()');
    console.log('✅ Supabase PostgreSQL connected successfully');
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('CONNECTION STRING:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
    throw error;
  }
}

async function getPool() {
  return pool;
}

async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

module.exports = {
  initializePool,
  getPool,
  closePool
};
