import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL Connected Successfully');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL Connection Error:', err.message);
});

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Create registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        job VARCHAR(255) NOT NULL,
        job_location VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        circle VARCHAR(100) NOT NULL,
        payment_id VARCHAR(255) NOT NULL,
        payment_screenshot TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add payment_screenshot column if it doesn't exist (for existing tables)
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='registrations' AND column_name='payment_screenshot'
        ) THEN
          ALTER TABLE registrations ADD COLUMN payment_screenshot TEXT;
        END IF;
      END $$;
    `);

    // Create admins table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better search performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_registrations_name ON registrations(name);
      CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone);
      CREATE INDEX IF NOT EXISTS idx_registrations_circle ON registrations(circle);
      CREATE INDEX IF NOT EXISTS idx_registrations_submitted_at ON registrations(submitted_at);
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  }
};

export default pool;
