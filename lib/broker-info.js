// Single source of truth for broker disclosure on funnel pages.
// These values are required by FMCSA on every broker advertisement (49 CFR 371.2/371.5).
// They change so rarely that hardcoding here (deploy-on-update) is appropriate; this lets
// the funnel pages render with full disclosure even when deployed to standalone domains
// that don't have access to our internal /api/fmcsa/lookup.

export const BROKER = {
  legal_name: "GMF Auto Transport LLC",
  dba_name: "GMF Auto Transport",
  mc: "1675078",
  mc_display: "MC-1675078",
  dot: "4301133",
  dot_display: "DOT 4301133",
  address: {
    street: "479 Center Street",
    city: "Wolcott",
    state: "CT",
    zip: "06716",
    full: "479 Center Street, Wolcott, CT 06716",
  },
  phone: "(203) 312-1197",
  phone_e164: "+12033121197",
  email: "info@gmfautotransport.com",
  website: "https://www.gmfautotransport.com/",
  bond: {
    type: "BMC-84",
    amount_usd: 75000,
    provider: "U.S. Specialty Insurance Company",
    display: "$75,000 BMC-84 surety bond on file with U.S. Specialty Insurance Company",
  },
};

// TCPA-compliant consent text. Every form that collects a phone or sends SMS
// MUST display this verbatim near the submit button.
export const TCPA_CONSENT = `By submitting, you agree ${BROKER.legal_name} may contact you by phone, SMS, or email about your quote. Message and data rates may apply. Reply STOP to unsubscribe. We never sell your contact info.`;
