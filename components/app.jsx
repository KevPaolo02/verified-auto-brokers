"use client";

// Main app — orchestrates the Verified Auto Brokers prototype.
// All registry data (counts, listings, claims) is fetched live from /api/brokers/*.
// No fabricated stats, no fake reviews, no fake scam alerts.

import React, { useState, useEffect } from "react";
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakColor,
  TweakToggle,
  TweakButton,
} from "./tweaks-panel";
import { UI } from "./ui-primitives";
import { HEROES } from "./heroes";
import { SCREENS } from "./screens";
import { LEAD } from "./leads";
import { BrokerService } from "./data";

// Maps a brokers-table row (claimed/verified) to the broker shape Profile expects.
function rowToBroker(r) {
  return {
    mc: r.mc ? `MC-${r.mc}` : null,
    dot: r.dot,
    name: r.legal_name || r.dba_name || "—",
    dba: r.dba_name,
    city: r.city,
    state: r.state,
    address: r.address || "",
    phone: r.phone,
    email: null,
    auth_status: r.broker_stat === "A" ? "ACTIVE" : "INACTIVE",
    auth_date: null,
    bond: { status: r.bond_on_file === "Y" ? "ACTIVE" : "UNKNOWN", amount: null, provider: null },
    insurance: { provider: null, liability: 0, cargo: 0 },
    fleet_partners: null,
    years: null,
    rating: 0,
    reviews: 0,
    verified: r.broker_stat === "A" && r.bond_on_file === "Y",
    flagged: r.broker_stat !== "A",
    flag_reason: null,
    specialties: [],
    bio: null,
  };
}

const App = ({ initialStats = null }) => {
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "hero": "registry",
    "accentRed": "#B0272D",
    "navy": "#0A1F44",
    "paper": "#F4F1EA",
    "showTicker": true,
    "showHowItWorks": true
  }/*EDITMODE-END*/);

  const [view, setView] = useState("home");
  const [activeBroker, setActiveBroker] = useState(null);
  const [modal, setModal] = useState(null);
  const [unlocked, setUnlocked] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  // Seed with server-rendered stats so first paint shows real numbers (not "—").
  const [stats, setStats] = useState(initialStats);

  // apply CSS variables from tweaks
  useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--navy", tweaks.navy);
    r.style.setProperty("--red", tweaks.accentRed);
    r.style.setProperty("--paper", tweaks.paper);
  }, [tweaks.navy, tweaks.accentRed, tweaks.paper]);

  // Refresh stats client-side after hydration in case the SSR snapshot is stale
  // (page revalidates every 5 min server-side; this catches faster claim updates).
  useEffect(() => {
    BrokerService.getStats().then(setStats).catch(() => {/* keep SSR value */});
  }, []);

  const goHome = () => { setView("home"); setActiveBroker(null); window.scrollTo({top:0}); };
  const openProfile = (b) => { setActiveBroker(b); setView("profile"); window.scrollTo({top:0}); };

  const onNav = (k) => {
    if (k === "home") goHome();
    else if (k === "directory") { setView("directory"); window.scrollTo({top:0}); }
    else if (k === "alerts") { setView("alerts"); window.scrollTo({top:0}); }
    else if (k === "match") { setModal({kind: "match"}); }
    else if (k === "quote") { setModal({kind: "quote", broker: null}); }
    else if (k === "report") { window.location.href = "/report-a-broker"; }
  };

  const onSearch = (p) => {
    if (p && p.broker) openProfile(p.broker);
    else if (p && p.query !== undefined) {
      setSearchQuery(p.query);
      setView("directory");
      window.scrollTo({top:0});
    }
  };

  const Hero =
    tweaks.hero === "bold" ? HEROES.HeroBoldNumber :
    tweaks.hero === "split" ? HEROES.HeroSplit :
    HEROES.HeroRegistry;

  return (
    <div style={{background:"var(--paper)", minHeight:"100vh"}}>
      <UI.TopBar stats={stats} />
      <UI.MainHeader onNav={onNav} view={view} />

      {view === "home" && (
        <>
          <Hero onSearch={onSearch} stats={stats} />
          {tweaks.showTicker && <UI.Ticker stats={stats} />}
          {tweaks.showHowItWorks && <HowItWorks onAction={onNav} />}
          <FeaturedBrokers onPick={openProfile} />
          <DealerStrip onAction={() => setModal({kind:"quote", broker: null})} />
        </>
      )}

      {view === "directory" && (
        <SCREENS.Directory onPick={openProfile} initialQuery={searchQuery} />
      )}

      {view === "profile" && activeBroker && (
        <SCREENS.Profile
          broker={activeBroker}
          onBack={() => setView("directory")}
          onQuote={(b) => setModal({kind:"quote", broker: b})}
          onUnlock={(b) => setModal({kind:"unlock", broker: b})}
          unlocked={!!unlocked[activeBroker.mc]}
        />
      )}

      {view === "alerts" && <LEAD.AlertsPage onPick={onNav} />}

      {modal && modal.kind === "quote" && (
        <LEAD.QuoteFlow broker={modal.broker} onClose={() => setModal(null)} onSubmit={() => {}} />
      )}
      {modal && modal.kind === "unlock" && (
        <LEAD.UnlockFlow broker={modal.broker}
          onClose={() => setModal(null)}
          onSubmit={() => setUnlocked(u => ({...u, [modal.broker.mc]: true}))} />
      )}
      {modal && modal.kind === "match" && (
        <LEAD.MatchFlow onClose={() => setModal(null)} onSubmit={() => {}} />
      )}

      <LEAD.Footer />

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Hero Variant">
          <TweakRadio
            value={tweaks.hero}
            onChange={(v) => setTweak("hero", v)}
            options={[
              { value: "registry", label: "Registry" },
              { value: "bold", label: "Big Number" },
              { value: "split", label: "Split Feed" }
            ]}
          />
        </TweakSection>
        <TweakSection title="Palette">
          <TweakColor label="Ink / Navy" value={tweaks.navy} onChange={(v) => setTweak("navy", v)} />
          <TweakColor label="Red Accent" value={tweaks.accentRed} onChange={(v) => setTweak("accentRed", v)} />
          <TweakColor label="Paper" value={tweaks.paper} onChange={(v) => setTweak("paper", v)} />
        </TweakSection>
        <TweakSection title="Sections">
          <TweakToggle label="Show Live Ticker" value={tweaks.showTicker} onChange={(v) => setTweak("showTicker", v)} />
          <TweakToggle label="Show How It Works" value={tweaks.showHowItWorks} onChange={(v) => setTweak("showHowItWorks", v)} />
        </TweakSection>
        <TweakSection title="Jump To">
          <TweakButton onClick={() => onNav("directory")}>Directory</TweakButton>
          <TweakButton onClick={() => onNav("alerts")}>Alerts</TweakButton>
          <TweakButton onClick={() => setModal({kind:"quote", broker: null})}>Open Quote Flow</TweakButton>
          <TweakButton onClick={() => setModal({kind:"match"})}>Open Match Flow</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

// =========== HOMEPAGE SECTIONS ===========

const HowItWorks = ({ onAction }) => (
  <section style={{background:"var(--paper)", padding: "80px 24px", borderTop:"1px solid var(--rule)"}}>
    <div style={{maxWidth: 1280, margin:"0 auto"}}>
      <div style={{display:"flex", alignItems:"baseline", gap: 14, marginBottom: 28}}>
        <UI.Eyebrow>§ How This Works</UI.Eyebrow>
        <div style={{flex:1, height:1, background:"var(--rule)"}}></div>
        <UI.Mono style={{fontSize:10, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase"}}>
          Free for shippers
        </UI.Mono>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 0, border:"1.5px solid var(--ink)"}}>
        {[
          ["01", "Look up any broker.", "Type a name, MC#, or DOT#. We pull the FMCSA public record on demand and show you whether their authority is active and their bond is on file."],
          ["02", "Compare claimed listings.", "Brokers can claim their listing and add a verified bio, specialties, and contact info. Every claim is reviewed manually before it shows up."],
          ["03", "Pick who fits.", "Get a free quote, request the broker's direct contact, or use Smart Match to be routed to claimed brokers that fit your shipment."]
        ].map(([n, h, p], i) => (
          <div key={n} style={{
            padding: "32px 28px",
            borderRight: i < 2 ? "1px solid var(--rule)" : "none",
            background: i === 1 ? "var(--paper-deep)" : "var(--paper)"
          }}>
            <div style={{
              fontFamily:"'Instrument Serif'", fontSize: 80, lineHeight: 1, color:"var(--ink)",
              opacity: 0.15, margin: "0 0 -20px"
            }}>{n}</div>
            <h3 style={{
              fontFamily:"'Instrument Serif'", fontSize: 30, lineHeight: 1.05,
              margin: "0 0 12px", fontWeight: 400, color:"var(--ink)", letterSpacing: "-0.01em"
            }}>{h}</h3>
            <p style={{fontFamily:"'Inter Tight'", fontSize: 15, lineHeight: 1.55, color:"var(--ink)"}}>{p}</p>
          </div>
        ))}
      </div>
      <div style={{marginTop: 32, display:"flex", gap: 12}}>
        <button onClick={() => onAction("match")} style={{
          background:"var(--ink)", color:"var(--paper)", border:"none",
          padding:"14px 24px", fontFamily:"'Inter Tight'", fontSize: 14,
          fontWeight: 600, cursor:"pointer"
        }}>Smart Match — 30 seconds →</button>
        <button onClick={() => onAction("directory")} style={{
          background:"transparent", color:"var(--ink)", border:"1.5px solid var(--ink)",
          padding:"14px 24px", fontFamily:"'Inter Tight'", fontSize: 14,
          fontWeight: 600, cursor:"pointer"
        }}>Browse the Registry</button>
      </div>
    </div>
  </section>
);

const FeaturedBrokers = ({ onPick }) => {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    BrokerService.searchBrokers({ claimed: true, page: 1, pageSize: 6 })
      .then((res) => setRows(res.rows))
      .catch(() => setRows([]));
  }, []);

  return (
    <section style={{background:"var(--paper-deep)", padding: "72px 24px", borderTop: "1px solid var(--rule)"}}>
      <div style={{maxWidth: 1280, margin:"0 auto"}}>
        <div style={{display:"flex", alignItems:"baseline", gap: 14, marginBottom: 28}}>
          <UI.Eyebrow>§ Claimed Listings</UI.Eyebrow>
          <div style={{flex:1, height:1, background:"var(--rule)"}}></div>
          <a href="/claim" style={{
            fontSize: 10.5, color:"var(--muted)", letterSpacing:"0.12em",
            textTransform:"uppercase", borderBottom:"1px dotted var(--muted)",
            textDecoration: "none", fontFamily: "'JetBrains Mono'"
          }}>
            Claim yours →
          </a>
        </div>
        <h2 style={{
          fontFamily:"'Instrument Serif'", fontSize: "clamp(40px, 5vw, 64px)",
          lineHeight: 1, margin: 0, fontWeight: 400, letterSpacing:"-0.02em"
        }}>
          Brokers who&apos;ve claimed their listing.
        </h2>
        <p style={{
          fontFamily: "'Inter Tight'", fontSize: 15, lineHeight: 1.55,
          color: "var(--ink)", marginTop: 16, maxWidth: 580,
        }}>
          Verified Auto Brokers tracks every FMCSA-licensed property broker. Brokers shown here have completed our claim verification — they supplied their own bio, specialties, and direct contact info.
        </p>

        {rows === null && (
          <div style={{padding: "60px 0", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase"}}>
            Loading…
          </div>
        )}

        {rows && rows.length === 0 && (
          <div style={{
            marginTop: 36, padding: "40px 32px", border: "1.5px dashed var(--ink)",
            background: "var(--paper)", textAlign: "center"
          }}>
            <UI.Mono style={{fontSize: 11, color:"var(--muted)", letterSpacing:"0.14em", textTransform:"uppercase"}}>No claimed listings yet</UI.Mono>
            <p style={{fontFamily: "'Inter Tight'", fontSize: 16, marginTop: 10, marginBottom: 16}}>
              Be the first claimed broker on the registry.
            </p>
            <a href="/claim" style={{
              display: "inline-block",
              background: "var(--ink)", color: "var(--paper)",
              padding: "12px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
              fontWeight: 600, letterSpacing: "0.02em", textDecoration: "none"
            }}>Claim your listing →</a>
          </div>
        )}

        {rows && rows.length > 0 && (
          <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 0, marginTop: 36, border:"1.5px solid var(--ink)"}}>
            {rows.slice(0, 3).map((r, i) => (
              <div key={r.mc} onClick={() => onPick(rowToBroker(r))} style={{
                padding: "28px 26px", cursor:"pointer",
                borderRight: i < 2 ? "1px solid var(--rule)" : "none",
                background: "var(--paper)",
                transition: "background 120ms"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--paper-deep)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--paper)"}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 14}}>
                  <UI.Mono style={{fontSize: 11, color:"var(--muted)"}}>MC-{r.mc}</UI.Mono>
                  <UI.Stamp tone="verified" small>◆ CLAIMED</UI.Stamp>
                </div>
                <h3 style={{fontFamily:"'Instrument Serif'", fontSize: 28, lineHeight: 1.05, margin: "0 0 8px", fontWeight: 400, letterSpacing: "-0.01em"}}>
                  {r.legal_name || r.dba_name || "—"}
                </h3>
                <UI.Mono style={{fontSize: 10.5, color:"var(--muted)", letterSpacing:"0.1em", textTransform:"uppercase"}}>
                  {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                </UI.Mono>
                <div style={{margin: "18px 0", paddingTop: 14, borderTop: "1px dashed var(--rule)", display: "flex", gap: 6, flexWrap: "wrap"}}>
                  {r.bond_on_file === "Y" && <UI.Stamp tone="verified" small>BOND</UI.Stamp>}
                  {r.broker_stat === "A" && <UI.Stamp tone="verified" small>FMCSA AUTH</UI.Stamp>}
                </div>
                <UI.Mono style={{fontSize: 11, color:"var(--navy)", letterSpacing:"0.12em", textTransform:"uppercase"}}>OPEN PROFILE →</UI.Mono>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Dealer-focused CTA. Removed the fabricated "1,200 dealers / 94% on-time / 48h" stats —
// we don't have the data to back those claims.
const DealerStrip = ({ onAction }) => (
  <section style={{background:"var(--ink)", color:"var(--paper)", padding: "64px 24px", borderTop:"1px solid var(--rule)"}}>
    <div style={{maxWidth: 1280, margin:"0 auto"}}>
      <div style={{display:"grid", gridTemplateColumns: "1.4fr 1fr", gap: 56, alignItems:"center"}}>
        <div>
          <UI.Eyebrow color="var(--paper)">For Dealers, Auctions & Wholesalers</UI.Eyebrow>
          <h2 style={{
            fontFamily:"'Instrument Serif'", fontSize: "clamp(40px, 5vw, 64px)",
            lineHeight: 1, margin:"12px 0 16px", fontWeight: 400, letterSpacing:"-0.02em"
          }}>
            Move volume? <em style={{color:"var(--amber)"}}>Move it transparently.</em>
          </h2>
          <p style={{fontFamily:"'Inter Tight'", fontSize: 17, lineHeight: 1.55, opacity: 0.85, maxWidth: 580}}>
            Submit one quote request and we route it to claimed brokers that match your route and equipment needs. Every broker we route to has active FMCSA authority, a bond on file, and has personally claimed their listing here.
          </p>
          <div style={{display:"flex", gap: 12, marginTop: 28}}>
            <button onClick={onAction} style={{
              background:"var(--paper)", color:"var(--ink)", border:"none",
              padding:"14px 22px", fontFamily:"'Inter Tight'", fontSize: 14,
              fontWeight: 600, cursor:"pointer"
            }}>Request a Quote →</button>
            <a href="/claim" style={{
              display:"inline-block",
              background:"transparent", color:"var(--paper)", border:"1.5px solid var(--paper)",
              padding:"14px 22px", fontFamily:"'Inter Tight'", fontSize: 14,
              fontWeight: 600, cursor:"pointer", textDecoration: "none"
            }}>Claim Your Listing</a>
          </div>
        </div>
        <div style={{borderLeft: "1px solid rgba(244,241,234,0.18)", paddingLeft: 32}}>
          <UI.Eyebrow color="var(--paper)" style={{ opacity: 0.85 }}>What we promise</UI.Eyebrow>
          <ul style={{
            fontFamily:"'Inter Tight'", fontSize: 14.5, lineHeight: 1.55,
            opacity: 0.85, paddingLeft: 18, margin: "10px 0 0"
          }}>
            <li>Your quote is only routed to brokers with active FMCSA authority.</li>
            <li>Bond status is checked against the FMCSA public record before routing.</li>
            <li>No flagged or inactive-authority brokers receive your information.</li>
            <li>Your contact details are never sold or shared with third parties.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default App;
