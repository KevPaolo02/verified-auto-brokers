// Apple touch icon — used when someone adds the site to their iOS home screen
// or shares it in iMessage. Bigger version of the favicon, same brand mark.
// Apple recommends 180x180 with no transparency.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 132,
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
