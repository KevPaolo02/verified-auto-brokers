// POST /api/claims
// Public-facing endpoint for brokers to submit a claim on their listing.
// Stored as status='pending'; admin reviews and promotes to 'verified' via SQL:
//
//   UPDATE broker_claims SET status='verified', verified_at=now() WHERE mc='...';
//
// To reject: UPDATE ... SET status='rejected', admin_notes='...'.
//
// Verified claims cannot be overwritten by public submission — that's an admin-only
// action so a stranger can't steal a confirmed listing.

import { NextResponse } from "next/server";
import { createPendingClaim, brokerExists } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Naive in-memory rate limiter: 1 submission per IP per 60s.
// Module-scoped Map survives between requests on a warm Node lambda. For a
// real production setup we'd swap to a Redis/Upstash token bucket.
const lastSubmitByIp = new Map();
const RATE_WINDOW_MS = 60_000;

function rateLimited(ip) {
  if (!ip) return false;
  const now = Date.now();
  const last = lastSubmitByIp.get(ip);
  if (last && now - last < RATE_WINDOW_MS) return true;
  lastSubmitByIp.set(ip, now);
  // Trim the map periodically so it doesn't grow unbounded.
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

// Conservative input validation — enough to keep junk out, not a wall.
function clean(s, max = 500) {
  if (s == null) return null;
  const t = String(s).trim();
  if (!t) return null;
  return t.slice(0, max);
}

function cleanInt(v, max = 1_000_000) {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return Math.floor(n);
}

function cleanEmail(s) {
  const t = clean(s, 200);
  if (!t) return null;
  // Light pattern, not RFC-perfect; admin reviews anyway.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t.toLowerCase() : null;
}

function cleanUrl(s) {
  const t = clean(s, 500);
  if (!t) return null;
  try {
    const u = new URL(t.startsWith("http") ? t : `https://${t}`);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

function cleanSpecialties(s) {
  if (!s) return null;
  const arr = Array.isArray(s) ? s : String(s).split(",");
  const cleaned = arr.map((x) => String(x).trim()).filter(Boolean).slice(0, 10);
  return cleaned.length ? cleaned : null;
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

  // Confirm broker exists so a claimer can't make up an MC.
  if (!(await brokerExists(mc))) {
    return badReq("MC not found in registry. Confirm the number and try again.", 404);
  }

  const submittedEmail = cleanEmail(body.submitted_email);
  if (!submittedEmail) return badReq("Valid email required");

  const claimedBy = clean(body.claimed_by, 200) ?? submittedEmail;
  const displayPhone = clean(body.display_phone, 40);
  const displayEmail = cleanEmail(body.display_email);
  const displayWebsite = cleanUrl(body.display_website);
  const bio = clean(body.bio, 1000);
  const specialties = cleanSpecialties(body.specialties);
  const carrierNetworkSize = cleanInt(body.carrier_network_size, 100_000);
  const yearsInBusiness = cleanInt(body.years_in_business, 200);

  try {
    const result = await createPendingClaim({
      mc,
      affiliation: "self",
      claimedBy,
      submittedEmail,
      submittedIp: ip,
      displayPhone,
      displayEmail,
      displayWebsite,
      bio,
      specialties,
      carrierNetworkSize,
      yearsInBusiness,
    });

    if (!result.ok) {
      if (result.reason === "already_verified") {
        return badReq(
          "This listing is already verified. Email support@verifiedautobrokers.com to update or transfer ownership.",
          409
        );
      }
      return badReq("Could not save claim", 500);
    }

    return NextResponse.json({
      ok: true,
      status: "pending",
      message: "Claim received. We review submissions within 1–2 business days.",
    });
  } catch (err) {
    console.error("[claims] insert failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
