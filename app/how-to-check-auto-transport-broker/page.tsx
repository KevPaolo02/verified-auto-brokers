// /how-to-check-auto-transport-broker — Phase C cluster page.
// Featured snippet play: 4-step list above the fold + expanded explanations.

import Link from "next/link";
import VerifyTool from "@/components/verify-tool";
import { buildMetadata } from "@/lib/seo";
import { BROKER as VAB_BROKER } from "@/lib/broker-info";
import { buildBrokerSlug } from "@/lib/notable-brokers";

export const metadata = buildMetadata({
  title: "How to Check if an Auto Transport Broker is Legit (4 Steps, 30 Seconds)",
  description:
    "The exact 4 checks every shipper should run before booking an auto transport broker: FMCSA registration, broker authority status, BMC-84 bond ($75K), and name match. Free tool included.",
  path: "/how-to-check-auto-transport-broker",
});

const gmfSlug = buildBrokerSlug({
  mc: VAB_BROKER.mc,
  legal_name: VAB_BROKER.legal_name,
  dba_name: VAB_BROKER.dba_name,
});

export default function HowToPage() {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <div style={{
        background: "var(--navy)", color: "var(--paper)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: "0.1em", padding: "6px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 24, textTransform: "uppercase" }}>
          <Link href="/" style={{ color: "var(--paper)", textDecoration: "none" }}>← VERIFIED AUTO BROKERS</Link>
          <span style={{ opacity: 0.7 }}>SHIPPER GUIDE</span>
        </div>
      </div>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--muted)", fontWeight: 500, marginBottom: 14,
        }}>§ Quick Guide · 30 Seconds</div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 1.0,
          margin: "0 0 22px", letterSpacing: "-0.02em",
          color: "var(--ink)", fontWeight: 400,
        }}>
          How to check if an auto transport broker is legit.
        </h1>

        <p style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 19,
          lineHeight: 1.5, color: "var(--ink)",
          margin: "0 0 32px",
        }}>
          Four checks. Takes under a minute. If a broker fails any of them, walk away — there are 24,000+ other licensed brokers in the U.S.
        </p>

        {/* ── Snippet-bait short list (above the fold) ──────────────────── */}
        <div style={{
          padding: "24px 28px", border: "1.5px solid var(--ink)",
          background: "var(--paper)", marginBottom: 36,
        }}>
          <ol style={{
            fontFamily: "'Inter Tight'", fontSize: 17, lineHeight: 1.7,
            paddingLeft: 22, margin: 0, color: "var(--ink)",
          }}>
            <li><strong>Look up their FMCSA registration</strong> — get the MC number, confirm it&apos;s real.</li>
            <li><strong>Confirm broker authority is ACTIVE</strong> — not Inactive, Revoked, or Suspended.</li>
            <li><strong>Check the BMC-84 bond is on file</strong> — $75,000 minimum, required by federal law.</li>
            <li><strong>Match the legal company name</strong> — make sure who&apos;s quoting you is who FMCSA says they are.</li>
          </ol>
        </div>

        {/* ── Inline tool ─────────────────────────────────────────────── */}
        <div style={{
          padding: "28px 28px", border: "1.5px solid var(--ink)",
          background: "var(--paper-deep)", marginBottom: 56, boxShadow: "6px 6px 0 var(--ink)",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--navy)", marginBottom: 10,
          }}>Skip the manual check</div>
          <h2 style={{
            fontFamily: "'Instrument Serif'", fontSize: "clamp(24px, 2.8vw, 32px)",
            lineHeight: 1.1, margin: "0 0 14px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            Run all 4 checks at once.
          </h2>
          <p style={{ fontFamily: "'Inter Tight'", fontSize: 15.5, lineHeight: 1.5, margin: "0 0 18px", color: "var(--ink)" }}>
            Type the broker&apos;s MC number or company name. We pull live FMCSA data and run all four checks in one shot.
          </p>
          <VerifyTool />
        </div>

        {/* ── Expanded explanations ─────────────────────────────────────── */}

        <Step n={1} h="Look up their FMCSA registration">
          <p>
            Every legal auto-transport broker in the U.S. has a Motor Carrier (MC) number issued by the Federal Motor Carrier Safety Administration. No MC number means they&apos;re not a licensed broker — they&apos;re either operating illegally or they&apos;re a different kind of company (e.g., a freight forwarder, a carrier, or just a website).
          </p>
          <p>
            <strong>Where to look it up:</strong> the FMCSA SAFER public site (<a href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx" target="_blank" rel="noopener noreferrer" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>safer.fmcsa.dot.gov</a>) or our <Link href="/verify-auto-transport-broker" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>verify tool</Link>. Both pull from the same federal database.
          </p>
          <p>
            <strong>What you&apos;re looking for:</strong> a record exists, the legal name on file matches the company you&apos;re talking to (or is at least a related DBA), and the MC docket type is <em>Broker — Property</em>.
          </p>
        </Step>

        <Step n={2} h="Confirm broker authority is ACTIVE">
          <p>
            FMCSA classifies every broker&apos;s authority as Active, Inactive, Pending, Revoked, or Suspended. <strong>Only Active is safe.</strong>
          </p>
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 15.5, lineHeight: 1.7, paddingLeft: 22, margin: "8px 0" }}>
            <li><strong>Active</strong> — legally permitted to broker shipments. Good.</li>
            <li><strong>Inactive</strong> — they&apos;re not currently licensed. Even if they&apos;re still answering the phone and quoting jobs, they can&apos;t legally take your money.</li>
            <li><strong>Pending</strong> — they applied for authority but haven&apos;t been granted it yet. Don&apos;t book.</li>
            <li><strong>Revoked / Suspended</strong> — FMCSA pulled their authority. Walk immediately.</li>
          </ul>
          <p>
            Brokers sometimes lose authority for non-payment of registration fees, bond lapses, or unresolved complaints. They often keep operating for weeks while &quot;working on getting it back.&quot; That&apos;s your money at risk.
          </p>
        </Step>

        <Step n={3} h="Check the BMC-84 bond is on file">
          <p>
            Federal law (49 CFR 387.307) requires every property broker to maintain a $75,000 surety bond — usually called the BMC-84 bond. It&apos;s the only money that&apos;s recoverable if the broker fails to pay the carrier or otherwise breaks the contract.
          </p>
          <p>
            If the bond isn&apos;t on file or has lapsed, two things are true: (1) they&apos;re operating in violation of federal law, and (2) you have <strong>no insurance behind the deal</strong>. If they take your money and disappear, there&apos;s nothing to claim against.
          </p>
          <p>
            Our <Link href="/verify-auto-transport-broker" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>verify tool</Link> shows the bond amount AND the surety provider name (e.g., U.S. Specialty Insurance Company). If the surety company name doesn&apos;t show up, the bond isn&apos;t there.
          </p>
        </Step>

        <Step n={4} h="Match the legal company name">
          <p>
            Pull the company name FMCSA has on file. Compare it to the name on your quote, contract, and invoice. They don&apos;t have to match exactly — many brokers operate under DBAs (&quot;doing business as&quot;) that are different from their legal name. That&apos;s normal.
          </p>
          <p>
            What&apos;s NOT normal: the MC number you were given belongs to one company, but the contract/invoice you&apos;re signing is from a totally unrelated entity. That&apos;s the <Link href="/car-shipping-scams" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>identity-spoofing scam</Link> — someone&apos;s using a real broker&apos;s MC# to look legitimate.
          </p>
          <p>
            <strong>Quick sanity check:</strong> after looking up the MC, call the phone number FMCSA has on file (NOT the number the salesperson gave you). Confirm they have your quote.
          </p>
        </Step>

        {/* ── Internal link cluster ─────────────────────────────────────── */}
        <section style={{ marginTop: 56, padding: "24px 26px", border: "1px solid var(--rule)", background: "var(--paper-deep)" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 14,
          }}>Related</div>
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.8, paddingLeft: 22, margin: 0 }}>
            <li><Link href="/car-shipping-scams" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>7 car shipping scams you must avoid</Link> — what happens when these checks aren&apos;t run.</li>
            <li><Link href="/broker-vs-carrier" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>Broker vs carrier — what&apos;s the difference?</Link></li>
            <li><Link href="/what-is-mc-number" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>What is an MC number?</Link></li>
            <li><Link href="/brokers/montway-auto-transport-mc-611862" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>Example: Montway Auto Transport — FMCSA verified profile</Link></li>
          </ul>
        </section>

        {/* ── Conversion CTA ────────────────────────────────────────────── */}
        <section style={{
          marginTop: 56, padding: "40px 32px",
          border: "1.5px solid var(--ink)", background: "var(--paper-deep)",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "'Instrument Serif'", fontSize: "clamp(28px, 3.5vw, 40px)",
            lineHeight: 1.1, margin: "0 0 12px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            Now check yours.
          </h2>
          <p style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55, color: "var(--ink)", maxWidth: 540, margin: "0 auto 22px" }}>
            Run all 4 checks on any broker — or get a verified quote from one we operate.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/verify-auto-transport-broker" style={{
              background: "var(--ink)", color: "var(--paper)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Check a broker →</Link>
            <Link href={`/brokers/${gmfSlug}`} style={{
              background: "transparent", color: "var(--ink)",
              border: "1.5px solid var(--ink)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Get a verified quote →</Link>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--muted)",
            letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 14,
          }}>
            ⚠ Get-quote button routes to {VAB_BROKER.legal_name} — operated by Verified Auto Brokers · Disclosed per FTC 16 CFR Part 255
          </div>
        </section>
      </main>

      <footer style={{ background: "var(--ink)", color: "var(--paper)", padding: "32px 24px" }}>
        <div style={{
          maxWidth: 820, margin: "0 auto",
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

function Step({ n, h, children }: { n: number; h: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12 }}>
        <span style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 56, lineHeight: 1,
          color: "var(--red)", fontWeight: 400,
        }}>{n}</span>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.1,
          margin: 0, fontWeight: 400, letterSpacing: "-0.015em", color: "var(--ink)",
        }}>{h}</h2>
      </div>
      <div style={{
        fontFamily: "'Inter Tight', sans-serif", fontSize: 16,
        lineHeight: 1.65, color: "var(--ink)",
      }}>{children}</div>
    </section>
  );
}
