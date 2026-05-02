// GET /api/brokers/stats — real counts derived from the DB. No fabrications.

import { NextResponse } from "next/server";
import { getRegistryStats } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getRegistryStats();
  return NextResponse.json(stats);
}
