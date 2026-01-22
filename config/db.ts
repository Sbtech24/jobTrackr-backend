import dotenv from "dotenv";
import pkg from "pg";
const { Client } = pkg;

dotenv.config();

const conn = new Client({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false, 
  },
});

await conn.connect();

export { conn };
