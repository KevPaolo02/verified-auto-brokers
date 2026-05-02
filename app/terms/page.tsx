// PLACEHOLDER TERMS OF SERVICE — must be reviewed and replaced by a licensed attorney
// before launch. The text below is a generic starting framework; it is not legal advice.

import Link from "next/link";
import { BROKER } from "@/lib/broker-info";

export const metadata = {
  title: `Terms of Service — ${BROKER.legal_name}`,
  description: "Terms of service for the Verified Auto Brokers and GMF Auto Transport funnel sites.",
};

export default function TermsPage() {
  return (
    <main style={{ background: "var(--paper)", minHeight: "100vh", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "'Inter Tight', sans-serif", color: "var(--ink)", lineHeight: 1.6 }}>
        <Link href="/" style={{
          fontFamily: "'JetBrains Mono'", fontSize: 11, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "var(--muted)", textDecoration: "none",
        }}>← BACK</Link>

        <h1 style={{
          fontFamily: "'Instrument Serif'", fontSize: "clamp(40px, 5vw, 64px)",
          lineHeight: 1, margin: "12px 0 24px", letterSpacing: "-0.02em", fontWeight: 400,
        }}>
          Terms of Service
        </h1>

        <p style={{
          padding: "12px 14px", border: "1px dashed var(--red)", background: "var(--red-tint)",
          fontSize: 14, marginBottom: 28,
        }}>
          <strong>Draft notice:</strong> This page is a placeholder. The published terms must be drafted or reviewed by a qualified attorney before launch.
        </p>

        <h2>Who we are</h2>
        <p>{BROKER.legal_name} ({BROKER.mc_display}, {BROKER.dot_display}) is a licensed FMCSA property broker. We arrange auto transport between shippers and FMCSA-authorized motor carriers. We are not a motor carrier and do not own, operate, or directly control any trucks.</p>

        <h2>Quotes and pricing</h2>
        <p>All prices shown on this site are <strong>indicative estimates</strong> based on typical market rates. They are not binding quotes. Final pricing is set by the assigned carrier and depends on real-time carrier availability, route, vehicle details, and pickup timing. We confirm an exact quote before you commit.</p>

        <h2>Pickup and delivery dates</h2>
        <p>Estimated pickup and delivery windows are typical for the route. They are <strong>not guaranteed.</strong> Auto transport is subject to weather, traffic, mechanical issues, and carrier scheduling. We will keep you informed of changes but cannot promise specific dates.</p>

        <h2>Carrier insurance</h2>
        <p>Federal law requires every motor carrier to carry cargo insurance. We require carriers in our network to provide a current insurance certificate before dispatching a load. Coverage limits, deductibles, and exclusions vary by carrier — we share the certificate before pickup so you can review it. Items left inside the vehicle are typically not covered by the carrier's cargo insurance.</p>

        <h2>Personal items</h2>
        <p>Many carriers permit limited personal items (often around 100 lbs in the trunk only), but the final allowance depends on the assigned carrier and must be confirmed before pickup. We are not responsible for personal items left in the vehicle.</p>

        <h2>No guarantees</h2>
        <p>We do not guarantee specific outcomes, pickup or delivery dates, or pricing beyond what is confirmed in writing once you book. We do not guarantee carrier performance — but we vet carriers in our network and address service issues directly.</p>

        <h2>Surety bond</h2>
        <p>{BROKER.legal_name} maintains a {BROKER.bond.display}, as required by 49 CFR 387.307 for licensed property brokers.</p>

        <h2>Contact</h2>
        <p>{BROKER.legal_name}<br/>{BROKER.address.full}<br/>{BROKER.email} · {BROKER.phone}</p>

        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 32 }}>
          Last updated: 2026-05-01 (placeholder — do not rely on this date for compliance).
        </p>
      </div>
    </main>
  );
}
