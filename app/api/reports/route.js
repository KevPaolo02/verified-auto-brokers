// POST /api/reports
// Public-facing endpoint for shippers to report a broker for fraud, bond lapse,
// double-brokering, or service issues. Stored as severity='medium' in
// internal_flags — admin reviews and adjusts via SQL:
//
//   SELECT id, mc, reason, severity, source, created_by, created_at
//     FROM internal_flags
//    WHERE source = 'public_report'
//    ORDER BY created_at DESC;
//
// To act on a report:
//   - Promote to 'high' if confirmed   →  flagged status flips on the broker page
//   - Demote/delete if unverifiable
//
// IMPORTANT: a public report does NOT immediately mark a broker as flagged.
// Severity defaults to 'medium' which doesn't trigger the verified=false rule —
// only admin-promoted 'high' flags do. Prevents one angry user from poisoning
// a broker's profile.

import { NextResponse } from "next/server";
import { createInternalFlag, brokerExists } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate limit: same naive in-memory map as /api/claims. 1 submission per IP per 60s.
const lastSubmitByIp = new Map();
const RATE_WINDOW_MS = 60_000;

function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const last = lastSubmitByIp.get(ip);
  if (last && now - last < RATE_WINDOW_MS) return true;
  lastSubmitByIp.set(ip, now);
  if (lastSubmitByIp.size > 1000) {
    for (const [k, v] of lastSubmitByIp) {
      if (now - v > RATE_WINDOW_MS) lastSubmitByIp.delete(k);
    }
  }
  return false;
}

function clientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

function badReq(msg, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function clean(s, max = 2000) {
  if (s == null) return null;
  const t = String(s).trim();
  if (!t) return null;
  return t.slice(0, max);
}

function cleanEmail(s) {
  const t = clean(s, 200);
  if (!t) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t.toLowerCase() : null;
}

export async function POST(req) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return badReq("Too many submissions. Try again in a minute.", 429);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return badReq("Invalid JSON");
  }

  // Canonical MC: bare digits.
  const mc = (body.mc || "").toString().replace(/^MC-?/i, "").trim();
  if (!mc || !/^\d+$/.test(mc)) {
    return badReq("MC number required (digits only)");
  }
  if (!(await brokerExists(mc))) {
    return badReq("MC not found in registry. Confirm the number and try again.", 404);
  }

  const reporterEmail = cleanEmail(body.reporter_email);
  if (!reporterEmail) return badReq("Valid reporter email required");

  const reasonText = clean(body.reason, 2000);
  if (!reasonText || reasonText.length < 20) {
    return badReq("Please describe the issue in at least 20 characters.");
  }

  // Build the structured reason payload — admin will see source IP + reporter
  // contact + the reason text in one record.
  const reason = JSON.stringify({
    summary: clean(body.category, 100) || "Public report",
    text: reasonText,
    reporter: {
      email: reporterEmail,
      name: clean(body.reporter_name, 200),
    },
    submitted_ip: ip,
  });

  try {
    await createInternalFlag({
      mc,
      reason,
      severity: "medium",        // admin promotes to "high" if confirmed
      source: "public_report",
      createdBy: reporterEmail,
    });
    return NextResponse.json({
      ok: true,
      message: "Report received. We review every submission and may follow up by email.",
    });
  } catch (err) {
    console.error("[reports] insert failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
