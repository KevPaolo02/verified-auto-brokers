// GET /api/fmcsa/lookup?mc=279140
// GET /api/fmcsa/lookup?dot=823914
//
// Returns a normalized broker record. Uses Neon-cached data when fresh (<24h),
// otherwise hits QCMobile, normalizes, writes back to cache, and returns.
// On QCMobile failure with a stale cached row available, returns the stale row
// with a warning.

import { NextResponse } from "next/server";
import { lookupCarrier } from "@/lib/fmcsa/qcmobile";
import { fetchActiveFilings } from "@/lib/fmcsa/socrata";
import { normalizeFmcsaBroker } from "@/lib/fmcsa/normalize";
import { readCache, writeCache, readInternalFlags, readClaim } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function isFresh(lastChecked) {
  if (!lastChecked) return false;
  const age = Date.now() - new Date(lastChecked).getTime();
  return age < CACHE_TTL_MS;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  // Canonicalize: cache key uses bare digits (no "MC-" prefix, no DOT padding)
  // so a request for "MC-1302755" and "1302755" hit the same row.
  const mcRaw = searchParams.get("mc")?.trim() || null;
  const dotRaw = searchParams.get("dot")?.trim() || null;
  const mc = mcRaw ? mcRaw.replace(/^MC-?/i, "").trim() : null;
  const dot = dotRaw ? dotRaw.replace(/[^\d]/g, "") : null;

  if (!mc && !dot) {
    return NextResponse.json(
      { error: "Provide ?mc= or ?dot=" },
      { status: 400 }
    );
  }

  const source = "QCMOBILE";

  // Claim is always fetched fresh — it's tiny and changes independently of FMCSA data.
  let claim = null;
  try {
    claim = mc ? await readClaim({ mc }) : null;
  } catch (err) {
    console.error("[fmcsa/lookup] claim read failed:", err);
  }

  // 1. Cache check.
  let cached = null;
  try {
    cached = await readCache({ mc, dot, source });
  } catch (err) {
    console.error("[fmcsa/lookup] cache read failed:", err);
  }

  if (cached && isFresh(cached.last_checked)) {
    return NextResponse.json({
      data: cached.parsed_json,
      claim,
      cached: true,
      stale: false,
      last_checked: cached.last_checked,
    });
  }

  // 2. Fresh fan-out: QCMobile (authority + amounts) and Socrata (provider names) in parallel.
  let raw = null;
  let filings = [];
  let fetchError = null;
  try {
    const [qcResult, socrataResult] = await Promise.allSettled([
      lookupCarrier({ mc, dot }),
      fetchActiveFilings({ mc, dot }),
    ]);
    if (qcResult.status === "fulfilled") raw = qcResult.value;
    else fetchError = qcResult.reason;
    if (socrataResult.status === "fulfilled") filings = socrataResult.value ?? [];
    else console.warn("[fmcsa/lookup] Socrata fetch failed:", socrataResult.reason);
  } catch (err) {
    fetchError = err;
    console.error("[fmcsa/lookup] FMCSA fan-out failed:", err);
  }

  if (!raw?.carrier) {
    // No live data. Return stale cache if we have it, otherwise 404.
    if (cached) {
      return NextResponse.json({
        data: cached.parsed_json,
        claim,
        cached: true,
        stale: true,
        warning: "FMCSA fetch failed; showing cached record.",
        last_checked: cached.last_checked,
      });
    }
    if (fetchError) {
      return NextResponse.json(
        { error: "FMCSA upstream error", detail: String(fetchError.message ?? fetchError) },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 3. Pull internal flags so verified/flagged are computed correctly.
  let flags = [];
  try {
    flags = await readInternalFlags({ mc, dot });
  } catch (err) {
    console.error("[fmcsa/lookup] internal_flags read failed:", err);
  }

  // 4. Normalize.
  const normalized = normalizeFmcsaBroker(raw, filings, flags, { mc, dot });

  // 5. Cache write — use canonical (digits-only) keys so future lookups hit.
  // The normalized record carries the display-formatted "MC-XXX" in parsed_json.
  try {
    const canonicalMc = mc ?? (normalized?.mc ? normalized.mc.replace(/^MC-?/i, "") : null);
    const canonicalDot = dot ?? (normalized?.dot ? String(normalized.dot).replace(/[^\d]/g, "") : null);
    await writeCache({
      mc: canonicalMc,
      dot: canonicalDot,
      source,
      parsed: normalized,
      rawHtml: null,
    });
  } catch (err) {
    console.error("[fmcsa/lookup] cache write failed:", err);
  }

  return NextResponse.json({
    data: normalized,
    claim,
    cached: false,
    stale: false,
    last_checked: normalized?.last_checked ?? new Date().toISOString(),
  });
}
