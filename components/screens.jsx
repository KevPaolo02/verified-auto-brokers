"use client";

// Directory, Profile, Lead Capture, Alerts, Match flow
import React, { useState, useEffect, useRef } from "react";
import { UI } from "./ui-primitives";
import { HEROES } from "./heroes";
import { BrokerService } from "./data";

// Map a brokers-table row to the broker shape the Profile component expects.
// Most fields beyond identity are filled in by the live FMCSA lookup once the
// Profile mounts; this gives the UI safe defaults during the loading state.
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
    bond: {
      status: r.bond_on_file === "Y" ? "ACTIVE" : "UNKNOWN",
      amount: null,    // bulk dataset doesn't carry the amount
      provider: null,  // ditto
    },
    insurance: { provider: null, liability: 0, cargo: 0 },
    fleet_partners: null,
    years: null,
    rating: 0,
    reviews: 0,
    verified: r.broker_stat === "A" && r.bond_on_file === "Y" && r.claim_affiliation !== "operator",
    flagged: r.broker_stat !== "A",
    flag_reason: null,
    specialties: [],
    bio: null,
    _claim_status: r.claim_status,
    _claim_affiliation: r.claim_affiliation,
  };
}

// =========== DIRECTORY / SEARCH RESULTS ===========

const PAGE_SIZE = 50;

const Directory = ({ onPick, initialQuery = "" }) => {
  const [q, setQ] = useState(initialQuery);
  const [filters, setFilters] = useState({ claimed: false, flagged: false, bonded: false, state: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ rows: [], total: 0, status: "loading" });

  // Reset to page 1 whenever query/filters change.
  useEffect(() => { setPage(1); }, [q, filters.claimed, filters.flagged, filters.bonded, filters.state]);

  // Debounced fetch.
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setData((d) => ({ ...d, status: "loading" }));
      try {
        const res = await BrokerService.searchBrokers({
          q,
          state: filters.state || null,
          bonded: filters.bonded,
          claimed: filters.claimed,
          flagged: filters.flagged,
          page,
          pageSize: PAGE_SIZE,
        });
        if (cancelled) return;
        setData({ rows: res.rows, total: res.total, status: "ok" });
      } catch (err) {
        if (cancelled) return;
        setData({ rows: [], total: 0, status: "error" });
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, filters.state, filters.bonded, filters.claimed, filters.flagged, page]);

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const showingFrom = data.rows.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const showingTo = (page - 1) * PAGE_SIZE + data.rows.length;

  return (
    <section style={{background: "var(--paper)", padding: "32px 24px 80px"}}>
      <div style={{maxWidth: 1280, margin: "0 auto"}}>
        <div style={{display:"flex", alignItems:"baseline", gap: 14, marginBottom: 18}}>
          <UI.Eyebrow>§ Directory · {data.total.toLocaleString()} matches</UI.Eyebrow>
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
            placeholder="Search by name, MC#, DOT#, city, or state…"
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
            ["claimed", "Claimed Only"],
            ["bonded", "Bond on File"],
            ["flagged", "Inactive Authority"],
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
          <select value={filters.state} onChange={e => setFilters(f => ({...f, state: e.target.value}))}
            style={{
              fontFamily:"'JetBrains Mono'", fontSize: 10.5,
              padding: "6px 10px", border: "1px solid var(--ink)",
              background:"var(--paper)", textTransform:"uppercase", letterSpacing:"0.1em"
            }}>
            <option value="">Any State</option>
            {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{
          marginTop: 28,
          border: "1.5px solid var(--ink)",
          background: "var(--paper)"
        }}>
          <div style={{
            display:"grid",
            gridTemplateColumns: "120px 1.8fr 1fr 0.8fr 1fr auto",
            gap: 16, padding: "12px 18px",
            background: "var(--ink)", color: "var(--paper)",
            fontFamily:"'JetBrains Mono'", fontSize: 10,
            letterSpacing:"0.16em", textTransform:"uppercase",
          }}>
            <span>MC #</span><span>Broker</span><span>Location</span>
            <span>Bond</span><span>Status</span><span></span>
          </div>
          {data.status === "loading" && (
            <div style={{padding: "60px 20px", textAlign:"center", fontFamily:"'JetBrains Mono'", fontSize: 11, color:"var(--muted)", letterSpacing: "0.14em", textTransform:"uppercase"}}>
              Loading…
            </div>
          )}
          {data.status === "error" && (
            <div style={{padding: "60px 20px", textAlign:"center", fontFamily:"'Inter Tight'", color:"var(--red)"}}>
              Search failed. Try again.
            </div>
          )}
          {data.status === "ok" && data.rows.map((r, i) => {
            const flagged = r.broker_stat !== "A";
            return (
              <div key={r.mc} onClick={() => onPick(rowToBroker(r))}
                style={{
                  display:"grid",
                  gridTemplateColumns: "120px 1.8fr 1fr 0.8fr 1fr auto",
                  gap: 16, padding: "16px 18px",
                  borderBottom: i < data.rows.length - 1 ? "1px solid var(--rule)" : "none",
                  cursor: "pointer", alignItems: "center",
                  background: flagged ? "var(--red-tint)" : "transparent"
                }}
                onMouseEnter={e => { if(!flagged) e.currentTarget.style.background = "var(--paper-deep)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = flagged ? "var(--red-tint)" : "transparent"; }}>
                <UI.Mono style={{fontSize: 12, color: "var(--muted)"}}>MC-{r.mc}</UI.Mono>
                <div>
                  <div style={{fontFamily:"'Inter Tight'", fontSize: 16, fontWeight: 600, letterSpacing:"-0.01em"}}>
                    {r.legal_name || r.dba_name || "—"}
                  </div>
                  {r.dba_name && r.dba_name !== r.legal_name && (
                    <div style={{fontFamily:"'JetBrains Mono'", fontSize: 9.5, color:"var(--muted)", letterSpacing:"0.1em", marginTop:3, textTransform:"uppercase"}}>
                      d/b/a {r.dba_name}
                    </div>
                  )}
                </div>
                <div style={{fontFamily:"'Inter Tight'", fontSize: 13}}>
                  {r.city || "—"}<span style={{color:"var(--muted)"}}>{r.state ? `, ${r.state}` : ""}</span>
                </div>
                <UI.Mono style={{fontSize: 12, color: r.bond_on_file === "Y" ? "var(--ink)" : "var(--muted)"}}>
                  {r.bond_on_file === "Y" ? "ACTIVE" : "—"}
                </UI.Mono>
                <div style={{display:"flex", gap: 6, flexWrap: "wrap"}}>
                  {flagged && <UI.Stamp tone="flagged" small>FLAGGED</UI.Stamp>}
                  {!flagged && <UI.Stamp tone="verified" small>FMCSA</UI.Stamp>}
                  {r.claim_status === "verified" && <UI.Stamp tone="verified" small>◆ CLAIMED</UI.Stamp>}
                </div>
                <UI.Mono style={{fontSize: 11, color:"var(--navy)", letterSpacing:"0.12em", textTransform:"uppercase"}}>OPEN →</UI.Mono>
              </div>
            );
          })}
          {data.status === "ok" && data.rows.length === 0 && (
            <div style={{padding: "60px 20px", textAlign:"center", fontFamily:"'Inter Tight'", color:"var(--muted)"}}>
              No matches. Try a different query or clear filters.
            </div>
          )}
        </div>

        <div style={{
          marginTop: 14, display: "flex", alignItems: "center", gap: 14,
          fontFamily:"'JetBrains Mono'", fontSize: 10.5,
          color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase"
        }}>
          <span>Showing {showingFrom.toLocaleString()}–{showingTo.toLocaleString()} of {data.total.toLocaleString()}</span>
          <div style={{flex: 1}}></div>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={pagerBtn(page <= 1)}>← Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={pagerBtn(page >= totalPages)}>Next →</button>
        </div>
      </div>
    </section>
  );
};

const pagerBtn = (disabled) => ({
  fontFamily: "'JetBrains Mono'", fontSize: 10.5, letterSpacing: "0.12em",
  textTransform: "uppercase", padding: "5px 10px",
  border: "1px solid var(--ink)", background: "var(--paper)", color: "var(--ink)",
  cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
});

// =========== BROKER PROFILE ===========

const Profile = ({ broker: seedBroker, onBack, onQuote, onUnlock, unlocked }) => {
  const [tab, setTab] = useState("overview");
  const [live, setLive] = useState({ status: "loading", data: null, claim: null, last_checked: null, warning: null });
  // We have no verified-review system yet — Reviews tab handles the empty case.
  const reviews = [];

  // Live FMCSA fetch is the source of truth for auth/bond/insurance/address.
  // Claim is the source of truth for bio/specialties/contact/self-reported metrics.
  // The seed broker is just the row identity (mc, dot, name) clicked from the
  // Directory; it might lack bond.amount/specialties/etc. until the API responds.
  const claim = live.claim;
  const liveData = live.data || {};

  // Unified display object — shadows the prop so existing JSX `broker.X` lookups
  // automatically prefer live + claim values once they arrive.
  const broker = {
    mc: liveData.mc || seedBroker.mc,
    dot: liveData.dot || seedBroker.dot,
    name: liveData.name || seedBroker.name,
    dba: liveData.dba || seedBroker.dba,
    city: liveData.city || seedBroker.city,
    state: liveData.state || seedBroker.state,
    address: liveData.address || seedBroker.address || "",
    phone: claim?.display_phone || seedBroker.phone,
    email: claim?.display_email || seedBroker.email,
    auth_status: liveData.auth_status || seedBroker.auth_status || "UNKNOWN",
    auth_date: seedBroker.auth_date || null,
    bond: liveData.bond || seedBroker.bond || { status: "UNKNOWN", amount: null, provider: null },
    insurance: liveData.insurance || seedBroker.insurance || { provider: null, liability: 0, cargo: 0 },
    bio: claim?.bio || seedBroker.bio || null,
    specialties: (claim?.specialties && claim.specialties.length > 0) ? claim.specialties : (seedBroker.specialties || []),
    fleet_partners: claim?.carrier_network_size ?? seedBroker.fleet_partners ?? null,
    years: claim?.years_in_business ?? seedBroker.years ?? null,
    rating: seedBroker.rating || 0,
    reviews: seedBroker.reviews || 0,
    flagged: liveData.flagged ?? seedBroker.flagged ?? false,
    flag_reason: liveData.flag_reason || seedBroker.flag_reason || null,
  };
  const fleetIsSelfReported = claim?.carrier_network_size != null;
  const yearsIsSelfReported = claim?.years_in_business != null;
  const hasReviewSignal = broker.reviews > 0 && broker.rating > 0;

  useEffect(() => {
    let cancelled = false;
    setLive({ status: "loading", data: null, claim: null, last_checked: null, warning: null });
    BrokerService.lookupBroker({ mc: seedBroker.mc, dot: seedBroker.dot })
      .then((res) => {
        if (cancelled) return;
        if (res?.error) {
          setLive({ status: "not-found", data: null, claim: null, last_checked: null, warning: res.error });
          return;
        }
        setLive({
          status: res.stale ? "stale" : "ok",
          data: res.data,
          claim: res.claim ?? null,
          last_checked: res.last_checked,
          warning: res.warning ?? null,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setLive({ status: "error", data: null, claim: null, last_checked: null, warning: String(err.message ?? err) });
      });
    return () => { cancelled = true; };
  }, [seedBroker.mc, seedBroker.dot]);

  const liveLabel = (() => {
    if (live.status === "loading") return "CHECKING FMCSA…";
    if (live.status === "not-found") return "FMCSA · RECORD NOT FOUND";
    if (live.status === "error") return "FMCSA · LOOKUP UNAVAILABLE";
    const ts = live.last_checked ? new Date(live.last_checked).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "—";
    const auth = live.data?.auth_status ?? "UNKNOWN";
    const stalePrefix = live.status === "stale" ? "STALE · " : "";
    return `${stalePrefix}FMCSA · AUTH ${auth} · CHECKED ${ts}`;
  })();

  return (
    <section style={{background: "var(--paper)", padding: "24px 24px 80px"}}>
      <div style={{maxWidth: 1280, margin: "0 auto"}}>
        <button onClick={onBack} style={{
          background:"none", border:"none", cursor:"pointer",
          fontFamily:"'JetBrains Mono'", fontSize: 11, letterSpacing:"0.14em",
          textTransform:"uppercase", color: "var(--muted)", padding: "8px 0",
          marginBottom: 12
        }}>← BACK TO REGISTRY</button>

        <div style={{
          border: "1.5px solid var(--ink)",
          background: "var(--paper)"
        }}>
          <div style={{
            display:"flex", justifyContent:"space-between",
            background: broker.flagged ? "var(--red)" : "var(--ink)",
            color: "var(--paper)",
            padding: "10px 22px",
            fontFamily:"'JetBrains Mono'", fontSize: 10.5,
            letterSpacing: "0.16em", textTransform: "uppercase"
          }}>
            <span>FILE · {broker.mc} / DOT-{broker.dot}</span>
            <span>{liveLabel}</span>
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
                <div style={{display:"flex", gap: 10, marginTop: 18, alignItems:"center", flexWrap: "wrap"}}>
                  {broker.flagged
                    ? <UI.Stamp tone="flagged">FLAGGED · DO NOT USE</UI.Stamp>
                    : <UI.Stamp tone="verified">FMCSA VERIFIED</UI.Stamp>}
                  {broker.bond.status === "ACTIVE" && <UI.Stamp tone="verified">BOND ACTIVE{broker.bond.amount ? ` · $${broker.bond.amount.toLocaleString()}` : ""}</UI.Stamp>}
                  {broker.bond.status === "PENDING" && <UI.Stamp tone="pending">BOND PENDING</UI.Stamp>}
                  {broker.bond.status === "LAPSED" && <UI.Stamp tone="flagged">BOND LAPSED</UI.Stamp>}
                  {claim?.status === "verified" && <UI.Stamp tone="verified">◆ CLAIMED</UI.Stamp>}
                  {claim?.status === "pending" && <UI.Stamp tone="pending">CLAIM PENDING REVIEW</UI.Stamp>}
                  {!claim && live.status === "ok" && (
                    <a
                      href={`/claim?mc=${broker.mc.replace(/^MC-?/i, "")}`}
                      style={{
                        fontFamily: "'JetBrains Mono'", fontSize: 10,
                        letterSpacing: "0.16em", textTransform: "uppercase",
                        fontWeight: 600, padding: "5px 9px",
                        border: "1.5px dashed var(--ink)", color: "var(--ink)",
                        textDecoration: "none", borderRadius: 2,
                      }}
                    >
                      ◇ Claim This Listing →
                    </a>
                  )}
                </div>

                {claim?.affiliation === "operator" && (
                  <div style={{
                    marginTop: 14, padding: "10px 14px",
                    background: "var(--paper-deep)", border: "1px dashed var(--ink)",
                    fontFamily: "'JetBrains Mono'", fontSize: 10.5, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "var(--ink)", lineHeight: 1.5
                  }}>
                    ⚠ DISCLOSURE · This broker is operated by Verified Auto Brokers. Affiliation disclosed per FTC 16 CFR Part 255.
                  </div>
                )}
              </div>

              <div style={{textAlign:"right"}}>
                {hasReviewSignal ? (
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
                ) : (
                  <UI.Mono style={{fontSize: 10.5, color:"var(--muted)", letterSpacing:"0.12em", textTransform:"uppercase"}}>
                    No verified reviews yet
                  </UI.Mono>
                )}
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
                 t === "reviews" ? (hasReviewSignal ? `§ Reviews (${broker.reviews.toLocaleString()})` : "§ Reviews") :
                 "§ Filing History"}
              </button>
            ))}
          </div>

          <div style={{padding: "32px 36px", background: "var(--paper-deep)"}}>
            {tab === "overview" && (
              <Overview
                broker={broker}
                claim={claim}
                fleetIsSelfReported={fleetIsSelfReported}
                yearsIsSelfReported={yearsIsSelfReported}
              />
            )}
            {tab === "credentials" && <Credentials broker={broker} />}
            {tab === "reviews" && <Reviews broker={broker} reviews={reviews} hasReviewSignal={hasReviewSignal} />}
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

const Overview = ({ broker, claim, fleetIsSelfReported, yearsIsSelfReported }) => (
  <div style={{display:"grid", gridTemplateColumns: "1.4fr 1fr", gap: 48}}>
    <div>
      <UI.Eyebrow>Synopsis</UI.Eyebrow>
      {broker.bio ? (
        <p style={{
          fontFamily:"'Instrument Serif'", fontSize: 22, lineHeight: 1.4,
          marginTop: 8, color:"var(--ink)"
        }}>{broker.bio}</p>
      ) : (
        <p style={{ fontFamily: "'Inter Tight'", fontSize: 14, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>
          No bio submitted by this broker. <a href={`/claim?mc=${(broker.mc || "").replace(/^MC-?/i, "")}`} style={{ color: "var(--navy)", borderBottom: "1px dotted var(--navy)", textDecoration: "none" }}>Are you the owner?</a>
        </p>
      )}
      {claim?.status === "verified" && claim.verified_at && (
        <UI.Mono style={{
          fontSize: 10, color: "var(--muted)", letterSpacing: "0.12em",
          textTransform: "uppercase", display: "block", marginTop: 6
        }}>
          ◆ Synopsis supplied by claimed owner · Verified {new Date(claim.verified_at).toISOString().slice(0, 10)}
        </UI.Mono>
      )}
      {broker.specialties && broker.specialties.length > 0 && (
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
      )}
      {claim?.display_website && (
        <div style={{marginTop: 24}}>
          <UI.Eyebrow>Website</UI.Eyebrow>
          <a href={claim.display_website} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-block", marginTop: 8,
            fontFamily: "'JetBrains Mono'", fontSize: 13, color: "var(--navy)",
            borderBottom: "1px dotted var(--navy)", textDecoration: "none"
          }}>{claim.display_website} ↗</a>
        </div>
      )}
    </div>
    <div>
      <DataRow label="MC Docket" value={broker.mc || "—"} />
      <DataRow label="DOT Number" value={broker.dot || "—"} />
      {broker.auth_date && <DataRow label="Authority Granted" value={broker.auth_date} />}
      {(broker.years ?? 0) > 0 && (
        <DataRow
          label="Years Active"
          value={`${broker.years} years${yearsIsSelfReported ? " (self-reported)" : ""}`}
        />
      )}
      {(broker.fleet_partners ?? 0) > 0 && (
        <DataRow
          label="Carrier Network"
          value={`${broker.fleet_partners.toLocaleString()} carriers${fleetIsSelfReported ? " (self-reported)" : ""}`}
        />
      )}
      {(broker.city || broker.state) && (
        <DataRow label="HQ" value={[broker.city, broker.state].filter(Boolean).join(", ")} mono={false} />
      )}
    </div>
  </div>
);

const Credentials = ({ broker }) => {
  const bondAmount = broker.bond?.amount;
  const liability = broker.insurance?.liability;
  const cargo = broker.insurance?.cargo;
  return (
    <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: 32}}>
      <div style={{border:"1px solid var(--rule)", padding: "20px 22px", background:"var(--paper)"}}>
        <UI.Eyebrow>Surety Bond — BMC-84</UI.Eyebrow>
        <div style={{
          fontFamily:"'Instrument Serif'", fontSize: 40, lineHeight: 1, marginTop: 8,
          color: broker.bond?.status === "ACTIVE" ? "var(--ink)" : "var(--red)"
        }}>{bondAmount ? `$${bondAmount.toLocaleString()}` : "—"}</div>
        <DataRow label="Provider" value={broker.bond?.provider || "Not on file"} />
        <DataRow label="Status" value={broker.bond?.status || "UNKNOWN"} />
        <DataRow label="Required Min" value="$75,000" />
      </div>
      <div style={{border:"1px solid var(--rule)", padding:"20px 22px", background:"var(--paper)"}}>
        <UI.Eyebrow>Insurance on File</UI.Eyebrow>
        <DataRow label="Liability" value={liability > 0 ? `$${liability.toLocaleString()}` : "Not on file"} />
        <DataRow label="Cargo" value={cargo > 0 ? `$${cargo.toLocaleString()}` : "Not on file"} />
        <DataRow label="Provider" value={broker.insurance?.provider || "Not on file"} />
      </div>
    </div>
  );
};

const Reviews = ({ broker, reviews, hasReviewSignal }) => (
  <div>
    {hasReviewSignal ? (
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
    ) : (
      <div style={{
        padding: 30, textAlign: "center", fontFamily: "'Inter Tight'",
        color: "var(--muted)", border: "1px dashed var(--rule)", marginBottom: 24
      }}>
        No verified reviews yet. We do not display reviews from third-party sites we cannot independently verify.
      </div>
    )}
    {hasReviewSignal && reviews.length === 0 && (
      <div style={{
        padding: 30, textAlign:"center", fontFamily:"'Inter Tight'",
        color:"var(--muted)", border:"1px dashed var(--rule)"
      }}>Sample reviews not loaded for this record.</div>
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
        <p style={{fontFamily:"'Inter Tight'", fontSize: 14.5, lineHeight: 1.5, margin:0, color:"var(--ink)"}}>&quot;{r.body}&quot;</p>
      </div>
    ))}
  </div>
);

const History = ({ broker }) => {
  // Build a real, minimal history from data we actually have. We don't fabricate
  // filing events — only render what we can derive.
  const events = [];
  if (broker.bond?.status === "ACTIVE" && broker.bond?.effective_date) {
    events.push([broker.bond.effective_date, `BMC-84 bond on file · ${broker.bond.provider || "Provider listed in FMCSA L&I"}`]);
  }
  if (broker.auth_date) {
    events.push([broker.auth_date, "Operating Authority granted by FMCSA"]);
  }
  return (
    <div>
      {events.length === 0 ? (
        <div style={{
          padding: 30, textAlign: "center", fontFamily: "'Inter Tight'",
          color: "var(--muted)", border: "1px dashed var(--rule)"
        }}>
          Authority and filing history aren&apos;t wired up yet for this record. Look up the broker on the FMCSA L&amp;I site for the full chronological history.
        </div>
      ) : events.map(([d, e], i) => (
        <div key={i} style={{display:"grid", gridTemplateColumns:"120px 16px 1fr", gap: 16, padding:"14px 0", borderBottom:"1px dashed var(--rule)", alignItems:"center"}}>
          <UI.Mono style={{fontSize:12, color:"var(--muted)"}}>{d}</UI.Mono>
          <div style={{width: 8, height: 8, background:"var(--ink)", borderRadius: 0, transform:"rotate(45deg)"}}></div>
          <div style={{fontFamily:"'Inter Tight'", fontSize: 14}}>{e}</div>
        </div>
      ))}
    </div>
  );
};

export const SCREENS = { Directory, Profile };
