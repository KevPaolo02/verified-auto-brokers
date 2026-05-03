// Generated robots.txt — Next.js App Router convention.
// Available at https://www.verifiedautobrokers.com/robots.txt at runtime.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Crawlers don't need our internal API surface — wastes their budget
        // and exposes data shapes we may want to change without thinking about SEO.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
