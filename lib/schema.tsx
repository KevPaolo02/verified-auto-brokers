// JSON-LD schema helpers (schema.org).
//
// Critical rule: schema MUST match visible page content. Google ignores (or
// distrusts) schema that contradicts what's actually rendered. Every helper
// below takes the same content the page is rendering, formatted as structured
// data — not separate marketing copy.
//
// Pages embed the output as <script type="application/ld+json">. Always serialize
// via JSON.stringify (handles apostrophes, special chars).

import { SITE_URL, SITE_NAME } from "./seo";
import { BROKER } from "./broker-info";

export type SchemaObject = Record<string, unknown>;

// ── HowTo ──────────────────────────────────────────────────────────────────
// Used on /how-to-check-auto-transport-broker — eligible for the step-by-step
// rich result in Google search.
export function howToSchema({
  name,
  description,
  totalTimeISO = "PT60S",
  steps,
}: {
  name: string;
  description: string;
  totalTimeISO?: string;
  steps: Array<{ name: string; text: string }>;
}): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime: totalTimeISO,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

// ── FAQPage ────────────────────────────────────────────────────────────────
// Eligible for the FAQ accordion rich result in Google search.
// Each Q&A pair MUST appear as visible content on the page.
export function faqSchema({
  questions,
}: {
  questions: Array<{ q: string; a: string }>;
}): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((qa) => ({
      "@type": "Question",
      name: qa.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.a,
      },
    })),
  };
}

// ── LocalBusiness ──────────────────────────────────────────────────────────
// For the GMF broker profile page + homepage. Establishes the operator as a
// real, locatable entity for trust + future local SEO.
export function localBusinessSchema({
  url,
}: {
  url?: string;
} = {}): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "MovingCompany"],
    "@id": url || `${SITE_URL}/brokers/gmf-auto-transport-mc-${BROKER.mc}`,
    name: BROKER.legal_name,
    alternateName: BROKER.dba_name,
    url: url || BROKER.website,
    telephone: BROKER.phone_e164,
    email: BROKER.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: BROKER.address.street,
      addressLocality: BROKER.address.city,
      addressRegion: BROKER.address.state,
      postalCode: BROKER.address.zip,
      addressCountry: "US",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    description: `${BROKER.legal_name} is a licensed FMCSA auto-transport broker (${BROKER.mc_display}, ${BROKER.dot_display}) coordinating vehicle shipping nationwide through vetted, FMCSA-authorized carriers.`,
    knowsAbout: [
      "Auto transport",
      "Car shipping",
      "FMCSA broker authority",
      "Vehicle transport",
      "Open transport",
      "Enclosed transport",
    ],
    identifier: [
      { "@type": "PropertyValue", propertyID: "MC", value: BROKER.mc },
      { "@type": "PropertyValue", propertyID: "DOT", value: BROKER.dot },
    ],
  };
}

// ── BreadcrumbList ─────────────────────────────────────────────────────────
// Helps Google show breadcrumbs in the SERP. Pass items in display order.
export function breadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── Organization (publisher) ───────────────────────────────────────────────
// Lighter than LocalBusiness — appropriate for the registry brand on the homepage.
export function organizationSchema(): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Independent registry of FMCSA-licensed auto-transport brokers.",
    sameAs: [], // add social URLs here when they exist
  };
}

// ── <JsonLd> renderer ──────────────────────────────────────────────────────
// Tiny helper component to embed a schema (or array of schemas) in a server
// component. Each entry becomes its own <script type="application/ld+json">.
export function JsonLd({ data }: { data: SchemaObject | SchemaObject[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
