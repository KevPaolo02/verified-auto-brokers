// Normalize raw FMCSA + internal-flags data into the broker shape used by the UI.
//
// Sources:
//   - QCMobile carrier record: authority status, name, address, bond AMOUNT,
//     liability AMOUNT (all amounts in thousands of dollars).
//   - Socrata active filings: bond + insurance PROVIDER names, policy numbers,
//     effective dates, cargo coverage.
//   - internal_flags: rows from our own internal_flags table.
//
// Verification rules per spec:
//   verified = auth ACTIVE/AUTHORIZED && bond ACTIVE && no high-severity internal flags
//   flagged  = auth not active/revoked || bond missing/lapsed || any internal flag

import { classifyFilings } from "./socrata";

// QCMobile uses single-letter codes for authority status:
//   A = Active, I = Inactive, N = Not Authorized / None, S = Suspended, R = Revoked
const ACTIVE_CODES = new Set(["A"]);

function authStatusFromCarrier(c) {
  // For brokers we care about brokerAuthorityStatus first, then fall back to common.
  // If a record has neither, report "UNKNOWN" rather than guessing.
  const broker = c.brokerAuthorityStatus;
  const common = c.commonAuthorityStatus;
  const contract = c.contractAuthorityStatus;

  // Pick the "best" status: any active wins; otherwise pick the first negative.
  for (const v of [broker, common, contract]) {
    if (ACTIVE_CODES.has(v)) return "ACTIVE";
  }
  for (const v of [broker, common, contract]) {
    if (v === "R") return "REVOKED";
    if (v === "S") return "SUSPENDED";
    if (v === "I") return "INACTIVE";
  }
  if ([broker, common, contract].every((v) => v === "N" || v == null)) return "NOT AUTHORIZED";
  return "UNKNOWN";
}

// QCMobile reports bondInsuranceOnFile as the bond amount in thousands of dollars
// ("75" = $75,000), or "0" if no bond is on file. bondInsuranceRequired is "Y"/"u"/null.
function bondFromCarrier(c, bondFiling) {
  const amountK = Number(c.bondInsuranceOnFile ?? 0);
  const amount = amountK > 0 ? amountK * 1000 : 0;
  const required = c.bondInsuranceRequired === "Y";

  let status;
  if (amountK > 0) status = "ACTIVE";
  else if (required) status = "LAPSED";
  else status = "UNKNOWN";

  return {
    provider: bondFiling?.name_company ?? null,
    amount: amount || null,
    status,
    policy_no: bondFiling?.policy_no ?? null,
    effective_date: bondFiling?.effective_date ?? null,
  };
}

function insuranceFromCarrier(c, bipdFiling, cargoFiling) {
  // bipdInsuranceOnFile: liability amount in thousands ("1000" = $1M), "0" if none.
  // bipdRequiredAmount:  required liability minimum in thousands.
  const liabilityKlb = Number(c.bipdInsuranceOnFile ?? 0);
  const liability = liabilityKlb > 0 ? liabilityKlb * 1000 : 0;

  // Cargo insurance amount isn't in QCMobile; pull from Socrata's max_cov_amount
  // (also in thousands when present, often "0" for brokers since cargo coverage
  // is on the carrier, not the broker).
  const cargoKlb = cargoFiling ? Number(cargoFiling.max_cov_amount ?? 0) : 0;
  const cargo = cargoKlb > 0 ? cargoKlb * 1000 : 0;

  // Provider: Socrata wins if present, otherwise null.
  const provider = bipdFiling?.name_company ?? cargoFiling?.name_company ?? null;

  return { provider, liability, cargo };
}

function applyVerificationRules({ authStatus, bondStatus, internalFlags }) {
  const flags = Array.isArray(internalFlags) ? internalFlags : [];
  const hasHighSeverityFlag = flags.some((f) => f.severity === "high");
  const hasAnyFlag = flags.length > 0;

  const authActive = authStatus === "ACTIVE" || authStatus === "AUTHORIZED";
  const bondActive = bondStatus === "ACTIVE";
  const authBad = ["INACTIVE", "REVOKED", "SUSPENDED", "NOT AUTHORIZED"].includes(authStatus);
  const bondBad = bondStatus === "LAPSED" || bondStatus === "MISSING";

  const verified = authActive && bondActive && !hasHighSeverityFlag;
  const flagged = authBad || bondBad || hasAnyFlag;

  const reasons = [];
  if (authBad) reasons.push(`Authority ${authStatus.toLowerCase()}`);
  if (bondBad) reasons.push(`Bond ${bondStatus.toLowerCase()}`);
  for (const f of flags) reasons.push(f.reason);

  return { verified, flagged, flag_reason: reasons.join(" · ") || null };
}

function formatMc(mc) {
  if (!mc) return null;
  const digits = String(mc).replace(/^MC-?/i, "").trim();
  return digits ? `MC-${digits}` : null;
}

function findMcInAuthority(authority) {
  for (const a of authority) {
    const docket = a?.docketNumber || a?.docket;
    if (docket) return formatMc(docket);
  }
  return null;
}

/**
 * @param {object} raw - { carrier, authority } from QCMobile.
 * @param {Array}  filings - active filings from Socrata (qh9u-swkp).
 * @param {Array}  internalFlags - rows from internal_flags for this broker.
 * @param {object} hint - { mc, dot } as supplied by the caller (used to fill blanks).
 */
export function normalizeFmcsaBroker(raw, filings = [], internalFlags = [], hint = {}) {
  const c = raw?.carrier;
  if (!c) return null;

  const { bond: bondFiling, bipd: bipdFiling, cargo: cargoFiling } = classifyFilings(filings);

  const authStatus = authStatusFromCarrier(c);
  const bond = bondFromCarrier(c, bondFiling);
  const insurance = insuranceFromCarrier(c, bipdFiling, cargoFiling);

  const dot = c.dotNumber ? String(c.dotNumber) : (hint.dot ?? null);
  const mc = formatMc(hint.mc) ?? findMcInAuthority(raw?.authority ?? []);

  const { verified, flagged, flag_reason } = applyVerificationRules({
    authStatus,
    bondStatus: bond.status,
    internalFlags,
  });

  const address = [c.phyStreet].filter(Boolean).join(", ");

  return {
    mc,
    dot,
    name: c.legalName ?? c.dbaName ?? null,
    dba: c.dbaName ?? null,
    city: c.phyCity ?? null,
    state: c.phyState ?? null,
    address,
    auth_status: authStatus,
    bond,
    insurance,
    verified,
    flagged,
    flag_reason,
    source: "FMCSA",
    last_checked: new Date().toISOString(),
  };
}
