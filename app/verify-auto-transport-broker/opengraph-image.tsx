import { ImageResponse } from "next/og";
import { OgFrame, COLORS, SIZE, CONTENT_TYPE } from "@/lib/og-templates";

export const runtime = "edge";
export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "Verify Any Auto Transport Broker Instantly — FMCSA Lookup Tool";

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame accent={COLORS.amber}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
            FMCSA Lookup Tool · Free · No Account
          </div>

          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              lineHeight: 0.95,
              color: COLORS.paper,
              letterSpacing: "-0.025em",
              display: "flex",
            }}
          >
            Verify any auto transport broker
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              lineHeight: 0.95,
              color: COLORS.amber,
              letterSpacing: "-0.025em",
              display: "flex",
            }}
          >
            instantly.
          </div>

          <div
            style={{
              fontSize: 28,
              color: COLORS.muted,
              marginTop: 12,
              display: "flex",
            }}
          >
            Check FMCSA license &amp; bond in seconds.
          </div>
        </div>
      </OgFrame>
    ),
    size
  );
}
