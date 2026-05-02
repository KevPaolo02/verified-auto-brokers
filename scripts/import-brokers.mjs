// Bulk-import all active property brokers from FMCSA Socrata into the local
// `brokers` table.
//
// Sources:
//   6eyk-hxee  Carrier - All With History — authority status by docket
//   az4n-8mr2  Company Census File         — name, address, phone (joined by DOT)
//
// Usage:
//   node scripts/import-brokers.mjs                  # full import
//   node scripts/import-brokers.mjs --limit=200      # smoke test with first N rows
//   node scripts/import-brokers.mjs --dry            # fetch + summarize, don't write
//
// Idempotent: uses INSERT … ON CONFLICT (mc) DO UPDATE so re-running upserts.

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// ── env loader ──────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }

// ── args ────────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  })
);
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const DRY = !!args.dry;

// ── helpers ─────────────────────────────────────────────────────────────────
const SOCRATA = "https://data.transportation.gov/resource";
const PAGE_SIZE = 1000;       // 6eyk-hxee fetch batch
const JOIN_BATCH = 100;       // dot IN(...) batch for az4n-8mr2

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return await res.json();
}

// "MC009153" → "9153"  ;  "MC1302755" → "1302755"
function canonMc(docket) {
  if (!docket) return null;
  const digits = String(docket).replace(/^MC-?/i, "").replace(/^0+/, "");
  return digits || null;
}
// "00107080" → "107080"  ;  "2239574" → "2239574"
function canonDot(d) {
  if (d == null) return null;
  const s = String(d).replace(/[^\d]/g, "").replace(/^0+/, "");
  return s || null;
}
// "20260204 0641" → "2026-02-04"
function parseMcs150Date(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

// Fetch a page of active *Property* brokers (broker_stat=A, MC dockets only).
// Skipping FF/MX dockets — those are freight forwarders and Mexican carriers,
// which can technically hold broker authority but aren't what shippers searching
// "auto brokers" expect. Add later if needed.
async function fetchBrokerPage(offset) {
  const where = encodeURIComponent("starts_with(docket_number, 'MC')");
  const u = `${SOCRATA}/6eyk-hxee.json?broker_stat=A&$where=${where}&$limit=${PAGE_SIZE}&$offset=${offset}&$order=docket_number`;
  return await getJson(u);
}

// Fetch census rows for a list of (un-padded) DOT numbers.
async function fetchCensusForDots(dots) {
  if (!dots.length) return [];
  // Quoted, comma-joined: '107080','2239574',…
  const inList = dots.map((d) => `'${d}'`).join(",");
  const u = `${SOCRATA}/az4n-8mr2.json?$where=${encodeURIComponent(`dot_number in (${inList})`)}&$limit=${dots.length}`;
  return await getJson(u);
}

// ── upsert ──────────────────────────────────────────────────────────────────
const sql = neon(url);

// Batch upsert via UNNEST — one round-trip per page (~1000 rows).
// Each column becomes a parallel array; UNNEST(...) produces a row set we INSERT from.
async function upsertBatch(rows) {
  if (!rows.length || DRY) return;
  const cols = [
    "mc", "dot", "legal_name", "dba_name", "address", "city", "state", "zip", "phone",
    "broker_stat", "common_stat", "contract_stat",
    "bond_required", "bond_on_file", "bipd_on_file", "cargo_on_file",
    "mcs150_date",
  ];
  // Build parallel arrays.
  const arrays = cols.map((c) => rows.map((r) => r[c] ?? null));
  // mcs150_date is DATE; everything else is TEXT.
  const types = cols.map((c) => (c === "mcs150_date" ? "date[]" : "text[]"));
  const params = arrays.map((_, i) => `$${i + 1}::${types[i]}`).join(", ");
  const colList = cols.join(", ");
  const updates = cols
    .filter((c) => c !== "mc")
    .map((c) => `${c} = EXCLUDED.${c}`)
    .concat("updated_at = now()")
    .join(",\n        ");

  const stmt = `
    INSERT INTO brokers (${colList}, updated_at)
    SELECT *, now() FROM UNNEST(${params}) AS t(${colList})
    ON CONFLICT (mc) DO UPDATE SET
        ${updates}
  `;
  await sql.query(stmt, arrays);
}

// ── main ────────────────────────────────────────────────────────────────────
const t0 = Date.now();
console.log(`Importing active brokers${DRY ? " (DRY RUN)" : ""}, limit=${LIMIT === Infinity ? "all" : LIMIT}`);

let totalProcessed = 0;
let offset = 0;

while (totalProcessed < LIMIT) {
  const page = await fetchBrokerPage(offset);
  if (!page.length) break;

  // Filter for valid rows + apply user limit.
  const remaining = LIMIT - totalProcessed;
  const slice = page.slice(0, Math.min(page.length, remaining));

  // Build a DOT list for the JOIN batches.
  const dots = [...new Set(slice.map((r) => canonDot(r.dot_number)).filter(Boolean))];

  const censusByDot = new Map();
  for (let i = 0; i < dots.length; i += JOIN_BATCH) {
    const chunk = dots.slice(i, i + JOIN_BATCH);
    const census = await fetchCensusForDots(chunk);
    for (const c of census) {
      censusByDot.set(canonDot(c.dot_number), c);
    }
  }

  // Merge.
  const merged = slice.map((b) => {
    const c = censusByDot.get(canonDot(b.dot_number)) ?? {};
    return {
      mc:            canonMc(b.docket_number),
      dot:           canonDot(b.dot_number),
      legal_name:    c.legal_name ?? null,
      dba_name:      c.dba_name ?? null,
      address:       c.phy_street ?? null,
      city:          c.phy_city ?? null,
      state:         c.phy_state ?? null,
      zip:           c.phy_zip ?? null,
      phone:         c.phone ?? null,
      broker_stat:   b.broker_stat ?? null,
      common_stat:   b.common_stat ?? null,
      contract_stat: b.contract_stat ?? null,
      bond_required: b.bond_req ?? null,
      bond_on_file:  b.bond_file ?? null,
      bipd_on_file:  b.bipd_file ?? null,
      cargo_on_file: b.cargo_file ?? null,
      mcs150_date:   parseMcs150Date(c.mcs150_date),
    };
  }).filter((r) => r.mc);

  await upsertBatch(merged);

  totalProcessed += slice.length;
  offset += page.length;
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  +${slice.length}  (total ${totalProcessed}, joined ${censusByDot.size}/${dots.length}, ${elapsed}s)`);

  if (page.length < PAGE_SIZE) break; // last page
}

console.log(`Done: ${totalProcessed} brokers in ${((Date.now() - t0) / 1000).toFixed(1)}s${DRY ? " (no rows written)" : ""}`);
