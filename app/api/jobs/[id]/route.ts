import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

// PATCH — update job
export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const b = await req.json();
  const job = await sql`
    UPDATE jobs SET
      customer      = ${b.customer},
      phone         = ${b.phone},
      address       = ${b.address},
      job_type      = ${b.jobType},
      area          = ${b.area},
      material_cost = ${b.materialCost},
      labour_cost   = ${b.labourCost},
      stage         = ${b.stage},
      notes         = ${b.notes},
      follow_up     = ${b.followUp},
      date          = ${b.date}
    WHERE id = ${id}
    RETURNING *
  `;
  return NextResponse.json(job[0]);
}

// DELETE — remove job
export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  await sql`DELETE FROM jobs WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
