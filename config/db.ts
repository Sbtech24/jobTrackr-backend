// src/config/db.ts
import { Pool } from 'pg';

export const conn = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Optional but recommended
conn.on('connect', () => {
  console.log('Postgres connected');
});

conn.on('error', (err) => {
  console.error('Postgres error', err);
});
