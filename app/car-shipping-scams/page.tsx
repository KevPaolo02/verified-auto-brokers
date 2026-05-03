// /car-shipping-scams — Phase C cluster page (highest ROI).
//
// Intent: emotional + conversion. Targets people already burned or worried about
// being burned. Operator tone, specific tactics, concrete defenses.
//
// SEO targets: "car shipping scams", "auto transport scams", "auto transport
// fraud", "fake car shipping company", "car shipping scam list".

import Link from "next/link";
import VerifyTool from "@/components/verify-tool";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { BROKER as VAB_BROKER } from "@/lib/broker-info";
import { buildBrokerSlug } from "@/lib/notable-brokers";
import { JsonLd, faqSchema, breadcrumbSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "7 Car Shipping Scams You Must Avoid (2026 Guide) — Verified Auto Brokers",
  description:
    "The 7 most common car shipping scams: lowball quotes, deposit traps, hostage vehicles, double-brokering, fake MC numbers. How to spot each one and what to do.",
  path: "/car-shipping-scams",
});

const gmfSlug = buildBrokerSlug({
  mc: VAB_BROKER.mc,
  legal_name: VAB_BROKER.legal_name,
  dba_name: VAB_BROKER.dba_name,
});

const SCAMS = [
  {
    n: 1,
    title: "The Lowball Quote",
    summary: "A broker quotes 30–50% under everyone else, you book, then the actual price doubles before pickup.",
    body: (
      <>
        <p>
          You ask 6 brokers for a Connecticut to Florida quote. Five say $1,100–$1,400. One says $650. You book the cheap one.
          Two days before pickup the broker calls: &quot;No carriers will run that lane for that price — we need to bump it to $1,350.&quot;
        </p>
        <p>
          The original quote was never real. They lowballed to win the booking. They knew no carrier would accept it.
          You&apos;re now stuck — your move dates are locked, you&apos;ve told the buyer/seller, and you have no time to start over.
        </p>
        <p>
          <strong>How to spot it:</strong> if a quote is more than 20% below the others, it&apos;s either bait or the broker has no idea what they&apos;re doing. Both are bad. Real auto-transport rates cluster in a tight band because carriers know what each lane pays.
        </p>
        <p>
          <strong>What to do:</strong> get 5+ quotes. Throw out the highest and the lowest. Pick from the middle three. And only book brokers with active FMCSA authority and a current bond.
        </p>
      </>
    ),
  },
  {
    n: 2,
    title: "The Deposit Trap",
    summary: "Broker takes a non-refundable deposit upfront, then ghosts you. No carrier ever shows up.",
    body: (
      <>
        <p>
          You pay a $200–$500 &quot;deposit to secure your spot.&quot; The broker says they&apos;re assigning a carrier. Days pass. They stop answering.
          When you do get them on the phone, they say &quot;the carrier fell through&quot; and offer to keep looking — or quietly refund you minus a service fee.
        </p>
        <p>
          They never assigned a carrier. They were waiting to see if a profitable one would walk in. If yes, they&apos;d run your load. If no, they&apos;d keep your deposit and move on.
        </p>
        <p>
          <strong>How to spot it:</strong> any deposit demanded BEFORE a specific carrier is assigned. Legitimate brokers don&apos;t need money to make calls. They get paid when the carrier picks up.
        </p>
        <p>
          <strong>What to do:</strong> never pay anything until you have the carrier&apos;s name, MC#, dispatch sheet, and pickup window in writing.
        </p>
      </>
    ),
  },
  {
    n: 3,
    title: "The Bait-and-Switch Pickup Price",
    summary: "Quoted $1,000. Driver shows up demanding $1,500 in cash before they&apos;ll load your car.",
    body: (
      <>
        <p>
          The driver is parked in front of your house with the car already on the trailer (or not yet loaded). They tell you the broker &quot;under-quoted you&quot; and the actual price is higher. If you don&apos;t pay the difference in cash, they&apos;ll either leave without your car or unload it and leave.
        </p>
        <p>
          The driver is usually telling the truth that the broker under-quoted them. The broker promised the carrier one rate to win their dispatch, then quoted you a different number. Now you&apos;re between them.
        </p>
        <p>
          <strong>How to spot it:</strong> a broker who refuses to give you the carrier&apos;s name + dispatch rate up front. If they hide what the carrier is actually getting paid, they&apos;re probably playing the spread.
        </p>
        <p>
          <strong>What to do:</strong> insist on a copy of the carrier&apos;s rate confirmation (the dispatch sheet) BEFORE pickup. Reputable brokers will share it. If yours won&apos;t, cancel.
        </p>
      </>
    ),
  },
  {
    n: 4,
    title: "Double-Brokering / Phantom Carrier",
    summary: "A broker books your load, then re-sells it to an unauthorized carrier you never agreed to.",
    body: (
      <>
        <p>
          You hire Broker A. They quote a carrier — Carrier X — with active authority and insurance. You agree.
          What actually shows up at pickup is Carrier Y, an unrelated company with no FMCSA authority, no insurance, and sometimes a stolen MC number.
        </p>
        <p>
          Broker A took the load and quietly sold it to a cheaper, unauthorized operator without telling you or the legitimate Carrier X. If anything happens to your vehicle, the insurance on Carrier X doesn&apos;t cover it (they were never on the load) and Carrier Y has no insurance at all.
        </p>
        <p>
          <strong>How to spot it:</strong> a different driver, different truck, or different MC# at pickup than what was on your dispatch sheet.
        </p>
        <p>
          <strong>What to do:</strong> at pickup, photograph the cab door (carrier name + MC# is required to be displayed there by federal law). Match it to your dispatch. If they don&apos;t match, do not load the vehicle and call the broker immediately.
        </p>
      </>
    ),
  },
  {
    n: 5,
    title: "Hostage Vehicle at Delivery",
    summary: "Carrier holds your vehicle until you pay an inflated &quot;final balance&quot; — usually in cash, often more than agreed.",
    body: (
      <>
        <p>
          The truck pulls up to the delivery address. The driver refuses to unload until you pay an amount that&apos;s higher than what was quoted. You either pay or watch your car drive away.
        </p>
        <p>
          This works because most consumers don&apos;t know they have legal rights here. Holding cargo for excess payment is a violation of the carrier&apos;s authority and a federal Surface Transportation Board issue. But in the moment, you don&apos;t have time to file complaints — you need your car.
        </p>
        <p>
          <strong>How to spot it:</strong> any carrier that demands cash-only at delivery, refuses electronic payment, or won&apos;t put the final number in writing before pickup.
        </p>
        <p>
          <strong>What to do:</strong> get the final delivery price in writing on your dispatch sheet BEFORE pickup. If they demand more at delivery, call the broker, take photos of the truck and driver, and tell them you&apos;ll file a complaint with the FMCSA National Consumer Complaint Database (1-888-DOT-SAFT). The threat alone often resolves it.
        </p>
      </>
    ),
  },
  {
    n: 6,
    title: "Fake MC Number / Identity Spoofing",
    summary: "A scam broker uses a real broker&apos;s MC number on quotes and contracts to look legitimate.",
    body: (
      <>
        <p>
          You look up the MC number on FMCSA — it&apos;s a real, active broker with a clean record. You book.
          The actual people running the operation aren&apos;t that broker — they&apos;re using the legitimate broker&apos;s MC#, name, and credentials to look real. The legitimate broker has no idea their identity is being used.
        </p>
        <p>
          When the scam runs (your vehicle disappears, your money is gone), you&apos;ll try to file a bond claim against the real broker. They&apos;ll say they have no record of you. Because they don&apos;t.
        </p>
        <p>
          <strong>How to spot it:</strong> the email/phone number doesn&apos;t match the company&apos;s public website. The contract is from a Gmail address. The broker&apos;s name on FMCSA matches but the physical address they give you doesn&apos;t.
        </p>
        <p>
          <strong>What to do:</strong> after looking up the MC, independently call the broker&apos;s phone number from their public website (NOT the number the salesperson gave you). Confirm they have your quote on file. <Link href="/verify-auto-transport-broker" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>Verify the MC here</Link> — we show the FMCSA-listed phone, not whatever number a salesperson sends you.
        </p>
      </>
    ),
  },
  {
    n: 7,
    title: "Cash-Only / No Paper Trail",
    summary: "Broker or carrier insists on cash, money order, or wire transfer with no documented invoice.",
    body: (
      <>
        <p>
          &quot;We don&apos;t take credit cards — too many chargebacks.&quot; &quot;Just send a money order.&quot; &quot;Pay cash to the driver.&quot; All sound reasonable. None should be acceptable.
        </p>
        <p>
          Cash with no paper trail means: no chargeback if the service fails, no documented contract, no proof you paid, no insurance claim eligibility. If anything goes wrong, you have nothing.
        </p>
        <p>
          <strong>How to spot it:</strong> any broker or carrier that explicitly refuses electronic payment methods. Even a Zelle or Venmo transfer (which leaves a digital trail) is better than cash.
        </p>
        <p>
          <strong>What to do:</strong> insist on credit card for at least the broker fee — the chargeback option is your only recourse if they fail to deliver. Cash on delivery to the carrier is normal in this industry, but the broker fee should always be on a card with a paper trail.
        </p>
      </>
    ),
  },
];

// Common questions visible on the page (rendered in the FAQ block below) and
// also surfaced as FAQPage JSON-LD for Google rich results. Same text in both.
const COMMON_QUESTIONS = [
  {
    q: "What is the most common car shipping scam?",
    a: "The lowball quote — a broker quotes a price 30-50% under everyone else, you book, then the actual price doubles before pickup. The original quote was never real; they used it to win the booking knowing no carrier would accept it.",
  },
  {
    q: "Are cheap car shipping quotes a scam?",
    a: "Not always, but a quote that's 20%+ below the others is either bait (no carrier will run it for that price) or signals a broker who doesn't know the market. Both end badly. Real auto-transport rates cluster in a tight band — get 5+ quotes and pick from the middle three.",
  },
  {
    q: "How do I verify an auto transport broker?",
    a: "Look up the broker's MC number on FMCSA, confirm broker authority is Active, confirm a $75,000 BMC-84 surety bond is on file, and match the legal company name. Use our free verify tool to run all four checks at once.",
  },
  {
    q: "What should I do if a broker takes my deposit and disappears?",
    a: "If they have an active BMC-84 bond, you can file a bond claim against the surety company — that's exactly what the bond exists for. File a complaint with the FMCSA National Consumer Complaint Database (1-888-DOT-SAFT) and dispute the charge with your credit card company if you paid with a card.",
  },
  {
    q: "What does it mean when a broker is 'double-brokering'?",
    a: "Double-brokering is when Broker A takes your load and quietly re-sells it to a different, often unauthorized, carrier without telling you. The carrier that shows up at pickup isn't the one on your dispatch sheet, and the insurance you thought you had doesn't actually cover the load.",
  },
  {
    q: "Can a carrier hold my car if I refuse to pay extra at delivery?",
    a: "No — holding cargo for excess payment violates the carrier's federal authority and is reportable to the FMCSA. Get the final delivery price in writing on your dispatch sheet before pickup. If a driver demands more at delivery, photograph the truck, call the broker, and tell them you'll file an FMCSA complaint.",
  },
  {
    q: "Are the MC numbers brokers display always real?",
    a: "Most are, but identity-spoofing scams use a real broker's MC number on quotes and contracts to look legitimate. Independently call the company at the FMCSA-listed phone number (not the salesperson's) to confirm they have your quote on file.",
  },
];

export default function ScamsPage() {
  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <JsonLd data={[
        faqSchema({ questions: COMMON_QUESTIONS }),
        breadcrumbSchema({
          items: [
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Car Shipping Scams", url: `${SITE_URL}/car-shipping-scams` },
          ],
        }),
      ]} />
      <div style={{
        background: "var(--navy)", color: "var(--paper)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: "0.1em", padding: "6px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", gap: 24, textTransform: "uppercase" }}>
          <Link href="/" style={{ color: "var(--paper)", textDecoration: "none" }}>← VERIFIED AUTO BROKERS</Link>
          <span style={{ opacity: 0.7 }}>FRAUD AWARENESS</span>
        </div>
      </div>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--red)", fontWeight: 600, marginBottom: 14,
        }}>
          ⚠ Public Notice · Fraud Awareness Guide
        </div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 1.0,
          margin: "0 0 22px", letterSpacing: "-0.02em",
          color: "var(--ink)", fontWeight: 400,
        }}>
          7 car shipping scams you must avoid.
        </h1>

        <p style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 19,
          lineHeight: 1.5, color: "var(--ink)",
          margin: "0 0 32px",
        }}>
          The auto-transport industry runs on trust and the trust gets exploited every week. These are the seven specific scams that catch the most consumers — how each one works, how to spot it before you book, and what to do if it&apos;s already happening.
        </p>

        <p style={{
          fontFamily: "'Inter Tight', sans-serif", fontSize: 16,
          lineHeight: 1.6, color: "var(--ink)",
          margin: "0 0 40px", padding: "16px 20px",
          background: "var(--paper-deep)", border: "1px dashed var(--ink)",
        }}>
          <strong>The single most important defense:</strong> verify any broker&apos;s FMCSA license, broker authority, and BMC-84 bond status BEFORE you pay anything. Every scam below either gets blocked or becomes recoverable when those three checks pass. <Link href="/verify-auto-transport-broker" style={{color:"var(--navy)", borderBottom:"1px dotted var(--navy)", textDecoration:"none"}}>Run the check here</Link> (it takes 30 seconds).
        </p>

        {/* ── SCAMS 1–3 ─────────────────────────────────────────────────── */}
        {SCAMS.slice(0, 3).map((s) => <Scam key={s.n} {...s} />)}

        {/* ── MID-PAGE EMBEDDED VERIFY TOOL (conversion multiplier) ──────── */}
        <div style={{
          margin: "48px 0",
          padding: "36px 32px",
          border: "1.5px solid var(--ink)",
          background: "var(--paper)",
          boxShadow: "8px 8px 0 var(--ink)",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--navy)", marginBottom: 10,
          }}>§ Free Tool · 30 Seconds</div>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(26px, 3vw, 36px)", lineHeight: 1.1,
            margin: "0 0 14px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            Check if your broker is legit right now.
          </h2>
          <p style={{
            fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55,
            margin: "0 0 20px", color: "var(--ink)",
          }}>
            Type the MC number or company name. We pull live FMCSA data and tell you whether their authority is active and bond is on file.
          </p>
          <VerifyTool />
        </div>

        {/* ── SCAMS 4–7 ─────────────────────────────────────────────────── */}
        {SCAMS.slice(3).map((s) => <Scam key={s.n} {...s} />)}

        {/* ── COMMON QUESTIONS (FAQ) — visible content matches FAQPage schema ── */}
        <section style={{ marginTop: 56 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 14,
          }}>§ Common Questions</div>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.1,
            margin: "0 0 18px", letterSpacing: "-0.015em", fontWeight: 400,
          }}>
            What people ask about car shipping scams.
          </h2>
          <div>
            {COMMON_QUESTIONS.map((qa, i) => (
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

        {/* ── INTERNAL LINK CLUSTER ─────────────────────────────────────── */}
        <section style={{ marginTop: 56, padding: "24px 26px", border: "1px solid var(--rule)", background: "var(--paper-deep)" }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--ink)", marginBottom: 14,
          }}>Related guides</div>
          <ul style={{ fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.8, paddingLeft: 22, margin: 0 }}>
            <li><Link href="/how-to-check-auto-transport-broker" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>How to check if an auto transport broker is legit</Link> — the 4 specific FMCSA checks every shipper should run before booking.</li>
            <li><Link href="/broker-vs-carrier" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>Broker vs carrier — what&apos;s the difference?</Link> — most scams happen because consumers don&apos;t understand who they&apos;re actually paying.</li>
            <li><Link href="/what-is-mc-number" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>What is an MC number?</Link> — the federal license every legitimate broker must have.</li>
            <li><Link href={`/brokers/uship-mc-973139`} style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>Example: uShip — FMCSA verified profile</Link> — what a legitimate broker&apos;s public record looks like.</li>
          </ul>
        </section>

        {/* ── CONVERSION CTA ────────────────────────────────────────────── */}
        <section style={{
          marginTop: 56, padding: "40px 32px",
          border: "1.5px solid var(--ink)", background: "var(--paper-deep)",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(28px, 3.5vw, 40px)", lineHeight: 1.1,
            margin: "0 0 12px", fontWeight: 400, letterSpacing: "-0.015em",
          }}>
            Skip the risk.
          </h2>
          <p style={{
            fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55,
            color: "var(--ink)", maxWidth: 540, margin: "0 auto 14px",
          }}>
            Verify any broker yourself, or get a quote from a broker we operate ourselves with full FMCSA license, $75K bond on file, and direct contact info.
          </p>
          <p style={{
            fontFamily: "'Inter Tight'", fontStyle: "italic",
            fontSize: 14.5, lineHeight: 1.5,
            color: "var(--muted)", maxWidth: 540, margin: "0 auto 22px",
          }}>
            Most issues in car shipping happen when brokers aren&apos;t verified up front.
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

function Scam({ n, title, summary, body }: { n: number; title: string; summary: string; body: React.ReactNode }) {
  return (
    <section style={{ marginTop: 48, paddingTop: 28, borderTop: "1px solid var(--rule)" }}>
      <div style={{
        display: "flex", alignItems: "baseline", gap: 16, marginBottom: 12,
      }}>
        <span style={{
          fontFamily: "'Instrument Serif', serif", fontSize: 64, lineHeight: 1,
          color: "var(--red)", fontWeight: 400, opacity: 0.7,
        }}>0{n}</span>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(26px, 3.2vw, 38px)", lineHeight: 1.1,
          margin: 0, fontWeight: 400, letterSpacing: "-0.015em",
          color: "var(--ink)",
        }}>{title}</h2>
      </div>
      <p style={{
        fontFamily: "'Inter Tight', sans-serif", fontSize: 17,
        lineHeight: 1.5, color: "var(--ink)",
        fontWeight: 500, marginBottom: 16,
      }}>
        {summary}
      </p>
      <div style={{
        fontFamily: "'Inter Tight', sans-serif", fontSize: 16,
        lineHeight: 1.65, color: "var(--ink)",
      }}>
        {body}
      </div>
    </section>
  );
}
