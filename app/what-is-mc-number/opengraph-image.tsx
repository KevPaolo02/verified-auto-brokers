import { ImageResponse } from "next/og";
import { OgFrame, COLORS, SIZE, CONTENT_TYPE } from "@/lib/og-templates";

export const runtime = "edge";
export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "What is an MC Number? — Verified Auto Brokers";

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame accent={COLORS.green}>
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
            § Foundational
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
            What is an
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              lineHeight: 0.95,
              color: COLORS.green,
              letterSpacing: "-0.025em",
              display: "flex",
            }}
          >
            MC Number?
          </div>

          <div
            style={{
              fontSize: 28,
              color: COLORS.muted,
              marginTop: 12,
              display: "flex",
            }}
          >
            The federal license that makes a broker legal.
          </div>
        </div>
      </OgFrame>
    ),
    size
  );
}
