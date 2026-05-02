// Hero / Landing variations + Search experience
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

// =========== SEARCH BAR (the centerpiece) ===========

const LiveSearch = ({ size = "lg", onPick, placeholder, autoFocus }) => {
  const [q, setQ] = uS("");
  const [open, setOpen] = uS(false);
  const ref = uR();
  const brokers = window.FMCSA_BROKERS;

  const matches = uM(() => {
    if (!q.trim()) return [];
    const ql = q.toLowerCase();
    return brokers.filter(b =>
      b.name.toLowerCase().includes(ql) ||
      b.dba.toLowerCase().includes(ql) ||
      b.mc.toLowerCase().includes(ql) ||
      b.dot.includes(ql) ||
      b.state.toLowerCase() === ql ||
      b.city.toLowerCase().includes(ql)
    ).slice(0, 6);
  }, [q]);

  uE(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, []);

  const isLg = size === "lg";

  return (
    <div style={{position: "relative", width: "100%"}}>
      <div style={{
        display: "flex",
        border: `1.5px solid var(--ink)`,
        background: "var(--paper)",
        height: isLg ? 76 : 56,
        alignItems: "stretch",
        boxShadow: isLg ? "6px 6px 0 var(--ink)" : "none"
      }}>
        <div style={{
          display: "grid", placeItems: "center",
          padding: isLg ? "0 22px" : "0 16px",
          borderRight: "1.5px solid var(--ink)",
          background: "var(--navy)",
          color: "var(--paper)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: isLg ? 11 : 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 600
        }}>
          {isLg ? "FMCSA Lookup" : "Lookup"}
        </div>
        <input
          ref={ref}
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder || "Search by name, MC# (e.g. MC-279140), DOT#, or state…"}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: isLg ? "0 22px" : "0 16px",
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: isLg ? 19 : 15,
            background: "transparent",
            color: "var(--ink)",
            letterSpacing: "-0.01em"
          }}
        />
        <button onClick={() => onPick && onPick({ query: q })}
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            border: "none",
            padding: isLg ? "0 32px" : "0 22px",
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: isLg ? 14 : 12,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: "pointer"
          }}>VERIFY ↗</button>
      </div>

      {open && matches.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "var(--paper)",
          border: "1.5px solid var(--ink)",
          boxShadow: "6px 6px 0 var(--ink)",
          zIndex: 30
        }}>
          <div style={{
            padding: "8px 16px",
            background: "var(--paper-deep)",
            borderBottom: "1px solid var(--rule)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted)",
            display: "flex", justifyContent: "space-between"
          }}>
            <span>{matches.length} match{matches.length>1?"es":""} in registry</span>
            <span>Live · L&I sync</span>
          </div>
          {matches.map(b => (
            <div key={b.mc}
              onMouseDown={() => onPick && onPick({ broker: b })}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--rule)",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                gap: 14, alignItems: "center"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--paper-deep)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <UI.Mono style={{fontSize:11, color:"var(--muted)", width: 96}}>{b.mc}</UI.Mono>
              <div>
                <div style={{fontFamily:"'Inter Tight'", fontSize: 15, fontWeight:600}}>{b.name}</div>
                <div style={{fontFamily:"'JetBrains Mono'", fontSize: 10, color:"var(--muted)", letterSpacing:"0.1em", marginTop:2, textTransform:"uppercase"}}>
                  {b.city}, {b.state} · {b.years}Y · {b.fleet_partners.toLocaleString()} carriers
                </div>
              </div>
              <UI.StarRow rating={b.rating} size={11} />
              {b.flagged ? <UI.Stamp tone="flagged" small>FLAGGED</UI.Stamp>
                        : <UI.Stamp tone="verified" small>VERIFIED</UI.Stamp>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =========== HERO VARIANTS ===========

const HeroRegistry = ({ onSearch, stats }) => (
  <section style={{
    background: "var(--paper)",
    padding: "72px 24px 40px",
    borderBottom: "1px solid var(--rule)",
  }}>
    <div style={{maxWidth: 1280, margin: "0 auto"}}>
      <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom: 28}}>
        <div style={{width: 28, height: 1, background: "var(--ink)"}}></div>
        <UI.Eyebrow>Vol. I · Issue 04 · Public Registry of Licensed Auto Brokers</UI.Eyebrow>
        <div style={{flex:1, height: 1, background: "var(--rule)"}}></div>
        <UI.Mono style={{fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em"}}>UPDATED {stats.last_sync}</UI.Mono>
      </div>

      <h1 style={{
        fontFamily: "'Instrument Serif', serif",
        fontSize: "clamp(56px, 8vw, 124px)",
        lineHeight: 0.92,
        margin: 0,
        letterSpacing: "-0.02em",
        color: "var(--ink)",
        fontWeight: 400,
      }}>
        Every <em style={{fontStyle:"italic", color:"var(--red)"}}>licensed</em> auto broker<br/>
        in America. <span style={{opacity:.5}}>One source.</span>
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 64,
        marginTop: 56,
        alignItems: "end"
      }}>
        <div>
          <p style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 18, lineHeight: 1.5, color: "var(--ink)",
            maxWidth: 540, margin: "0 0 28px",
            letterSpacing: "-0.01em"
          }}>
            We pull the FMCSA <UI.Mono style={{fontSize: 15, background:"var(--paper-deep)", padding:"1px 6px", border:"1px solid var(--rule)"}}>L&I</UI.Mono> registry every six hours, cross-check
            bond status, surface complaints, and keep the scammers out. Free to search.
            Free to verify. Funded by quotes that actually go to verified brokers.
          </p>
          <LiveSearch size="lg" onPick={onSearch} autoFocus />
          <div style={{
            display:"flex", gap: 20, marginTop: 16,
            fontFamily:"'JetBrains Mono'", fontSize: 10.5,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "var(--muted)"
          }}>
            <span>TRY:</span>
            {["MC-279140", "Sherpa", "FL", "Enclosed Transport"].map(s => (
              <span key={s} style={{cursor:"pointer", color:"var(--navy)", borderBottom:"1px dotted var(--navy)"}}
                onClick={() => onSearch && onSearch({query: s})}>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          border: "1.5px solid var(--ink)",
          background: "var(--paper-deep)"
        }}>
          <div style={{
            background: "var(--ink)", color: "var(--paper)",
            padding: "8px 14px",
            fontFamily: "'JetBrains Mono'", fontSize: 10.5,
            letterSpacing: "0.16em", textTransform: "uppercase",
            display:"flex", justifyContent: "space-between"
          }}>
            <span>● THIS WEEK IN THE REGISTRY</span>
            <span>WK 18</span>
          </div>
          <div style={{padding: "16px 18px"}}>
            {[
              ["Authorities revoked", "12", "var(--red)"],
              ["New brokers verified", "47", "var(--ink)"],
              ["Scam reports filed", "94", "var(--red)"],
              ["Bond lapses detected", "18", "var(--ink)"],
              ["Quotes routed to verified", "3,712", "var(--ink)"],
            ].map(([label, num, color], i) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between", alignItems:"baseline",
                padding: "10px 0",
                borderBottom: i < 4 ? "1px dashed var(--rule)" : "none"
              }}>
                <span style={{fontFamily:"'Inter Tight'", fontSize: 13.5, color:"var(--ink)"}}>{label}</span>
                <UI.Mono style={{fontSize: 22, color, fontWeight: 500}}>{num}</UI.Mono>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HeroBoldNumber = ({ onSearch, stats }) => (
  <section style={{
    background: "var(--navy)",
    color: "var(--paper)",
    padding: "64px 24px 56px",
    position: "relative",
    overflow: "hidden"
  }}>
    {/* faint grid backdrop */}
    <div style={{
      position:"absolute", inset:0,
      backgroundImage: "linear-gradient(var(--paper-15) 1px, transparent 1px), linear-gradient(90deg, var(--paper-15) 1px, transparent 1px)",
      backgroundSize: "48px 48px",
      opacity: 0.4,
      pointerEvents: "none"
    }}></div>
    <div style={{maxWidth: 1280, margin: "0 auto", position:"relative"}}>
      <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom: 32}}>
        <UI.Eyebrow color="var(--paper)">PUBLIC INTEREST DATA · NO PAYWALL · NO ACCOUNT</UI.Eyebrow>
      </div>

      <div style={{display:"grid", gridTemplateColumns: "auto 1fr", gap: 56, alignItems: "start"}}>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(140px, 22vw, 320px)",
          lineHeight: 0.85,
          color: "var(--paper)",
          fontWeight: 400,
          letterSpacing: "-0.04em"
        }}>
          <UI.Mono style={{fontFamily:"'Instrument Serif', serif"}}>{stats.total_licensed_brokers.toLocaleString()}</UI.Mono>
        </div>
        <div style={{paddingTop: 32}}>
          <h1 style={{
            fontFamily:"'Instrument Serif', serif",
            fontSize: "clamp(36px, 4.5vw, 60px)",
            lineHeight: 1.0,
            margin: 0,
            letterSpacing:"-0.015em",
            color: "var(--paper)",
            fontWeight: 400
          }}>
            licensed brokers,<br/>
            <em style={{color:"var(--amber)"}}>vetted continuously.</em>
          </h1>
          <p style={{
            fontFamily: "'Inter Tight'", fontSize: 17, lineHeight: 1.55,
            maxWidth: 480, marginTop: 24, opacity: 0.85
          }}>
            Type any broker name or MC#. We tell you if their authority is active,
            their bond is current, and what real customers say. Then we route your
            quote to the ones that pass.
          </p>

          <div style={{marginTop: 32}}>
            <LiveSearch size="lg" onPick={onSearch} autoFocus />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const HeroSplit = ({ onSearch, stats }) => (
  <section style={{
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    minHeight: 560,
    background: "var(--paper)",
    borderBottom: "1px solid var(--rule)"
  }}>
    <div style={{
      padding: "56px 56px 48px",
      borderRight: "1px solid var(--rule)",
      display: "flex", flexDirection: "column", justifyContent: "space-between"
    }}>
      <div>
        <UI.Eyebrow>FILE 001 · THE INDEPENDENT REGISTRY</UI.Eyebrow>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(48px, 6vw, 84px)",
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          margin: "20px 0 0",
          color:"var(--ink)",
          fontWeight: 400
        }}>
          Don't hire<br/>a broker blind.
        </h1>
        <p style={{
          fontFamily:"'Inter Tight'", fontSize: 17, lineHeight: 1.55,
          color:"var(--ink)", maxWidth: 480, marginTop: 24
        }}>
          The FMCSA licenses tens of thousands of auto-transport brokers.
          Some are 18-year-old institutions. Some are scams that opened last week.
          We tell you which is which — for free.
        </p>
      </div>

      <div style={{marginTop: 40}}>
        <LiveSearch size="lg" onPick={onSearch} autoFocus />
        <div style={{
          marginTop: 24, display:"flex", gap: 32,
          fontFamily:"'JetBrains Mono'", fontSize: 10.5,
          letterSpacing: "0.14em", textTransform:"uppercase",
          color:"var(--muted)"
        }}>
          <span><span style={{color: "var(--navy)", fontSize: 14}}>●</span> {stats.active_authority.toLocaleString()} active</span>
          <span><span style={{color: "var(--red)", fontSize: 14}}>●</span> {stats.flagged_this_month} flagged</span>
          <span><span style={{color: "var(--amber-ink)", fontSize: 14}}>●</span> {stats.scam_reports_30d} reports/30d</span>
        </div>
      </div>
    </div>

    <div style={{
      background: "var(--paper-deep)",
      padding: "40px 40px",
      position:"relative",
      borderLeft: "0px",
      overflow: "hidden"
    }}>
      <UI.Eyebrow>RECENT FILINGS · LIVE FEED</UI.Eyebrow>
      <div style={{marginTop: 18}}>
        {window.SCAM_ALERTS.slice(0, 5).map((a, i) => (
          <div key={i} style={{
            padding: "16px 0",
            borderBottom: "1px solid var(--rule)",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 18,
            alignItems: "start"
          }}>
            <UI.Stamp tone="flagged" small>FLAG</UI.Stamp>
            <div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
                <div style={{fontFamily:"'Inter Tight'", fontSize: 15, fontWeight: 600, color:"var(--ink)"}}>{a.name}</div>
                <UI.Mono style={{fontSize: 10.5, color:"var(--muted)"}}>{a.date}</UI.Mono>
              </div>
              <UI.Mono style={{fontSize: 10.5, color:"var(--muted)", letterSpacing:"0.08em"}}>{a.mc}</UI.Mono>
              <div style={{fontFamily:"'Inter Tight'", fontSize: 13.5, color:"var(--ink)", marginTop: 6, lineHeight: 1.4}}>
                {a.reason}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

window.HEROES = { HeroRegistry, HeroBoldNumber, HeroSplit, LiveSearch };
