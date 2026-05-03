// Shared building blocks for OpenGraph images via next/og (Satori).
//
// Constraints to remember:
//   - Use inline styles only (no className / Tailwind / external CSS)
//   - Layout must be Flexbox (no grid, no float, no position:absolute on most things)
//   - Default font is fine for v1 — we can wire Google Fonts later if needed
//   - Max image weight ~1MB; keep DOM simple
//
// Design rules per spec: dark / high-contrast, ≤3 elements, large readable text,
// brand footer ("Verified Auto Brokers · Verified via FMCSA") on every image.

import React from "react";

export const SIZE = { width: 1200, height: 630 };
export const CONTENT_TYPE = "image/png";

export const COLORS = {
  bg: "#0A1F44",         // navy
  bgDeep: "#061536",     // navy-deep
  paper: "#F4F1EA",
  ink: "#11161E",
  red: "#B0272D",
  amber: "#E8C547",
  green: "#1FBA5A",
  muted: "rgba(244, 241, 234, 0.55)",
  rule: "rgba(244, 241, 234, 0.18)",
};

// Frame: dark gradient bg + brand footer pinned bottom. Children fill the body.
export function OgFrame({
  accent = COLORS.amber,
  children,
}: {
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(135deg, ${COLORS.bg} 0%, ${COLORS.bgDeep} 100%)`,
        color: COLORS.paper,
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 8,
          background: accent,
          width: "100%",
          display: "flex",
        }}
      />

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 72px",
        }}
      >
        {children}
      </div>

      {/* Brand footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 72px",
          borderTop: `1px solid ${COLORS.rule}`,
          fontSize: 18,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Seal />
          <span style={{ color: COLORS.paper, letterSpacing: "0.1em", fontSize: 20 }}>
            Verified Auto Brokers
          </span>
        </div>
        <span style={{ display: "flex" }}>Verified via FMCSA</span>
      </div>
    </div>
  );
}

// Compact V monogram seal — pure SVG via JSX so Satori can render it.
function Seal() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.paper,
        color: COLORS.bg,
        fontWeight: 800,
        fontSize: 22,
        fontFamily: "serif",
      }}
    >
      V
    </div>
  );
}

// Status pill — used on the broker OG image.
// Color + border + uppercase text do all the work; we skip prefix glyphs
// because Satori's default font doesn't render unicode symbols (✓, ✗) at this
// size and the empty-box fallback looks worse than no glyph.
export function StatusPill({
  tone,
  text,
}: {
  tone: "verified" | "warn" | "bad";
  text: string;
}) {
  const palette =
    tone === "verified"
      ? { bg: "rgba(31,186,90,0.18)", border: COLORS.green, fg: COLORS.green }
      : tone === "warn"
      ? { bg: "rgba(232,197,71,0.18)", border: COLORS.amber, fg: COLORS.amber }
      : { bg: "rgba(176,39,45,0.22)", border: COLORS.red, fg: COLORS.paper };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px 22px",
        border: `2px solid ${palette.border}`,
        background: palette.bg,
        color: palette.fg,
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        alignSelf: "flex-start",
      }}
    >
      <span style={{ display: "flex" }}>{text}</span>
    </div>
  );
}
