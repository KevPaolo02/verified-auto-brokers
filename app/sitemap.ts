// Generated sitemap.xml — Next.js App Router convention.
// Available at https://www.verifiedautobrokers.com/sitemap.xml at runtime.
//
// Indexing strategy: only emit URLs we want Google to rank.
//   - Homepage, claim form, route landing pages, privacy/terms — always included
//   - Per-broker pages — both Tier-2 notable brokers AND verified-claimed brokers.
//     Long-tail unclaimed brokers exist for direct visits but are noindex'd; we
//     never sitemap them (their slug URL still works but Google won't rank them).
//
// Always uses the CANONICAL slug URL — never the bare MC URL — so Google
// consolidates rank to one URL per broker.
//
// Revalidates hourly so newly-approved claims appear in search results fast.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getRouteSlugs } from "@/lib/routes";
import { sql } from "@/lib/db";
import { NOTABLE_BROKERS, buildBrokerSlug } from "@/lib/notable-brokers";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,        lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/claim`,   lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/terms`,   lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  // Route landing pages
  for (const slug of getRouteSlugs()) {
    entries.push({
      url: `${SITE_URL}/routes/${slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  // Build the union of MCs we want indexed: notable list ∪ verified claims.
  // Both go through the same slug builder so the URL is canonical.
  const mcsToIndex = new Map<string, { lastMod: Date; priority: number }>();

  // Notable brokers (curated brand-search targets) — priority 0.85
  for (const mc of Object.keys(NOTABLE_BROKERS)) {
    mcsToIndex.set(mc, { lastMod: now, priority: 0.85 });
  }

  // Verified-claimed brokers — priority 0.9 (these convert higher)
  if (sql) {
    try {
      const rows = await sql`
        SELECT mc, updated_at
          FROM broker_claims
         WHERE status = 'verified'
      `;
      for (const r of rows) {
        mcsToIndex.set(r.mc, {
          lastMod: r.updated_at ? new Date(r.updated_at) : now,
          priority: 0.9,
        });
      }
    } catch (err) {
      console.error("[sitemap] failed to load claimed brokers:", err);
    }

    // Pull legal_name + dba_name in one batch so slugs match what the broker
    // page itself computes (otherwise an MC-only URL would 301 to a different
    // canonical slug, which is fine but wastes Google's crawl budget).
    try {
      const mcList = Array.from(mcsToIndex.keys());
      if (mcList.length > 0) {
        const inList = mcList.map((m) => `'${m.replace(/'/g, "''")}'`).join(",");
        const rows = await sql.query(
          `SELECT mc, legal_name, dba_name FROM brokers WHERE mc IN (${inList})`,
          []
        );
        for (const r of rows) {
          const meta = mcsToIndex.get(r.mc);
          if (!meta) continue;
          const slug = buildBrokerSlug({
            mc: r.mc,
            legal_name: r.legal_name,
            dba_name: r.dba_name,
          });
          if (slug) {
            entries.push({
              url: `${SITE_URL}/brokers/${slug}`,
              lastModified: meta.lastMod,
              changeFrequency: "weekly",
              priority: meta.priority,
            });
          }
        }
      }
    } catch (err) {
      console.error("[sitemap] failed to enrich broker slugs:", err);
    }
  }

  return entries;
}
