import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// PATCH update job
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  const job = await sql`
    UPDATE jobs SET
      customer=${b.customer}, phone=${b.phone}, address=${b.address},
      job_type=${b.jobType}, area=${b.area}, material_cost=${b.materialCost},
      labour_cost=${b.labourCost}, stage=${b.stage}, notes=${b.notes},
      follow_up=${b.followUp}, date=${b.date}
    WHERE id=${params.id} RETURNING *
  `;
  return NextResponse.json(job[0]);
}

// DELETE job
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await sql`DELETE FROM jobs WHERE id=${params.id}`;
  return NextResponse.json({ success: true });
}