"use client";

// Public claim form. Walks a broker through:
//   1. Enter MC# → look up the broker via /api/fmcsa/lookup
//   2. Confirm "is this you" — show the live FMCSA record so they know who they're claiming
//   3. Fill in contact + bio + specialties + self-reported numbers
//   4. Submit → POST /api/claims (status='pending', awaits admin review)

import React, { useState } from "react";
import { UI } from "./ui-primitives";

const btnPrimary = {
  background: "var(--ink)", color: "var(--paper)", border: "none",
  padding: "12px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
  fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em"
};
const btnGhost = {
  background: "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)",
  padding: "12px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
  fontWeight: 600, cursor: "pointer"
};
const inputStyle = {
  width: "100%", border: "1.5px solid var(--ink)", padding: "11px 14px",
  fontFamily: "'Inter Tight'", fontSize: 15, background: "var(--paper)",
  outline: "none", letterSpacing: "-0.01em",
};
const labelStyle = {
  fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em",
  textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, display: "block",
};

const Field = ({ label, children, hint }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}</label>
    {children}
    {hint && (
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, fontFamily: "'Inter Tight'" }}>
        {hint}
      </div>
    )}
  </div>
);

export default function ClaimForm({ initialMc }) {
  const [step, setStep] = useState(initialMc ? 2 : 1);
  const [mcInput, setMcInput] = useState(initialMc ?? "");
  const [lookup, setLookup] = useState({ status: "idle", data: null, claim: null, error: null });
  const [form, setForm] = useState({
    submitted_email: "",
    claimed_by: "",
    display_phone: "",
    display_email: "",
    display_website: "",
    bio: "",
    specialties: "",
    carrier_network_size: "",
    years_in_business: "",
  });
  const [submit, setSubmit] = useState({ status: "idle", error: null, message: null });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const doLookup = async (rawMc) => {
    const mc = rawMc.replace(/^MC-?/i, "").trim();
    if (!mc || !/^\d+$/.test(mc)) {
      setLookup({ status: "error", data: null, claim: null, error: "Enter a valid MC number (digits)." });
      return;
    }
    setLookup({ status: "loading", data: null, claim: null, error: null });
    try {
      const res = await fetch(`/api/fmcsa/lookup?mc=${mc}`, { cache: "no-store" });
      const j = await res.json();
      if (!res.ok || j.error) {
        setLookup({ status: "error", data: null, claim: null, error: j.error || `Lookup failed (${res.status})` });
        return;
      }
      setLookup({ status: "ok", data: j.data, claim: j.claim, error: null });
      setStep(2);
    } catch (err) {
      setLookup({ status: "error", data: null, claim: null, error: String(err.message ?? err) });
    }
  };

  const doSubmit = async () => {
    setSubmit({ status: "loading", error: null, message: null });
    const payload = {
      mc: mcInput,
      submitted_email: form.submitted_email,
      claimed_by: form.claimed_by || form.submitted_email,
      display_phone: form.display_phone || null,
      display_email: form.display_email || null,
      display_website: form.display_website || null,
      bio: form.bio || null,
      specialties: form.specialties
        ? form.specialties.split(",").map((s) => s.trim()).filter(Boolean)
        : null,
      carrier_network_size: form.carrier_network_size || null,
      years_in_business: form.years_in_business || null,
    };
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) {
        setSubmit({ status: "error", error: j.error || `Failed (${res.status})`, message: null });
        return;
      }
      setSubmit({ status: "done", error: null, message: j.message });
    } catch (err) {
      setSubmit({ status: "error", error: String(err.message ?? err), message: null });
    }
  };

  return (
    <section style={{ background: "var(--paper)", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <UI.Eyebrow>§ Claim Your Listing</UI.Eyebrow>
        <h1 style={{
          fontFamily: "'Instrument Serif'", fontSize: "clamp(40px, 5.5vw, 64px)",
          lineHeight: 1, margin: "12px 0 18px", letterSpacing: "-0.02em",
          color: "var(--ink)", fontWeight: 400,
        }}>
          Tell shippers who you are.
        </h1>
        <p style={{
          fontFamily: "'Inter Tight'", fontSize: 16, lineHeight: 1.55, color: "var(--ink)",
          marginBottom: 28,
        }}>
          Verified Auto Brokers already lists every FMCSA-licensed property broker in the U.S. (24,992 records).
          Claim your listing to add a bio, specialties, your direct contact info, and self-reported metrics.
          Claims are reviewed manually within 1–2 business days.
        </p>

        {/* ── Step 1: MC lookup ───────────────────────────────────────── */}
        {step === 1 && (
          <div style={{ border: "1.5px solid var(--ink)", padding: "28px 30px", background: "var(--paper)" }}>
            <UI.Eyebrow>Step 01 · Find Your Listing</UI.Eyebrow>
            <div style={{ marginTop: 18 }}>
              <Field label="MC Number" hint="Just the digits, with or without the 'MC-' prefix.">
                <input
                  style={inputStyle}
                  value={mcInput}
                  onChange={(e) => setMcInput(e.target.value)}
                  placeholder="e.g. MC-1675078 or 1675078"
                  onKeyDown={(e) => { if (e.key === "Enter") doLookup(mcInput); }}
                />
              </Field>
              {lookup.status === "error" && (
                <div style={{
                  padding: "10px 14px", marginBottom: 12,
                  background: "var(--red-tint)", border: "1.5px solid var(--red)",
                  fontFamily: "'Inter Tight'", fontSize: 14, color: "var(--ink)",
                }}>
                  {lookup.error}
                </div>
              )}
              <button onClick={() => doLookup(mcInput)} disabled={lookup.status === "loading"} style={btnPrimary}>
                {lookup.status === "loading" ? "Looking up…" : "Look Up Listing →"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Confirm broker ──────────────────────────────────── */}
        {step === 2 && lookup.data && (
          <div style={{ border: "1.5px solid var(--ink)", padding: "28px 30px", background: "var(--paper)" }}>
            <UI.Eyebrow>Step 02 · Confirm This Is You</UI.Eyebrow>
            <div style={{ marginTop: 18, padding: "20px 22px", background: "var(--paper-deep)", border: "1px solid var(--rule)" }}>
              <div style={{ fontFamily: "'Instrument Serif'", fontSize: 28, lineHeight: 1.1 }}>
                {lookup.data.name}
              </div>
              <UI.Mono style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginTop: 6 }}>
                {lookup.data.mc} · DOT-{lookup.data.dot} · {lookup.data.city}, {lookup.data.state}
              </UI.Mono>
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {lookup.data.auth_status === "ACTIVE"
                  ? <UI.Stamp tone="verified" small>FMCSA AUTH ACTIVE</UI.Stamp>
                  : <UI.Stamp tone="flagged" small>AUTH {lookup.data.auth_status}</UI.Stamp>}
                {lookup.data.bond?.status === "ACTIVE" && (
                  <UI.Stamp tone="verified" small>BOND ACTIVE</UI.Stamp>
                )}
              </div>
            </div>

            {lookup.claim?.status === "verified" && (
              <div style={{
                marginTop: 16, padding: "12px 14px",
                background: "var(--red-tint)", border: "1.5px solid var(--red)",
                fontFamily: "'Inter Tight'", fontSize: 14,
              }}>
                This listing is already claimed and verified. To request ownership transfer, email{" "}
                <strong>support@verifiedautobrokers.com</strong> with proof of authority.
              </div>
            )}
            {lookup.claim?.status === "pending" && (
              <div style={{
                marginTop: 16, padding: "12px 14px",
                background: "var(--paper-deep)", border: "1px dashed var(--ink)",
                fontFamily: "'Inter Tight'", fontSize: 14,
              }}>
                A claim submission is already pending review. Submitting again will replace it.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button onClick={() => { setStep(1); setLookup({ status: "idle", data: null, claim: null, error: null }); }} style={btnGhost}>
                ← Wrong listing
              </button>
              {lookup.claim?.status !== "verified" && (
                <button onClick={() => setStep(3)} style={btnPrimary}>
                  Yes, this is my company →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Details ─────────────────────────────────────────── */}
        {step === 3 && (
          <div style={{ border: "1.5px solid var(--ink)", padding: "28px 30px", background: "var(--paper)" }}>
            <UI.Eyebrow>Step 03 · Your Listing Details</UI.Eyebrow>
            <p style={{ fontFamily: "'Inter Tight'", fontSize: 13.5, color: "var(--muted)", marginTop: 8, marginBottom: 20 }}>
              Self-reported numbers are displayed with a "(self-reported)" footnote. Required fields are marked.
            </p>

            <Field label="Your Email *" hint="Used to confirm your claim. Not displayed publicly.">
              <input style={inputStyle} type="email" value={form.submitted_email}
                onChange={(e) => set("submitted_email", e.target.value)}
                placeholder="you@yourcompany.com" />
            </Field>

            <Field label="Your Name (optional)" hint="If different from your email.">
              <input style={inputStyle} value={form.claimed_by} onChange={(e) => set("claimed_by", e.target.value)} placeholder="Jane Doe" />
            </Field>

            <div style={{ marginTop: 12, padding: "16px 18px", background: "var(--paper-deep)", border: "1px solid var(--rule)" }}>
              <UI.Mono style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
                Public contact (shown on profile)
              </UI.Mono>
              <div style={{ marginTop: 12 }}>
                <Field label="Display Phone">
                  <input style={inputStyle} value={form.display_phone} onChange={(e) => set("display_phone", e.target.value)} placeholder="(555) 555-5555" />
                </Field>
                <Field label="Display Email">
                  <input style={inputStyle} type="email" value={form.display_email} onChange={(e) => set("display_email", e.target.value)} placeholder="info@yourcompany.com" />
                </Field>
                <Field label="Website">
                  <input style={inputStyle} value={form.display_website} onChange={(e) => set("display_website", e.target.value)} placeholder="https://yourcompany.com" />
                </Field>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: "16px 18px", background: "var(--paper-deep)", border: "1px solid var(--rule)" }}>
              <UI.Mono style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
                Profile content
              </UI.Mono>
              <div style={{ marginTop: 12 }}>
                <Field label="Bio" hint="1–3 sentences. What lanes do you serve, what's your specialty?">
                  <textarea
                    style={{ ...inputStyle, fontSize: 14.5, resize: "vertical" }}
                    rows={4}
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Connecticut-based broker focused on Northeast and Florida snowbird routes…"
                  />
                </Field>
                <Field label="Specialties" hint="Comma-separated. Up to 10. e.g. Open Transport, Enclosed, Door-to-Door">
                  <input style={inputStyle} value={form.specialties} onChange={(e) => set("specialties", e.target.value)} placeholder="Open Transport, Enclosed, Dealer Auctions" />
                </Field>
              </div>
            </div>

            <div style={{ marginTop: 12, padding: "16px 18px", background: "var(--paper-deep)", border: "1px solid var(--rule)" }}>
              <UI.Mono style={{ fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
                Self-reported metrics
              </UI.Mono>
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="Carriers Worked With">
                  <input style={inputStyle} type="number" min="0" value={form.carrier_network_size} onChange={(e) => set("carrier_network_size", e.target.value)} placeholder="e.g. 200" />
                </Field>
                <Field label="Years In Business">
                  <input style={inputStyle} type="number" min="0" max="200" value={form.years_in_business} onChange={(e) => set("years_in_business", e.target.value)} placeholder="e.g. 5" />
                </Field>
              </div>
            </div>

            {submit.status === "error" && (
              <div style={{
                marginTop: 14, padding: "10px 14px",
                background: "var(--red-tint)", border: "1.5px solid var(--red)",
                fontFamily: "'Inter Tight'", fontSize: 14, color: "var(--ink)",
              }}>
                {submit.error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 22, paddingTop: 22, borderTop: "1px solid var(--rule)" }}>
              <button onClick={() => setStep(2)} style={btnGhost}>← Back</button>
              <button onClick={doSubmit} disabled={!form.submitted_email || submit.status === "loading"} style={btnPrimary}>
                {submit.status === "loading" ? "Submitting…" : "Submit Claim →"}
              </button>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 10.5, color: "var(--muted)", letterSpacing: "0.1em", marginTop: 14, lineHeight: 1.5 }}>
              By submitting, you confirm you are authorized to represent this broker. False claims are removed and may be reported to FMCSA.
            </p>
          </div>
        )}

        {/* ── Step 4: Confirmation ────────────────────────────────────── */}
        {submit.status === "done" && (
          <div style={{
            marginTop: 18, border: "1.5px solid var(--ink)", padding: "28px 30px",
            background: "var(--paper-deep)",
          }}>
            <UI.Eyebrow>RECEIPT · {new Date().toISOString().slice(0, 10)}</UI.Eyebrow>
            <h2 style={{ fontFamily: "'Instrument Serif'", fontSize: 36, lineHeight: 1.05, margin: "8px 0", fontWeight: 400 }}>
              Claim received.
            </h2>
            <p style={{ fontFamily: "'Inter Tight'", fontSize: 15, lineHeight: 1.5, color: "var(--ink)" }}>
              {submit.message ?? "We'll review your submission and email you within 1–2 business days."}
            </p>
            <UI.Mono style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase", display: "block", marginTop: 14 }}>
              Status · PENDING ADMIN REVIEW
            </UI.Mono>
          </div>
        )}
      </div>
    </section>
  );
}
