"use client";

// Interactive funnel UI for /routes/[slug]:
//   - Hero CTA buttons (call + estimate)
//   - ZIP-to-ZIP estimate form
//   - Estimate result with route-specific transit window
//   - SMS capture (TCPA-compliant consent)
//
// All events post to GMF CRM via lib/crm-client (proxied through /api/gmf/* rewrite).
// No leads or events are stored locally — this funnel is a thin layer over the central CRM.

import React, { useEffect, useState } from "react";
import { BROKER, TCPA_CONSENT } from "@/lib/broker-info";
import { track, priceEstimate, smsCapture } from "@/lib/crm-client";

const inputStyle = {
  width: "100%", border: "1.5px solid var(--ink)", padding: "12px 14px",
  fontFamily: "'Inter Tight'", fontSize: 16, background: "var(--paper)",
  outline: "none", letterSpacing: "-0.01em",
};
const btnPrimary = {
  background: "var(--ink)", color: "var(--paper)", border: "none",
  padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
  fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em",
  textTransform: "uppercase",
};
const btnGhost = {
  background: "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)",
  padding: "14px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
  fontWeight: 600, cursor: "pointer",
};

export default function RouteFunnel({ route, routeKey }) {
  const [form, setForm] = useState({ pickup_zip: "", delivery_zip: "", phone: "" });
  const [transportType, setTransportType] = useState("open");
  const [estimate, setEstimate] = useState(null);   // { low, high, transit_days_low, transit_days_high, source }
  const [estimateState, setEstimateState] = useState("idle"); // idle | loading | done | error
  const [smsState, setSmsState] = useState("idle"); // idle | sent | error
  const [smsError, setSmsError] = useState(null);

  // Page-load tracking — fires once on mount.
  // event_type values are constrained by the CRM contract to:
  //   'visit' | 'redirect_to_calculator' | 'call_click'
  // Sub-action distinctions go into metadata.action so analytics can group them.
  useEffect(() => {
    track("visit", routeKey, {
      origin_state: route.origin.state,
      destination_state: route.destination.state,
    });
  }, [routeKey, route.origin.state, route.destination.state]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleEstimate = async (e) => {
    e?.preventDefault?.();
    if (!/^\d{5}$/.test(form.pickup_zip) || !/^\d{5}$/.test(form.delivery_zip)) {
      setEstimateState("error");
      setEstimate(null);
      return;
    }
    setEstimateState("loading");
    track("redirect_to_calculator", routeKey, {
      action: "estimate_submit",
      pickup_zip: form.pickup_zip,
      delivery_zip: form.delivery_zip,
      transport_type: transportType,
    });
    // Try the CRM endpoint first; fall back to the route's hardcoded baseline if the CRM is down.
    const crmResult = await priceEstimate({
      pickup_zip: form.pickup_zip,
      delivery_zip: form.delivery_zip,
      transport_type: transportType,
    });
    if (crmResult && crmResult.low && crmResult.high) {
      setEstimate({ ...crmResult, source: "crm" });
    } else {
      const baseline = transportType === "enclosed"
        ? route.enclosed_estimate_usd
        : route.baseline_estimate_usd;
      setEstimate({
        low: baseline.low,
        high: baseline.high,
        transit_days_low: route.typical_transit_days.low,
        transit_days_high: route.typical_transit_days.high,
        source: "route_baseline",
      });
    }
    setEstimateState("done");
  };

  const handleSms = async (e) => {
    e?.preventDefault?.();
    setSmsError(null);
    // Light validation: 10+ digits.
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setSmsError("Enter a valid 10-digit U.S. phone number.");
      return;
    }
    track("call_click", routeKey, { action: "sms_submit" });
    // If the user already submitted ZIPs to get an estimate, include them on
    // the SMS lead so the CRM can route a more accurate carrier-bid quote.
    const hasZips = /^\d{5}$/.test(form.pickup_zip) && /^\d{5}$/.test(form.delivery_zip);
    const res = await smsCapture({
      phone: form.phone,
      route_key: routeKey,
      consent_text: TCPA_CONSENT,
      pickup_zip: hasZips ? form.pickup_zip : null,
      delivery_zip: hasZips ? form.delivery_zip : null,
      transport_type: hasZips ? transportType : null,
    });
    if (res.ok) {
      setSmsState("sent");
    } else {
      setSmsState("error");
      setSmsError("Couldn't reach our system. Please call us instead at " + BROKER.phone);
    }
  };

  const handleCallClick = () => {
    track("call_click", routeKey, { action: "tel_link", source: "primary_cta" });
    // Native tel: link does the rest.
  };

  return (
    <>
      {/* Primary CTAs — visible immediately above the fold */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <a href="#estimate" style={btnPrimary} onClick={() => track("redirect_to_calculator", routeKey, { action: "hero_cta" })}>
          Get an Estimate ↓
        </a>
        <a
          href={`tel:${BROKER.phone_e164}`}
          onClick={handleCallClick}
          style={btnGhost}
        >
          Call {BROKER.phone}
        </a>
      </div>

      {/* ZIP form */}
      <form id="estimate" onSubmit={handleEstimate} style={{
        marginTop: 28, padding: "24px 26px",
        border: "1.5px solid var(--ink)", background: "var(--paper)",
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono'", fontSize: 10,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--muted)", marginBottom: 14,
        }}>
          Indicative estimate · {route.origin.state} → {route.destination.state}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <label>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
              Pickup ZIP ({route.origin.state})
            </div>
            <input
              style={inputStyle}
              value={form.pickup_zip}
              onChange={(e) => set("pickup_zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="06716"
              inputMode="numeric"
              maxLength={5}
            />
          </label>
          <label>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
              Delivery ZIP ({route.destination.state})
            </div>
            <input
              style={inputStyle}
              value={form.delivery_zip}
              onChange={(e) => set("delivery_zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="33139"
              inputMode="numeric"
              maxLength={5}
            />
          </label>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
          {[
            ["open", "Open transport · most common"],
            ["enclosed", "Enclosed · premium"],
          ].map(([v, label]) => (
            <button
              type="button"
              key={v}
              onClick={() => setTransportType(v)}
              style={{
                flex: 1, padding: "10px 12px",
                background: transportType === v ? "var(--ink)" : "transparent",
                color: transportType === v ? "var(--paper)" : "var(--ink)",
                border: "1.5px solid var(--ink)", cursor: "pointer",
                fontFamily: "'Inter Tight'", fontSize: 13.5, fontWeight: 500, textAlign: "left",
              }}
            >
              {transportType === v ? "● " : "○ "}{label}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <button type="submit" style={btnPrimary} disabled={estimateState === "loading"}>
            {estimateState === "loading" ? "Calculating…" : "Get Indicative Estimate →"}
          </button>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10.5, color: "var(--muted)", letterSpacing: "0.1em" }}>
            No spam · No account required
          </span>
        </div>

        {estimateState === "error" && (
          <p style={{ marginTop: 12, padding: "10px 14px", background: "var(--red-tint)", border: "1.5px solid var(--red)", fontFamily: "'Inter Tight'", fontSize: 14 }}>
            Both ZIPs are required and must be 5 digits.
          </p>
        )}

        {estimateState === "done" && estimate && (
          <div style={{ marginTop: 18, padding: "20px 22px", background: "var(--paper-deep)", border: "1.5px solid var(--ink)" }}>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--muted)" }}>
              Indicative Estimate
            </div>
            <div style={{ fontFamily: "'Instrument Serif'", fontSize: 44, lineHeight: 1.05, marginTop: 8 }}>
              ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
            </div>
            <div style={{ marginTop: 8, fontFamily: "'Inter Tight'", fontSize: 14.5, color: "var(--ink)" }}>
              Typical transit: <strong>{estimate.transit_days_low}–{estimate.transit_days_high} days</strong> from pickup.
            </div>
            <p style={{ marginTop: 14, fontFamily: "'Inter Tight'", fontSize: 13, lineHeight: 1.5, color: "var(--muted)" }}>
              This is an <strong>indicative estimate</strong>, not a binding quote. Final pricing depends on carrier availability, vehicle details, route, and pickup timing. {estimate.source === "route_baseline" ? "Estimate from typical pricing for this route — we'll confirm a real bid once you reach out." : null}
            </p>
            <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href={`tel:${BROKER.phone_e164}`} onClick={handleCallClick} style={btnPrimary}>
                Call to Confirm · {BROKER.phone}
              </a>
              <a href="#sms" style={btnGhost}>Text me my exact quote →</a>
            </div>
          </div>
        )}
      </form>

      {/* SMS capture — TCPA consent inline */}
      <form id="sms" onSubmit={handleSms} style={{
        marginTop: 28, padding: "24px 26px",
        border: "1.5px solid var(--ink)", background: "var(--paper)",
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono'", fontSize: 10,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "var(--muted)", marginBottom: 14,
        }}>
          Text me my exact quote
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr auto", gap: 12, alignItems: "end" }}>
          <label>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 6 }}>
              Phone Number
            </div>
            <input
              style={inputStyle}
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(555) 555-5555"
              autoComplete="tel"
            />
          </label>
          <button type="submit" style={btnPrimary} disabled={smsState === "sent"}>
            {smsState === "sent" ? "Sent ✓" : "Send Quote →"}
          </button>
        </div>
        <p style={{
          marginTop: 14, fontFamily: "'Inter Tight'", fontSize: 12,
          lineHeight: 1.5, color: "var(--muted)",
        }}>
          {TCPA_CONSENT}
        </p>
        {smsState === "sent" && (
          <p style={{ marginTop: 10, padding: "10px 14px", background: "var(--paper-deep)", border: "1px dashed var(--ink)", fontFamily: "'Inter Tight'", fontSize: 14 }}>
            Got it. A transport specialist will text you with an exact quote shortly.
          </p>
        )}
        {smsError && (
          <p style={{ marginTop: 10, padding: "10px 14px", background: "var(--red-tint)", border: "1.5px solid var(--red)", fontFamily: "'Inter Tight'", fontSize: 14 }}>
            {smsError}
          </p>
        )}
      </form>
    </>
  );
}
