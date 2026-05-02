// Data service for the frontend.
//
// All broker data now comes from the live API:
//   - /api/brokers/search   bulk registry (24,992 brokers from FMCSA)
//   - /api/brokers/stats    real registry counts
//   - /api/fmcsa/lookup     single-broker live lookup with claim data
//
// No fabricated registry stats, no fake scam alerts, no fake reviews.
// Empty exports below are kept so older imports don't break during the migration —
// they're slated for full removal once all components are off them.

export const FMCSA_BROKERS = [];
export const REGISTRY_STATS = null;          // see BrokerService.getStats()
export const SCAM_ALERTS = [];                // see internal_flags table (none yet)
export const SAMPLE_REVIEWS = {};             // we have no verified reviews

export const BrokerService = {
  // Single-broker live lookup (FMCSA + Socrata + claim).
  async lookupBroker({ mc, dot }) {
    const params = new URLSearchParams();
    if (mc) params.set("mc", mc);
    if (dot) params.set("dot", dot);
    const res = await fetch(`/api/fmcsa/lookup?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Lookup failed (${res.status}): ${detail}`);
    }
    return await res.json();
  },

  // Paginated, filterable search across the full broker registry.
  async searchBrokers({ q = "", state = null, bonded = false, claimed = false, flagged = false, page = 1, pageSize = 50, sort = "mc" } = {}) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (state) p.set("state", state);
    if (bonded) p.set("bonded", "1");
    if (claimed) p.set("claimed", "1");
    if (flagged) p.set("flagged", "1");
    p.set("page", String(page));
    p.set("page_size", String(pageSize));
    if (sort) p.set("sort", sort);
    const res = await fetch(`/api/brokers/search?${p.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Search failed (${res.status})`);
    return await res.json(); // { rows, total, page, pageSize }
  },

  // Real registry counts.
  async getStats() {
    const res = await fetch("/api/brokers/stats", { cache: "no-store" });
    if (!res.ok) throw new Error(`Stats failed (${res.status})`);
    return await res.json();
  },
};
