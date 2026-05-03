// Curated seed list of brokers worth indexing for brand-name search traffic.
//
// Rule for inclusion: people actually search "[name] reviews", "[name] complaints",
// or "is [name] legit". If no one searches a name, the page should stay noindex'd.
//
// Every entry below was verified live against FMCSA QCMobile (active broker
// authority + $75k bond on file) before being added. Re-verify quarterly because
// MCs can be revoked, transferred, or have bonds lapse.
//
// Canonical name = the BRAND name people search (NOT the legal name on file).
//   "uShip" — not "USHIP CONCIERGE LLC"
//   "Montway Auto Transport" — not "MONTWAY LLC"
// Slug is computed from this canonical name + MC suffix to guarantee uniqueness.

export const NOTABLE_BROKERS = {
  // ── Tier 2A · High-volume national ──────────────────────────────────────
  "611862":  { name: "Montway Auto Transport",         tier: "2A" },
  "1555035": { name: "Sherpa Auto Transport",          tier: "2A" },
  "1687799": { name: "AmeriFreight",                   tier: "2A" },
  "103888":  { name: "Easy Auto Ship",                 tier: "2A" },
  "873392":  { name: "SGT Auto Transport",             tier: "2A" },
  "647319":  { name: "Mercury Auto Transport",         tier: "2A" },
  "89820":   { name: "RoadRunner Auto Transport",      tier: "2A" },
  "973139":  { name: "uShip",                          tier: "2A" },
  "933173":  { name: "Nexus Auto Transport",           tier: "2A" },

  // ── Tier 2B · Mid-tier ──────────────────────────────────────────────────
  "600908":  { name: "AutoStar Transport Express",     tier: "2B" },
  "632461":  { name: "Ship a Car Direct",              tier: "2B" },
  "578938":  { name: "National Auto Shipping",         tier: "2B" },
  "1276929": { name: "Pride Car Shipping",             tier: "2B" },
  "1577361": { name: "Direct Connect Auto Transport",  tier: "2B" },
  "873248":  { name: "MoveWheels",                     tier: "2B" },

  // ── Tier 2C · Complaint-driven brand searches ───────────────────────────
  "1388861": { name: "Safe Auto Trucking",             tier: "2C" },
  "658640":  { name: "Global Auto Transportation",     tier: "2C" },
  "724477":  { name: "Ultimate Transport 123",         tier: "2C" },
  "1115582": { name: "Sonic Auto Transportation",      tier: "2C" },
  "656874":  { name: "Elite Auto Shipping",            tier: "2C" },
  "1652375": { name: "Rapid Auto Shipping",            tier: "2C" },
  "1070277": { name: "Car Shipping Carriers",          tier: "2C" },

  // ── Operator-affiliated (also already a verified claim) ─────────────────
  "1675078": { name: "GMF Auto Transport",             tier: "operator" },
};

// Look up the curated brand name for an MC. Returns null if not in the list.
export function getNotableName(mc) {
  if (!mc) return null;
  const bare = String(mc).replace(/^MC-?/i, "").replace(/[^\d]/g, "");
  return NOTABLE_BROKERS[bare]?.name ?? null;
}

// Tier label, used by sitemap priority + page badging.
export function getNotableTier(mc) {
  if (!mc) return null;
  const bare = String(mc).replace(/^MC-?/i, "").replace(/[^\d]/g, "");
  return NOTABLE_BROKERS[bare]?.tier ?? null;
}

// Returns true when this MC should be indexed by Google (notable + bonded), even
// if no claim exists. The page itself still verifies live FMCSA before rendering.
export function isIndexable(mc) {
  return !!getNotableName(mc);
}

// Convert any string to a clean URL slug. Strips common business suffixes
// (LLC, INC, CORP, etc.) so "MONTWAY LLC" → "montway" not "montway-llc".
export function slugifyName(name) {
  if (!name) return "";
  return String(name)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")               // strip accents
    .replace(/[\.,'"!?&#]/g, "")                   // strip punctuation
    .replace(/\b(LLC|L\.?L\.?C\.?|INC|CORP|CO|COMPANY|GROUP|HOLDINGS|LIMITED|LTD)\b/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Pick the best name to use for the URL slug. Order of preference:
//   1. Curated NOTABLE_BROKERS entry (brand name people search)
//   2. DBA name (consumer-facing trade name from MCS-150)
//   3. Legal name (FMCSA registration)
export function canonicalNameForBroker({ mc, legal_name, dba_name }) {
  return getNotableName(mc) || dba_name || legal_name || `MC-${mc}`;
}

// Build the canonical slug for any broker. Always ends in -mc-{digits} so the
// slug is unique even if two brokers share a name.
export function buildBrokerSlug({ mc, legal_name, dba_name }) {
  const bare = String(mc || "").replace(/^MC-?/i, "").replace(/[^\d]/g, "");
  if (!bare) return null;
  const namePart = slugifyName(canonicalNameForBroker({ mc: bare, legal_name, dba_name }));
  return namePart ? `${namePart}-mc-${bare}` : `mc-${bare}`;
}

// Reverse: extract the bare MC digits from any /brokers/ URL segment.
// Handles every shape: "MC-1675078", "MC1675078", "1675078",
// "uship-mc-973139", "anything-mc-12345-and-trailing".
export function extractMcFromSlug(input) {
  if (!input) return null;
  const s = String(input);
  // Try the slug pattern first ("…-mc-DIGITS" anywhere)
  const slugMatch = s.match(/(?:^|[^a-z0-9])mc[-_]?(\d+)/i);
  if (slugMatch) return slugMatch[1];
  // Then plain "MC-DIGITS" prefix
  const mcMatch = s.match(/^mc[-_]?(\d+)$/i);
  if (mcMatch) return mcMatch[1];
  // Then bare digits
  const digits = s.replace(/[^\d]/g, "");
  return digits || null;
}
