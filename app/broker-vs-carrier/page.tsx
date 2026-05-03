// /broker-vs-carrier — Phase C cluster page.
// Targets the confusion that drives most scams ("most customers think they're booking a carrier").

import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { BROKER as VAB_BROKER } from "@/lib/broker-info";
import { buildBrokerSlug } from "@/lib/notable-brokers";

export const metadata = buildMetadata({
  title: "Broker vs Carrier in Auto Transport: What's the Difference?",
  description:
    "Most people think they're booking a carrier — they're not. Here's the actual difference between an auto transport broker and a carrier, why it matters for your insurance and recourse, and how to know which one you're talking to.",
  path: "/broker-vs-carrier",
});

const gmfSlug = buildBrokerSlug({
  mc: VAB_BROKER.mc,
  legal_name: VAB_BROKER.legal_name,
  dba_name: VAB_BROKER.dba_name,
});

export default function BrokerVsCarrierPage() {
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
        }}>§ Plain-English Guide</div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 1.0,
          margin: "0 0 22px", letterSpacing: "-0.02em",
          color: "var(--ink)", fontWeight: 400,
        }}>
          Broker vs carrier: what&apos;s the difference?
        </h1>

        <p style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 19,
          lineHeight: 1.5, color: "var(--ink)",
          margin: "0 0 32px",
        }}>
          Most customers think they&apos;re booking a carrier. They&apos;re not — they&apos;re booking a broker who books a carrier on their behalf. That distinction is responsible for most of the bad outcomes in auto transport.
        </p>

        {/* ── Quick comparison table ────────────────────────────────────── */}
        <div style={{
          marginBottom: 48, border: "1.5px solid var(--ink)", background: "var(--paper)",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "var(--ink)", color: "var(--paper)",
          }}>
            <div style={{
              padding: "14px 18px", fontFamily: "'JetBrains Mono'", fontSize: 11,
              letterSpacing: "0.16em", textTransform: "uppercase", borderRight: "1px solid var(--paper)",
            }}>Broker</div>
            <div style={{
              padding: "14px 18px", fontFamily: "'JetBrains Mono'", fontSize: 11,
              letterSpacing: "0.16em", textTransform: "uppercase",
            }}>Carrier</div>
          </div>
          {[
            ["Owns trucks?", "No", "Yes — they are the truck"],
            ["FMCSA license", "Broker authority (BR)", "Motor carrier authority (MC)"],
            ["Required bond", "$75K BMC-84 surety bond", "Cargo insurance (no bond required)"],
            ["Who you pay", "The broker (who pays the carrier)", "The carrier directly"],
            ["Who shows up at your door", "Whoever they hire", "Their own driver and truck"],
            ["When something breaks", "Your claim is against the broker bond + the carrier's insurance", "Your claim is against the carrier's insurance only"],
            ["Best for", "Most consumer shipments — gives you carrier choice + price competition", "When you have a relationship with a specific carrier already"],
          ].map(([label, broker, carrier], i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              borderTop: "1px solid var(--rule)",
            }}>
              <div style={{
                padding: "12px 18px", fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.5,
                borderRight: "1px solid var(--rule)", background: "var(--paper-deep)",
              }}>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9.5, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <div>{broker}</div>
              </div>
              <div style={{
                padding: "12px 18px", fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.5,
              }}>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9.5, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>&nbsp;</div>
                <div>{carrier}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── What a broker actually does ──────────────────────────────── */}
        <Section h="What a broker actually does">
          <p>
            A broker is a middle layer. They don&apos;t own trucks, hire drivers, or move vehicles themselves. What they do is take your shipment, post it on a load board (Central Dispatch is the big one in auto transport), negotiate with carriers, pick one, and dispatch your load to them.
          </p>
          <p>
            The broker keeps a margin (typically 10-25% of the total price). The carrier gets the rest. You write one check to the broker; the broker pays the carrier on your behalf.
          </p>
          <p>
            <strong>Why use a broker:</strong> they have relationships with hundreds of carriers, they can find you a price-competitive option fast, and they handle the dispatching paperwork. For most consumer shipments, this is the right path.
          </p>
        </Section>

        {/* ── What a carrier actually does ──────────────────────────────── */}
        <Section h="What a carrier actually does">
          <p>
            A carrier is the operator that physically moves your vehicle. They own (or lease) the truck and trailer, employ the driver, carry the cargo insurance, and are the only entity that ever physically touches your car.
          </p>
          <p>
            <strong>Why book direct with a carrier:</strong> if you have an existing relationship with one, you cut out the broker margin. But finding a carrier with available capacity on your specific route on your specific date is the broker&apos;s entire job — doing it yourself is much slower and the savings are usually marginal.
          </p>
          <p>
            Some &quot;carriers&quot; you&apos;ll see online are actually brokers in disguise. They&apos;ll tell you they&apos;re a carrier so you feel safer, then dispatch your load to a real carrier behind the scenes. <Link href="/verify-auto-transport-broker" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>Run the FMCSA check</Link> — the public record will say whether they hold broker authority, motor carrier authority, or both.
          </p>
        </Section>

        {/* ── Why this matters for your money ───────────────────────────── */}
        <Section h="Why this matters for your money">
          <p>
            Auto-transport claims are messy. When something gets damaged, lost, or stolen, the question of <em>who you have a contract with</em> determines who you can sue.
          </p>
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.7, paddingLeft: 22 }}>
            <li><strong>Booked direct with a carrier:</strong> claim goes to their cargo insurance. If the insurance is good and current, you&apos;re covered. If it&apos;s lapsed or fraudulent, you&apos;re out.</li>
            <li><strong>Booked through a broker:</strong> you have <em>two</em> places to recover from — the carrier&apos;s cargo insurance AND the broker&apos;s $75K BMC-84 bond. The bond exists specifically to protect shippers when the broker fails to pay the carrier or the carrier fails to perform.</li>
          </ul>
          <p>
            That&apos;s the consumer-protection argument for using a licensed broker over an unknown carrier: an extra $75K in financial backing standing between you and a worst-case scenario.
          </p>
        </Section>

        {/* ── How to know which one you&apos;re talking to ─────────────── */}
        <Section h="How to know which one you&apos;re talking to">
          <p>
            Three quick checks:
          </p>
          <ol style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.7, paddingLeft: 22 }}>
            <li><strong>Look up their MC#</strong> on FMCSA. The record will explicitly say <em>Property Broker</em>, <em>Motor Carrier</em>, or both.</li>
            <li><strong>Ask:</strong> &quot;Are you the carrier or the broker?&quot; If they hesitate, they&apos;re the broker (and they wish they could say carrier).</li>
            <li><strong>Read the contract.</strong> A broker&apos;s contract will reference &quot;the assigned carrier&quot;; a carrier&apos;s contract is between you and them directly.</li>
          </ol>
          <p>
            Either is fine — both can be legitimate, well-bonded, well-insured operators. What matters is that you know which one, you&apos;ve verified their license, and the price reflects the role.
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
            <li><Link href="/car-shipping-scams" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>7 car shipping scams you must avoid</Link></li>
            <li><Link href="/what-is-mc-number" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>What is an MC number?</Link></li>
            <li><Link href="/brokers/sherpa-auto-transport-mc-1555035" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>Example: Sherpa Auto Transport — broker FMCSA profile</Link></li>
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
            Work with verified brokers only.
          </h2>
          <p style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55, color: "var(--ink)", maxWidth: 540, margin: "0 auto 22px" }}>
            Whether you book a broker or a carrier, the FMCSA check is the same. Verify before you pay anything.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/verify-auto-transport-broker" style={{
              background: "var(--ink)", color: "var(--paper)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Verify a broker →</Link>
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
