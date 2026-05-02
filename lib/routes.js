// Route registry for funnel landing pages.
//
// IMPORTANT: each route entry must be substantively unique (real cities,
// real seasonal patterns, real route-specific FAQs). Pages that are mere
// city/state swaps trip Google's doorway-page penalties.
//
// Pricing baselines below are *indicative* — labeled as such on the page. Final
// pricing comes from /api/public/price-estimate (GMF CRM); these baselines are
// the fallback if the CRM doesn't return a value.

export const ROUTES = {
  "connecticut-to-florida": {
    slug: "connecticut-to-florida",
    seo_title: "Connecticut to Florida Car Shipping | Indicative Pricing",
    seo_description:
      "Ship a car from Connecticut to Florida. Indicative pricing, typical 4–8 day transit. Licensed FMCSA broker (MC-1675078) — connects you with vetted insured carriers.",
    origin: {
      state: "CT",
      state_name: "Connecticut",
      major_cities: ["Hartford", "Bridgeport", "New Haven", "Stamford", "Waterbury", "Norwalk"],
    },
    destination: {
      state: "FL",
      state_name: "Florida",
      major_cities: ["Miami", "Tampa", "Orlando", "Jacksonville", "Fort Lauderdale", "Naples"],
    },
    distance_miles: 1250,
    typical_transit_days: { low: 4, high: 8 },
    baseline_estimate_usd: { low: 850, high: 1450 },     // open transport, off-peak
    enclosed_estimate_usd: { low: 1300, high: 2200 },    // open × ~1.5
    seasonal_notes:
      "Demand peaks October through December (snowbirds heading south) and again March through May (heading north). Expect 15–25% higher pricing in those windows. Summer rates tend to be the lowest.",
    hero_subhead:
      "Open and enclosed transport between Connecticut and Florida, coordinated through vetted FMCSA-authorized carriers. Get an indicative estimate in seconds, then we confirm a real bid before you commit.",
    common_considerations: [
      "Northeast to Florida is one of the highest-volume auto transport corridors in the U.S. — carrier availability is generally strong, especially in summer.",
      "Snowbird season (Oct–Dec southbound, Mar–May northbound) doubles route demand and tightens carrier capacity. Book at least 2 weeks ahead in those windows.",
      "Pickup in dense Connecticut suburbs (Stamford, Greenwich, Fairfield) sometimes requires a smaller truck for narrow streets — confirm during quoting.",
      "Florida deliveries below Miami (Keys, Marathon) typically add 1–2 days and a small per-mile surcharge.",
    ],
    route_faqs: [
      {
        q: "How long does Connecticut to Florida car shipping take?",
        a: "Most carriers complete this route in 4–8 days from pickup to delivery. Off-season (June–September) tends to be on the faster end; snowbird season can stretch to the longer end because of higher route volume.",
      },
      {
        q: "When is the cheapest time to ship from Connecticut to Florida?",
        a: "Late spring through early fall (roughly May–September). Snowbird season — October through December and March through May — runs 15–25% higher because demand exceeds carrier capacity on the corridor.",
      },
      {
        q: "Can a carrier pick up at my home in Connecticut?",
        a: "Yes, door-to-door is the standard. The exception is narrow residential streets or HOA restrictions where a 75-foot car-hauler can't safely maneuver — in those cases the carrier will arrange a meeting spot at a nearby parking lot.",
      },
      {
        q: "Do you ship to the Florida Keys?",
        a: "Yes. Deliveries past Homestead (Marathon, Key West, etc.) typically add 1–2 days and a route surcharge that varies by carrier. We'll confirm both before booking.",
      },
    ],
  },

  // Add more routes here. Keep each one genuinely route-specific —
  // duplicate templates with only city names swapped will hurt SEO.
};

export function getRoute(slug) {
  return ROUTES[slug] || null;
}

export function getRouteSlugs() {
  return Object.keys(ROUTES);
}
