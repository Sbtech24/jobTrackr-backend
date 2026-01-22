import { conn } from "../config/db";

export async function initDb() {
  try {
    await conn.query(`
        CREATE TABLE IF NOT EXISTS jobs(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        status TEXT, 
        description VARCHAR(255),
        date_applied TIMESTAMP DEFAULT NOW()
        )
        `);
    console.log(`Database connected successfully`);
  } catch (err) {
    console.log("Error connecting to db");
  }
}
