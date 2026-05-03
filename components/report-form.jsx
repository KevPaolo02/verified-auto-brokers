"use client";

// Report-a-Broker form. Submits to POST /api/reports → internal_flags table.
// A submission lands at severity='medium' which doesn't auto-flag the broker —
// admin reviews and promotes to 'high' if confirmed. Prevents single-user spite
// reports from poisoning a broker's profile.

import React, { useState } from "react";

const inputStyle = {
  width: "100%", border: "1.5px solid var(--ink)", padding: "11px 14px",
  fontFamily: "'Inter Tight'", fontSize: 15, background: "var(--paper)",
  outline: "none", letterSpacing: "-0.01em",
};
const labelStyle = {
  fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em",
  textTransform: "uppercase", color: "var(--muted)", marginBottom: 6, display: "block",
};
const btnPrimary = {
  background: "var(--ink)", color: "var(--paper)", border: "none",
  padding: "12px 22px", fontFamily: "'Inter Tight'", fontSize: 14,
  fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em",
};

const CATEGORIES = [
  ["bait_and_switch", "Bait-and-switch pricing", "Quoted price didn't match what I was charged."],
  ["deposit_taken",   "Deposit taken, no service", "Paid a deposit, broker disappeared / no carrier ever assigned."],
  ["double_brokered", "Double-brokering / phantom carrier", "A different carrier showed up than what was on the dispatch sheet."],
  ["hostage_vehicle", "Hostage vehicle at delivery", "Driver demanded extra payment to release my car."],
  ["fake_mc",         "Fake MC / identity spoofing", "The company quoting me wasn't actually who they claimed to be."],
  ["other",           "Other", "Something else worth flagging."],
];

const Field = ({ label, children, hint, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}{required && <span style={{ color: "var(--red)", marginLeft: 4 }}>*</span>}</label>
    {children}
    {hint && (
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4, fontFamily: "'Inter Tight'" }}>
        {hint}
      </div>
    )}
  </div>
);

export default function ReportForm({ initialMc = null }) {
  const [form, setForm] = useState({
    mc: initialMc || "",
    category: "",
    reason: "",
    reporter_name: "",
    reporter_email: "",
  });
  const [submit, setSubmit] = useState({ status: "idle", error: null, message: null });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const doSubmit = async (e) => {
    e?.preventDefault?.();
    setSubmit({ status: "loading", error: null, message: null });
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mc: form.mc,
          category: form.category || "Other",
          reason: form.reason,
          reporter_name: form.reporter_name || null,
          reporter_email: form.reporter_email,
        }),
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

  if (submit.status === "done") {
    return (
      <div style={{
        padding: "32px 30px", border: "1.5px solid var(--ink)",
        background: "var(--paper-deep)",
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "var(--muted)",
        }}>RECEIPT · {new Date().toISOString().slice(0, 10)}</div>
        <h2 style={{
          fontFamily: "'Instrument Serif'", fontSize: 36, lineHeight: 1.05,
          margin: "8px 0 12px", fontWeight: 400,
        }}>
          Report received.
        </h2>
        <p style={{ fontFamily: "'Inter Tight'", fontSize: 15, lineHeight: 1.5, color: "var(--ink)", margin: 0 }}>
          {submit.message ?? "We review every submission and may follow up by email."}
        </p>
        <div style={{
          marginTop: 20, padding: "12px 14px",
          background: "var(--paper)", border: "1px dashed var(--ink)",
          fontFamily: "'Inter Tight'", fontSize: 13.5, lineHeight: 1.55,
          color: "var(--ink)",
        }}>
          <strong>Heads up:</strong> if this is fraud or a serious safety issue, also file directly with the FMCSA National Consumer Complaint Database — <a href="tel:18883687238" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>1-888-DOT-SAFT</a> or <a href="https://nccdb.fmcsa.dot.gov/nccdb/home.aspx" target="_blank" rel="noopener noreferrer" style={{color:"var(--navy)", textDecoration:"none", borderBottom:"1px dotted var(--navy)"}}>nccdb.fmcsa.dot.gov</a>. They have enforcement authority; we don&apos;t.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={doSubmit} style={{
      padding: "28px 30px", border: "1.5px solid var(--ink)",
      background: "var(--paper)",
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em",
        textTransform: "uppercase", color: "var(--muted)", marginBottom: 18,
      }}>
        File a Broker Report
      </div>

      <Field
        label="Broker MC Number"
        required
        hint="Just the digits, with or without 'MC-'. Required so we can route the report to the right broker file."
      >
        <input
          style={inputStyle}
          value={form.mc}
          onChange={(e) => set("mc", e.target.value)}
          placeholder="e.g. 1675078"
          required
        />
      </Field>

      <Field label="What happened?" required hint="Pick the closest category. Use 'Other' if nothing fits.">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {CATEGORIES.map(([value, label, sub]) => (
            <label key={value} style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "10px 12px",
              border: `1.5px solid ${form.category === value ? "var(--ink)" : "var(--rule)"}`,
              background: form.category === value ? "var(--paper-deep)" : "var(--paper)",
              cursor: "pointer",
            }}>
              <input
                type="radio"
                name="category"
                value={value}
                checked={form.category === value}
                onChange={(e) => set("category", e.target.value)}
                style={{ marginTop: 4 }}
              />
              <div>
                <div style={{ fontFamily: "'Inter Tight'", fontSize: 14.5, fontWeight: 600 }}>{label}</div>
                <div style={{ fontFamily: "'Inter Tight'", fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{sub}</div>
              </div>
            </label>
          ))}
        </div>
      </Field>

      <Field
        label="Tell us what happened"
        required
        hint={`At least 20 characters. Include dates, dollar amounts, names you were given, and any documentation you have. The more specific, the faster we can act on it.`}
      >
        <textarea
          style={{ ...inputStyle, fontSize: 14.5, resize: "vertical", minHeight: 140 }}
          value={form.reason}
          onChange={(e) => set("reason", e.target.value)}
          placeholder="On 03/15/2026 I booked MC-XXXXXX for $1,100 from CT to FL. The driver showed up demanding $1,500 cash. I have screenshots of the original quote and the dispatch sheet."
          required
        />
        <div style={{
          fontFamily: "'JetBrains Mono'", fontSize: 10, color: form.reason.length >= 20 ? "var(--muted)" : "var(--red)",
          letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4,
        }}>
          {form.reason.length} chars · {form.reason.length >= 20 ? "ok" : `need ${20 - form.reason.length} more`}
        </div>
      </Field>

      <div style={{
        marginTop: 16, padding: "16px 18px",
        background: "var(--paper-deep)", border: "1px solid var(--rule)",
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "var(--muted)", marginBottom: 12,
        }}>Your contact</div>

        <Field label="Your name" hint="Optional — helps us follow up.">
          <input style={inputStyle} value={form.reporter_name} onChange={(e) => set("reporter_name", e.target.value)} placeholder="Jane Doe" />
        </Field>

        <Field label="Your email" required hint="We may follow up to verify details. Not displayed publicly. Not shared.">
          <input
            style={inputStyle}
            type="email"
            value={form.reporter_email}
            onChange={(e) => set("reporter_email", e.target.value)}
            placeholder="you@example.com"
            required
          />
        </Field>
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

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 22, marginTop: 22, borderTop: "1px solid var(--rule)", flexWrap: "wrap", gap: 12,
      }}>
        <p style={{
          fontFamily: "'JetBrains Mono'", fontSize: 10, color: "var(--muted)",
          letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 1.5, margin: 0,
        }}>
          We don&apos;t auto-flag brokers. Reports go to manual review.
        </p>
        <button
          type="submit"
          style={btnPrimary}
          disabled={submit.status === "loading" || !form.mc || !form.reporter_email || form.reason.length < 20}
        >
          {submit.status === "loading" ? "Submitting…" : "Submit Report →"}
        </button>
      </div>
    </form>
  );
}
