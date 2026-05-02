// PLACEHOLDER PRIVACY POLICY — must be reviewed and replaced by a licensed attorney
// before launch. The text below is a generic starting framework; it is not legal advice
// and may not satisfy CCPA/CPRA, GDPR, or state-specific requirements for your business.

import Link from "next/link";
import { BROKER } from "@/lib/broker-info";

export const metadata = {
  title: `Privacy Policy — ${BROKER.legal_name}`,
  description: "How we collect, use, and protect personal information.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <p style={{
          padding: "12px 14px", border: "1px dashed var(--red)", background: "var(--red-tint)",
          fontSize: 14, marginBottom: 28,
        }}>
          <strong>Draft notice:</strong> This page is a placeholder. The published policy must be drafted or reviewed by a qualified attorney before launch to ensure CCPA/CPRA, state, and federal compliance.
        </p>

        <h2>What we collect</h2>
        <p>When you use this site we may collect: name, email address, phone number, pickup and delivery ZIP codes, vehicle details, and information you submit through our quote forms. We also collect technical information about your visit (IP address, browser, pages viewed, referring URL) for analytics and fraud prevention.</p>

        <h2>How we use it</h2>
        <p>We use this information to provide quotes, connect you with carriers in our network, fulfill the auto transport service you requested, contact you about your shipment, comply with legal obligations, and improve our service.</p>

        <h2>Who we share it with</h2>
        <p>We share your shipment details with the FMCSA-authorized carriers we book on your behalf — they need to know what they're transporting and where. We may share information with service providers (CRM, payment processors, communications platforms) under written contracts that limit their use of your data. We do not sell your personal information to third parties for marketing.</p>

        <h2>SMS messaging</h2>
        <p>If you submit your phone number, you consent to receive text messages from {BROKER.legal_name} about your quote and shipment. Reply STOP at any time to opt out. Message and data rates may apply. We do not share phone numbers with third parties for marketing.</p>

        <h2>Your rights</h2>
        <p>You can request a copy of the personal information we hold about you, ask us to correct or delete it, or opt out of future communications. Email <a href={`mailto:${BROKER.email}`}>{BROKER.email}</a> with your request. California residents have additional rights under the CCPA/CPRA — contact us using the same email.</p>

        <h2>Contact</h2>
        <p>{BROKER.legal_name}<br/>{BROKER.address.full}<br/>{BROKER.email} · {BROKER.phone}</p>

        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 32 }}>
          Last updated: 2026-05-01 (placeholder — do not rely on this date for compliance).
        </p>
      </div>
    </main>
  );
}
