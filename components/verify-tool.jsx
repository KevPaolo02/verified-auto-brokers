"use client";

// VerifyTool — the input + result handler for /verify-auto-transport-broker.
//
// Behavior:
//   - User types EITHER a numeric MC# OR a company name
//   - Numeric input → router.push to /brokers/MC-XXX (canonical-slug 308 will catch)
//   - Text input    → live search via /api/brokers/search → show top 5 inline
//   - User clicks a result → router.push to its canonical-slug broker page
//
// SEO note: this is a tiny client component nested inside a server-rendered page.
// All the SEO-ranking copy is in the parent server component; this only handles
// the live interaction.

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BrokerService } from "./data";

const inputStyle = {
  width: "100%", border: "1.5px solid var(--ink)",
  background: "var(--paper)", color: "var(--ink)",
  padding: "20px 22px",
  fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 500,
  letterSpacing: "-0.01em", outline: "none",
};
const btnPrimary = {
  background: "var(--ink)", color: "var(--paper)", border: "none",
  padding: "20px 32px",
  fontFamily: "'Inter Tight', sans-serif", fontSize: 16, fontWeight: 600,
  letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer",
};

export default function VerifyTool() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState(null);
  const inputRef = useRef(null);

  // Debounced live search when user types text (not pure digits).
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed || /^\d+$/.test(trimmed)) {
      setResults([]); setSearching(false); return;
    }
    let cancelled = false;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await BrokerService.searchBrokers({ q: trimmed, page: 1, pageSize: 5 });
        if (!cancelled) setResults(res.rows || []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  const onSubmit = (e) => {
    e?.preventDefault?.();
    setErr(null);
    const trimmed = q.trim();
    if (!trimmed) {
      setErr("Enter an MC number or company name.");
      inputRef.current?.focus();
      return;
    }
    // Pure digits → treat as MC#. The /brokers route will 308 to the canonical slug.
    const digits = trimmed.replace(/[^\d]/g, "");
    const looksLikeMc = /^mc[-\s]?\d+$/i.test(trimmed) || /^\d+$/.test(trimmed);
    if (looksLikeMc && digits.length >= 4 && digits.length <= 8) {
      router.push(`/brokers/MC-${digits}`);
      return;
    }
    // Otherwise the live results below should handle it; if user just hits Enter
    // with an unmatched name, surface a soft error.
    if (results.length > 0) {
      // Click the first result.
      const first = results[0];
      router.push(`/brokers/MC-${first.mc}`);
      return;
    }
    setErr("No matches found. Check the spelling or try the MC number directly.");
  };

  return (
    <form onSubmit={onSubmit} style={{ position: "relative" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto", gap: 0,
        boxShadow: "8px 8px 0 var(--ink)",
      }}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setErr(null); }}
          placeholder="Enter MC number or company name (e.g. MC-1675078 or 'Montway')"
          aria-label="Broker MC number or company name"
          style={inputStyle}
          autoComplete="off"
        />
        <button type="submit" style={btnPrimary}>
          Check Broker →
        </button>
      </div>

      {err && (
        <div style={{
          marginTop: 10, padding: "10px 14px",
          background: "var(--red-tint)", border: "1.5px solid var(--red)",
          fontFamily: "'Inter Tight'", fontSize: 14, color: "var(--ink)",
        }}>{err}</div>
      )}

      {searching && (
        <div style={{
          marginTop: 12, fontFamily: "'JetBrains Mono'",
          fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--muted)",
        }}>Searching FMCSA registry…</div>
      )}

      {!searching && results.length > 0 && (
        <div style={{
          marginTop: 12,
          border: "1.5px solid var(--ink)",
          background: "var(--paper)",
          boxShadow: "6px 6px 0 var(--ink)",
        }}>
          <div style={{
            padding: "8px 16px",
            background: "var(--paper-deep)",
            borderBottom: "1px solid var(--rule)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9.5,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "var(--muted)",
            display: "flex", justifyContent: "space-between",
          }}>
            <span>{results.length} match{results.length === 1 ? "" : "es"}</span>
            <span>FMCSA Public Record</span>
          </div>
          {results.map((r) => {
            const flagged = r.broker_stat !== "A";
            return (
              <button
                key={r.mc}
                type="button"
                onClick={() => router.push(`/brokers/MC-${r.mc}`)}
                style={{
                  display: "grid", gridTemplateColumns: "auto 1fr auto",
                  gap: 14, alignItems: "center",
                  width: "100%", textAlign: "left",
                  padding: "14px 18px",
                  borderTop: "1px solid var(--rule)", borderBottom: "none",
                  borderLeft: "none", borderRight: "none",
                  background: "var(--paper)", cursor: "pointer",
                  fontFamily: "'Inter Tight', sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-deep)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--paper)")}
              >
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12, color: "var(--muted)", width: 100,
                }}>MC-{r.mc}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{r.legal_name || r.dba_name || "—"}</div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                    color: "var(--muted)", letterSpacing: "0.1em",
                    marginTop: 2, textTransform: "uppercase",
                  }}>
                    {[r.city, r.state].filter(Boolean).join(", ") || "—"}
                    {r.bond_on_file === "Y" ? " · BOND" : " · NO BOND"}
                    {r.claim_status === "verified" ? " · ◆ CLAIMED" : ""}
                  </div>
                </div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                  color: flagged ? "var(--red)" : "var(--navy)", fontWeight: 600,
                  padding: "5px 9px", border: `1.5px solid ${flagged ? "var(--red)" : "var(--navy)"}`,
                }}>{flagged ? "FLAGGED" : "FMCSA"}</span>
              </button>
            );
          })}
        </div>
      )}
    </form>
  );
}
