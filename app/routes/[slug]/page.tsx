// Server component: renders SEO-friendly content for a route landing page,
// then delegates the interactive funnel UI to a nested client component.
//
// Each route slug must be substantively differentiated in lib/routes.js — Google
// penalizes "doorway" pages that only swap city names. Real per-route content
// (cities, seasonal patterns, route-specific FAQs) lives in the route entry.

import { notFound } from "next/navigation";
import Link from "next/link";
import { getRoute, getRouteSlugs } from "@/lib/routes";
import { BROKER } from "@/lib/broker-info";
import RouteFunnel from "@/components/route-funnel";

export async function generateStaticParams() {
  return getRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const route = getRoute(params.slug);
  if (!route) return { title: "Route not found" };
  return {
    title: route.seo_title,
    description: route.seo_description,
  };
}

export default function RoutePage({ params }: { params: { slug: string } }) {
  const route = getRoute(params.slug);
  if (!route) notFound();

  const routeKey = `${route.origin.state}-${route.destination.state}`;
  const heroHeadline = `Ship a car from ${route.origin.state_name} to ${route.destination.state_name}.`;

  // Universal compliance FAQs (every route page must include these).
  const complianceFaqs = [
    {
      q: "Are you a broker or a carrier?",
      a: `${BROKER.legal_name} is a licensed FMCSA property broker (${BROKER.mc_display}, ${BROKER.dot_display}). We do not own trucks. We connect you with vetted, insured carriers from the FMCSA-authorized network and coordinate the shipment.`,
    },
    {
      q: "How is pricing determined?",
      a: "Indicative estimates are based on typical market rates for your route, distance, vehicle type, and transport type (open vs. enclosed). Final pricing is set by the carrier we book and depends on real-time carrier availability, fuel costs, route, and timing. We confirm an exact quote before you commit.",
    },
    {
      q: "Are pickup and delivery dates guaranteed?",
      a: "No. We give you an estimated pickup window and an estimated transit window — these are typical for the route, not guarantees. Auto transport is subject to weather, traffic, mechanical issues, and carrier scheduling. Anyone who guarantees dates in this industry is being dishonest.",
    },
    {
      q: "Is my vehicle insured during transport?",
      a: `Federal law requires every motor carrier we book to carry cargo insurance. We require carriers in our network to provide a current insurance certificate before dispatching a load. Coverage details (limits, deductibles, exclusions) vary by carrier — we share the certificate before pickup so you can review it. ${BROKER.legal_name} also maintains a ${BROKER.bond.display}.`,
    },
    {
      q: "Can I leave personal items in the car?",
      a: "Many carriers allow limited personal items, often around 100 lbs in the trunk only, but the final allowance depends on the assigned carrier and must be confirmed before pickup. Most carriers prohibit valuables, firearms, and anything visible above the window line. Items in the vehicle are not covered by the carrier's cargo insurance.",
    },
  ];

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      {/* TopBar with broker disclosure — required on every funnel page (49 CFR 371.2/371.5) */}
      <div style={{
        background: "var(--navy)", color: "var(--paper)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: "0.1em", padding: "6px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 24, textTransform: "uppercase" }}>
          <span>{BROKER.legal_name.toUpperCase()} · LICENSED FMCSA PROPERTY BROKER</span>
          <span style={{ opacity: 0.7 }}>{BROKER.mc_display} · {BROKER.dot_display}</span>
        </div>
        <div style={{ display: "flex", gap: 24, textTransform: "uppercase", opacity: 0.85 }}>
          <a href={`tel:${BROKER.phone_e164}`} style={{ color: "var(--paper)", textDecoration: "none" }}>
            CALL {BROKER.phone}
          </a>
        </div>
      </div>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section style={{ paddingTop: 24 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--muted)", fontWeight: 500,
          }}>
            Route File · {route.origin.state} → {route.destination.state} · ~{route.distance_miles.toLocaleString()} miles
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1.0,
            margin: "12px 0 18px", letterSpacing: "-0.02em",
            color: "var(--ink)", fontWeight: 400,
          }}>
            {heroHeadline}
          </h1>
          <p style={{
            fontFamily: "'Inter Tight', sans-serif", fontSize: 17, lineHeight: 1.55,
            color: "var(--ink)", maxWidth: 680, margin: "0 0 28px",
          }}>
            {route.hero_subhead}
          </p>

          {/* Funnel: ZIP form, estimate display, CTAs, TCPA consent, SMS capture */}
          <RouteFunnel route={route} routeKey={routeKey} />
        </section>

        {/* ── TRUST / TRANSPARENCY ─────────────────────────────────────── */}
        <section style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--rule)" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 16,
          }}>
            § How we operate
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginTop: 18 }}>
            <div>
              <h3 style={{ fontFamily: "'Instrument Serif'", fontSize: 28, lineHeight: 1.1, margin: "0 0 12px", fontWeight: 400 }}>
                We&apos;re a broker, not a carrier.
              </h3>
              <p style={{ fontFamily: "'Inter Tight'", fontSize: 15, lineHeight: 1.55, color: "var(--ink)", margin: 0 }}>
                {BROKER.legal_name} ({BROKER.mc_display}, {BROKER.dot_display}) is a licensed FMCSA property broker. We do not own trucks. We connect you with vetted carriers from the FMCSA-authorized network and coordinate the shipment from quote to delivery.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Instrument Serif'", fontSize: 28, lineHeight: 1.1, margin: "0 0 12px", fontWeight: 400 }}>
                Bonded and on file with the public record.
              </h3>
              <p style={{ fontFamily: "'Inter Tight'", fontSize: 15, lineHeight: 1.55, color: "var(--ink)", margin: 0 }}>
                We maintain a {BROKER.bond.display}. Every carrier we book is required to be FMCSA-authorized and to carry valid cargo insurance — we share the certificate with you before pickup.
              </p>
            </div>
          </div>

          <ul style={{
            marginTop: 28, padding: "20px 24px",
            border: "1px solid var(--rule)", background: "var(--paper-deep)",
            fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.7,
            listStyle: "none",
          }}>
            <li>✓ Licensed broker — {BROKER.mc_display} / {BROKER.dot_display}</li>
            <li>✓ Physical office — {BROKER.address.full}</li>
            <li>✓ {BROKER.bond.display}</li>
            <li>✓ Door-to-door service through carriers in the FMCSA-authorized network</li>
            <li>✓ Open or enclosed transport</li>
            <li>— Pickup and delivery dates are estimated, not guaranteed</li>
            <li>— Final pricing is set by the assigned carrier and confirmed before booking</li>
          </ul>
        </section>

        {/* ── ROUTE-SPECIFIC GUIDE ─────────────────────────────────────── */}
        <section style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--rule)" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 16,
          }}>
            § About the {route.origin.state}→{route.destination.state} corridor
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginTop: 18 }}>
            <div>
              <h3 style={{ fontFamily: "'Instrument Serif'", fontSize: 24, lineHeight: 1.15, margin: "0 0 10px", fontWeight: 400 }}>
                Cities we cover
              </h3>
              <p style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)" }}>
                <strong>Pickup ({route.origin.state}):</strong> {route.origin.major_cities.join(", ")}, plus surrounding suburbs.<br/><br/>
                <strong>Delivery ({route.destination.state}):</strong> {route.destination.major_cities.join(", ")}, plus most secondary cities and rural addresses.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Instrument Serif'", fontSize: 24, lineHeight: 1.15, margin: "0 0 10px", fontWeight: 400 }}>
                Seasonal patterns
              </h3>
              <p style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)" }}>
                {route.seasonal_notes}
              </p>
              <p style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)", marginTop: 12 }}>
                <strong>Typical transit:</strong> {route.typical_transit_days.low}–{route.typical_transit_days.high} days from pickup.
              </p>
            </div>
          </div>

          {route.common_considerations && (
            <div style={{ marginTop: 28 }}>
              <h3 style={{ fontFamily: "'Instrument Serif'", fontSize: 24, lineHeight: 1.15, margin: "0 0 10px", fontWeight: 400 }}>
                What to know about this route
              </h3>
              <ul style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.7, color: "var(--ink)", paddingLeft: 22 }}>
                {route.common_considerations.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* ── FAQ ───────────────────────────────────────────────────────── */}
        <section style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--rule)" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 16,
          }}>
            § Frequently asked
          </div>

          {/* Route-specific FAQs first (they're the SEO depth differentiator) */}
          <h3 style={{ fontFamily: "'Instrument Serif'", fontSize: 24, lineHeight: 1.15, margin: "12px 0 14px", fontWeight: 400 }}>
            About this route
          </h3>
          <div>
            {(route.route_faqs || []).map((f: { q: string; a: string }, i: number) => (
              <details key={i} style={{
                padding: "16px 18px", border: "1px solid var(--rule)", marginBottom: 10,
                background: "var(--paper)",
              }}>
                <summary style={{ cursor: "pointer", fontFamily: "'Inter Tight'", fontSize: 16, fontWeight: 600 }}>
                  {f.q}
                </summary>
                <p style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)", marginTop: 10, marginBottom: 0 }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>

          <h3 style={{ fontFamily: "'Instrument Serif'", fontSize: 24, lineHeight: 1.15, margin: "32px 0 14px", fontWeight: 400 }}>
            About auto transport
          </h3>
          <div>
            {complianceFaqs.map((f, i) => (
              <details key={i} style={{
                padding: "16px 18px", border: "1px solid var(--rule)", marginBottom: 10,
                background: "var(--paper)",
              }}>
                <summary style={{ cursor: "pointer", fontFamily: "'Inter Tight'", fontSize: 16, fontWeight: 600 }}>
                  {f.q}
                </summary>
                <p style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, lineHeight: 1.6, color: "var(--ink)", marginTop: 10, marginBottom: 0 }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
        <section style={{
          marginTop: 64, padding: "40px 32px",
          border: "1.5px solid var(--ink)", background: "var(--paper-deep)",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "'Instrument Serif'", fontSize: "clamp(32px, 4vw, 48px)",
            lineHeight: 1.1, margin: "0 0 14px", fontWeight: 400, letterSpacing: "-0.02em",
          }}>
            Ready to get an estimate?
          </h2>
          <p style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55, color: "var(--ink)", maxWidth: 540, margin: "0 auto 22px" }}>
            Two ways to start: get an indicative estimate online in seconds, or talk to a transport specialist directly.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#estimate" style={{
              background: "var(--ink)", color: "var(--paper)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Get an Estimate →</a>
            <a href={`tel:${BROKER.phone_e164}`} style={{
              background: "transparent", color: "var(--ink)",
              border: "1.5px solid var(--ink)",
              padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, textDecoration: "none",
            }}>Call {BROKER.phone}</a>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: "var(--ink)", color: "var(--paper)", padding: "40px 24px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 36 }}>
            <div>
              <div style={{ fontFamily: "'Instrument Serif'", fontSize: 22 }}>{BROKER.legal_name}</div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: "0.16em", textTransform: "uppercase",
                opacity: 0.7, marginTop: 6,
              }}>
                Licensed FMCSA Property Broker
              </div>
              <p style={{ fontFamily: "'Inter Tight'", fontSize: 13.5, lineHeight: 1.6, opacity: 0.85, marginTop: 14, maxWidth: 420 }}>
                {BROKER.address.full}<br/>
                {BROKER.phone} · {BROKER.email}<br/>
                {BROKER.mc_display} · {BROKER.dot_display}
              </p>
              <p style={{ fontFamily: "'Inter Tight'", fontSize: 12, lineHeight: 1.5, opacity: 0.6, marginTop: 14, maxWidth: 460 }}>
                {BROKER.legal_name} is a licensed FMCSA property broker, not a motor carrier. We do not own or operate trucks. {BROKER.bond.display}.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85 }}>Legal</div>
              <div style={{ marginTop: 12, fontFamily: "'Inter Tight'", fontSize: 13.5, lineHeight: 1.9 }}>
                <Link href="/privacy" style={{ color: "var(--paper)", opacity: 0.85, textDecoration: "none", display: "block" }}>Privacy Policy</Link>
                <Link href="/terms" style={{ color: "var(--paper)", opacity: 0.85, textDecoration: "none", display: "block" }}>Terms of Service</Link>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.85 }}>FMCSA Lookup</div>
              <div style={{ marginTop: 12, fontFamily: "'Inter Tight'", fontSize: 13.5, lineHeight: 1.6, opacity: 0.85 }}>
                <a href={`https://safer.fmcsa.dot.gov/CompanySnapshot.aspx`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--paper)", textDecoration: "none", borderBottom: "1px dotted rgba(255,255,255,0.4)" }}>
                  Verify on SAFER ↗
                </a>
              </div>
            </div>
          </div>
          <div style={{
            marginTop: 32, paddingTop: 18, borderTop: "1px solid rgba(244,241,234,0.18)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6,
          }}>
            <span>© 2026 {BROKER.legal_name} · Not affiliated with USDOT or FMCSA</span>
            <span>Pricing shown is indicative · Final price set at carrier confirmation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
