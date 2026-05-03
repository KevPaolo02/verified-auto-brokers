// Server-rendered per-broker page at /brokers/MC-1675078
//
// SEO strategy:
//   - Verified-claimed brokers     → fully indexed; full bio + specialties + claim disclosure
//   - Unclaimed brokers (FMCSA only) → page still works, but `noindex` so Google doesn't
//     get 24,992 thin pages of FMCSA data already on FMCSA.gov
//   - Unknown MC                    → 404
//
// All data is fetched server-side: live FMCSA + Socrata via our normalize pipeline,
// claim from broker_claims. Page is SEO-friendly out of the box (no client fetch needed).

import Link from "next/link";
import { notFound } from "next/navigation";
import { lookupCarrier } from "@/lib/fmcsa/qcmobile";
import { fetchActiveFilings } from "@/lib/fmcsa/socrata";
import { normalizeFmcsaBroker } from "@/lib/fmcsa/normalize";
import { sql, readClaim, readInternalFlags } from "@/lib/db";
import { BROKER as VAB_BROKER } from "@/lib/broker-info";
import { buildMetadata, brokerUrl } from "@/lib/seo";

// Strip "MC-" / "MC" prefix and leading zeros so "/brokers/MC-1675078",
// "/brokers/MC1675078", and "/brokers/1675078" all resolve to the same record.
function canonMc(raw: string): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/^MC-?/i, "").replace(/[^\d]/g, "");
  return digits || null;
}

async function loadBroker(mc: string) {
  if (!sql) return null;
  // Confirm the broker exists in our bulk registry — gates the page so randoms
  // can't fabricate URLs that hammer FMCSA.
  const rows = await sql`
    SELECT mc, dot, legal_name, dba_name, address, city, state, zip, phone,
           broker_stat, bond_on_file
      FROM brokers
     WHERE mc = ${mc}
     LIMIT 1
  `;
  return rows[0] ?? null;
}

// ── metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { mc: string } }) {
  const mc = canonMc(params.mc);
  if (!mc) return { title: "Broker not found" };

  const row = await loadBroker(mc);
  if (!row) return { title: "Broker not found", robots: { index: false, follow: false } };

  const claim = await readClaim({ mc });
  const verified = claim?.status === "verified";
  const name = row.legal_name || row.dba_name || `MC-${mc}`;
  const cityState = [row.city, row.state].filter(Boolean).join(", ");

  return buildMetadata({
    title: `${name} (MC-${mc}) — Auto Transport Broker · Verified Auto Brokers`,
    description: verified && claim?.bio
      ? `${name} — ${claim.bio.slice(0, 160)}`
      : `${name} is a licensed FMCSA auto-transport broker (MC-${mc}, DOT-${row.dot}) based in ${cityState}. Authority status: ${row.broker_stat === "A" ? "Active" : "Inactive"}. Bond on file: ${row.bond_on_file === "Y" ? "Yes" : "No"}.`,
    path: `/brokers/MC-${mc}`,
    noIndex: !verified, // unclaimed brokers stay out of the index
  });
}

export default async function BrokerPage({ params }: { params: { mc: string } }) {
  const mc = canonMc(params.mc);
  if (!mc) notFound();

  const row = await loadBroker(mc);
  if (!row) notFound();

  // Fan out: live FMCSA carrier + active insurance filings + claim + internal flags.
  // Each is wrapped so a single upstream failure doesn't take the whole page down.
  const [carrierResult, filingsResult, claim, flags] = await Promise.all([
    lookupCarrier({ mc, dot: row.dot }).catch(() => ({ carrier: null, authority: [] })),
    fetchActiveFilings({ mc, dot: row.dot }).catch(() => []),
    readClaim({ mc }).catch(() => null),
    readInternalFlags({ mc, dot: row.dot }).catch(() => []),
  ]);

  // Normalize live data into our broker shape; fall back to the bulk-row info
  // if FMCSA lookup failed.
  const normalized = carrierResult?.carrier
    ? normalizeFmcsaBroker(carrierResult, filingsResult, flags, { mc, dot: row.dot })
    : null;

  const display = {
    name: normalized?.name || row.legal_name || row.dba_name || `MC-${mc}`,
    dba: normalized?.dba ?? row.dba_name,
    city: normalized?.city || row.city,
    state: normalized?.state || row.state,
    address: normalized?.address || row.address || "",
    phone: claim?.display_phone || row.phone,
    email: claim?.display_email || null,
    website: claim?.display_website || null,
    auth_status: normalized?.auth_status || (row.broker_stat === "A" ? "ACTIVE" : "INACTIVE"),
    bond: normalized?.bond || { status: row.bond_on_file === "Y" ? "ACTIVE" : "UNKNOWN", amount: null, provider: null },
    insurance: normalized?.insurance || { provider: null, liability: 0, cargo: 0 },
    bio: claim?.bio,
    specialties: claim?.specialties || [],
    fleet_partners: claim?.carrier_network_size ?? null,
    years: claim?.years_in_business ?? null,
    flagged: normalized?.flagged ?? row.broker_stat !== "A",
    flag_reason: normalized?.flag_reason,
  };

  const isClaimed = claim?.status === "verified";
  const isOperator = claim?.affiliation === "operator";

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Top disclosure bar — always carries broker MC/DOT per FMCSA 49 CFR 371 */}
      <div style={{
        background: "var(--navy)", color: "var(--paper)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: "0.1em", padding: "6px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 24, textTransform: "uppercase" }}>
          <Link href="/" style={{ color: "var(--paper)", textDecoration: "none" }}>← VERIFIED AUTO BROKERS</Link>
          <span style={{ opacity: 0.7 }}>FMCSA PUBLIC RECORD</span>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Header band */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          background: display.flagged ? "var(--red)" : "var(--ink)",
          color: "var(--paper)", padding: "10px 22px",
          fontFamily: "'JetBrains Mono'", fontSize: 10.5,
          letterSpacing: "0.16em", textTransform: "uppercase",
          marginBottom: 0,
        }}>
          <span>FILE · MC-{mc} / DOT-{row.dot}</span>
          <span>FMCSA · AUTH {display.auth_status}</span>
        </div>

        <div style={{
          padding: "36px 36px 32px",
          border: "1.5px solid var(--ink)", borderTop: "none",
          background: "var(--paper)",
        }}>
          {/* Eyebrow */}
          <div style={{
            fontFamily: "'JetBrains Mono'", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--muted)", fontWeight: 500,
          }}>
            Operating Authority · {display.auth_status === "ACTIVE" ? "Active" : display.auth_status}
          </div>

          {/* H1 — broker name */}
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.0,
            margin: "10px 0 6px", letterSpacing: "-0.02em",
            color: "var(--ink)", fontWeight: 400,
          }}>
            {display.name}
          </h1>

          <div style={{
            fontFamily: "'JetBrains Mono'", fontSize: 12, color: "var(--muted)",
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            {display.dba && display.dba !== display.name ? `d/b/a ${display.dba} · ` : ""}
            {[display.city, display.state].filter(Boolean).join(", ") || "—"}
          </div>

          {/* Status stamps */}
          <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center", flexWrap: "wrap" }}>
            <Stamp tone={display.flagged ? "flagged" : "verified"}>
              {display.flagged ? "⚠ FLAGGED" : "✓ FMCSA VERIFIED"}
            </Stamp>
            {display.bond.status === "ACTIVE" && (
              <Stamp tone="verified">
                BOND ACTIVE{display.bond.amount ? ` · $${display.bond.amount.toLocaleString()}` : ""}
              </Stamp>
            )}
            {display.bond.status === "LAPSED" && <Stamp tone="flagged">BOND LAPSED</Stamp>}
            {isClaimed && <Stamp tone="verified">◆ CLAIMED</Stamp>}
          </div>

          {/* Operator-affiliation disclosure (FTC 16 CFR Part 255) */}
          {isOperator && (
            <div style={{
              marginTop: 14, padding: "10px 14px",
              background: "var(--paper-deep)", border: "1px dashed var(--ink)",
              fontFamily: "'JetBrains Mono'", fontSize: 10.5, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--ink)", lineHeight: 1.5,
            }}>
              ⚠ DISCLOSURE · This broker is operated by Verified Auto Brokers. Affiliation disclosed per FTC 16 CFR Part 255.
            </div>
          )}

          {/* Unclaimed CTA */}
          {!isClaimed && row.broker_stat === "A" && (
            <div style={{ marginTop: 16 }}>
              <Link
                href={`/claim?mc=${mc}`}
                style={{
                  display: "inline-block",
                  fontFamily: "'JetBrains Mono'", fontSize: 11,
                  letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
                  padding: "8px 14px", border: "1.5px dashed var(--ink)",
                  color: "var(--ink)", textDecoration: "none", borderRadius: 2,
                }}
              >◇ Are you {display.name}? Claim this listing →</Link>
            </div>
          )}
        </div>

        {/* Body grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36, marginTop: 32 }}>
          {/* Left: synopsis + specialties */}
          <div>
            <Eyebrow>Synopsis</Eyebrow>
            {display.bio ? (
              <>
                <p style={{
                  fontFamily: "'Instrument Serif'", fontSize: 22, lineHeight: 1.4,
                  marginTop: 8, color: "var(--ink)",
                }}>{display.bio}</p>
                {claim?.verified_at && (
                  <div style={{
                    fontFamily: "'JetBrains Mono'", fontSize: 10, color: "var(--muted)",
                    letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 6,
                  }}>
                    ◆ Synopsis supplied by claimed owner · Verified {new Date(claim.verified_at).toISOString().slice(0, 10)}
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontFamily: "'Inter Tight'", fontSize: 14, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
                No bio submitted by this broker. <Link href={`/claim?mc=${mc}`} style={{ color: "var(--navy)", borderBottom: "1px dotted var(--navy)", textDecoration: "none" }}>Are you the owner?</Link>
              </p>
            )}

            {display.specialties.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Eyebrow>Specialties</Eyebrow>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  {display.specialties.map((s: string) => (
                    <span key={s} style={{
                      fontFamily: "'JetBrains Mono'", fontSize: 10.5,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      padding: "5px 10px", border: "1px solid var(--ink)", background: "var(--paper)",
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {display.website && (
              <div style={{ marginTop: 24 }}>
                <Eyebrow>Website</Eyebrow>
                <a href={display.website} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-block", marginTop: 8,
                  fontFamily: "'JetBrains Mono'", fontSize: 13, color: "var(--navy)",
                  borderBottom: "1px dotted var(--navy)", textDecoration: "none",
                }}>{display.website} ↗</a>
              </div>
            )}

            {/* Get a quote CTA — funnels into the route landing page if route is well-known,
                otherwise goes to a generic intake. We just send to /claim for now since
                the public quote flow isn't wired to CRM yet. */}
            {isClaimed && display.phone && (
              <div style={{ marginTop: 32, padding: "20px 22px", border: "1.5px solid var(--ink)", background: "var(--paper-deep)" }}>
                <Eyebrow>Contact this broker</Eyebrow>
                <div style={{ marginTop: 10, fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.5 }}>
                  <a href={`tel:${display.phone.replace(/[^\d+]/g, "")}`} style={{ color: "var(--ink)", fontWeight: 600, textDecoration: "none" }}>
                    📞 {display.phone}
                  </a>
                  {display.email && (
                    <>
                      {" · "}
                      <a href={`mailto:${display.email}`} style={{ color: "var(--ink)", textDecoration: "none", borderBottom: "1px dotted var(--ink)" }}>
                        {display.email}
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: hard data */}
          <aside>
            <Eyebrow>Public record</Eyebrow>
            <DataRow label="MC Docket" value={`MC-${mc}`} />
            <DataRow label="DOT Number" value={row.dot ? `DOT-${row.dot}` : "—"} />
            {(display.years ?? 0) > 0 && (
              <DataRow label="Years Active" value={`${display.years} years (self-reported)`} />
            )}
            {(display.fleet_partners ?? 0) > 0 && (
              <DataRow label="Carrier Network" value={`${display.fleet_partners.toLocaleString()} carriers (self-reported)`} />
            )}
            {(display.city || display.state) && (
              <DataRow label="HQ" value={[display.city, display.state].filter(Boolean).join(", ")} mono={false} />
            )}

            {display.bond.status === "ACTIVE" && (
              <div style={{ marginTop: 24 }}>
                <Eyebrow>Surety Bond — BMC-84</Eyebrow>
                {display.bond.amount && (
                  <div style={{
                    fontFamily: "'Instrument Serif'", fontSize: 36,
                    lineHeight: 1, marginTop: 6, color: "var(--ink)",
                  }}>${display.bond.amount.toLocaleString()}</div>
                )}
                {display.bond.provider && <DataRow label="Provider" value={display.bond.provider} />}
                <DataRow label="Status" value="ACTIVE" />
              </div>
            )}

            {/* Verify-on-FMCSA link — independent third-party check */}
            <div style={{ marginTop: 24 }}>
              <a
                href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  fontFamily: "'JetBrains Mono'", fontSize: 10.5,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--navy)", borderBottom: "1px dotted var(--navy)",
                  textDecoration: "none",
                }}
              >Verify on FMCSA SAFER ↗</a>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer with VAB broker disclosure */}
      <footer style={{ background: "var(--ink)", color: "var(--paper)", padding: "32px 24px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
            Verified Auto Brokers · {VAB_BROKER.mc_display} · {VAB_BROKER.dot_display} · {VAB_BROKER.address.full}
          </div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
            <Link href="/privacy" style={{ color: "var(--paper)", textDecoration: "none", marginRight: 16 }}>Privacy</Link>
            <Link href="/terms" style={{ color: "var(--paper)", textDecoration: "none" }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Inline micro-components (avoid re-importing the SPA's ones) ───────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
      letterSpacing: "0.18em", textTransform: "uppercase",
      color: "var(--ink)", fontWeight: 500,
    }}>{children}</div>
  );
}

function Stamp({ children, tone }: { children: React.ReactNode; tone: "verified" | "flagged" | "pending" }) {
  const palette = tone === "flagged"
    ? { bg: "var(--red)", fg: "#fff", border: "var(--red)" }
    : tone === "pending"
      ? { bg: "transparent", fg: "var(--amber-ink)", border: "var(--amber-ink)" }
      : { bg: "transparent", fg: "var(--navy)", border: "var(--navy)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
      letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600,
      padding: "5px 9px", border: `1.5px solid ${palette.border}`,
      background: palette.bg, color: palette.fg, borderRadius: 2,
    }}>{children}</span>
  );
}

function DataRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "180px 1fr",
      gap: 18, padding: "10px 0", borderBottom: "1px dashed var(--rule)",
    }}>
      <Eyebrow>{label}</Eyebrow>
      <div style={{
        fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter Tight'",
        fontSize: mono ? 13 : 14.5, color: "var(--ink)",
      }}>{value}</div>
    </div>
  );
}
