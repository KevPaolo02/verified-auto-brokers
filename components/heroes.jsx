"use client";

// Hero / Landing variations + Search experience
import React, { useState, useEffect, useRef } from "react";
import { UI } from "./ui-primitives";
import { BrokerService } from "./data";

// Maps a brokers-table row (from /api/brokers/search) to the broker shape that
// downstream components (Profile, etc.) expect. Mirrors the helper in screens.jsx.
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
    _claim_status: r.claim_status,
    _claim_affiliation: r.claim_affiliation,
  };
}

// =========== SEARCH BAR (the centerpiece) ===========

const LiveSearch = ({ size = "lg", onPick, placeholder, autoFocus }) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);
  const ref = useRef();

  // Debounced fetch as user types.
  useEffect(() => {
    if (!q.trim()) { setMatches([]); setSearching(false); return; }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await BrokerService.searchBrokers({ q, page: 1, pageSize: 6 });
        if (cancelled) return;
        setMatches(res.rows || []);
      } catch {
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

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

      {open && (matches.length > 0 || searching) && (
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
            <span>{searching ? "Searching…" : `${matches.length} match${matches.length === 1 ? "" : "es"} shown`}</span>
            <span>FMCSA Public Record</span>
          </div>
          {matches.map((r) => {
            const flagged = r.broker_stat !== "A";
            return (
              <div key={r.mc}
                onMouseDown={() => onPick && onPick({ broker: rowToBroker(r) })}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--rule)",
                  cursor: "pointer",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: 14, alignItems: "center"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--paper-deep)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <UI.Mono style={{fontSize:11, color:"var(--muted)", width: 96}}>MC-{r.mc}</UI.Mono>
                <div>
                  <div style={{fontFamily:"'Inter Tight'", fontSize: 15, fontWeight:600}}>{r.legal_name || r.dba_name || "—"}</div>
                  <div style={{fontFamily:"'JetBrains Mono'", fontSize: 10, color:"var(--muted)", letterSpacing:"0.1em", marginTop:2, textTransform:"uppercase"}}>
                    {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                    {r.bond_on_file === "Y" ? " · BOND" : ""}
                    {r.claim_status === "verified" ? " · ◆ CLAIMED" : ""}
                  </div>
                </div>
                {flagged ? <UI.Stamp tone="flagged" small>FLAGGED</UI.Stamp>
                        : <UI.Stamp tone="verified" small>FMCSA</UI.Stamp>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// =========== HERO VARIANTS ===========

const HeroRegistry = ({ onSearch, stats }) => {
  const lastUpdated = stats?.last_imported_at
    ? new Date(stats.last_imported_at).toISOString().slice(0, 10)
    : "—";
  // Real registry counts. Each line shows nothing when stats haven't loaded — no zeros.
  const sidebarItems = stats ? [
    ["Brokers tracked", Number(stats.total_brokers || 0).toLocaleString(), "var(--ink)"],
    ["Active authority", Number(stats.active_authority || 0).toLocaleString(), "var(--ink)"],
    ["Bond on file", Number(stats.with_bond_on_file || 0).toLocaleString(), "var(--ink)"],
    ["Claimed & verified", Number(stats.claimed_verified || 0).toLocaleString(), "var(--navy)"],
    ["Claims pending review", Number(stats.claimed_pending || 0).toLocaleString(), "var(--ink)"],
  ] : [];
  return (
    <section style={{
      background: "var(--paper)",
      padding: "72px 24px 40px",
      borderBottom: "1px solid var(--rule)",
    }}>
      <div style={{maxWidth: 1280, margin: "0 auto"}}>
        <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom: 28}}>
          <div style={{width: 28, height: 1, background: "var(--ink)"}}></div>
          <UI.Eyebrow>Public Registry of FMCSA-Licensed Property Brokers</UI.Eyebrow>
          <div style={{flex:1, height: 1, background: "var(--rule)"}}></div>
          <UI.Mono style={{fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em"}}>REGISTRY UPDATED {lastUpdated}</UI.Mono>
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
              We track every FMCSA-licensed property broker (the public registry) and check authority and bond status from public records on demand. Free to search. Free to look up. Brokers can claim their listing — we verify each claim manually.
            </p>
            <LiveSearch size="lg" onPick={onSearch} autoFocus />
            <div style={{
              display:"flex", gap: 20, marginTop: 16,
              fontFamily:"'JetBrains Mono'", fontSize: 10.5,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--muted)"
            }}>
              <span>TRY:</span>
              {["GMF Auto Transport", "Texas", "Florida", "MC-1675078"].map(s => (
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
              <span>Registry · Live Counts</span>
              <span>{lastUpdated}</span>
            </div>
            <div style={{padding: "16px 18px"}}>
              {sidebarItems.length === 0 ? (
                <div style={{padding: "20px 0", fontFamily: "'JetBrains Mono'", fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase"}}>
                  Loading…
                </div>
              ) : sidebarItems.map(([label, num, color], i) => (
                <div key={i} style={{
                  display:"flex", justifyContent:"space-between", alignItems:"baseline",
                  padding: "10px 0",
                  borderBottom: i < sidebarItems.length - 1 ? "1px dashed var(--rule)" : "none"
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
};

const HeroBoldNumber = ({ onSearch, stats }) => {
  const total = stats?.total_brokers ? Number(stats.total_brokers).toLocaleString() : "—";
  return (
    <section style={{
      background: "var(--navy)",
      color: "var(--paper)",
      padding: "64px 24px 56px",
      position: "relative",
      overflow: "hidden"
    }}>
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
            <UI.Mono style={{fontFamily:"'Instrument Serif', serif"}}>{total}</UI.Mono>
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
              <em style={{color:"var(--amber)"}}>tracked from public records.</em>
            </h1>
            <p style={{
              fontFamily: "'Inter Tight'", fontSize: 17, lineHeight: 1.55,
              maxWidth: 480, marginTop: 24, opacity: 0.85
            }}>
              Type any broker name or MC#. We pull the FMCSA public record and tell you whether their authority is active and their bond is on file. Free, no account required.
            </p>

            <div style={{marginTop: 32}}>
              <LiveSearch size="lg" onPick={onSearch} autoFocus />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const HeroSplit = ({ onSearch, stats }) => {
  const total = stats?.total_brokers ? Number(stats.total_brokers).toLocaleString() : "—";
  const bonded = stats?.with_bond_on_file ? Number(stats.with_bond_on_file).toLocaleString() : "—";
  const claimed = stats?.claimed_verified ? Number(stats.claimed_verified).toLocaleString() : "0";
  return (
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
            Don&apos;t hire<br/>a broker blind.
          </h1>
          <p style={{
            fontFamily:"'Inter Tight'", fontSize: 17, lineHeight: 1.55,
            color:"var(--ink)", maxWidth: 480, marginTop: 24
          }}>
            The FMCSA licenses tens of thousands of auto-transport brokers. Some have decades of clean filings; some opened last week. We pull the public record so you can see which is which — free.
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
            <span><span style={{color: "var(--navy)", fontSize: 14}}>●</span> {total} tracked</span>
            <span><span style={{color: "var(--ink)", fontSize: 14}}>●</span> {bonded} with bond</span>
            <span><span style={{color: "var(--navy)", fontSize: 14}}>●</span> {claimed} claimed</span>
          </div>
        </div>
      </div>

      <div style={{
        background: "var(--paper-deep)",
        padding: "40px 40px",
        position:"relative",
        borderLeft: "0px",
        overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "center"
      }}>
        <UI.Eyebrow>FOR BROKERS</UI.Eyebrow>
        <h2 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: "clamp(34px, 4vw, 52px)", lineHeight: 1.05,
          margin: "12px 0 18px", letterSpacing: "-0.02em", fontWeight: 400,
        }}>
          Are you in the registry?
        </h2>
        <p style={{
          fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55,
          color: "var(--ink)", marginBottom: 24,
        }}>
          If you hold an active FMCSA broker authority, you&apos;re already listed. Claim your listing to add a bio, specialties, and direct contact info shippers can see.
        </p>
        <a href="/claim" style={{
          display: "inline-block", alignSelf: "flex-start",
          background: "var(--ink)", color: "var(--paper)",
          padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
          fontWeight: 600, letterSpacing: "0.02em", textDecoration: "none",
        }}>Claim Your Listing →</a>
      </div>
    </section>
  );
};

export const HEROES = { HeroRegistry, HeroBoldNumber, HeroSplit, LiveSearch };
