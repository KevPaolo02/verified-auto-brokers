import { ImageResponse } from "next/og";
import { OgFrame, COLORS, SIZE, CONTENT_TYPE } from "@/lib/og-templates";

export const runtime = "edge";
export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "7 Car Shipping Scams You Must Avoid — Verified Auto Brokers";

export default async function Image() {
  return new ImageResponse(
    (
      <OgFrame accent={COLORS.red}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 22,
              color: COLORS.red,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 28, display: "flex" }}>⚠</span>
            <span style={{ display: "flex" }}>Public Notice · Fraud Awareness</span>
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
            7 Car Shipping
          </div>
          <div
            style={{
              fontSize: 110,
              fontWeight: 800,
              lineHeight: 0.95,
              color: COLORS.red,
              letterSpacing: "-0.025em",
              display: "flex",
            }}
          >
            Scams You Must Avoid.
          </div>

          <div
            style={{
              fontSize: 28,
              color: COLORS.muted,
              marginTop: 8,
              display: "flex",
            }}
          >
            How to spot each one before you book.
          </div>
        </div>
      </OgFrame>
    ),
    size
  );
}
