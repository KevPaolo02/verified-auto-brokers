// Shared UI primitives — registry/government aesthetic
const { useState, useEffect, useRef, useMemo } = React;

// =========== ATOMS ===========

const Eyebrow = ({ children, color = "var(--ink)", style }) => (
  <div style={{
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color,
    fontWeight: 500,
    ...style
  }}>{children}</div>
);

const Rule = ({ thick = false, color = "var(--rule)", style }) => (
  <hr style={{
    border: 0,
    borderTop: `${thick ? 2 : 1}px solid ${color}`,
    margin: 0,
    ...style
  }} />
);

const Stamp = ({ children, tone = "verified", small }) => {
  const tones = {
    verified:  { bg: "transparent", fg: "var(--navy)", border: "var(--navy)" },
    flagged:   { bg: "var(--red)", fg: "#fff", border: "var(--red)" },
    pending:   { bg: "transparent", fg: "var(--amber-ink)", border: "var(--amber-ink)" },
    inactive:  { bg: "transparent", fg: "var(--muted)", border: "var(--muted)" },
  };
  const t = tones[tone] || tones.verified;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: small ? 9 : 10,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      fontWeight: 600,
      padding: small ? "3px 7px" : "5px 9px",
      border: `1.5px solid ${t.border}`,
      background: t.bg,
      color: t.fg,
      borderRadius: 2
    }}>
      {tone === "verified" && <Checkmark size={small ? 9 : 10} />}
      {tone === "flagged"  && <WarnTri size={small ? 9 : 10} />}
      {children}
    </span>
  );
};

const Checkmark = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2 6.5L5 9.5L10 3" stroke={color} strokeWidth="2" strokeLinecap="square"/>
  </svg>
);

const WarnTri = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M6 1L11 11H1L6 1Z" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M6 5V7.5" stroke={color} strokeWidth="1.5"/>
    <circle cx="6" cy="9" r="0.5" fill={color}/>
  </svg>
);

const Mono = ({ children, style }) => (
  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontFeatureSettings: "'tnum' 1", ...style }}>{children}</span>
);

const Star = ({ filled, size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{display:"inline-block"}}>
    <path d="M8 1L10 6L15 6.5L11.2 10L12.3 15L8 12.5L3.7 15L4.8 10L1 6.5L6 6L8 1Z"
      fill={filled ? "var(--navy)" : "none"} stroke="var(--navy)" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

const StarRow = ({ rating, size = 12 }) => (
  <span style={{ display: "inline-flex", gap: 1 }}>
    {[1,2,3,4,5].map(i => <Star key={i} filled={i <= Math.round(rating)} size={size} />)}
  </span>
);

// =========== HEADER ===========

const Seal = ({ size = 44 }) => (
  <div style={{
    width: size, height: size, position: "relative",
    display: "grid", placeItems: "center"
  }}>
    <svg width={size} height={size} viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill="none" stroke="var(--navy)" strokeWidth="1"/>
      <circle cx="22" cy="22" r="17" fill="none" stroke="var(--navy)" strokeWidth="1"/>
      <circle cx="22" cy="22" r="14" fill="var(--navy)"/>
      {/* tick marks around the seal */}
      {Array.from({length: 24}).map((_, i) => {
        const a = (i * 15) * Math.PI / 180;
        const x1 = 22 + Math.cos(a) * 18;
        const y1 = 22 + Math.sin(a) * 18;
        const x2 = 22 + Math.cos(a) * 20;
        const y2 = 22 + Math.sin(a) * 20;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--navy)" strokeWidth="1"/>;
      })}
      {/* V monogram */}
      <path d="M16 16L22 30L28 16" stroke="#F4F1EA" strokeWidth="2.4" fill="none" strokeLinecap="square"/>
    </svg>
  </div>
);

const TopBar = ({ stats }) => (
  <div style={{
    background: "var(--navy)",
    color: "var(--paper)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.1em",
    padding: "6px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid var(--navy-deep)"
  }}>
    <div style={{display:"flex", gap: 24, textTransform: "uppercase"}}>
      <span>● LIVE · FMCSA L&I SYNC</span>
      <span style={{opacity:.6}}>LAST PULL {stats.last_sync}</span>
    </div>
    <div style={{display:"flex", gap: 24, textTransform: "uppercase", opacity:.85}}>
      <span>EST. 2026</span>
      <span>NOT AFFILIATED WITH USDOT</span>
      <span>EN · ES</span>
    </div>
  </div>
);

const MainHeader = ({ onNav, view }) => (
  <header style={{
    background: "var(--paper)",
    borderBottom: "1.5px solid var(--ink)",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 32
  }}>
    <div style={{display:"flex", alignItems:"center", gap: 14, cursor:"pointer"}} onClick={() => onNav("home")}>
      <Seal size={48} />
      <div>
        <div style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 26, lineHeight: 1, color: "var(--ink)", fontWeight: 400
        }}>
          Verified Auto Brokers
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--muted)", marginTop: 3
        }}>
          The Independent Registry · verifiedautobrokers.com
        </div>
      </div>
    </div>
    <nav style={{display:"flex", gap: 28, alignItems:"center"}}>
      {[
        ["directory", "Directory"],
        ["alerts", "Scam Alerts"],
        ["match", "Get Matched"],
        ["report", "Report a Broker"],
      ].map(([k, label]) => (
        <a key={k} onClick={() => onNav(k)} style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: 13, fontWeight: 500, color: "var(--ink)",
          textDecoration: view === k ? "underline" : "none",
          textDecorationThickness: 2, textUnderlineOffset: 6,
          cursor: "pointer", letterSpacing: "-0.01em"
        }}>{label}</a>
      ))}
      <button onClick={() => onNav("quote")} style={{
        background: "var(--navy)", color: "var(--paper)",
        border: "none", padding: "10px 18px",
        fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 600,
        letterSpacing: "-0.01em", cursor: "pointer"
      }}>Get a Free Quote →</button>
    </nav>
  </header>
);

// =========== TICKER ===========

const Ticker = ({ stats }) => {
  const items = [
    { num: stats.total_licensed_brokers.toLocaleString(), label: "Licensed Brokers Tracked" },
    { num: stats.active_authority.toLocaleString(), label: "Active Authority" },
    { num: stats.flagged_this_month, label: "Flagged This Month", warn: true },
    { num: stats.scam_reports_30d, label: "Scam Reports (30d)", warn: true },
    { num: stats.bond_lapses_30d, label: "Bond Lapses (30d)" },
    { num: stats.new_authorities_30d, label: "New Authorities (30d)" },
    { num: stats.quotes_facilitated_24h.toLocaleString(), label: "Quotes Facilitated (24h)" },
  ];
  return (
    <div style={{
      borderTop: "1px solid var(--rule)",
      borderBottom: "1px solid var(--rule)",
      background: "var(--paper)",
      overflow: "hidden",
      padding: "14px 0",
    }}>
      <div style={{
        display: "flex", gap: 48,
        animation: "tickerScroll 60s linear infinite",
        whiteSpace: "nowrap"
      }}>
        {[...items, ...items, ...items].map((it, i) => (
          <div key={i} style={{display:"flex", alignItems:"baseline", gap: 10, flex:"0 0 auto"}}>
            <span style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 28, color: it.warn ? "var(--red)" : "var(--ink)",
              fontWeight: 400
            }}><Mono>{it.num}</Mono></span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--muted)"
            }}>{it.label}</span>
            <span style={{color: "var(--rule)", marginLeft: 30}}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

window.UI = {
  Eyebrow, Rule, Stamp, Checkmark, WarnTri, Mono, Star, StarRow,
  Seal, TopBar, MainHeader, Ticker
};
