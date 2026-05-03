// SEO helpers — base URL, canonical, default OpenGraph/Twitter metadata.
//
// Set NEXT_PUBLIC_SITE_URL in Vercel env vars when the production host changes.
// Falls back to the canonical www domain so local dev still produces correct URLs.

import { BROKER } from "./broker-info";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.verifiedautobrokers.com").replace(/\/$/, "");
export const SITE_NAME = "Verified Auto Brokers";

// Canonical helper — accepts a path like "/routes/connecticut-to-florida"
// and returns the absolute URL on the canonical host.
export function canonical(path = "/") {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleaned}`;
}

// Build a full Next.js Metadata object with sane defaults that any page can
// extend or override. Pages just call buildMetadata({ title, description, path })
// and get OG + Twitter + canonical filled in.
export function buildMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
  ogImage = null, // optional override; default to none for now (Tier 2 will add next/og)
} = {}) {
  const url = canonical(path);
  const fullTitle = title ? `${title}` : `${SITE_NAME} — The Independent Registry`;
  const desc = description || "Independent registry of FMCSA-licensed auto-transport brokers. Look up any broker by name, MC#, or DOT#.";

  return {
    title: fullTitle,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: fullTitle,
      description: desc,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

// Convenience: an MC docket → its public broker page URL.
export function brokerUrl(mcDigits) {
  if (!mcDigits) return null;
  const bare = String(mcDigits).replace(/^MC-?/i, "").replace(/[^\d]/g, "");
  return bare ? canonical(`/brokers/MC-${bare}`) : null;
}

// Re-export BROKER so SEO consumers don't have to import two places.
export { BROKER };
