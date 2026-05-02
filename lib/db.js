// Neon Postgres client. Uses the HTTP-based serverless driver so it works
// in Next.js route handlers (Node and Edge runtimes) without connection pooling.
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url && typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  // Soft warning rather than throw — module still loads in environments where
  // env vars haven't been wired up yet (e.g. running `next build` in CI).
  console.warn("[lib/db] DATABASE_URL not set");
}

export const sql = url ? neon(url) : null;

// ── fmcsa_cache helpers ─────────────────────────────────────────────────────

export async function readCache({ mc, dot, source }) {
  if (!sql) return null;
  // Match either MC or DOT (whichever was provided), most-recent-first.
  // Branch on which key is supplied so each query has only the relevant predicates.
  let rows;
  if (mc) {
    rows = await sql`
      SELECT parsed_json, last_checked
        FROM fmcsa_cache
       WHERE source = ${source} AND mc = ${mc}
       ORDER BY last_checked DESC
       LIMIT 1
    `;
  } else if (dot) {
    rows = await sql`
      SELECT parsed_json, last_checked
        FROM fmcsa_cache
       WHERE source = ${source} AND dot = ${dot}
       ORDER BY last_checked DESC
       LIMIT 1
    `;
  } else {
    return null;
  }
  return rows[0] ?? null;
}

export async function writeCache({ mc, dot, source, parsed, rawHtml = null }) {
  if (!sql) return;
  await sql`
    INSERT INTO fmcsa_cache (mc, dot, source, parsed_json, raw_html)
    VALUES (${mc ?? null}, ${dot ?? null}, ${source}, ${parsed}, ${rawHtml})
  `;
}

// ── broker_claims helpers ───────────────────────────────────────────────────

export async function readClaim({ mc }) {
  if (!sql || !mc) return null;
  const rows = await sql`
    SELECT mc, status, affiliation, claimed_by,
           display_phone, display_email, display_website,
           bio, specialties,
           carrier_network_size, years_in_business,
           verified_at
      FROM broker_claims
     WHERE mc = ${mc}
     LIMIT 1
  `;
  return rows[0] ?? null;
}

// Insert OR overwrite a pending claim. If a verified claim already exists for
// this MC, the insert is rejected — verified claims should only change via admin
// SQL, not through public submissions.
export async function createPendingClaim({
  mc, affiliation, claimedBy, submittedEmail, submittedIp,
  displayPhone, displayEmail, displayWebsite, bio, specialties,
  carrierNetworkSize, yearsInBusiness,
}) {
  if (!sql) throw new Error("DB not configured");
  // Block if a verified claim is already on this MC.
  const [existing] = await sql`
    SELECT status FROM broker_claims WHERE mc = ${mc} LIMIT 1
  `;
  if (existing && existing.status === "verified") {
    return { ok: false, reason: "already_verified" };
  }
  await sql`
    INSERT INTO broker_claims (
      mc, status, affiliation, claimed_by,
      submitted_email, submitted_ip,
      display_phone, display_email, display_website,
      bio, specialties, carrier_network_size, years_in_business
    ) VALUES (
      ${mc}, 'pending', ${affiliation}, ${claimedBy},
      ${submittedEmail}, ${submittedIp},
      ${displayPhone}, ${displayEmail}, ${displayWebsite},
      ${bio}, ${specialties}, ${carrierNetworkSize}, ${yearsInBusiness}
    )
    ON CONFLICT (mc) DO UPDATE SET
      status               = 'pending',
      affiliation          = EXCLUDED.affiliation,
      claimed_by           = EXCLUDED.claimed_by,
      submitted_email      = EXCLUDED.submitted_email,
      submitted_ip         = EXCLUDED.submitted_ip,
      display_phone        = EXCLUDED.display_phone,
      display_email        = EXCLUDED.display_email,
      display_website      = EXCLUDED.display_website,
      bio                  = EXCLUDED.bio,
      specialties          = EXCLUDED.specialties,
      carrier_network_size = EXCLUDED.carrier_network_size,
      years_in_business    = EXCLUDED.years_in_business,
      updated_at           = now()
  `;
  return { ok: true };
}

// Confirm broker exists (used to validate a claim submission).
export async function brokerExists(mc) {
  if (!sql || !mc) return false;
  const rows = await sql`SELECT 1 FROM brokers WHERE mc = ${mc} LIMIT 1`;
  return rows.length > 0;
}

// ── brokers table search ────────────────────────────────────────────────────

// Paginated search across the bulk-imported brokers list. LEFT JOINs claim status
// so callers can render the CLAIMED badge inline.
export async function searchBrokers({
  q = null,                  // free-text: name / dba / mc / dot / city / state
  state = null,              // 2-letter state code filter
  bonded = null,             // true = bond_on_file = 'Y'
  claimed = null,            // true = has verified claim
  flagged = null,            // true = broker_stat <> 'A'
  page = 1,
  pageSize = 50,
  sort = "mc",               // 'mc' | 'name' | 'state'
} = {}) {
  if (!sql) return { rows: [], total: 0, page, pageSize };
  const limit = Math.min(Math.max(1, pageSize), 200);
  const offset = Math.max(0, (page - 1) * limit);

  // Numeric q gets matched as exact MC or DOT; alpha q matches name/dba/city.
  const qDigits = q && /^\d+$/.test(q.trim()) ? q.trim() : null;
  const qText = q && !qDigits ? q.trim() : null;
  const qState = state ? state.trim().toUpperCase() : null;

  const orderBy = sort === "name" ? "b.legal_name ASC NULLS LAST"
                : sort === "state" ? "b.state ASC NULLS LAST, b.legal_name ASC"
                : "b.mc::bigint ASC";

  // Run filtered + count queries in parallel.
  const [rows, [{ count }]] = await Promise.all([
    sql.query(`
      SELECT
        b.mc, b.dot, b.legal_name, b.dba_name, b.address, b.city, b.state, b.zip, b.phone,
        b.broker_stat, b.bond_on_file, b.bipd_on_file, b.cargo_on_file, b.mcs150_date,
        c.status AS claim_status, c.affiliation AS claim_affiliation
      FROM brokers b
      LEFT JOIN broker_claims c ON c.mc = b.mc
      WHERE 1=1
        AND ($1::text IS NULL OR b.mc = $1::text OR b.dot = $1::text)
        AND ($2::text IS NULL OR (
          LOWER(b.legal_name) LIKE '%'||LOWER($2::text)||'%'
          OR LOWER(b.dba_name) LIKE '%'||LOWER($2::text)||'%'
          OR LOWER(b.city)    LIKE '%'||LOWER($2::text)||'%'
        ))
        AND ($3::text    IS NULL OR b.state = $3::text)
        AND ($4::boolean IS NULL OR ($4::boolean = TRUE AND b.bond_on_file = 'Y'))
        AND ($5::boolean IS NULL OR ($5::boolean = TRUE AND c.status = 'verified'))
        AND ($6::boolean IS NULL OR ($6::boolean = TRUE AND b.broker_stat <> 'A'))
      ORDER BY ${orderBy}
      LIMIT $7 OFFSET $8
    `, [qDigits, qText, qState, bonded, claimed, flagged, limit, offset]),
    sql.query(`
      SELECT count(*)::int AS count
      FROM brokers b
      LEFT JOIN broker_claims c ON c.mc = b.mc
      WHERE 1=1
        AND ($1::text IS NULL OR b.mc = $1::text OR b.dot = $1::text)
        AND ($2::text IS NULL OR (
          LOWER(b.legal_name) LIKE '%'||LOWER($2::text)||'%'
          OR LOWER(b.dba_name) LIKE '%'||LOWER($2::text)||'%'
          OR LOWER(b.city)    LIKE '%'||LOWER($2::text)||'%'
        ))
        AND ($3::text    IS NULL OR b.state = $3::text)
        AND ($4::boolean IS NULL OR ($4::boolean = TRUE AND b.bond_on_file = 'Y'))
        AND ($5::boolean IS NULL OR ($5::boolean = TRUE AND c.status = 'verified'))
        AND ($6::boolean IS NULL OR ($6::boolean = TRUE AND b.broker_stat <> 'A'))
    `, [qDigits, qText, qState, bonded, claimed, flagged]),
  ]);
  return { rows, total: count, page, pageSize: limit };
}

// Real registry stats — pulled from the actual tables, no fabrications.
export async function getRegistryStats() {
  if (!sql) {
    return { total_brokers: 0, with_bond_on_file: 0, claimed_verified: 0, claimed_pending: 0, last_imported_at: null };
  }
  const [stats] = await sql`
    SELECT
      (SELECT count(*) FROM brokers)                                               AS total_brokers,
      (SELECT count(*) FROM brokers WHERE bond_on_file = 'Y')                      AS with_bond_on_file,
      (SELECT count(*) FROM brokers WHERE broker_stat = 'A')                       AS active_authority,
      (SELECT count(*) FROM broker_claims WHERE status = 'verified')               AS claimed_verified,
      (SELECT count(*) FROM broker_claims WHERE status = 'pending')                AS claimed_pending,
      (SELECT max(updated_at) FROM brokers)                                        AS last_imported_at
  `;
  return stats;
}

// ── internal_flags helpers ──────────────────────────────────────────────────

export async function readInternalFlags({ mc, dot }) {
  if (!sql) return [];
  return await sql`
    SELECT id, mc, dot, reason, severity, source, created_by, created_at
      FROM internal_flags
     WHERE ( ${mc ?? null}::text IS NOT NULL  AND mc  = ${mc ?? null}::text )
        OR ( ${dot ?? null}::text IS NOT NULL AND dot = ${dot ?? null}::text )
     ORDER BY created_at DESC
  `;
}
