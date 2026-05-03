// /what-is-mc-number — Phase C cluster page (lowest priority but useful).
// Targets foundational searches: "what is an MC number", "how to find MC number",
// "MC number vs DOT number".

import Link from "next/link";
import VerifyTool from "@/components/verify-tool";
import { buildMetadata } from "@/lib/seo";
import { BROKER as VAB_BROKER } from "@/lib/broker-info";
import { buildBrokerSlug } from "@/lib/notable-brokers";

export const metadata = buildMetadata({
  title: "What is an MC Number? (And How to Look One Up) — Verified Auto Brokers",
  description:
    "An MC number is the FMCSA license that makes a property broker (or motor carrier) legal. Here's what it means, how to look one up, and how to spot a fake one.",
  path: "/what-is-mc-number",
});

const gmfSlug = buildBrokerSlug({
  mc: VAB_BROKER.mc,
  legal_name: VAB_BROKER.legal_name,
  dba_name: VAB_BROKER.dba_name,
});

export default function WhatIsMcNumberPage() {
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
          <span style={{ opacity: 0.7 }}>BASIC GUIDE</span>
        </div>
      </div>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--muted)", fontWeight: 500, marginBottom: 14,
        }}>§ Foundational</div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 1.0,
          margin: "0 0 22px", letterSpacing: "-0.02em",
          color: "var(--ink)", fontWeight: 400,
        }}>
          What is an MC number?
        </h1>

        <p style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 19,
          lineHeight: 1.5, color: "var(--ink)",
          margin: "0 0 32px",
        }}>
          The MC number is the federal license that makes an auto-transport broker (or motor carrier) legal. No MC number = not a real broker. Here&apos;s what it actually means and how to use it.
        </p>

        <Section h="The short version">
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.7, paddingLeft: 22 }}>
            <li><strong>MC stands for Motor Carrier.</strong> It&apos;s a license number issued by the Federal Motor Carrier Safety Administration (FMCSA).</li>
            <li><strong>Required for brokers and for-hire carriers.</strong> If a company arranges or operates interstate freight transport for hire, they must have one.</li>
            <li><strong>Format:</strong> the letters &quot;MC&quot; followed by 4–7 digits. Examples: <code>MC-279140</code>, <code>MC-1675078</code>.</li>
            <li><strong>Public:</strong> every MC number is searchable in the FMCSA public record. Anyone can look up any company.</li>
          </ul>
        </Section>

        {/* ── Inline tool ─────────────────────────────────────────────── */}
        <div style={{
          margin: "40px 0",
          padding: "28px 28px", border: "1.5px solid var(--ink)",
          background: "var(--paper-deep)", boxShadow: "6px 6px 0 var(--ink)",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--navy)", marginBottom: 10,
          }}>Look up any MC number</div>
          <h2 style={{
            fontFamily: "'Instrument Serif'", fontSize: "clamp(24px, 2.8vw, 32px)",
            lineHeight: 1.1, margin: "0 0 14px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            Try it now.
          </h2>
          <p style={{ fontFamily: "'Inter Tight'", fontSize: 15.5, lineHeight: 1.5, margin: "0 0 18px", color: "var(--ink)" }}>
            Type any MC number (e.g. <code>1675078</code>) and we&apos;ll pull the live FMCSA record — authority status, bond, address.
          </p>
          <VerifyTool />
        </div>

        <Section h="MC number vs DOT number — what&apos;s the difference?">
          <p>
            They&apos;re both FMCSA identifiers, but they mean different things.
          </p>
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.7, paddingLeft: 22 }}>
            <li>
              <strong>DOT number</strong> identifies the <em>company entity</em>. Any commercial vehicle operator — for-hire or private — needs one. A landscaping company with one truck has a DOT number.
            </li>
            <li>
              <strong>MC number</strong> identifies the <em>operating authority</em>. Only for-hire carriers and brokers need one — companies that take money to move freight or arrange shipments for someone else.
            </li>
          </ul>
          <p>
            A legitimate broker has both: one DOT number (the company) and one MC number (the broker license). They&apos;re displayed together: e.g. <code>MC-1675078 / DOT-4301133</code>.
          </p>
          <p>
            <strong>If a company has only a DOT number and no MC number,</strong> they&apos;re not licensed to broker your shipment. They might be a private fleet, a moving company, or just a small operator who never registered for broker authority. Either way, don&apos;t hire them as a broker.
          </p>
        </Section>

        <Section h="What an MC number tells you">
          <p>
            Pull up any MC number in the FMCSA SAFER database (or our <Link href="/verify-auto-transport-broker" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>tool</Link>) and you can see:
          </p>
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.7, paddingLeft: 22 }}>
            <li><strong>Legal name and DBA</strong> on file with FMCSA</li>
            <li><strong>Physical address</strong> — required to be accurate by federal law</li>
            <li><strong>Operating authority status</strong> — Active, Inactive, Pending, Revoked, Suspended</li>
            <li><strong>Authority type</strong> — Broker, Motor Carrier, or both</li>
            <li><strong>Bond and insurance</strong> on file (the BMC-84 bond for brokers; cargo insurance for carriers)</li>
            <li><strong>Date the authority was granted</strong></li>
          </ul>
          <p>
            That&apos;s a lot of accountability built into one number. It&apos;s also why fake or borrowed MC numbers are the most common scam in the industry — see <Link href="/car-shipping-scams" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>identity-spoofing scams</Link>.
          </p>
        </Section>

        <Section h="How to spot a fake MC number">
          <p>
            Three patterns to watch for:
          </p>
          <ol style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.7, paddingLeft: 22 }}>
            <li>
              <strong>The MC doesn&apos;t exist in the FMCSA database.</strong> Look it up — if there&apos;s no record at all, the number is made up.
            </li>
            <li>
              <strong>The MC exists but the company name on FMCSA doesn&apos;t match the company quoting you.</strong> Someone&apos;s using a real broker&apos;s license number to look legitimate. Independently call the legitimate broker (using the phone number on FMCSA, not the salesperson&apos;s number) and confirm they have your quote.
            </li>
            <li>
              <strong>The MC exists but the authority is Inactive, Revoked, or Suspended.</strong> They had a license but lost it. Doesn&apos;t matter why — they&apos;re not currently allowed to broker shipments.
            </li>
          </ol>
        </Section>

        <Section h="How to find a company&apos;s MC number">
          <p>
            Three ways:
          </p>
          <ol style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.7, paddingLeft: 22 }}>
            <li>Look at any quote, contract, invoice, or website footer they&apos;ve sent you. Brokers are required by federal law (49 CFR 371.2) to display their MC number on advertising.</li>
            <li>Search by company name on the <a href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx" target="_blank" rel="noopener noreferrer" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>FMCSA SAFER public site</a>.</li>
            <li>Search by company name in our <Link href="/verify-auto-transport-broker" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>verify tool</Link> — same data, faster interface.</li>
          </ol>
          <p>
            If a company is reluctant to share their MC number, that&apos;s a serious red flag. They&apos;re required to disclose it, and any legitimate operator does so proudly.
          </p>
        </Section>

        {/* ── Internal link cluster ─────────────────────────────────────── */}
        <section style={{ marginTop: 56, padding: "24px 26px", border: "1px solid var(--rule)", background: "var(--paper-deep)" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 14,
          }}>Related</div>
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.8, paddingLeft: 22, margin: 0 }}>
            <li><Link href="/how-to-check-auto-transport-broker" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>How to check if an auto transport broker is legit</Link></li>
            <li><Link href="/broker-vs-carrier" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>Broker vs carrier — what&apos;s the difference?</Link></li>
            <li><Link href="/car-shipping-scams" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>7 car shipping scams you must avoid</Link></li>
            <li><Link href="/brokers/easy-auto-ship-mc-103888" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>Example: Easy Auto Ship — what an MC profile looks like</Link></li>
          </ul>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section style={{
          marginTop: 56, padding: "40px 32px",
          border: "1.5px solid var(--ink)", background: "var(--paper-deep)",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "'Instrument Serif'", fontSize: "clamp(28px, 3.5vw, 40px)",
            lineHeight: 1.1, margin: "0 0 12px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            Look up any MC.
          </h2>
          <p style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55, color: "var(--ink)", maxWidth: 540, margin: "0 auto 22px" }}>
            Live FMCSA data. 30 seconds. No account required.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/verify-auto-transport-broker" style={{
              background: "var(--ink)", color: "var(--paper)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Use the verify tool →</Link>
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

function Section({ h, children }: { h: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
      <h2 style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.1,
        margin: "0 0 14px", fontWeight: 400, letterSpacing: "-0.015em", color: "var(--ink)",
      }}>{h}</h2>
      <div style={{
        fontFamily: "'Inter Tight', sans-serif", fontSize: 16,
        lineHeight: 1.65, color: "var(--ink)",
      }}>{children}</div>
    </section>
  );
}
