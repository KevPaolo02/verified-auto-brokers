// Dynamic favicon — Next.js App Router convention.
// Renders the "V" seal mark from the OG images at browser-tab size.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A1F44",
          color: "#F4F1EA",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: 26,
          lineHeight: 1,
          letterSpacing: "-0.04em",
        }}
      >
        V
      </div>
    ),
    size
  );
}
