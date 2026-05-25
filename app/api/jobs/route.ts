import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// GET all jobs
export async function GET() {
  const jobs = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
  return NextResponse.json(jobs);
}

// POST new job
export async function POST(req: Request) {
  const b = await req.json();
  const job = await sql`
    INSERT INTO jobs (customer, phone, address, job_type, area, material_cost, labour_cost, stage, notes, follow_up, date)
    VALUES (${b.customer}, ${b.phone}, ${b.address}, ${b.jobType}, ${b.area}, ${b.materialCost}, ${b.labourCost}, ${b.stage}, ${b.notes}, ${b.followUp}, ${b.date})
    RETURNING *
  `;
  return NextResponse.json(job[0]);
}