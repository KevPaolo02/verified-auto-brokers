import { ImageResponse } from "next/og";
import { OgFrame, COLORS, SIZE, CONTENT_TYPE } from "@/lib/og-templates";

export const runtime = "edge";
export const size = SIZE;
export const contentType = CONTENT_TYPE;
export const alt = "How to Check if an Auto Transport Broker is Legit — 4 Steps";

const STEPS = [
  "Look up the FMCSA registration",
  "Confirm broker authority is ACTIVE",
  "Verify the BMC-84 bond ($75K)",
  "Match the legal company name",
];

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
            § Quick Guide · 30 Seconds
          </div>

          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 0.98,
              color: COLORS.paper,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            How to check if a broker is legit.
          </div>

          {/* 4-step checklist */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            {STEPS.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontSize: 26,
                  color: COLORS.paper,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    border: `2px solid ${COLORS.green}`,
                    color: COLORS.green,
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ display: "flex" }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </OgFrame>
    ),
    size
  );
}
