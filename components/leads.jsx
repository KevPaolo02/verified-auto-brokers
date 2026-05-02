"use client";

// Lead capture flows: Quote, Unlock, Match · plus Alerts page · plus Footer
import React, { useState, useEffect } from "react";
import { UI } from "./ui-primitives";
import { BrokerService } from "./data";

// =========== QUOTE FLOW ===========

const QuoteFlow = ({ broker, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    pickup: "", dest: "", year: "", make: "", model: "",
    transport: "open", date: "", operable: "yes",
    name: "", email: "", phone: "", role: "consumer", notes: ""
  });
  const set = (k, v) => setData(d => ({...d, [k]: v}));
  const isLast = step === 4;

  const submit = () => {
    onSubmit && onSubmit({ kind: "quote", broker, data });
    setStep(99);
  };

  return (
    <Modal title={broker ? `Quote Request — ${broker.name}` : "Free Quote Request"}
           subtitle={broker ? `Routed direct to ${broker.mc}` : `Routed to up to 5 verified brokers`}
           onClose={onClose} step={step <= 4 ? step : null} totalSteps={4}>
      {step === 1 && (
        <Section title="Step 01 · Route">
          <Field label="Pickup ZIP or City"><Input value={data.pickup} onChange={v => set("pickup", v)} placeholder="e.g. 90210 or Beverly Hills, CA" /></Field>
          <Field label="Delivery ZIP or City"><Input value={data.dest} onChange={v => set("dest", v)} placeholder="e.g. 33139 or Miami Beach, FL" /></Field>
          <Field label="Earliest Pickup Date"><Input type="date" value={data.date} onChange={v => set("date", v)} /></Field>
        </Section>
      )}
      {step === 2 && (
        <Section title="Step 02 · Vehicle">
          <Field label="Year"><Input value={data.year} onChange={v => set("year", v)} placeholder="e.g. 2023" /></Field>
          <Field label="Make"><Input value={data.make} onChange={v => set("make", v)} placeholder="e.g. Porsche" /></Field>
          <Field label="Model"><Input value={data.model} onChange={v => set("model", v)} placeholder="e.g. 911 GT3" /></Field>
          <Field label="Operable?">
            <Radio value={data.operable} onChange={v => set("operable", v)} options={[["yes","Runs & drives"],["no","Inop / non-running"]]} />
          </Field>
        </Section>
      )}
      {step === 3 && (
        <Section title="Step 03 · Transport">
          <Field label="Transport Type">
            <Radio value={data.transport} onChange={v => set("transport", v)}
              options={[["open","Open · most common"],["enclosed","Enclosed · premium"],["expedited","Expedited"]]} />
          </Field>
          <Field label="I'm a…">
            <Radio value={data.role} onChange={v => set("role", v)}
              options={[["consumer","Individual"],["dealer","Dealer / Auction"],["business","Business / Relo"]]} />
          </Field>
          <Field label="Notes (optional)"><Textarea value={data.notes} onChange={v => set("notes", v)} placeholder="Anything the broker should know — gated community, low clearance, multi-vehicle, etc." /></Field>
        </Section>
      )}
      {step === 4 && (
        <Section title="Step 04 · Contact">
          <Field label="Full Name"><Input value={data.name} onChange={v => set("name", v)} placeholder="Jane Doe" /></Field>
          <Field label="Email"><Input value={data.email} onChange={v => set("email", v)} placeholder="jane@example.com" /></Field>
          <Field label="Phone"><Input value={data.phone} onChange={v => set("phone", v)} placeholder="(555) 555-5555" /></Field>
          <p style={{
            fontFamily:"'JetBrains Mono'", fontSize: 10.5, color:"var(--muted)",
            letterSpacing:"0.1em", textTransform:"uppercase", lineHeight: 1.5,
            border:"1px dashed var(--rule)", padding: "12px 14px", marginTop: 14
          }}>
            By submitting, you agree to be contacted by {broker ? broker.name : "up to 5 verified brokers"} regarding your shipment. We never sell your data to flagged brokers. Read our public-data policy.
          </p>
        </Section>
      )}
      {step === 99 && (
        <Section title="Confirmed">
          <div style={{
            border:"1.5px solid var(--ink)", padding: "28px 26px", background:"var(--paper-deep)"
          }}>
            <UI.Eyebrow>RECEIPT · 2026-04-30</UI.Eyebrow>
            <h3 style={{fontFamily:"'Instrument Serif'", fontSize: 36, lineHeight: 1.05, margin:"8px 0", fontWeight: 400}}>
              Quote routed.
            </h3>
            <p style={{fontFamily:"'Inter Tight'", fontSize: 15, lineHeight: 1.5, color:"var(--ink)"}}>
              {broker
                ? <>We&apos;ve sent your details to <strong>{broker.name}</strong> ({broker.mc}). They&apos;ll respond by phone or email within 1 business hour. We&apos;ve also CC&apos;d you a copy.</>
                : <>We&apos;ve routed your shipment to up to 5 verified brokers. You&apos;ll receive comparable quotes within 4 hours. No spam — only brokers who pass our active-authority and bond checks.</>
              }
            </p>
            <UI.Mono style={{fontSize: 11, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", display:"block", marginTop: 14}}>
              CONFIRMATION · VAB-{Math.floor(Math.random()*900000+100000)}
            </UI.Mono>
          </div>
        </Section>
      )}

      {step <= 4 && (
        <div style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          paddingTop: 24, marginTop: 24, borderTop:"1px solid var(--rule)"
        }}>
          <button onClick={() => step > 1 ? setStep(step-1) : onClose()}
            style={btnGhost}>{step > 1 ? "← Back" : "Cancel"}</button>
          <button onClick={() => isLast ? submit() : setStep(step+1)}
            style={btnPrimary}>
            {isLast ? "Submit Quote Request →" : "Continue →"}
          </button>
        </div>
      )}
      {step === 99 && (
        <div style={{paddingTop: 20, marginTop: 20, borderTop: "1px solid var(--rule)", textAlign:"right"}}>
          <button onClick={onClose} style={btnPrimary}>Done</button>
        </div>
      )}
    </Modal>
  );
};

// =========== UNLOCK FLOW ===========

const UnlockFlow = ({ broker, onClose, onSubmit }) => {
  const [data, setData] = useState({ name:"", email:"", phone:"", reason:"shipping" });
  const [done, setDone] = useState(false);
  const set = (k,v) => setData(d => ({...d, [k]: v}));

  if (done) {
    return (
      <Modal title="Direct Contact Unlocked" subtitle={broker.name} onClose={onClose}>
        <Section title="Verified Contact Details">
          <div style={{border:"1.5px solid var(--ink)", padding: "24px 24px", background:"var(--paper-deep)"}}>
            <DataRow2 label="Phone" value={broker.phone} />
            <DataRow2 label="Email" value={broker.email} />
            <DataRow2 label="HQ Address" value={`${broker.address}, ${broker.city}, ${broker.state}`} mono={false} />
            <DataRow2 label="Best Hours" value="Mon-Fri 8a-7p ET · Sat 9a-2p" mono={false} />
          </div>
          <p style={{fontFamily:"'JetBrains Mono'", fontSize: 10.5, color:"var(--muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginTop: 18, lineHeight: 1.5}}>
            Tip: when you call, mention you found them on Verified Auto Brokers. They get notified you came from a vetted source — usually means tighter pricing.
          </p>
          <div style={{paddingTop: 16, marginTop: 16, borderTop:"1px solid var(--rule)", textAlign:"right"}}>
            <button onClick={onClose} style={btnPrimary}>Close</button>
          </div>
        </Section>
      </Modal>
    );
  }

  return (
    <Modal title="Unlock Direct Contact"
           subtitle={`${broker.name} · ${broker.mc}`}
           onClose={onClose}>
      <p style={{fontFamily:"'Inter Tight'", fontSize: 15, lineHeight: 1.5, color:"var(--ink)", margin: "0 0 18px"}}>
        We share verified contact details with you for free. In exchange, we let the broker know a serious shipper from our registry is calling — so they prioritize the response.
      </p>
      <Field label="Full Name"><Input value={data.name} onChange={v => set("name", v)} /></Field>
      <Field label="Email"><Input value={data.email} onChange={v => set("email", v)} placeholder="we send the contact card here" /></Field>
      <Field label="Phone"><Input value={data.phone} onChange={v => set("phone", v)} placeholder="optional, recommended" /></Field>
      <Field label="Why you're contacting them">
        <Radio value={data.reason} onChange={v => set("reason", v)}
          options={[["shipping","Need a shipment quoted"],["dealer","I'm a dealer/auction"],["research","Vetting before hire"]]} />
      </Field>
      <div style={{display:"flex", justifyContent:"space-between", paddingTop: 22, marginTop: 22, borderTop:"1px solid var(--rule)"}}>
        <button onClick={onClose} style={btnGhost}>Cancel</button>
        <button onClick={() => { onSubmit && onSubmit({kind:"unlock", broker, data}); setDone(true); }} style={btnPrimary}>
          Unlock Contact ↗
        </button>
      </div>
    </Modal>
  );
};

// =========== MATCH FLOW ===========

const MatchFlow = ({ onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ what:"sedan", priority:"price", transport:"open", route:"long", contact:"", phone:"", email:"" });
  const [matched, setMatched] = useState([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const set = (k,v) => setData(d => ({...d, [k]: v}));

  const submit = async () => {
    onSubmit && onSubmit({kind:"match", data});
    // Match against the live registry — claimed/verified brokers only.
    setMatchLoading(true);
    try {
      const res = await BrokerService.searchBrokers({ claimed: true, page: 1, pageSize: 3 });
      setMatched(res.rows || []);
    } catch {
      setMatched([]);
    } finally {
      setMatchLoading(false);
      setStep(99);
    }
  };

  return (
    <Modal title="Smart Match" subtitle="Tell us 3 things. We'll route you to the 3 best fits." onClose={onClose} step={step<=3 ? step : null} totalSteps={3}>
      {step === 1 && (
        <Section title="What are you shipping?">
          <Radio value={data.what} onChange={v => set("what", v)} stack
            options={[
              ["sedan","Standard sedan / SUV / pickup"],
              ["luxury","Luxury or low-clearance vehicle"],
              ["classic","Classic / collector / show car"],
              ["multi","Multiple vehicles (dealer/auction)"],
              ["other","Boat, motorcycle, equipment"]
            ]} />
        </Section>
      )}
      {step === 2 && (
        <Section title="What matters most?">
          <Radio value={data.priority} onChange={v => set("priority", v)} stack
            options={[
              ["price","Lowest price"],
              ["speed","Fastest pickup & delivery"],
              ["trust","Highest trust / best reviews"],
              ["communication","Best communication"]
            ]} />
        </Section>
      )}
      {step === 3 && (
        <Section title="Your contact">
          <Field label="Full Name"><Input value={data.contact} onChange={v => set("contact", v)} /></Field>
          <Field label="Email"><Input value={data.email} onChange={v => set("email", v)} /></Field>
          <Field label="Phone"><Input value={data.phone} onChange={v => set("phone", v)} /></Field>
        </Section>
      )}
      {step === 99 && (
        <Section title={matched.length > 0 ? `Your ${matched.length} match${matched.length === 1 ? "" : "es"}` : "We'll be in touch"}>
          {matchLoading && (
            <p style={{fontFamily:"'JetBrains Mono'", fontSize: 11, color:"var(--muted)", letterSpacing:"0.14em", textTransform:"uppercase"}}>
              Matching against claimed listings…
            </p>
          )}
          {!matchLoading && matched.length === 0 && (
            <div style={{
              padding: "20px 22px", border: "1.5px dashed var(--ink)",
              background: "var(--paper-deep)", marginBottom: 14
            }}>
              <p style={{fontFamily:"'Inter Tight'", fontSize: 14.5, lineHeight: 1.5, margin: 0, color:"var(--ink)"}}>
                We don&apos;t have enough claimed listings on the registry yet to auto-match you. Your shipment details are saved — we&apos;ll reach out as more brokers complete claim verification.
              </p>
            </div>
          )}
          {matched.map((r, i) => (
            <div key={r.mc} style={{
              border:"1.5px solid var(--ink)", padding:"16px 18px", marginBottom: 10,
              display:"grid", gridTemplateColumns: "30px 1fr auto", gap: 16, alignItems:"center",
              background: i === 0 ? "var(--paper-deep)" : "var(--paper)"
            }}>
              <UI.Mono style={{fontSize: 22, color:"var(--ink)"}}>0{i+1}</UI.Mono>
              <div>
                <div style={{fontFamily:"'Inter Tight'", fontSize: 16, fontWeight: 600}}>{r.legal_name || r.dba_name || "—"}</div>
                <UI.Mono style={{fontSize:10.5, color:"var(--muted)", letterSpacing:"0.1em", textTransform:"uppercase"}}>
                  MC-{r.mc} · {[r.city, r.state].filter(Boolean).join(", ")}
                </UI.Mono>
              </div>
              <UI.Stamp tone="verified" small>◆ CLAIMED</UI.Stamp>
            </div>
          ))}
          {matched.length > 0 && (
            <p style={{fontFamily:"'Inter Tight'", fontSize: 13.5, lineHeight: 1.5, color:"var(--muted)", marginTop: 14}}>
              Matches are claimed brokers from our registry. We notify them about your shipment and they reach out directly. We don&apos;t guarantee response time.
            </p>
          )}
        </Section>
      )}

      {step <= 3 && (
        <div style={{display:"flex", justifyContent:"space-between", paddingTop: 22, marginTop: 22, borderTop:"1px solid var(--rule)"}}>
          <button onClick={() => step>1 ? setStep(step-1) : onClose()} style={btnGhost}>{step>1?"← Back":"Cancel"}</button>
          <button onClick={() => step===3 ? submit() : setStep(step+1)} style={btnPrimary}>
            {step===3 ? "Find My Matches →" : "Continue →"}
          </button>
        </div>
      )}
      {step === 99 && (
        <div style={{paddingTop:18, marginTop:18, borderTop:"1px solid var(--rule)", textAlign:"right"}}>
          <button onClick={onClose} style={btnPrimary}>Done</button>
        </div>
      )}
    </Modal>
  );
};

// =========== ALERTS PAGE ===========

// Alerts are derived from internal_flags + brokers with non-active authority — no fakery.
// For v1 we just show the empty state honestly until we wire up the live feed.
const AlertsPage = ({ onPick }) => {
  const [stats, setStats] = useState(null);
  useEffect(() => { BrokerService.getStats().then(setStats).catch(() => setStats(null)); }, []);
  const inactiveCount = stats ? Math.max(0, Number(stats.total_brokers || 0) - Number(stats.active_authority || 0)) : null;

  return (
    <section style={{background: "var(--paper)", padding: "40px 24px 80px"}}>
      <div style={{maxWidth: 1280, margin: "0 auto"}}>
        <UI.Eyebrow color="var(--red)">⚠ Public Notice</UI.Eyebrow>
        <h1 style={{fontFamily:"'Instrument Serif'", fontSize: "clamp(56px, 7vw, 96px)", lineHeight:0.95, margin:"12px 0 0", letterSpacing:"-0.02em", fontWeight:400}}>
          Authority &amp; bond <em style={{color:"var(--red)"}}>warnings</em>.
        </h1>
        <p style={{fontFamily:"'Inter Tight'", fontSize: 17, lineHeight: 1.5, color:"var(--ink)", maxWidth: 640, marginTop: 18}}>
          When a broker&apos;s FMCSA authority is inactive or revoked, or when our internal review surfaces a concern, it shows up here. We don&apos;t fabricate counts. We don&apos;t accept advertising from any broker we&apos;ve flagged.
        </p>

        <div style={{
          marginTop: 36, border:"1.5px solid var(--red)",
          background: "var(--paper)"
        }}>
          <div style={{
            background:"var(--red)", color:"var(--paper)", padding:"12px 22px",
            fontFamily:"'JetBrains Mono'", fontSize: 11, letterSpacing:"0.16em", textTransform:"uppercase",
            display:"flex", justifyContent:"space-between"
          }}>
            <span>Internal Flag List</span>
            <span>0 INTERNAL FLAGS · {inactiveCount == null ? "…" : inactiveCount.toLocaleString()} INACTIVE FMCSA AUTHORITY</span>
          </div>
          <div style={{padding: "40px 22px", textAlign: "center", background: "var(--red-tint)"}}>
            <p style={{fontFamily:"'Inter Tight'", fontSize: 16, color:"var(--ink)", margin: 0}}>
              No brokers are currently on our internal flag list.
            </p>
            <p style={{fontFamily:"'Inter Tight'", fontSize: 14, color:"var(--muted)", marginTop: 8}}>
              When we manually flag a broker for double-brokering, bond lapse, or complaint patterns, it appears here. The Directory marks any broker with inactive FMCSA authority — use the &quot;Inactive Authority&quot; filter there to see them.
            </p>
          </div>
        </div>

        <div style={{
          marginTop: 32, padding: "24px 26px",
          border: "1.5px solid var(--ink)", background:"var(--paper-deep)",
          display:"grid", gridTemplateColumns:"1fr auto", gap: 24, alignItems:"center"
        }}>
          <div>
            <UI.Eyebrow>Had a bad experience with a broker?</UI.Eyebrow>
            <h3 style={{fontFamily:"'Instrument Serif'", fontSize: 36, lineHeight:1, margin:"6px 0 0", fontWeight: 400}}>Report them.</h3>
            <p style={{fontFamily:"'Inter Tight'", fontSize: 14, lineHeight: 1.5, color:"var(--ink)", marginTop: 8, maxWidth: 520}}>
              Reports go to our internal review queue. We verify against FMCSA filings before adding any broker to the flag list. We don&apos;t flag without manual review.
            </p>
          </div>
          <button onClick={() => onPick("report")} style={btnPrimary}>File a Report →</button>
        </div>
      </div>
    </section>
  );
};

// =========== MODAL CHROME ===========

const Modal = ({ title, subtitle, onClose, children, step, totalSteps }) => (
  <div style={{
    position:"fixed", inset: 0, background: "rgba(10, 31, 68, 0.55)",
    zIndex: 1000, display:"grid", placeItems:"center", padding: 24
  }} onClick={onClose}>
    <div onClick={e => e.stopPropagation()} style={{
      background:"var(--paper)", border:"1.5px solid var(--ink)",
      width: "min(640px, 100%)", maxHeight:"90vh", overflowY:"auto",
      boxShadow: "10px 10px 0 var(--ink)"
    }}>
      <div style={{
        background:"var(--ink)", color:"var(--paper)",
        padding:"14px 22px", display:"flex", justifyContent:"space-between", alignItems:"center"
      }}>
        <div>
          <UI.Eyebrow color="var(--paper)">{title}</UI.Eyebrow>
          {subtitle && <div style={{fontFamily:"'Inter Tight'", fontSize: 13, marginTop: 3, opacity:.85}}>{subtitle}</div>}
        </div>
        <div style={{display:"flex", gap: 14, alignItems:"center"}}>
          {step && <UI.Mono style={{fontSize: 11, letterSpacing: "0.14em"}}>STEP {step}/{totalSteps}</UI.Mono>}
          <button onClick={onClose} style={{
            background:"transparent", color:"var(--paper)", border:"1px solid var(--paper)",
            padding:"4px 10px", cursor:"pointer", fontFamily:"'JetBrains Mono'",
            fontSize: 11, letterSpacing:"0.1em"
          }}>CLOSE ✕</button>
        </div>
      </div>
      {step && (
        <div style={{height: 4, background:"var(--rule)"}}>
          <div style={{height:"100%", width: `${(step/totalSteps)*100}%`, background:"var(--ink)", transition:"width 200ms"}}></div>
        </div>
      )}
      <div style={{padding: "26px 30px"}}>
        {children}
      </div>
    </div>
  </div>
);

// =========== FORM ATOMS ===========

const Section = ({ title, children }) => (
  <div>
    <UI.Eyebrow>{title}</UI.Eyebrow>
    <div style={{marginTop: 14}}>{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{marginBottom: 14}}>
    <div style={{
      fontFamily:"'JetBrains Mono'", fontSize: 10, letterSpacing:"0.14em",
      textTransform:"uppercase", color:"var(--muted)", marginBottom: 6
    }}>{label}</div>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = "text" }) => (
  <input value={value || ""} type={type} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{
      width: "100%", border: "1.5px solid var(--ink)", padding: "11px 14px",
      fontFamily:"'Inter Tight'", fontSize: 15, background:"var(--paper)",
      outline:"none", letterSpacing:"-0.01em"
    }} />
);

const Textarea = ({ value, onChange, placeholder }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
    style={{
      width: "100%", border:"1.5px solid var(--ink)", padding:"11px 14px",
      fontFamily:"'Inter Tight'", fontSize: 14.5, background:"var(--paper)",
      outline:"none", resize:"vertical"
    }} />
);

const Radio = ({ value, onChange, options, stack }) => (
  <div style={{display:"flex", flexDirection: stack ? "column" : "row", gap: 6, flexWrap:"wrap"}}>
    {options.map(([v, label]) => (
      <button key={v} onClick={() => onChange(v)} style={{
        flex: stack ? "1 1 100%" : "1 1 auto", textAlign:"left",
        padding: "10px 14px",
        background: value === v ? "var(--ink)" : "transparent",
        color: value === v ? "var(--paper)" : "var(--ink)",
        border: "1.5px solid var(--ink)",
        cursor: "pointer", fontFamily:"'Inter Tight'", fontSize: 14, fontWeight: 500
      }}>
        {value === v ? "● " : "○ "}{label}
      </button>
    ))}
  </div>
);

const DataRow2 = ({ label, value, mono = true }) => (
  <div style={{
    display:"grid", gridTemplateColumns: "120px 1fr",
    gap: 16, padding: "10px 0",
    borderBottom: "1px dashed var(--rule)"
  }}>
    <UI.Eyebrow>{label}</UI.Eyebrow>
    <div style={{
      fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter Tight'",
      fontSize: mono ? 14 : 14.5, color:"var(--ink)", fontWeight: 500
    }}>{value}</div>
  </div>
);

const btnPrimary = {
  background: "var(--ink)", color: "var(--paper)", border: "none",
  padding: "12px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
  fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em"
};
const btnGhost = {
  background: "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)",
  padding: "12px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
  fontWeight: 600, cursor: "pointer"
};

// =========== FOOTER ===========

const Footer = () => (
  <footer style={{background: "var(--ink)", color: "var(--paper)", padding: "56px 24px 32px", marginTop: 0}}>
    <div style={{maxWidth: 1280, margin:"0 auto"}}>
      <div style={{display:"grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48}}>
        <div>
          <div style={{display:"flex", alignItems:"center", gap: 14, marginBottom: 18}}>
            <div style={{
              width: 40, height: 40, border: "1.5px solid var(--paper)",
              display:"grid", placeItems:"center",
              fontFamily:"'Instrument Serif'", fontSize: 24
            }}>V</div>
            <div>
              <div style={{fontFamily:"'Instrument Serif'", fontSize: 22}}>Verified Auto Brokers</div>
              <UI.Mono style={{fontSize: 9.5, letterSpacing:"0.16em", textTransform:"uppercase", opacity:.7}}>
                THE INDEPENDENT REGISTRY
              </UI.Mono>
            </div>
          </div>
          <p style={{fontFamily:"'Inter Tight'", fontSize: 14, lineHeight: 1.6, opacity: 0.8, maxWidth: 420}}>
            We are not affiliated with the U.S. Department of Transportation or the FMCSA. We are an independent registry that surfaces public FMCSA data to protect consumers and dealers.
          </p>
        </div>
        {[
          ["Registry", ["Search Directory","Scam Alerts","New This Month","API Access (soon)"]],
          ["For Shippers", ["Get a Quote","Smart Match","Vet a Broker","Report Fraud"]],
          ["For Brokers", ["Claim Your Listing","Verification Process","Carrier Tools","Contact"]],
        ].map(([h, items]) => (
          <div key={h}>
            <UI.Eyebrow color="var(--paper)">{h}</UI.Eyebrow>
            <div style={{marginTop: 14}}>
              {items.map(it => (
                <div key={it} style={{padding: "5px 0", fontFamily:"'Inter Tight'", fontSize: 14, opacity: 0.8, cursor:"pointer"}}>{it}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop: 56, paddingTop: 24, borderTop: "1px solid rgba(244,241,234,0.18)", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <UI.Mono style={{fontSize: 10.5, letterSpacing:"0.14em", textTransform:"uppercase", opacity: 0.6}}>
          © 2026 Verified Auto Brokers · Public-data registry · No advertising from flagged brokers
        </UI.Mono>
        <UI.Mono style={{fontSize: 10.5, letterSpacing:"0.14em", textTransform:"uppercase", opacity: 0.6}}>
          DATA SOURCES · FMCSA QCMobile · FMCSA SOCRATA · BROKER-CLAIMED LISTINGS
        </UI.Mono>
      </div>
    </div>
  </footer>
);

export const LEAD = { QuoteFlow, UnlockFlow, MatchFlow, AlertsPage, Footer, Modal };
