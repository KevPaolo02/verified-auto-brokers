import type { Metadata } from "next";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Default metadata applied to every page; individual pages override via their own
// generateMetadata or `export const metadata`. metadataBase lets relative OG
// image paths resolve to absolute URLs when crawlers fetch them.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({
    title: "Verified Auto Brokers — The Independent Registry",
    description:
      "Independent registry of FMCSA-licensed auto-transport brokers. Look up any broker by name, MC#, or DOT#. 24,992 active brokers tracked.",
    path: "/",
  }),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
