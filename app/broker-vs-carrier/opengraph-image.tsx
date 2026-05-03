import { ImageResponse } from "next/og";
import { OgFrame, COLORS, SIZE, CONTENT_TYPE } from "@/lib/og-templates";

export const runtime = "edge";
export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "Broker vs Carrier — What's the Difference? — Verified Auto Brokers";

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame accent={COLORS.amber}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
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
            § Plain-English Guide
          </div>

          <div
            style={{
              fontSize: 90,
              fontWeight: 800,
              lineHeight: 0.95,
              color: COLORS.paper,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            Broker vs Carrier:
          </div>
          <div
            style={{
              fontSize: 90,
              fontWeight: 800,
              lineHeight: 0.95,
              color: COLORS.amber,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            what&apos;s the difference?
          </div>

          <div
            style={{
              fontSize: 26,
              color: COLORS.muted,
              marginTop: 12,
              display: "flex",
            }}
          >
            Most people think they&apos;re booking a carrier. They&apos;re not.
          </div>
        </div>
      </OgFrame>
    ),
    size
  );
}
