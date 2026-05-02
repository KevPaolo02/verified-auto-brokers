# GMF Multi-Domain Funnel Contract

**File purpose:** Add this document to every domain/project folder before using Claude Code, Codex, v0, or any coding assistant.

This document is the source of truth for how each domain connects to GMF Auto Transport’s central CRM, tracking, attribution, legal disclosures, and conversion system.

---

## 1. Core Rule

This project is a **funnel layer only** unless explicitly stated otherwise.

Do **not** create a separate CRM, leads table, tracking table, SMS system, pricing engine, or duplicate backend endpoints inside this project.

All tracking events, price estimates, SMS captures, and full lead submissions must go to the central GMF CRM backend.

**Rule:** Many domains. One CRM. One attribution system. One source of truth.

---

## 2. Business Structure

### Core Business

**GMF Auto Transport LLC** is the main auto transport brokerage business.

GMF closes the leads, manages customers, dispatches shipments, and owns the central CRM.

### Funnel Domains

The domains are traffic, SEO, trust, comparison, or route-specific lead capture layers. They feed leads into GMF.

Current domain map:

| Domain | Role |
|---|---|
| `gmfautotransport.com` | Main business / CRM / authority hub |
| `carshippingcalculator2027.com` | Calculator / conversion engine |
| `ct-to-fl-carshipping.com` | Route funnel: CT → FL |
| `nytofloridaautotransport.com` | Route funnel: NY → FL |
| `californiacarshippingpros.com` | Regional California funnel |
| `top-ct-car-movers.com` | Connecticut regional / route funnel |
| `lowestcarshipquotes.com` | Comparison / quote-shopping funnel |
| `verifiedautobrokers.com` | Trust / authority / broker verification funnel |
| `idispatchloads.com` | Future B2B / carrier / dispatch tool, not part of Phase 1 lead capture |

---

## 3. Central GMF Backend Endpoints

Use the existing GMF CRM backend endpoints.

Base URL:

```txt
https://gmfautotransport.com
```

### 3.1 Track Funnel Event

```http
POST https://gmfautotransport.com/api/public/track
```

Use this for page load, CTA clicks, call clicks, and redirect events.

Recommended body:

```json
{
  "event_type": "visit",
  "source_domain": "ct-to-fl-carshipping.com",
  "route_key": "CT-FL",
  "session_id": "client-generated-session-uuid",
  "metadata": {}
}
```

Allowed event types may include:

```txt
visit
redirect_to_calculator
call_click
price_click
sms_capture_click
form_start
form_submit
```

Do not add unnecessary event columns. Use `metadata` for extra details.

---

### 3.2 Price Estimate

```http
POST https://gmfautotransport.com/api/public/price-estimate
```

Use this when the user enters pickup and delivery ZIP codes.

Recommended body:

```json
{
  "pickup_zip": "06101",
  "delivery_zip": "33101",
  "transport_type": "open",
  "vehicle_make": "Toyota",
  "vehicle_model": "Camry",
  "is_inoperable": false,
  "origin_domain": "ct-to-fl-carshipping.com",
  "route_key": "CT-FL",
  "session_id": "client-generated-session-uuid"
}
```

Pricing language must describe the result as an **indicative estimate** or **estimated range**, not a guaranteed final price.

Required pricing disclaimer:

```txt
Final price depends on carrier availability, route, vehicle details, pickup timing, and market conditions. Exact pricing is confirmed before booking.
```

---

### 3.3 Phone-Only SMS Capture

```http
POST https://gmfautotransport.com/api/public/sms-capture
```

Use this when the user only provides a phone number and wants a quote by text.

Recommended body:

```json
{
  "phone": "+12035551234",
  "customer_name": "John",
  "origin_domain": "ct-to-fl-carshipping.com",
  "route_key": "CT-FL",
  "session_id": "client-generated-session-uuid",
  "utm_source": "google",
  "utm_campaign": "ct-fl-route"
}
```

This creates a stub / phone-only lead in GMF CRM and triggers the first-touch SMS flow.

---

### 3.4 Full Lead Create

```http
POST https://gmfautotransport.com/api/crm/leads
```

Use this for full lead submissions with customer and shipment details.

Required headers:

```http
Content-Type: application/json
x-gmf-secret: <calculator-or-funnel-secret>
x-lead-provider: calculator2027
```

Recommended body includes the normal lead fields plus attribution:

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com",
  "phone": "+12035551234",
  "pickup_zip": "06101",
  "pickup_city": "Hartford",
  "pickup_state": "CT",
  "delivery_zip": "33101",
  "delivery_city": "Miami",
  "delivery_state": "FL",
  "vehicle_year": "2020",
  "vehicle_make": "Toyota",
  "vehicle_model": "Camry",
  "transport_type": "open",
  "ship_date": "2026-06-01",
  "origin_domain": "ct-to-fl-carshipping.com",
  "referrer_origin": "https://ct-to-fl-carshipping.com",
  "attribution_source": "param",
  "route_key": "CT-FL",
  "session_id": "client-generated-session-uuid",
  "utm_source": "google",
  "utm_campaign": "ct-fl-route"
}
```

---

## 4. Attribution Rules

Every funnel page must preserve attribution.

### Required Fields

| Field | Meaning |
|---|---|
| `origin_domain` | The original funnel domain, usually from `?origin=` |
| `referrer_origin` | Browser referrer origin, used for audit/debugging |
| `attribution_source` | `param`, `referrer`, or `direct` |
| `route_key` | Route identifier, for example `CT-FL` |
| `session_id` | Client-generated UUID persisted in sessionStorage |
| `utm_source` | Optional campaign source |
| `utm_campaign` | Optional campaign name |

### Origin Handling

When redirecting to the calculator, always include:

```txt
?origin=<current-domain>&route_key=<ROUTE_KEY>&session_id=<SESSION_ID>
```

Example:

```txt
https://carshippingcalculator2027.com/?origin=ct-to-fl-carshipping.com&route_key=CT-FL&session_id=abc-123
```

### Route Key Format

Use this format:

```txt
STATE-STATE
```

Examples:

```txt
CT-FL
NY-FL
CA-TX
NJ-FL
```

Always uppercase. Do not use `ct-fl`, `CT_to_FL`, or custom variations.

---

## 5. Session ID Rules

Every project must create or preserve a session ID on the client side.

Use `sessionStorage`.

Example helper:

```js
function getOrCreateSessionId() {
  const key = 'gmf_session_id'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(key, id)
  }
  return id
}
```

Send `session_id` on every request to:

- `/api/public/track`
- `/api/public/price-estimate`
- `/api/public/sms-capture`
- `/api/crm/leads`

Without `session_id`, the CRM cannot reliably connect visits → clicks → leads → booked revenue.

---

## 6. Page Tracking Requirements

### On Page Load

```js
fetch('https://gmfautotransport.com/api/public/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'visit',
    source_domain: location.hostname.replace(/^www\./, '').toLowerCase(),
    route_key: 'CT-FL',
    session_id: getOrCreateSessionId(),
    metadata: { path: location.pathname }
  })
})
```

### On Call Button Click

```js
fetch('https://gmfautotransport.com/api/public/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'call_click',
    source_domain: location.hostname.replace(/^www\./, '').toLowerCase(),
    route_key: 'CT-FL',
    session_id: getOrCreateSessionId(),
    metadata: { phone_displayed: '+1-XXX-XXX-XXXX' }
  })
})
```

### On Redirect to Calculator

```js
const sessionId = getOrCreateSessionId()
const origin = location.hostname.replace(/^www\./, '').toLowerCase()
const routeKey = 'CT-FL'

fetch('https://gmfautotransport.com/api/public/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    event_type: 'redirect_to_calculator',
    source_domain: origin,
    route_key: routeKey,
    session_id: sessionId,
    metadata: { target: 'carshippingcalculator2027.com' }
  })
})

window.location.href = `https://carshippingcalculator2027.com/?origin=${encodeURIComponent(origin)}&route_key=${encodeURIComponent(routeKey)}&session_id=${encodeURIComponent(sessionId)}`
```

---

## 7. Legal and Ethical Compliance Rules

Every customer-facing page must be transparent and ethical.

### Required Broker Disclosure

Use language like:

```txt
GMF Auto Transport LLC is a licensed auto transport broker, not a motor carrier. We arrange transportation with licensed and insured motor carriers.
```

### Required Identifiers

Display clearly in the footer and preferably in a trust section:

```txt
GMF Auto Transport LLC
Licensed Auto Transport Broker
MC-1675078 · DOT 4301133
```

If available, display the physical business location from config or the broker profile API.

### Do Not Say

Do not say:

- “Our trucks”
- “Our drivers”
- “Guaranteed pickup date”
- “Guaranteed delivery date”
- “Lowest price guaranteed”
- “Government approved”
- “FMCSA verified by us” in a way that implies government affiliation
- Fake reviews or fabricated customer counts

### Acceptable Language

Use:

```txt
Estimated pickup window
Estimated transit time
Carrier availability varies
Final price confirmed before booking
Licensed broker arranging transport with insured carriers
```

---

## 8. TCPA Consent Language

Place this language near every phone/SMS form:

```txt
By submitting, you agree GMF Auto Transport LLC may contact you by phone, SMS, or email about your quote. Message and data rates may apply. Reply STOP to unsubscribe. We never sell your contact info.
```

This must appear before or near the submit button, not hidden only in Terms.

---

## 9. Personal Items Language

Do not promise “150 lbs free” as a universal guarantee.

Use this safer version:

```txt
Many carriers allow limited personal items, often around 100 lbs, usually secured below the window line. The final allowance depends on the assigned carrier and must be confirmed before pickup.
```

---

## 10. Pricing Language

Do not present estimates as guaranteed quotes.

Use:

```txt
Indicative estimate
Estimated price range
Exact carrier pricing confirmed before booking
```

Required disclaimer:

```txt
Final price may vary based on carrier availability, vehicle type, vehicle condition, route, timing, and market conditions.
```

---

## 11. Privacy and Terms

Every domain must link to:

```txt
/privacy
/terms
```

Privacy page must disclose:

- Lead collection
- Phone/SMS/email contact
- Session tracking
- Page event tracking
- Cookies or local/session storage
- UTM/campaign attribution
- Do Not Sell / privacy rights where applicable

Terms page must disclose:

- Broker role
- No guaranteed pickup/delivery dates unless written separately
- Carrier assignment process
- Pricing estimate limitations
- Customer responsibility for accurate info

If using placeholder legal pages, add a clear internal comment that legal review is still required before launch.

---

## 12. SEO and Multi-Domain Rules

Multi-domain SEO is allowed, but thin doorway pages are not.

Each route or regional domain must have unique, substantive content.

### Required Unique Content Per Route Page

Include:

- Route-specific headline
- Pickup and delivery states/cities
- Common seasonal patterns
- Typical transit window
- Route-specific FAQs
- Common pickup/delivery considerations
- Honest pricing explanation
- Local/regional wording that is actually relevant

Do not create 50 pages that only swap city/state names.

### Canonical Strategy

If pages are duplicated across domains or subdomains, set proper canonicals. Avoid confusing Google with identical content across many domains.

### No Fake EEAT

Do not fake:

- Reviews
- Awards
- Government affiliation
- Years in business
- Carrier ownership
- Office locations

---

## 13. Conversion Page Template

Each lead funnel page should follow this structure:

1. Hero section
   - Route-specific headline
   - Clear broker/service explanation
   - Primary CTA: Get estimate
   - Secondary CTA: Call now

2. ZIP / price interaction
   - Pickup ZIP
   - Delivery ZIP
   - Transport type
   - Estimated range result

3. SMS capture
   - Phone input
   - TCPA consent
   - Text me my quote CTA

4. Trust and transparency
   - Broker disclosure
   - MC/DOT
   - Licensed and insured carrier network language
   - No guaranteed dates language

5. Route-specific guide
   - Major cities
   - Seasonal demand
   - Transit expectations
   - Pickup/delivery notes

6. FAQ
   - Broker vs carrier
   - How pricing works
   - Are dates guaranteed?
   - Is the vehicle insured?
   - Can I put items in the car?

7. Final CTA
   - Get exact quote
   - Call now

---

## 14. Domain-Specific Roles

### Route Domains

Examples:

```txt
ct-to-fl-carshipping.com
nytofloridaautotransport.com
```

Goal:

- Capture high-intent route traffic
- Offer price estimate
- Encourage call/SMS
- Send all leads to GMF CRM

Must include route-specific content.

---

### Calculator Domain

Example:

```txt
carshippingcalculator2027.com
```

Goal:

- Convert traffic from other domains
- Provide ZIP-based estimate
- Capture phone/full lead
- Preserve origin attribution

Must preserve:

- `origin_domain`
- `route_key`
- `session_id`
- UTM fields

---

### Comparison Domain

Example:

```txt
lowestcarshipquotes.com
```

Goal:

- Capture quote-shopping users
- Educate ethically
- Push to estimate/call/SMS
- Avoid fake comparison claims

Do not falsely claim to compare live quotes from companies unless actually doing so.

---

### Authority / Trust Domain

Example:

```txt
verifiedautobrokers.com
```

Goal:

- Help users research broker authority and legitimacy
- Build trust
- Offer path to get a quote from GMF

Do not imply government affiliation.

Do not make it look like an official FMCSA or DOT website.

---

### B2B / Dispatch Domain

Example:

```txt
idispatchloads.com
```

Goal:

- Future carrier/broker/dispatch product
- Not part of Phase 1 consumer lead capture unless explicitly decided

Do not connect it to the consumer lead funnel without a separate plan.

---

## 15. What Claude / Codex Must Do Before Coding

Before coding, the assistant must state:

1. Which files it will modify
2. Which GMF backend endpoints it will call
3. Which attribution fields it will preserve
4. Which compliance disclosures will be visible
5. What it will **not** build

Required statement:

```txt
I will not create a new CRM, leads table, event table, SMS system, pricing backend, or duplicate GMF backend endpoints unless explicitly instructed.
```

---

## 16. Start Prompt for Claude Code / Codex

Paste this at the start of any new domain/project session:

```txt
Before coding, read GMF_FUNNEL_CONTRACT.md.

This project is a funnel layer only unless explicitly stated otherwise.
Do not create a new CRM, leads table, tracking table, SMS system, pricing engine, or duplicate backend endpoints.

All tracking, price estimates, SMS captures, and full lead submissions must call the existing GMF CRM backend:

POST https://gmfautotransport.com/api/public/track
POST https://gmfautotransport.com/api/public/price-estimate
POST https://gmfautotransport.com/api/public/sms-capture
POST https://gmfautotransport.com/api/crm/leads

Before coding, explain:
1. Which files you will modify
2. Which external GMF endpoints you will call
3. What attribution fields you will preserve
4. What legal/compliance disclosures will be displayed
5. What you will not build

Preserve origin_domain, route_key, session_id, utm_source, and utm_campaign across the full funnel.
Use ethical, legal, transparent broker language.
Do not guarantee dates or pricing.
Do not imply GMF owns trucks or drivers.
Do not imply government affiliation.
```

---

## 17. Smoke Test Checklist

After launching a domain/page, test the first 5 real or test leads before trusting the system.

In Supabase / GMF CRM, verify:

- `origin_domain` is correct
- `attribution_source = 'param'`
- `session_id` is set
- `session_id` matches at least one row in `tracking_events`
- Funnel dashboard shows the correct domain with leads ≥ 1
- SMS was sent if using SMS capture
- Call click tracking fires when call button is clicked

If `attribution_source = 'direct'`, the page or calculator dropped the origin param.

If `session_id` is missing, the frontend failed to generate or pass it.

If tracking events are missing, the page-side script is broken.

---

## 18. Final Operating Principle

Do not optimize for pretty pages first.

Optimize for:

1. Trust
2. Speed
3. Attribution accuracy
4. Lead capture
5. Legal clarity
6. Close rate

The goal is not traffic alone.

The goal is:

```txt
Visits → Qualified leads → Booked orders → Revenue by domain
```

