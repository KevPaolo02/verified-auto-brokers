import { ImageResponse } from "next/og";
import { OgFrame, COLORS, SIZE, CONTENT_TYPE } from "@/lib/og-templates";

export const runtime = "edge";
export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "Verified Auto Brokers — The Independent FMCSA Registry";

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame accent={COLORS.amber}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 22,
              color: COLORS.muted,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "flex",
            }}
          >
            Public Registry of FMCSA-Licensed Property Brokers
          </div>

          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              lineHeight: 0.95,
              color: COLORS.paper,
              letterSpacing: "-0.025em",
              display: "flex",
            }}
          >
            Verified Auto Brokers.
          </div>

          <div
            style={{
              display: "flex",
              gap: 38,
              marginTop: 8,
              alignItems: "baseline",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: COLORS.amber, letterSpacing: "-0.02em", display: "flex" }}>24,992</span>
              <span style={{ fontSize: 18, color: COLORS.muted, letterSpacing: "0.14em", textTransform: "uppercase", display: "flex" }}>Brokers Tracked</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: COLORS.paper, letterSpacing: "-0.02em", display: "flex" }}>$75K</span>
              <span style={{ fontSize: 18, color: COLORS.muted, letterSpacing: "0.14em", textTransform: "uppercase", display: "flex" }}>BMC-84 Bond Verified</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 64, fontWeight: 800, color: COLORS.paper, letterSpacing: "-0.02em", display: "flex" }}>Live</span>
              <span style={{ fontSize: 18, color: COLORS.muted, letterSpacing: "0.14em", textTransform: "uppercase", display: "flex" }}>FMCSA Lookup</span>
            </div>
          </div>
        </div>
      </OgFrame>
    ),
    size
  );
}
