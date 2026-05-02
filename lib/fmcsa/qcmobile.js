// Thin wrapper around the FMCSA QCMobile JSON API.
// Docs: https://mobile.fmcsa.dot.gov/QCDevsite/
//
// All endpoints require ?webKey=<key>. Server-only — never imported into a client component.

const BASE = "https://mobile.fmcsa.dot.gov/qc/services";
const TIMEOUT_MS = 10_000;

function getWebKey() {
  const key = process.env.FMCSA_WEBKEY;
  if (!key) throw new Error("FMCSA_WEBKEY not set");
  return key;
}

async function getJson(path) {
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}webKey=${getWebKey()}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`QCMobile ${res.status}: ${path}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Strip an "MC-" prefix and any whitespace so callers can pass "MC-279140" or "279140".
function normalizeMc(mc) {
  if (!mc) return null;
  return String(mc).replace(/^MC-?/i, "").trim() || null;
}

function normalizeDot(dot) {
  if (!dot) return null;
  return String(dot).replace(/[^\d]/g, "") || null;
}

// Look up by DOT number. Returns the raw `content.carrier` object or null.
export async function fetchByDot(dot) {
  const d = normalizeDot(dot);
  if (!d) return null;
  const json = await getJson(`/carriers/${encodeURIComponent(d)}`);
  return json?.content?.carrier ?? null;
}

// Look up by MC docket number. Returns the first matching `content[].carrier`,
// or null if no match.
export async function fetchByMc(mc) {
  const m = normalizeMc(mc);
  if (!m) return null;
  const json = await getJson(`/carriers/docket-number/${encodeURIComponent(m)}`);
  const list = Array.isArray(json?.content) ? json.content : [];
  return list[0]?.carrier ?? null;
}

// Fetch authority grant history. Returns an array (possibly empty) of authority records.
// Each record has fields like authority, authStatus, originalActionDate, dateIssued, etc.
export async function fetchAuthority(dot) {
  const d = normalizeDot(dot);
  if (!d) return [];
  const json = await getJson(`/carriers/${encodeURIComponent(d)}/authority`);
  return Array.isArray(json?.content) ? json.content : [];
}

// One-shot lookup: takes either MC or DOT, returns the raw carrier + authority list.
// Always tries to fill in the other identifier when only one was supplied.
export async function lookupCarrier({ mc, dot }) {
  let carrier = null;
  if (dot) {
    carrier = await fetchByDot(dot);
  } else if (mc) {
    carrier = await fetchByMc(mc);
  }
  if (!carrier) return { carrier: null, authority: [] };

  const resolvedDot = carrier.dotNumber ? String(carrier.dotNumber) : null;
  const authority = resolvedDot ? await fetchAuthority(resolvedDot) : [];
  return { carrier, authority };
}
