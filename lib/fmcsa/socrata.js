// FMCSA insurance/bond filings via the data.transportation.gov Socrata API.
//
// Datasets:
//   qh9u-swkp  ActPendInsur — currently active or pending policies (what we want).
//   ypjt-5ydn  Insur        — all policies including expired (used as fallback).
//
// The L&I HTML form has reCAPTCHA on it; the Socrata endpoints are the official
// public-API path to the same data and don't require auth.
//
// Form codes we care about:
//   84    BMC-84  Surety bond for brokers (typically $75,000)
//   85    BMC-85  Trust fund agreement (alternative to BMC-84)
//   91    BMC-91  Liability (BIPD) insurance
//   91X   BMC-91X Liability insurance (electronic)
//   34    BMC-34  Cargo insurance
//   34X   BMC-34X Cargo insurance (electronic)
//   32    BMC-32  Endorsement
//
// Docket numbers in Socrata are formatted as `MC{digits}` (no padding).
// DOT numbers are zero-padded to 8 digits.

const BASE = "https://data.transportation.gov/resource";
const TIMEOUT_MS = 10_000;

function normalizeMc(mc) {
  if (!mc) return null;
  const digits = String(mc).replace(/^MC-?/i, "").trim();
  return digits ? `MC${digits}` : null;
}

function normalizeDot(dot) {
  if (!dot) return null;
  const digits = String(dot).replace(/[^\d]/g, "");
  return digits ? digits.padStart(8, "0") : null;
}

async function getJson(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Socrata ${res.status}: ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Fetch all currently-active/pending filings for a broker (qh9u-swkp).
// Returns an array (possibly empty). Tries MC first, falls back to DOT.
export async function fetchActiveFilings({ mc, dot }) {
  const mcq = normalizeMc(mc);
  const dotq = normalizeDot(dot);

  if (mcq) {
    const rows = await getJson(`${BASE}/qh9u-swkp.json?docket_number=${encodeURIComponent(mcq)}`);
    if (Array.isArray(rows) && rows.length) return rows;
  }
  if (dotq) {
    const rows = await getJson(`${BASE}/qh9u-swkp.json?dot_number=${encodeURIComponent(dotq)}`);
    if (Array.isArray(rows) && rows.length) return rows;
  }
  return [];
}

// Pick out the relevant filings from a list:
//   bond  — the most-recent ins_form_code 84 or 85
//   bipd  — the most-recent ins_form_code 91 or 91X
//   cargo — the most-recent ins_form_code 34 or 34X
// "Most recent" is by effective_date.
export function classifyFilings(rows) {
  const byForm = (codes) =>
    rows
      .filter((r) => codes.includes(String(r.ins_form_code).toUpperCase()))
      .sort((a, b) => Date.parse(b.effective_date || 0) - Date.parse(a.effective_date || 0))[0] ?? null;

  return {
    bond: byForm(["84", "85"]),
    bipd: byForm(["91", "91X"]),
    cargo: byForm(["34", "34X"]),
  };
}
