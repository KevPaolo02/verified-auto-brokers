// /verify-auto-transport-broker — the money page.
//
// SEO target: "verify auto transport broker", "check MC number",
// "auto transport broker lookup", "FMCSA broker search",
// "is this car shipping company legit"
//
// Structure follows the conversion blueprint:
//   1. Above-fold lookup tool (the action)
//   2. "How to Check if a Broker is Legit" (snippet bait)
//   3. "What We Verify Automatically" (trust)
//   4. "Not Sure About a Broker?" (conversion → GMF)
//
// Page is server-rendered for SEO with a tiny client-side input nested in.

import Link from "next/link";
import VerifyTool from "@/components/verify-tool";
import { buildMetadata } from "@/lib/seo";
import { BROKER as VAB_BROKER } from "@/lib/broker-info";
import { buildBrokerSlug } from "@/lib/notable-brokers";

export const metadata = buildMetadata({
  title: "Verify Any Auto Transport Broker (FMCSA Lookup Tool) — Verified Auto Brokers",
  description:
    "Check any auto-transport broker's FMCSA license, $75K BMC-84 bond status, and broker authority in seconds. Search by MC number or company name. Free, no signup.",
  path: "/verify-auto-transport-broker",
});

const gmfSlug = buildBrokerSlug({
  mc: VAB_BROKER.mc,
  legal_name: VAB_BROKER.legal_name,
  dba_name: VAB_BROKER.dba_name,
});

export default function VerifyPage() {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Top bar — broker disclosure, 49 CFR 371 compliance */}
      <div style={{
        background: "var(--navy)", color: "var(--paper)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: "0.1em", padding: "6px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 24, textTransform: "uppercase" }}>
          <Link href="/" style={{ color: "var(--paper)", textDecoration: "none" }}>← VERIFIED AUTO BROKERS</Link>
          <span style={{ opacity: 0.7 }}>FMCSA PUBLIC RECORD LOOKUP</span>
        </div>
      </div>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── SECTION 1: Above-the-fold lookup tool ─────────────────────── */}
        <section>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--muted)", fontWeight: 500, marginBottom: 14,
          }}>
            FMCSA Lookup Tool · Free · No Account Required
          </div>

          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(44px, 6.5vw, 84px)", lineHeight: 0.98,
            margin: "0 0 18px", letterSpacing: "-0.02em",
            color: "var(--ink)", fontWeight: 400,
          }}>
            Verify any auto transport broker <em style={{ color: "var(--red)" }}>instantly</em>.
          </h1>

          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 19, lineHeight: 1.5, color: "var(--ink)",
            maxWidth: 680, margin: "0 0 32px",
          }}>
            Check FMCSA license, BMC-84 bond status, and broker authority in seconds. Search by MC number or company name. Powered by live FMCSA public records.
          </p>

          <VerifyTool />

          {/* Trust line directly under the tool */}
          <p style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--muted)", marginTop: 18,
          }}>
            Tracking 24,992 active FMCSA-licensed brokers · Updated weekly from federal records
          </p>
        </section>

        {/* ── SECTION 2: "How to Check if a Broker is Legit" — snippet bait ── */}
        <section style={{ marginTop: 72 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 14,
          }}>§ Quick Guide</div>

          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(32px, 4.5vw, 52px)", lineHeight: 1.05,
            margin: "0 0 22px", letterSpacing: "-0.015em",
            color: "var(--ink)", fontWeight: 400,
          }}>
            How to check if a broker is legit
          </h2>

          <p style={{
            fontFamily: "'Inter Tight', sans-serif", fontSize: 16,
            lineHeight: 1.55, color: "var(--ink)", marginBottom: 24, maxWidth: 720,
          }}>
            Four checks. Takes 30 seconds. If a broker fails any of them, walk away.
          </p>

          <ol style={{
            fontFamily: "'Inter Tight', sans-serif", fontSize: 17,
            lineHeight: 1.7, color: "var(--ink)",
            paddingLeft: 0, listStyle: "none", margin: 0,
            counterReset: "step",
          }}>
            {[
              {
                h: "Look up their FMCSA registration",
                p: "Every legal auto-transport broker has an MC number from the Federal Motor Carrier Safety Administration. No MC = not a broker. Use our tool above or check FMCSA SAFER directly.",
              },
              {
                h: "Confirm broker authority is ACTIVE",
                p: "FMCSA marks each broker as Active, Inactive, Revoked, or Suspended. Only Active is safe. Inactive means they can't legally broker shipments — even if they're still answering the phone.",
              },
              {
                h: "Check the BMC-84 bond ($75,000 required)",
                p: "Federal law (49 CFR 387.307) requires every property broker to maintain a $75,000 surety bond. If the bond isn't on file, walk away — that's the only money you can recover if they fail to pay the carrier.",
              },
              {
                h: "Match the legal company name",
                p: "Make sure the company name on the FMCSA record matches the name they're quoting you under. Many brokers operate under DBAs — that's normal. But a mismatch with a totally unrelated legal name is a fraud red flag.",
              },
            ].map((step, i) => (
              <li key={i} style={{
                display: "grid", gridTemplateColumns: "auto 1fr",
                gap: 22, padding: "20px 0",
                borderBottom: i < 3 ? "1px solid var(--rule)" : "none",
                counterIncrement: "step",
              }}>
                <span style={{
                  fontFamily: "'Instrument Serif', serif", fontSize: 48,
                  lineHeight: 1, color: "var(--red)", fontWeight: 400,
                  width: 50, textAlign: "right",
                }}>{i + 1}</span>
                <div>
                  <h3 style={{
                    fontFamily: "'Inter Tight', sans-serif", fontSize: 19,
                    fontWeight: 600, margin: "4px 0 6px", color: "var(--ink)",
                  }}>{step.h}</h3>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: "var(--ink)" }}>{step.p}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── SECTION 3: "What We Verify Automatically" — trust layer ────── */}
        <section style={{ marginTop: 72 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 14,
          }}>§ Trust Layer</div>

          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(32px, 4.5vw, 52px)", lineHeight: 1.05,
            margin: "0 0 22px", letterSpacing: "-0.015em",
            color: "var(--ink)", fontWeight: 400,
          }}>
            What we verify automatically
          </h2>

          <p style={{
            fontFamily: "'Inter Tight', sans-serif", fontSize: 16,
            lineHeight: 1.55, color: "var(--ink)", marginBottom: 24, maxWidth: 720,
          }}>
            Every lookup pulls live data straight from the federal record. Nothing cached for marketing purposes.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: 16, marginTop: 8,
          }}>
            {[
              {
                h: "FMCSA registration",
                p: "MC number, DOT number, legal name, DBA, physical address — all live from FMCSA QCMobile.",
              },
              {
                h: "Broker authority status",
                p: "Active, Inactive, Revoked, or Suspended — pulled the moment you search. No stale snapshots.",
              },
              {
                h: "BMC-84 bond filing",
                p: "Bond amount, surety provider, policy number, effective date. The federal $75K minimum requirement is shown.",
              },
              {
                h: "Carrier vs broker classification",
                p: "FMCSA distinguishes property brokers from motor carriers. We tell you which one you're actually talking to.",
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "20px 22px",
                border: "1.5px solid var(--ink)",
                background: "var(--paper)",
              }}>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--navy)", fontWeight: 600, marginBottom: 8,
                }}>0{i + 1} · Verified</div>
                <h3 style={{
                  fontFamily: "'Inter Tight', sans-serif", fontSize: 19,
                  fontWeight: 600, margin: "0 0 8px", color: "var(--ink)",
                }}>{item.h}</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: "var(--ink)" }}>{item.p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 4: Conversion CTA ─────────────────────────────────── */}
        <section style={{
          marginTop: 80, padding: "44px 36px",
          border: "1.5px solid var(--ink)", background: "var(--paper-deep)",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.1,
            margin: "0 0 14px", fontWeight: 400, letterSpacing: "-0.02em",
          }}>
            Not sure about a broker?
          </h2>

          <p style={{
            fontFamily: "'Inter Tight', sans-serif", fontSize: 17,
            lineHeight: 1.55, color: "var(--ink)", maxWidth: 540,
            margin: "0 auto 12px",
          }}>
            Check another company instantly above, or get a verified quote from a broker we operate ourselves.
          </p>

          <p style={{
            fontFamily: "'Inter Tight', sans-serif", fontStyle: "italic",
            fontSize: 14.5, lineHeight: 1.5,
            color: "var(--muted)", maxWidth: 540, margin: "0 auto 24px",
          }}>
            Most issues in car shipping happen when brokers aren&apos;t verified up front. Take 30 seconds to check yours.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#top" style={{
              background: "var(--ink)", color: "var(--paper)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Check another broker ↑</a>
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

      {/* Footer with broker disclosure */}
      <footer style={{ background: "var(--ink)", color: "var(--paper)", padding: "32px 24px" }}>
        <div style={{
          maxWidth: 980, margin: "0 auto",
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
