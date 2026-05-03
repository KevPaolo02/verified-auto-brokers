// Generated sitemap.xml — Next.js App Router convention.
// Available at https://www.verifiedautobrokers.com/sitemap.xml at runtime.
//
// Strategy: only index pages with substantial unique content.
//   - Homepage, claim form, route landing pages, privacy/terms — always included
//   - Per-broker pages — only verified-claimed brokers (the ones that have
//     unique bio/specialties/etc. that aren't on FMCSA.gov). Unclaimed broker
//     pages exist for deep-links but are noindex'd; we don't sitemap them.
//
// Revalidates hourly so newly-approved claims show up in the sitemap fast.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getRouteSlugs } from "@/lib/routes";
import { sql } from "@/lib/db";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/claim`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/terms`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  // Route landing pages (CT-FL, NY-FL, etc.) — high priority, real ranking targets.
  for (const slug of getRouteSlugs()) {
    entries.push({
      url: `${SITE_URL}/routes/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  // Verified-claimed broker pages — fetch from DB. Skip silently if DB unavailable
  // (sitemap should still render; we just won't list per-broker pages).
  if (sql) {
    try {
      const rows = await sql`
        SELECT mc, updated_at
          FROM broker_claims
         WHERE status = 'verified'
         ORDER BY updated_at DESC
      `;
      for (const r of rows) {
        entries.push({
          url: `${SITE_URL}/brokers/MC-${r.mc}`,
          lastModified: r.updated_at ? new Date(r.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    } catch (err) {
      console.error("[sitemap] failed to load claimed brokers:", err);
    }
  }

  return entries;
}
