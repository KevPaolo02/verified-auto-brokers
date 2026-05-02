// Client-side session + attribution helpers.
//
// Every funnel page persists a session_id in sessionStorage. That ID accompanies
// every track / lead event so we can stitch a user's journey together in the CRM
// without cookies or cross-domain trackers.
//
// Attribution surface for the CRM:
//   source_domain      — current host (location.hostname)
//   origin_domain      — explicit ?origin= override (used when this page is hit
//                        via a redirect from a route-specific domain)
//   referrer_origin    — hostname of document.referrer if present
//   attribution_source — how we figured out origin_domain: 'param' | 'hostname'

const SESSION_KEY = "vab_session_id";

export function getSessionId() {
  if (typeof window === "undefined") return null;
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (id) return id;
    id = (window.crypto && window.crypto.randomUUID)
      ? window.crypto.randomUUID()
      : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return null;
  }
}

export function getSourceDomain() {
  if (typeof window === "undefined") return null;
  try { return window.location.hostname; } catch { return null; }
}

// Resolve attribution: ?origin= wins (it's the explicit signal from a route-specific
// landing page). Falls back to current hostname if no override.
export function getAttribution() {
  if (typeof window === "undefined") {
    return { origin_domain: null, attribution_source: null, referrer_origin: null };
  }
  try {
    const url = new URL(window.location.href);
    const explicit = url.searchParams.get("origin");
    const referrer_origin = (() => {
      try {
        if (!document.referrer) return null;
        return new URL(document.referrer).hostname || null;
      } catch { return null; }
    })();
    return {
      origin_domain: explicit || window.location.hostname,
      attribution_source: explicit ? "param" : "hostname",
      referrer_origin,
    };
  } catch {
    return { origin_domain: null, attribution_source: null, referrer_origin: null };
  }
}

export function getUtm() {
  if (typeof window === "undefined") return {};
  try {
    const url = new URL(window.location.href);
    const utm = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"]) {
      const v = url.searchParams.get(k);
      if (v) utm[k] = v;
    }
    return utm;
  } catch {
    return {};
  }
}
