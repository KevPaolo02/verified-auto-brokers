// GET /api/brokers/search
//
// Query params:
//   q           free-text or numeric (matches mc/dot exactly when digits)
//   state       2-letter state code (CT, FL, …)
//   bonded      "1" / "true" — only brokers with bond on file
//   claimed     "1" / "true" — only verified-claimed brokers
//   flagged     "1" / "true" — only inactive/revoked authority
//   page        1-indexed (default 1)
//   page_size   max 200 (default 50)
//   sort        "mc" | "name" | "state"

import { NextResponse } from "next/server";
import { searchBrokers } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const truthy = (v) => v === "1" || v === "true" || v === "yes";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const result = await searchBrokers({
    q: searchParams.get("q") || null,
    state: searchParams.get("state") || null,
    bonded: searchParams.get("bonded") ? truthy(searchParams.get("bonded")) : null,
    claimed: searchParams.get("claimed") ? truthy(searchParams.get("claimed")) : null,
    flagged: searchParams.get("flagged") ? truthy(searchParams.get("flagged")) : null,
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("page_size")) || 50,
    sort: searchParams.get("sort") || "mc",
  });
  return NextResponse.json(result);
}
