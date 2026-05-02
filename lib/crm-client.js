// Browser-side wrapper for the GMF CRM public endpoints.
//
// Confirmed contracts (live, verified 2026-05-01):
//
//   POST /api/public/track
//     body: { event_type, source_domain, route_key, session_id, metadata }
//     200:  { success: true }
//
//   POST /api/public/price-estimate
//     body: { pickup_zip, delivery_zip, transport_type, vehicle_type? }
//     200:  { distance_miles, transport_type, currency,
//             price: { center, low, high },
//             breakdown: { rate_per_mile, base_price, ... } }
//
//   POST /api/public/sms-capture
//     body: { phone, session_id, route_key, source_domain, consent_text, ... }
//     (returns 500 in current backend with test data — schema may change)
//
//   POST /api/crm/leads
//     Returns 403 from public — server-side only. NOT called from browser.
//     If we need lead submission from the funnel, route through /sms-capture
//     or build a server-side proxy with auth.
//
// All requests go to /api/gmf/* (proxied to www.gmfautotransport.com via
// next.config.mjs rewrite), so the browser sees same-origin and CORS doesn't apply.

import { getSessionId, getSourceDomain, getAttribution, getUtm } from "./session";

const BASE = "/api/gmf";
const DEV = typeof process !== "undefined" && process.env.NODE_ENV !== "production";

function devLog(label, payload, response) {
  if (!DEV || typeof window === "undefined") return;
  // Concise, collapsible group so dev console isn't noisy.
  console.groupCollapsed(`[crm] ${label}`);
  console.log("payload:", payload);
  if (response !== undefined) console.log("response:", response);
  console.groupEnd();
}

async function postJson(path, body) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true, // lets track() events fire on page-unload too
    });
    let data = null;
    try { data = await res.json(); } catch { /* may be empty */ }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, error: String(err.message ?? err), data: null };
  }
}

// ── /api/public/track ──────────────────────────────────────────────────────
//
// event_type values used by the funnel:
//   'visit'                    — page load
//   'redirect_to_calculator'   — user submitted the ZIP estimate form
//   'call_click'               — user clicked a tel: link or SMS button
//   'hero_cta_click'           — user clicked a hero CTA
//
export async function track(event_type, route_key = null, metadata = {}) {
  const attr = getAttribution();
  const utm = getUtm();
  const payload = {
    event_type,
    source_domain: getSourceDomain(),
    route_key,
    session_id: getSessionId(),
    metadata: {
      origin_domain: attr.origin_domain,
      attribution_source: attr.attribution_source,
      referrer_origin: attr.referrer_origin,
      ...utm,
      ...metadata,
    },
  };
  const result = await postJson("/public/track", payload);
  devLog(`track ${event_type}`, payload, result);
  return result;
}

// ── /api/public/price-estimate ─────────────────────────────────────────────
//
// Returns { low, high, center, distance_miles, breakdown } on success, null otherwise.
// The CRM doesn't return transit days — caller fills that in from route config.
//
export async function priceEstimate({ pickup_zip, delivery_zip, vehicle_type = null, transport_type = "open" }) {
  const payload = { pickup_zip, delivery_zip, transport_type, vehicle_type };
  try {
    const res = await fetch(`${BASE}/public/price-estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      devLog("priceEstimate (failed)", payload, { status: res.status });
      return null;
    }
    const data = await res.json();
    devLog("priceEstimate", payload, data);
    // Normalize to a flat shape the UI consumes.
    if (data?.price && (data.price.low != null || data.price.high != null)) {
      return {
        low: data.price.low,
        high: data.price.high,
        center: data.price.center,
        distance_miles: data.distance_miles,
        breakdown: data.breakdown,
      };
    }
    return null;
  } catch (err) {
    devLog("priceEstimate (error)", payload, { error: String(err) });
    return null;
  }
}

// ── /api/public/sms-capture ────────────────────────────────────────────────
//
// Field-name discovery against the live endpoint:
//   `phone_number` → 400 "A valid US phone number is required"  (wrong field name)
//   `phone`        → 500 "Could not create lead"                (correct field, downstream failure)
// So the field name IS `phone`; the 500 happens after validation. Likely a missing
// required field or a backend bug. Endpoint is also IP-rate-limited tightly
// (~few requests per several minutes), making contract iteration painful.
//
// We send a maximalist payload: every field the CRM is plausibly expecting. If
// the backend ignores extras, that's fine; if it requires one we're missing,
// add it here and route-funnel.jsx automatically picks it up.
export async function smsCapture({
  phone,
  route_key = null,
  consent_text,
  // Optional — if the user has already filled in the ZIP form, pass these too.
  pickup_zip = null,
  delivery_zip = null,
  transport_type = null,
  // Optional — name/email if collected.
  name = null,
  email = null,
} = {}) {
  const attr = getAttribution();
  const utm = getUtm();
  const payload = {
    // Core lead fields (best guesses at required).
    phone,
    name,
    email,
    pickup_zip,
    delivery_zip,
    transport_type,
    // Identity / attribution.
    session_id: getSessionId(),
    source_domain: getSourceDomain(),
    origin_domain: attr.origin_domain,
    attribution_source: attr.attribution_source,
    referrer_origin: attr.referrer_origin,
    route_key,
    // TCPA — capture both the text and when consent was given.
    consent_text,
    consent_timestamp: new Date().toISOString(),
    // Backend may use this to route SMS-only leads vs full leads.
    phone_only: !email && !name,
    lead_source: "funnel_sms",
    ...utm,
  };
  const result = await postJson("/public/sms-capture", payload);
  devLog("smsCapture", payload, result);
  return result;
}

// /api/crm/leads is server-only (returns 403 from browser). If the funnel needs
// to submit a full lead, route through sms-capture or add an authenticated
// server-side proxy. Intentionally not exposed here.
