// Server-rendered per-broker page.
//
// URL handling — every shape resolves to the same canonical slug:
//   /brokers/MC-1675078                       → 301 → /brokers/gmf-auto-transport-mc-1675078
//   /brokers/1675078                          → 301 → /brokers/gmf-auto-transport-mc-1675078
//   /brokers/uship-concierge-llc-mc-973139    → 301 → /brokers/uship-mc-973139  (legal-name URL → brand canonical)
//   /brokers/uship-mc-973139                  → 200 (canonical, rendered)
//
// SEO indexing strategy:
//   - In NOTABLE_BROKERS list (curated brand-search targets)   → indexable
//   - Has a verified claim (broker-supplied bio / specialties) → indexable
//   - Otherwise (long-tail unclaimed)                          → noindex
//
// All data fetched server-side: live FMCSA + Socrata + claim + internal flags.

import Link from "next/link";
import { notFound, redirect, permanentRedirect } from "next/navigation";
import { lookupCarrier } from "@/lib/fmcsa/qcmobile";
import { fetchActiveFilings } from "@/lib/fmcsa/socrata";
import { normalizeFmcsaBroker } from "@/lib/fmcsa/normalize";
import { sql, readClaim, readInternalFlags } from "@/lib/db";
import { BROKER as VAB_BROKER } from "@/lib/broker-info";
import { buildMetadata } from "@/lib/seo";
import {
  buildBrokerSlug,
  canonicalNameForBroker,
  extractMcFromSlug,
  getNotableName,
  isIndexable as isNotable,
} from "@/lib/notable-brokers";

async function loadBroker(mc: string) {
  if (!sql) return null;
  const rows = await sql`
    SELECT mc, dot, legal_name, dba_name, address, city, state, zip, phone,
           broker_stat, bond_on_file
      FROM brokers
     WHERE mc = ${mc}
     LIMIT 1
  `;
  return rows[0] ?? null;
}

// Resolve URL → broker row + canonical slug. Caller decides what to do (render,
// redirect, 404).
async function resolveSlug(slugOrMc: string) {
  const mc = extractMcFromSlug(slugOrMc);
  if (!mc) return { found: false as const };
  const row = await loadBroker(mc);
  if (!row) return { found: false as const };
  const canonicalSlug = buildBrokerSlug({
    mc: row.mc,
    legal_name: row.legal_name,
    dba_name: row.dba_name,
  });
  return { found: true as const, mc: row.mc, row, canonicalSlug };
}

// ── metadata ──────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { mc: string } }) {
  const resolved = await resolveSlug(params.mc);
  if (!resolved.found) {
    return { title: "Broker not found", robots: { index: false, follow: false } };
  }

  const { mc, row } = resolved;
  const claim = await readClaim({ mc });
  const claimed = claim?.status === "verified";
  const indexable = claimed || isNotable(mc);

  const canonical = canonicalNameForBroker({
    mc: row.mc,
    legal_name: row.legal_name,
    dba_name: row.dba_name,
  });
  const cityState = [row.city, row.state].filter(Boolean).join(", ");

  return buildMetadata({
    title: `${canonical} (MC-${mc}) — FMCSA Verified Profile · Verified Auto Brokers`,
    description: claimed && claim?.bio
      ? `${canonical} (MC-${mc}) — ${claim.bio.slice(0, 150)}`
      : `Check ${canonical} (MC-${mc}, DOT-${row.dot}) — FMCSA broker authority status, $75K BMC-84 bond on file, and what people search about ${canonical} reviews and complaints. Independent registry.`,
    path: `/brokers/${resolved.canonicalSlug}`,
    noIndex: !indexable,
  });
}

export default async function BrokerPage({ params }: { params: { mc: string } }) {
  const resolved = await resolveSlug(params.mc);
  if (!resolved.found) notFound();

  const { mc, row, canonicalSlug } = resolved;

  // Canonical-URL enforcement: any incoming URL that doesn't already match the
  // canonical slug 301-redirects there. Critical for SEO consolidation.
  if (decodeURIComponent(params.mc) !== canonicalSlug) {
    permanentRedirect(`/brokers/${canonicalSlug}`);
  }

  // Fan out: live FMCSA + Socrata + claim + flags. Each call falls back gracefully.
  const [carrierResult, filingsResult, claim, flags] = await Promise.all([
    lookupCarrier({ mc, dot: row.dot }).catch(() => ({ carrier: null, authority: [] })),
    fetchActiveFilings({ mc, dot: row.dot }).catch(() => []),
    readClaim({ mc }).catch(() => null),
    readInternalFlags({ mc, dot: row.dot }).catch(() => []),
  ]);

  const normalized = carrierResult?.carrier
    ? normalizeFmcsaBroker(carrierResult, filingsResult, flags, { mc, dot: row.dot })
    : null;

  const canonicalName = canonicalNameForBroker({
    mc: row.mc,
    legal_name: row.legal_name,
    dba_name: row.dba_name,
  });
  const isClaimed = claim?.status === "verified";
  const isOperator = claim?.affiliation === "operator";

  const display = {
    name: canonicalName,                                     // brand name (notable list / DBA / legal)
    legal_name: normalized?.name || row.legal_name,          // FMCSA legal — show in trust section
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
  };

  const authActive = display.auth_status === "ACTIVE";
  const bondActive = display.bond.status === "ACTIVE";

  // Plain-English legitimacy assessment, derived strictly from the data.
  // No editorial commentary — the FMCSA facts speak for themselves.
  const legitVerdict =
    authActive && bondActive ? "yes-active"
    : authActive && !bondActive ? "partial-no-bond"
    : !authActive ? "no-inactive"
    : "unknown";

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Top disclosure bar — 49 CFR 371 compliance */}
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
        }}>
          <span>FILE · MC-{mc} / DOT-{row.dot}</span>
          <span>FMCSA · AUTH {display.auth_status}</span>
        </div>

        <div style={{
          padding: "36px 36px 32px",
          border: "1.5px solid var(--ink)", borderTop: "none",
          background: "var(--paper)",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono'", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--muted)", fontWeight: 500,
          }}>
            Operating Authority · {display.auth_status === "ACTIVE" ? "Active" : display.auth_status}
          </div>

          {/* H1 — brand-search-friendly name */}
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
            Legal: {display.legal_name}
            {display.legal_name !== display.name && display.dba && display.dba !== display.legal_name ? ` · d/b/a ${display.dba}` : ""}
            {" · "}{[display.city, display.state].filter(Boolean).join(", ") || "—"}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18, alignItems: "center", flexWrap: "wrap" }}>
            <Stamp tone={display.flagged ? "flagged" : "verified"}>
              {display.flagged ? "⚠ FLAGGED" : "✓ FMCSA VERIFIED"}
            </Stamp>
            {bondActive && (
              <Stamp tone="verified">
                BOND ACTIVE{display.bond.amount ? ` · $${display.bond.amount.toLocaleString()}` : ""}
              </Stamp>
            )}
            {!bondActive && display.bond.status === "LAPSED" && <Stamp tone="flagged">BOND LAPSED</Stamp>}
            {isClaimed && <Stamp tone="verified">◆ CLAIMED</Stamp>}
          </div>

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

        {/* ── "Is [Name] Legit?" section ────────────────────────────────── */}
        <section style={{ marginTop: 40 }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.1,
            margin: "0 0 18px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            Is {display.name} legit?
          </h2>

          <div style={{
            padding: "20px 24px",
            border: "1.5px solid var(--ink)",
            background: legitVerdict === "yes-active" ? "var(--paper)" : "var(--red-tint)",
          }}>
            <p style={{
              fontFamily: "'Inter Tight'", fontSize: 17, lineHeight: 1.55,
              margin: "0 0 14px", color: "var(--ink)",
            }}>
              {legitVerdict === "yes-active" && (
                <>
                  <strong>Short answer: Yes — based on FMCSA public records.</strong>{" "}
                  {display.name} (MC-{mc}, DOT-{row.dot}) currently holds <strong>active broker authority</strong> with the FMCSA, has a <strong>${display.bond.amount?.toLocaleString() || "75,000"} BMC-84 surety bond on file</strong>{display.bond.provider ? ` with ${display.bond.provider}` : ""}, and operates as a licensed property broker — not a motor carrier.
                </>
              )}
              {legitVerdict === "partial-no-bond" && (
                <>
                  <strong>Caution.</strong> {display.name} (MC-{mc}) has active broker authority but the FMCSA public record shows <strong>no surety bond on file right now</strong>. A $75,000 BMC-84 bond is required by federal law for property brokers (49 CFR 387.307). Verify the bond directly on FMCSA SAFER before booking.
                </>
              )}
              {legitVerdict === "no-inactive" && (
                <>
                  <strong>Do not use.</strong> {display.name} (MC-{mc}) does <strong>not currently hold active FMCSA broker authority</strong>. Status: {display.auth_status}. They are not legally permitted to broker auto-transport shipments.
                </>
              )}
              {legitVerdict === "unknown" && (
                <>
                  We couldn&apos;t fully verify {display.name} (MC-{mc}) against the FMCSA public record at the moment. Check directly on FMCSA SAFER below.
                </>
              )}
            </p>

            <ul style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.7, paddingLeft: 22, margin: 0, color: "var(--ink)" }}>
              <li><strong>FMCSA broker authority:</strong> {display.auth_status === "ACTIVE" ? "Active" : display.auth_status}</li>
              <li><strong>Bond on file:</strong> {bondActive ? `Yes — $${(display.bond.amount || 75000).toLocaleString()} BMC-84${display.bond.provider ? ` via ${display.bond.provider}` : ""}` : "No"}</li>
              <li><strong>Broker vs carrier:</strong> Property broker (arranges transport via FMCSA-authorized carriers — does not operate trucks)</li>
              <li><strong>HQ on FMCSA record:</strong> {[display.city, display.state].filter(Boolean).join(", ") || "—"}</li>
            </ul>

            <div style={{ marginTop: 14 }}>
              <a
                href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx"
                target="_blank" rel="noopener noreferrer"
                style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 11,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "var(--navy)", borderBottom: "1px dotted var(--navy)",
                  textDecoration: "none",
                }}
              >Verify independently on FMCSA SAFER ↗</a>
            </div>
          </div>
        </section>

        {/* ── "What People Search About [Name]" section ─────────────────── */}
        <section style={{ marginTop: 48 }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.1,
            margin: "0 0 18px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            What people search about {display.name}
          </h2>
          <div>
            {[
              {
                q: `${display.name} reviews`,
                a: `We do not aggregate third-party reviews. ${display.name} (MC-${mc}) has ${authActive ? "active" : display.auth_status.toLowerCase()} FMCSA broker authority and ${bondActive ? "a current BMC-84 surety bond" : "no current bond"} on file. For real customer experiences, check independent review sites like the BBB, Google Reviews, or Transport Reviews — not paid review aggregators.`,
              },
              {
                q: `${display.name} complaints`,
                a: `Complaints filed with the FMCSA appear in their public Safety Measurement System (SMS) profile. We surface authority and bond status here; for the full complaint and inspection history, look up DOT-${row.dot} on FMCSA SAFER.`,
              },
              {
                q: `Is ${display.name} legit?`,
                a: legitVerdict === "yes-active"
                  ? `Yes — they are FMCSA-licensed and bonded. See the legitimacy summary above.`
                  : `${legitVerdict === "no-inactive" ? `No — their FMCSA broker authority is currently ${display.auth_status.toLowerCase()}.` : `Caution warranted — see the summary above for current FMCSA status.`}`,
              },
              {
                q: `${display.name} MC number`,
                a: `MC-${mc} (DOT-${row.dot}). ${display.legal_name && display.legal_name !== display.name ? `The legal entity on the FMCSA filing is ${display.legal_name}.` : ""}`,
              },
            ].map((qa, i) => (
              <details key={i} style={{
                padding: "16px 18px", border: "1px solid var(--rule)", marginBottom: 10,
                background: "var(--paper)",
              }}>
                <summary style={{ cursor: "pointer", fontFamily: "'Inter Tight'", fontSize: 16, fontWeight: 600 }}>
                  {qa.q}
                </summary>
                <p style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)", marginTop: 10, marginBottom: 0 }}>
                  {qa.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Body grid: bio/specialties + public record sidebar ────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 36, marginTop: 48 }}>
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
          </aside>
        </div>

        {/* ── Conversion CTA — every broker page ends here ──────────────── */}
        <section style={{
          marginTop: 64, padding: "40px 32px",
          border: "1.5px solid var(--ink)", background: "var(--paper-deep)",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "'Instrument Serif'", fontSize: "clamp(28px, 3.5vw, 40px)",
            lineHeight: 1.1, margin: "0 0 12px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            Not sure about this broker?
          </h2>
          <p style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55, color: "var(--ink)", maxWidth: 540, margin: "0 auto 22px" }}>
            Check another company instantly, or get a verified quote from a broker we operate ourselves.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{
              background: "var(--ink)", color: "var(--paper)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Check another broker →</Link>
            <Link href={`/brokers/${buildBrokerSlug({ mc: VAB_BROKER.mc, legal_name: VAB_BROKER.legal_name, dba_name: VAB_BROKER.dba_name })}`} style={{
              background: "transparent", color: "var(--ink)",
              border: "1.5px solid var(--ink)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Get a verified quote →</Link>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono'", fontSize: 9, color: "var(--muted)",
            letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 14,
          }}>
            ⚠ Get-quote button routes to GMF Auto Transport — operated by Verified Auto Brokers · Disclosed per FTC 16 CFR Part 255
          </div>
        </section>
      </main>

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

// ── Inline micro-components ───────────────────────────────────────────────

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
