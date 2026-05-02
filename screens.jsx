// Directory, Profile, Lead Capture, Alerts, Match flow
const { useState: dS, useMemo: dM, useEffect: dE } = React;

// =========== DIRECTORY / SEARCH RESULTS ===========

const Directory = ({ onPick, initialQuery = "" }) => {
  const [q, setQ] = dS(initialQuery);
  const [filters, setFilters] = dS({
    verified: false, flagged: false, enclosed: false, bonded: false,
    sort: "rating"
  });
  const brokers = window.FMCSA_BROKERS;

  const results = dM(() => {
    let r = brokers;
    if (q.trim()) {
      const ql = q.toLowerCase();
      r = r.filter(b =>
        b.name.toLowerCase().includes(ql) || b.dba.toLowerCase().includes(ql) ||
        b.mc.toLowerCase().includes(ql) || b.dot.includes(ql) ||
        b.state.toLowerCase() === ql || b.city.toLowerCase().includes(ql) ||
        b.specialties.some(s => s.toLowerCase().includes(ql))
      );
    }
    if (filters.verified) r = r.filter(b => b.verified && !b.flagged);
    if (filters.flagged) r = r.filter(b => b.flagged);
    if (filters.enclosed) r = r.filter(b => b.specialties.some(s => /enclosed/i.test(s)));
    if (filters.bonded) r = r.filter(b => b.bond && b.bond.status === "ACTIVE");
    if (filters.sort === "rating") r = [...r].sort((a, b) => b.rating - a.rating);
    if (filters.sort === "years") r = [...r].sort((a, b) => b.years - a.years);
    if (filters.sort === "fleet") r = [...r].sort((a, b) => b.fleet_partners - a.fleet_partners);
    return r;
  }, [q, filters]);

  return (
    <section style={{background: "var(--paper)", padding: "32px 24px 80px"}}>
      <div style={{maxWidth: 1280, margin: "0 auto"}}>
        <div style={{display:"flex", alignItems:"baseline", gap: 14, marginBottom: 18}}>
          <UI.Eyebrow>§ Directory · 27,418 records</UI.Eyebrow>
          <div style={{flex:1, height:1, background:"var(--rule)"}}></div>
        </div>

        <h2 style={{
          fontFamily:"'Instrument Serif'", fontSize: 56, lineHeight: 1, margin: 0,
          color:"var(--ink)", fontWeight: 400, letterSpacing:"-0.02em"
        }}>
          Search the registry.
        </h2>

        <div style={{marginTop: 28}}>
          <HEROES.LiveSearch
            size="md"
            placeholder="Search 27,418 brokers — name, MC#, DOT#, city, state, or specialty"
            onPick={(p) => {
              if (p.broker) onPick(p.broker);
              else setQ(p.query);
            }}
          />
        </div>

        <div style={{
          display:"flex", gap: 8, marginTop: 18, flexWrap:"wrap",
          alignItems: "center"
        }}>
          {[
            ["verified", "Verified Only"],
            ["flagged", "Show Flagged"],
            ["enclosed", "Enclosed Capable"],
            ["bonded", "Bond Active"],
          ].map(([k, label]) => (
            <button key={k} onClick={() => setFilters(f => ({...f, [k]: !f[k]}))}
              style={{
                fontFamily:"'JetBrains Mono'", fontSize: 10.5,
                letterSpacing:"0.12em", textTransform:"uppercase",
                padding: "7px 12px",
                background: filters[k] ? "var(--ink)" : "transparent",
                color: filters[k] ? "var(--paper)" : "var(--ink)",
                border: "1px solid var(--ink)", cursor:"pointer"
              }}>
              {filters[k] ? "▣" : "□"} {label}
            </button>
          ))}
          <div style={{flex:1}}></div>
          <UI.Mono style={{fontSize: 10.5, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase"}}>SORT BY</UI.Mono>
          <select value={filters.sort} onChange={e => setFilters(f => ({...f, sort: e.target.value}))}
            style={{
              fontFamily:"'JetBrains Mono'", fontSize: 10.5,
              padding: "6px 10px", border: "1px solid var(--ink)",
              background:"var(--paper)", textTransform:"uppercase", letterSpacing:"0.1em"
            }}>
            <option value="rating">Rating</option>
            <option value="years">Years Active</option>
            <option value="fleet">Carrier Network</option>
          </select>
        </div>

        <div style={{
          marginTop: 28,
          border: "1.5px solid var(--ink)",
          background: "var(--paper)"
        }}>
          {/* table header */}
          <div style={{
            display:"grid",
            gridTemplateColumns: "120px 1.6fr 1fr 0.8fr 0.8fr 1fr auto",
            gap: 16, padding: "12px 18px",
            background: "var(--ink)", color: "var(--paper)",
            fontFamily:"'JetBrains Mono'", fontSize: 10,
            letterSpacing:"0.16em", textTransform:"uppercase",
          }}>
            <span>MC #</span><span>Broker</span><span>Location</span>
            <span>Years</span><span>Carriers</span><span>Rating</span><span></span>
          </div>
          {results.map((b, i) => (
            <div key={b.mc} onClick={() => onPick(b)}
              style={{
                display:"grid",
                gridTemplateColumns: "120px 1.6fr 1fr 0.8fr 0.8fr 1fr auto",
                gap: 16, padding: "16px 18px",
                borderBottom: i < results.length - 1 ? "1px solid var(--rule)" : "none",
                cursor: "pointer", alignItems: "center",
                background: b.flagged ? "var(--red-tint)" : "transparent"
              }}
              onMouseEnter={e => { if(!b.flagged) e.currentTarget.style.background = "var(--paper-deep)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = b.flagged ? "var(--red-tint)" : "transparent"; }}>
              <UI.Mono style={{fontSize: 12, color: "var(--muted)"}}>{b.mc}</UI.Mono>
              <div>
                <div style={{fontFamily:"'Inter Tight'", fontSize: 16, fontWeight: 600, letterSpacing:"-0.01em"}}>{b.name}</div>
                <div style={{fontFamily:"'JetBrains Mono'", fontSize: 9.5, color:"var(--muted)", letterSpacing:"0.1em", marginTop:3, textTransform:"uppercase"}}>
                  {b.specialties.slice(0,3).join(" · ")}
                </div>
              </div>
              <div style={{fontFamily:"'Inter Tight'", fontSize: 13}}>
                {b.city}<span style={{color:"var(--muted)"}}>, {b.state}</span>
              </div>
              <UI.Mono style={{fontSize: 14}}>{b.years}y</UI.Mono>
              <UI.Mono style={{fontSize: 13}}>{b.fleet_partners.toLocaleString()}</UI.Mono>
              <div style={{display:"flex", alignItems:"center", gap: 6}}>
                <UI.StarRow rating={b.rating} size={11} />
                <UI.Mono style={{fontSize: 11.5, color:"var(--muted)"}}>{b.rating}</UI.Mono>
              </div>
              {b.flagged ? <UI.Stamp tone="flagged" small>FLAGGED</UI.Stamp>
                        : <UI.Stamp tone="verified" small>VERIFIED</UI.Stamp>}
            </div>
          ))}
          {results.length === 0 && (
            <div style={{padding: "60px 20px", textAlign:"center", fontFamily:"'Inter Tight'", color:"var(--muted)"}}>
              No matches. Try clearing filters or a different query.
            </div>
          )}
        </div>

        <div style={{
          marginTop: 14, fontFamily:"'JetBrains Mono'", fontSize: 10.5,
          color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase"
        }}>
          SHOWING {results.length} OF 27,418 · DEMO DATASET · LIVE FMCSA SYNC ON PRODUCTION
        </div>
      </div>
    </section>
  );
};

// =========== BROKER PROFILE ===========

const Profile = ({ broker, onBack, onQuote, onUnlock, unlocked }) => {
  const [tab, setTab] = dS("overview");
  const reviews = window.SAMPLE_REVIEWS[broker.mc] || [];

  return (
    <section style={{background: "var(--paper)", padding: "24px 24px 80px"}}>
      <div style={{maxWidth: 1280, margin: "0 auto"}}>
        <button onClick={onBack} style={{
          background:"none", border:"none", cursor:"pointer",
          fontFamily:"'JetBrains Mono'", fontSize: 11, letterSpacing:"0.14em",
          textTransform:"uppercase", color: "var(--muted)", padding: "8px 0",
          marginBottom: 12
        }}>← BACK TO REGISTRY</button>

        {/* document header */}
        <div style={{
          border: "1.5px solid var(--ink)",
          background: "var(--paper)"
        }}>
          {/* file marker */}
          <div style={{
            display:"flex", justifyContent:"space-between",
            background: broker.flagged ? "var(--red)" : "var(--ink)",
            color: "var(--paper)",
            padding: "10px 22px",
            fontFamily:"'JetBrains Mono'", fontSize: 10.5,
            letterSpacing: "0.16em", textTransform: "uppercase"
          }}>
            <span>FILE · {broker.mc} / DOT-{broker.dot}</span>
            <span>RECORD CHECKED 2026-04-30 14:22 UTC</span>
          </div>

          <div style={{padding: "32px 36px"}}>
            <div style={{display:"grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems:"start"}}>
              <div>
                <UI.Eyebrow>{broker.auth_status === "ACTIVE" ? "Operating Authority · Active" : "Operating Authority · Inactive"}</UI.Eyebrow>
                <h1 style={{
                  fontFamily: "'Instrument Serif'", fontSize: 64, lineHeight: 1,
                  margin: "10px 0 4px", letterSpacing: "-0.02em",
                  fontWeight: 400, color: "var(--ink)"
                }}>{broker.name}</h1>
                <div style={{
                  fontFamily:"'JetBrains Mono'", fontSize: 12, color:"var(--muted)",
                  letterSpacing:"0.1em", textTransform:"uppercase"
                }}>
                  d/b/a {broker.dba} · {broker.address}, {broker.city}, {broker.state}
                </div>
                <div style={{display:"flex", gap: 10, marginTop: 18, alignItems:"center"}}>
                  {broker.flagged
                    ? <UI.Stamp tone="flagged">FLAGGED · DO NOT USE</UI.Stamp>
                    : <UI.Stamp tone="verified">FMCSA VERIFIED</UI.Stamp>}
                  {broker.bond.status === "ACTIVE" && <UI.Stamp tone="verified">BOND ACTIVE · ${broker.bond.amount.toLocaleString()}</UI.Stamp>}
                  {broker.bond.status === "PENDING" && <UI.Stamp tone="pending">BOND PENDING</UI.Stamp>}
                  {broker.bond.status === "LAPSED" && <UI.Stamp tone="flagged">BOND LAPSED</UI.Stamp>}
                </div>
              </div>

              <div style={{textAlign:"right"}}>
                <div style={{display:"flex", alignItems:"center", gap: 10, justifyContent:"flex-end"}}>
                  <span style={{
                    fontFamily:"'Instrument Serif'", fontSize: 64, lineHeight: 1, color:"var(--ink)"
                  }}>{broker.rating}</span>
                  <div style={{textAlign:"left"}}>
                    <UI.StarRow rating={broker.rating} size={14}/>
                    <div style={{fontFamily:"'JetBrains Mono'", fontSize: 10, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", marginTop: 2}}>
                      {broker.reviews.toLocaleString()} verified reviews
                    </div>
                  </div>
                </div>
                <div style={{display:"flex", gap: 8, marginTop: 18, justifyContent:"flex-end"}}>
                  <button onClick={() => onQuote(broker)} style={{
                    background:"var(--ink)", color:"var(--paper)", border:"none",
                    padding:"12px 22px", fontFamily:"'Inter Tight'", fontSize: 13,
                    fontWeight: 600, cursor:"pointer", letterSpacing:"0.02em"
                  }}>Get a Free Quote →</button>
                  {!unlocked && !broker.flagged && (
                    <button onClick={() => onUnlock(broker)} style={{
                      background:"transparent", color:"var(--ink)",
                      border:"1.5px solid var(--ink)",
                      padding:"12px 22px", fontFamily:"'Inter Tight'", fontSize: 13,
                      fontWeight: 600, cursor:"pointer"
                    }}>Unlock Direct Contact</button>
                  )}
                </div>
              </div>
            </div>

            {broker.flagged && broker.flag_reason && (
              <div style={{
                marginTop: 24, padding: "16px 18px",
                background: "var(--red-tint)", border: "1.5px solid var(--red)"
              }}>
                <UI.Eyebrow color="var(--red)">⚠ Active Warnings</UI.Eyebrow>
                <div style={{
                  fontFamily:"'Inter Tight'", fontSize: 15, color:"var(--ink)",
                  marginTop: 6
                }}>{broker.flag_reason}</div>
              </div>
            )}
          </div>

          {/* tabs */}
          <div style={{borderTop: "1px solid var(--ink)", display:"flex"}}>
            {["overview", "credentials", "reviews", "history"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "14px 0",
                background: tab === t ? "var(--paper-deep)" : "transparent",
                border: "none", borderRight: t !== "history" ? "1px solid var(--rule)" : "none",
                fontFamily:"'JetBrains Mono'", fontSize: 11,
                letterSpacing:"0.16em", textTransform:"uppercase",
                fontWeight: tab === t ? 600 : 400,
                cursor:"pointer", color: "var(--ink)"
              }}>
                {t === "overview" ? "§ Overview" :
                 t === "credentials" ? "§ Credentials" :
                 t === "reviews" ? `§ Reviews (${broker.reviews.toLocaleString()})` :
                 "§ Filing History"}
              </button>
            ))}
          </div>

          <div style={{padding: "32px 36px", background: "var(--paper-deep)"}}>
            {tab === "overview" && <Overview broker={broker} />}
            {tab === "credentials" && <Credentials broker={broker} />}
            {tab === "reviews" && <Reviews broker={broker} reviews={reviews} />}
            {tab === "history" && <History broker={broker} />}
          </div>
        </div>
      </div>
    </section>
  );
};

const DataRow = ({ label, value, mono = true }) => (
  <div style={{
    display:"grid", gridTemplateColumns: "180px 1fr",
    gap: 18, padding: "10px 0",
    borderBottom: "1px dashed var(--rule)"
  }}>
    <UI.Eyebrow>{label}</UI.Eyebrow>
    <div style={{
      fontFamily: mono ? "'JetBrains Mono', monospace" : "'Inter Tight'",
      fontSize: mono ? 13 : 14.5, color:"var(--ink)"
    }}>{value}</div>
  </div>
);

const Overview = ({ broker }) => (
  <div style={{display:"grid", gridTemplateColumns: "1.4fr 1fr", gap: 48}}>
    <div>
      <UI.Eyebrow>Synopsis</UI.Eyebrow>
      <p style={{
        fontFamily:"'Instrument Serif'", fontSize: 22, lineHeight: 1.4,
        marginTop: 8, color:"var(--ink)"
      }}>{broker.bio}</p>
      <div style={{marginTop: 24}}>
        <UI.Eyebrow>Specialties</UI.Eyebrow>
        <div style={{display:"flex", flexWrap:"wrap", gap: 6, marginTop: 10}}>
          {broker.specialties.map(s => (
            <span key={s} style={{
              fontFamily:"'JetBrains Mono'", fontSize: 10.5,
              letterSpacing:"0.1em", textTransform:"uppercase",
              padding: "5px 10px", border: "1px solid var(--ink)",
              background: "var(--paper)"
            }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
    <div>
      <DataRow label="MC Docket" value={broker.mc} />
      <DataRow label="DOT Number" value={broker.dot} />
      <DataRow label="Authority Granted" value={broker.auth_date} />
      <DataRow label="Years Active" value={`${broker.years} years`} />
      <DataRow label="Carrier Network" value={`${broker.fleet_partners.toLocaleString()} partners`} />
      <DataRow label="HQ" value={`${broker.city}, ${broker.state}`} mono={false} />
    </div>
  </div>
);

const Credentials = ({ broker }) => (
  <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: 32}}>
    <div style={{border:"1px solid var(--rule)", padding: "20px 22px", background:"var(--paper)"}}>
      <UI.Eyebrow>Surety Bond — BMC-84</UI.Eyebrow>
      <div style={{
        fontFamily:"'Instrument Serif'", fontSize: 40, lineHeight: 1, marginTop: 8,
        color: broker.bond.status === "ACTIVE" ? "var(--ink)" : "var(--red)"
      }}>${broker.bond.amount.toLocaleString()}</div>
      <DataRow label="Provider" value={broker.bond.provider} />
      <DataRow label="Status" value={broker.bond.status} />
      <DataRow label="Required Min" value="$75,000" />
    </div>
    <div style={{border:"1px solid var(--rule)", padding:"20px 22px", background:"var(--paper)"}}>
      <UI.Eyebrow>Insurance on File</UI.Eyebrow>
      <DataRow label="Liability" value={`$${broker.insurance.liability.toLocaleString()}`} />
      <DataRow label="Cargo" value={`$${broker.insurance.cargo.toLocaleString()}`} />
      <DataRow label="Provider" value={broker.insurance.provider} />
      <DataRow label="Last Verified" value="2026-04-28" />
    </div>
  </div>
);

const Reviews = ({ broker, reviews }) => (
  <div>
    <div style={{display:"grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems:"center", marginBottom: 24}}>
      <div>
        <div style={{fontFamily:"'Instrument Serif'", fontSize: 80, lineHeight:1, color:"var(--ink)"}}>{broker.rating}</div>
        <UI.StarRow rating={broker.rating} size={16}/>
        <UI.Mono style={{fontSize:11, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase", display:"block", marginTop: 4}}>
          {broker.reviews.toLocaleString()} verified reviews
        </UI.Mono>
      </div>
      <div>
        {[5,4,3,2,1].map(s => {
          const pct = s === 5 ? 78 : s === 4 ? 14 : s === 3 ? 5 : s === 2 ? 2 : 1;
          return (
            <div key={s} style={{display:"grid", gridTemplateColumns:"40px 1fr 40px", gap: 12, alignItems:"center", padding: "3px 0"}}>
              <UI.Mono style={{fontSize: 11}}>{s} ★</UI.Mono>
              <div style={{height: 6, background:"var(--rule)"}}>
                <div style={{height:"100%", width: `${pct}%`, background:"var(--ink)"}}></div>
              </div>
              <UI.Mono style={{fontSize: 10.5, color:"var(--muted)", textAlign:"right"}}>{pct}%</UI.Mono>
            </div>
          );
        })}
      </div>
    </div>
    {reviews.length === 0 && (
      <div style={{
        padding: 30, textAlign:"center", fontFamily:"'Inter Tight'",
        color:"var(--muted)", border:"1px dashed var(--rule)"
      }}>Sample reviews not loaded for this record. Production pulls from BBB / Google / verified shipper reports.</div>
    )}
    {reviews.map((r, i) => (
      <div key={i} style={{
        padding: "20px 0", borderTop: i > 0 ? "1px solid var(--rule)" : "none"
      }}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline"}}>
          <div style={{fontFamily:"'Inter Tight'", fontWeight: 600, fontSize: 14}}>{r.author}</div>
          <UI.Mono style={{fontSize: 10.5, color:"var(--muted)"}}>{r.date}</UI.Mono>
        </div>
        <div style={{margin:"4px 0 8px"}}><UI.StarRow rating={r.rating} size={11}/></div>
        <p style={{fontFamily:"'Inter Tight'", fontSize: 14.5, lineHeight: 1.5, margin:0, color:"var(--ink)"}}>"{r.body}"</p>
      </div>
    ))}
  </div>
);

const History = ({ broker }) => (
  <div>
    {[
      ["2026-04-28", "L&I record sync · No changes detected"],
      ["2026-02-12", "Insurance certificate refiled (BIPD $1M)"],
      ["2025-11-04", "BMC-84 bond renewed · " + broker.bond.provider],
      ["2025-08-20", "Authority active · No deficiencies"],
      [broker.auth_date, "Operating Authority granted by FMCSA"],
    ].map(([d, e], i) => (
      <div key={i} style={{display:"grid", gridTemplateColumns:"120px 16px 1fr", gap: 16, padding:"14px 0", borderBottom:"1px dashed var(--rule)", alignItems:"center"}}>
        <UI.Mono style={{fontSize:12, color:"var(--muted)"}}>{d}</UI.Mono>
        <div style={{width: 8, height: 8, background:"var(--ink)", borderRadius: 0, transform:"rotate(45deg)"}}></div>
        <div style={{fontFamily:"'Inter Tight'", fontSize: 14}}>{e}</div>
      </div>
    ))}
  </div>
);

window.SCREENS = { Directory, Profile };
