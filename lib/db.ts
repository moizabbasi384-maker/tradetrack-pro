import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);

export async function createTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      customer TEXT NOT NULL,
      phone TEXT,
      address TEXT NOT NULL,
      job_type TEXT,
      area NUMERIC,
      material_cost NUMERIC DEFAULT 0,
      labour_cost NUMERIC DEFAULT 0,
      stage TEXT DEFAULT 'New Lead',
      notes TEXT,
      follow_up BOOLEAN DEFAULT false,
      date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}