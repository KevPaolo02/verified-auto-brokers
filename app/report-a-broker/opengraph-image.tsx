import { ImageResponse } from "next/og";
import { OgFrame, COLORS, SIZE, CONTENT_TYPE } from "@/lib/og-templates";

export const runtime = "edge";
export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "Report an Auto Transport Broker — Verified Auto Brokers";

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame accent={COLORS.red}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 22,
              color: COLORS.red,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              display: "flex",
            }}
          >
            File a Broker Report
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
            Got burned by
          </div>
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              lineHeight: 0.95,
              color: COLORS.red,
              letterSpacing: "-0.025em",
              display: "flex",
            }}
          >
            a broker?
          </div>

          <div
            style={{
              fontSize: 26,
              color: COLORS.muted,
              marginTop: 12,
              display: "flex",
            }}
          >
            Tell us what happened. Manual review. We never auto-flag.
          </div>
        </div>
      </OgFrame>
    ),
    size
  );
}
