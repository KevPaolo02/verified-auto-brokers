// /report-a-broker — public-facing report flow.
// Submissions go to internal_flags at severity='medium' (admin-promoted to
// 'high' after review). Same operator-tone, no fluff.

import Link from "next/link";
import ReportForm from "@/components/report-form";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { BROKER as VAB_BROKER } from "@/lib/broker-info";

export const metadata = buildMetadata({
  title: "Report a Broker — Verified Auto Brokers",
  description:
    "Report an auto-transport broker for fraud, bond lapse, double-brokering, hostage-vehicle, or service issues. Manual review. We never auto-flag — your report goes to our internal queue.",
  path: "/report-a-broker",
});

export default function ReportPage({
  searchParams,
}: {
  searchParams: { mc?: string };
}) {
  const initialMc = searchParams?.mc ?? null;

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* Top disclosure bar */}
      <div style={{
        background: "var(--navy)", color: "var(--paper)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: "0.1em", padding: "6px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 24, textTransform: "uppercase" }}>
          <Link href="/" style={{ color: "var(--paper)", textDecoration: "none" }}>← VERIFIED AUTO BROKERS</Link>
          <span style={{ opacity: 0.7 }}>Report a Broker</span>
        </div>
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* HERO */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--red)", fontWeight: 600, marginBottom: 14,
        }}>
          ⚠ File a Broker Report
        </div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(40px, 5.5vw, 64px)", lineHeight: 1.0,
          margin: "0 0 18px", letterSpacing: "-0.02em",
          color: "var(--ink)", fontWeight: 400,
        }}>
          Got burned by a broker?
        </h1>

        <p style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 17,
          lineHeight: 1.55, color: "var(--ink)",
          margin: "0 0 32px",
        }}>
          Tell us what happened. Reports land in our internal review queue, not on the broker&apos;s public profile. Once we verify the pattern, we promote the report to a public flag.
        </p>

        {/* What we do / don't do */}
        <div style={{
          marginBottom: 32, padding: "20px 22px",
          background: "var(--paper-deep)", border: "1px dashed var(--ink)",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 10,
          }}>What this is for</div>
          <ul style={{
            fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.7,
            paddingLeft: 22, margin: 0, color: "var(--ink)",
          }}>
            <li><strong>Internal review.</strong> We read every submission, cross-check against FMCSA records, and may follow up by email.</li>
            <li><strong>Pattern detection.</strong> Three or more verified reports against the same broker triggers a manual review.</li>
            <li><strong>Manual flag.</strong> If we promote a report to high severity, it becomes a public flag on that broker&apos;s profile.</li>
            <li><strong>No auto-flagging.</strong> Single submissions don&apos;t change a broker&apos;s status — prevents spite reporting.</li>
          </ul>
          <div style={{
            marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--rule)",
            fontFamily: "'Inter Tight'", fontSize: 13, color: "var(--ink)", lineHeight: 1.6,
          }}>
            <strong>For active fraud</strong>, also file with the FMCSA National Consumer Complaint Database (<a href="tel:18883687238" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>1-888-DOT-SAFT</a> · <a href="https://nccdb.fmcsa.dot.gov/nccdb/home.aspx" target="_blank" rel="noopener noreferrer" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>nccdb.fmcsa.dot.gov</a>) — they have actual enforcement authority. We track and surface; FMCSA acts.
          </div>
        </div>

        {/* The form */}
        <ReportForm initialMc={initialMc} />

        {/* Internal links */}
        <section style={{ marginTop: 48, padding: "20px 22px", border: "1px solid var(--rule)", background: "var(--paper-deep)" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 10,
          }}>While you&apos;re here</div>
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 15, lineHeight: 1.8, paddingLeft: 22, margin: 0 }}>
            <li><Link href="/car-shipping-scams" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>7 car shipping scams to avoid</Link></li>
            <li><Link href="/verify-auto-transport-broker" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>Verify any other broker before you book again</Link></li>
            <li><Link href="/how-to-check-auto-transport-broker" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>How to check if a broker is legit (4 steps)</Link></li>
          </ul>
        </section>
      </main>

      <footer style={{ background: "var(--ink)", color: "var(--paper)", padding: "32px 24px" }}>
        <div style={{
          maxWidth: 720, margin: "0 auto",
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
