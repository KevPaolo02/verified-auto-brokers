// Main app — orchestrates the prototype
const { useState: aS, useEffect: aE } = React;

const App = () => {
  const tweaks = useTweaks(/*EDITMODE-BEGIN*/{
    "hero": "registry",
    "accentRed": "#B0272D",
    "navy": "#0A1F44",
    "paper": "#F4F1EA",
    "showTicker": true,
    "showHowItWorks": true
  }/*EDITMODE-END*/);

  const [view, setView] = aS("home");
  const [activeBroker, setActiveBroker] = aS(null);
  const [modal, setModal] = aS(null);
  const [unlocked, setUnlocked] = aS({});
  const [searchQuery, setSearchQuery] = aS("");

  // apply CSS variables from tweaks
  aE(() => {
    const r = document.documentElement;
    r.style.setProperty("--navy", tweaks.navy);
    r.style.setProperty("--red", tweaks.accentRed);
    r.style.setProperty("--paper", tweaks.paper);
  }, [tweaks.navy, tweaks.accentRed, tweaks.paper]);

  const goHome = () => { setView("home"); setActiveBroker(null); window.scrollTo({top:0}); };
  const openProfile = (b) => { setActiveBroker(b); setView("profile"); window.scrollTo({top:0}); };

  const onNav = (k) => {
    if (k === "home") goHome();
    else if (k === "directory") { setView("directory"); window.scrollTo({top:0}); }
    else if (k === "alerts") { setView("alerts"); window.scrollTo({top:0}); }
    else if (k === "match") { setModal({kind: "match"}); }
    else if (k === "quote") { setModal({kind: "quote", broker: null}); }
    else if (k === "report") { setModal({kind:"quote", broker: null}); }
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
      <UI.TopBar stats={window.REGISTRY_STATS} />
      <UI.MainHeader onNav={onNav} view={view} />

      {view === "home" && (
        <>
          <Hero onSearch={onSearch} stats={window.REGISTRY_STATS} />
          {tweaks.showTicker && <UI.Ticker stats={window.REGISTRY_STATS} />}
          {tweaks.showHowItWorks && <HowItWorks onAction={onNav} />}
          <FeaturedBrokers onPick={openProfile} />
          <ScamCallout alerts={window.SCAM_ALERTS} onView={() => setView("alerts")} />
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
          <TweakButton onClick={() => onNav("alerts")}>Scam Alerts</TweakButton>
          <TweakButton onClick={() => setModal({kind:"quote", broker: null})}>Open Quote Flow</TweakButton>
          <TweakButton onClick={() => setModal({kind:"match"})}>Open Match Flow</TweakButton>
          <TweakButton onClick={() => openProfile(window.FMCSA_BROKERS[0])}>Sample Profile (Verified)</TweakButton>
          <TweakButton onClick={() => openProfile(window.FMCSA_BROKERS[3])}>Sample Profile (Flagged)</TweakButton>
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
          Free for shippers · Funded by verified brokers
        </UI.Mono>
      </div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 0, border:"1.5px solid var(--ink)"}}>
        {[
          ["01", "Look up any broker.", "Type a name, MC#, or DOT#. We tell you instantly if their authority is active, their bond is current, and what real customers say."],
          ["02", "Get matched or get quoted.", "Answer a few questions. We route you to up to 5 verified brokers — never to anyone on our flagged list. Compare. Choose."],
          ["03", "Ship with confidence.", "After delivery, we ask you to rate them. Your review feeds the next person's lookup. The registry gets sharper every week."]
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
  const featured = window.FMCSA_BROKERS.filter(b => !b.flagged && b.rating >= 4.7).slice(0, 3);
  return (
    <section style={{background:"var(--paper-deep)", padding: "72px 24px", borderTop: "1px solid var(--rule)"}}>
      <div style={{maxWidth: 1280, margin:"0 auto"}}>
        <div style={{display:"flex", alignItems:"baseline", gap: 14, marginBottom: 28}}>
          <UI.Eyebrow>§ Top Verified · This Month</UI.Eyebrow>
          <div style={{flex:1, height:1, background:"var(--rule)"}}></div>
          <UI.Mono style={{fontSize: 10.5, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", cursor:"pointer", borderBottom:"1px dotted var(--muted)"}}>
            View all 24,902 →
          </UI.Mono>
        </div>
        <h2 style={{
          fontFamily:"'Instrument Serif'", fontSize: "clamp(40px, 5vw, 64px)",
          lineHeight: 1, margin: 0, fontWeight: 400, letterSpacing:"-0.02em"
        }}>
          Brokers earning the most trust right now.
        </h2>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap: 0, marginTop: 36, border:"1.5px solid var(--ink)"}}>
          {featured.map((b, i) => (
            <div key={b.mc} onClick={() => onPick(b)} style={{
              padding: "28px 26px", cursor:"pointer",
              borderRight: i < 2 ? "1px solid var(--rule)" : "none",
              background: "var(--paper)",
              transition: "background 120ms"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--paper-deep)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--paper)"}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 14}}>
                <UI.Mono style={{fontSize: 11, color:"var(--muted)"}}>{b.mc}</UI.Mono>
                <UI.Stamp tone="verified" small>VERIFIED</UI.Stamp>
              </div>
              <h3 style={{fontFamily:"'Instrument Serif'", fontSize: 30, lineHeight: 1.05, margin: "0 0 8px", fontWeight: 400, letterSpacing: "-0.01em"}}>{b.name}</h3>
              <UI.Mono style={{fontSize: 10.5, color:"var(--muted)", letterSpacing:"0.1em", textTransform:"uppercase"}}>{b.city}, {b.state} · EST. {2026 - b.years}</UI.Mono>
              <div style={{margin: "18px 0", paddingTop: 14, borderTop: "1px dashed var(--rule)"}}>
                <p style={{fontFamily:"'Inter Tight'", fontSize: 14, lineHeight: 1.5, color:"var(--ink)", margin: 0}}>{b.bio}</p>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop: 14, borderTop: "1px solid var(--rule)"}}>
                <div style={{display:"flex", alignItems:"center", gap: 8}}>
                  <UI.StarRow rating={b.rating} size={12} />
                  <UI.Mono style={{fontSize: 12}}>{b.rating}</UI.Mono>
                  <UI.Mono style={{fontSize: 11, color:"var(--muted)"}}>({b.reviews.toLocaleString()})</UI.Mono>
                </div>
                <UI.Mono style={{fontSize: 11, color:"var(--navy)", letterSpacing:"0.12em", textTransform:"uppercase"}}>OPEN FILE →</UI.Mono>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ScamCallout = ({ alerts, onView }) => (
  <section style={{background:"var(--paper)", padding: "0", borderTop: "1px solid var(--rule)"}}>
    <div style={{maxWidth: 1280, margin:"0 auto", padding: "72px 24px"}}>
      <div style={{
        display:"grid", gridTemplateColumns: "1.1fr 1fr", gap: 56, alignItems: "center"
      }}>
        <div>
          <UI.Eyebrow color="var(--red)">⚠ Public Notice</UI.Eyebrow>
          <h2 style={{
            fontFamily:"'Instrument Serif'", fontSize: "clamp(40px, 5.4vw, 72px)",
            lineHeight: 0.98, margin: "12px 0 18px", letterSpacing:"-0.02em",
            color:"var(--ink)", fontWeight: 400
          }}>
            <em style={{color:"var(--red)"}}>387</em> scam reports in the last 30 days.
          </h2>
          <p style={{fontFamily:"'Inter Tight'", fontSize: 17, lineHeight: 1.55, color:"var(--ink)", maxWidth: 540}}>
            Auto-transport fraud is the fastest-growing freight scam category in the U.S. Identity-spoofed brokers, double-brokering, and price-after-pickup tactics cost consumers an estimated $89M last year. We name them publicly.
          </p>
          <button onClick={onView} style={{
            marginTop: 24,
            background:"var(--red)", color:"var(--paper)", border:"none",
            padding:"14px 22px", fontFamily:"'Inter Tight'", fontSize: 14,
            fontWeight: 600, cursor:"pointer"
          }}>See the Blacklist →</button>
        </div>
        <div style={{border:"1.5px solid var(--red)", background:"var(--red-tint)"}}>
          <div style={{background:"var(--red)", color:"var(--paper)", padding:"10px 18px", fontFamily:"'JetBrains Mono'", fontSize: 10.5, letterSpacing:"0.16em", textTransform:"uppercase", display:"flex", justifyContent:"space-between"}}>
            <span>BLACKLIST · LATEST</span><span>5 RECORDS</span>
          </div>
          {alerts.slice(0, 4).map((a, i) => (
            <div key={i} style={{padding:"14px 18px", borderBottom: i < 3 ? "1px solid var(--rule)" : "none"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
                <div style={{fontFamily:"'Inter Tight'", fontSize: 14.5, fontWeight: 600}}>{a.name}</div>
                <UI.Mono style={{fontSize: 10, color:"var(--muted)"}}>{a.mc}</UI.Mono>
              </div>
              <div style={{fontFamily:"'Inter Tight'", fontSize: 13, color:"var(--ink)", marginTop: 3}}>{a.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

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
            Move 50 cars a month? <em style={{color:"var(--amber)"}}>Move them right.</em>
          </h2>
          <p style={{fontFamily:"'Inter Tight'", fontSize: 17, lineHeight: 1.55, opacity: 0.85, maxWidth: 580}}>
            We route dealer volume to brokers with auction-lane experience, dedicated dispatch, and proven on-time records at Manheim, ADESA, Copart and Mecum. One form. Five qualified bids. No back-and-forth.
          </p>
          <div style={{display:"flex", gap: 12, marginTop: 28}}>
            <button onClick={onAction} style={{
              background:"var(--paper)", color:"var(--ink)", border:"none",
              padding:"14px 22px", fontFamily:"'Inter Tight'", fontSize: 14,
              fontWeight: 600, cursor:"pointer"
            }}>Request Dealer Quote →</button>
            <button style={{
              background:"transparent", color:"var(--paper)", border:"1.5px solid var(--paper)",
              padding:"14px 22px", fontFamily:"'Inter Tight'", fontSize: 14,
              fontWeight: 600, cursor:"pointer"
            }}>Volume Pricing</button>
          </div>
        </div>
        <div>
          {[
            ["1,200+", "Dealer accounts active"],
            ["94%", "On-time pickup rate (verified brokers)"],
            ["$0", "Cost to compare quotes"],
            ["48h", "Avg. carrier assignment for dealer freight"],
          ].map(([n, l], i) => (
            <div key={i} style={{
              display:"grid", gridTemplateColumns:"auto 1fr", gap: 24, alignItems:"baseline",
              padding: "14px 0", borderBottom: i < 3 ? "1px dashed rgba(244,241,234,0.25)" : "none"
            }}>
              <UI.Mono style={{fontFamily:"'Instrument Serif', serif", fontSize: 38, color:"var(--paper)"}}>{n}</UI.Mono>
              <span style={{fontFamily:"'Inter Tight'", fontSize: 14, opacity: 0.85}}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

window.App = App;
