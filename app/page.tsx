// Homepage — server-renders the registry stats so first paint already shows real
// numbers (no "—" flash) AND so Google sees the actual content during crawl.

import App from "@/components/app";
import { getRegistryStats } from "@/lib/db";
import { buildMetadata, SITE_URL } from "@/lib/seo";
import { JsonLd, organizationSchema, localBusinessSchema } from "@/lib/schema";

export const metadata = buildMetadata({
  title: "Verified Auto Brokers — Look up any FMCSA-licensed auto broker",
  description:
    "Independent registry of every FMCSA-licensed auto-transport broker in the U.S. — 24,992 active brokers. Search by name, MC#, or DOT#.",
  path: "/",
});

// Revalidate the page every 5 minutes so the stats stay reasonably fresh
// without re-running the SQL on every visit.
export const revalidate = 300;

export default async function Page() {
  let initialStats = null;
  try {
    initialStats = await getRegistryStats();
  } catch (err) {
    console.error("[home] getRegistryStats failed:", err);
  }
  return (
    <>
      <JsonLd data={[
        // Publisher entity for the registry as a whole.
        organizationSchema(),
        // GMF as the operator-affiliated entity (transparent disclosure already
        // visible elsewhere on the site; LocalBusiness here surfaces it to crawlers).
        localBusinessSchema(),
      ]} />
      <App initialStats={initialStats} />
    </>
  );
}
