// Dynamic OG image per broker — Next.js convention.
// Renders at /brokers/[mc]/opengraph-image. Auto-attached to the route's metadata.

import { ImageResponse } from "next/og";
import { sql, readClaim } from "@/lib/db";
import { extractMcFromSlug, canonicalNameForBroker } from "@/lib/notable-brokers";
import { OgFrame, StatusPill, COLORS, SIZE, CONTENT_TYPE } from "@/lib/og-templates";

export const runtime = "nodejs"; // need access to our db client (not Edge-bundled)
export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "Broker FMCSA verification card";

async function loadBroker(mc: string) {
  if (!sql) return null;
  const rows = await sql`
    SELECT mc, dot, legal_name, dba_name, broker_stat, bond_on_file
      FROM brokers
     WHERE mc = ${mc}
     LIMIT 1
  `;
  return rows[0] ?? null;
}

export default async function Image({ params }: { params: { mc: string } }) {
  const mc = extractMcFromSlug(params.mc);
  const row = mc ? await loadBroker(mc) : null;

  // Fallback for unknown / unparseable URLs — still produces a valid card.
  if (!mc || !row) {
    return new ImageResponse(
      (
        <OgFrame>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 24, color: COLORS.muted, letterSpacing: "0.18em", textTransform: "uppercase", display: "flex" }}>
              Broker Profile
            </div>
            <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.0, color: COLORS.paper, display: "flex" }}>
              FMCSA Lookup
            </div>
            <div style={{ fontSize: 32, color: COLORS.muted, marginTop: 6, display: "flex" }}>
              Search any broker by MC number or company name
            </div>
          </div>
        </OgFrame>
      ),
      size
    );
  }

  const claim = await readClaim({ mc }).catch(() => null);
  const name = canonicalNameForBroker({
    mc: row.mc,
    legal_name: row.legal_name,
    dba_name: row.dba_name,
  });

  const authActive = row.broker_stat === "A";
  const bondActive = row.bond_on_file === "Y";
  const claimed = claim?.status === "verified";

  // Three-state status used both in the pill and the accent color.
  const status =
    authActive && bondActive
      ? { tone: "verified" as const, text: "FMCSA Verified", accent: COLORS.green }
      : authActive && !bondActive
      ? { tone: "warn" as const, text: "Bond Issue", accent: COLORS.amber }
      : { tone: "bad" as const, text: "Inactive Authority", accent: COLORS.red };

  return new ImageResponse(
    (
      <OgFrame accent={status.accent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 22,
              color: COLORS.muted,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              display: "flex",
              gap: 14,
            }}
          >
            <span style={{ display: "flex" }}>FMCSA Broker Profile</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex", color: COLORS.paper }}>MC-{row.mc}</span>
          </div>

          {/* Broker name (H1) */}
          <div
            style={{
              fontSize: name.length > 30 ? 64 : 84,
              fontWeight: 800,
              lineHeight: 1.0,
              color: COLORS.paper,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {name}
          </div>

          {/* Status row: pill + claimed badge if applicable */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <StatusPill tone={status.tone} text={status.text} />
            {claimed && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 22px",
                  border: `2px solid ${COLORS.amber}`,
                  background: "rgba(232,197,71,0.18)",
                  color: COLORS.amber,
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Claimed
              </div>
            )}
          </div>

          {/* DOT + bond detail line */}
          <div
            style={{
              fontSize: 22,
              color: COLORS.muted,
              letterSpacing: "0.06em",
              display: "flex",
              gap: 18,
            }}
          >
            <span style={{ display: "flex" }}>DOT-{row.dot}</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>
              Bond {bondActive ? "$75,000 BMC-84 on file" : "not on file"}
            </span>
          </div>
        </div>
      </OgFrame>
    ),
    size
  );
}
