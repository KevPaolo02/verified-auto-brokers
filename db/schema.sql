-- FMCSA lookup cache. One row per fetch; query by (mc OR dot, source) ORDER BY last_checked DESC LIMIT 1.
-- Storing every fetch (not upserting) gives us an audit trail; cleanup can happen later.
CREATE TABLE IF NOT EXISTS fmcsa_cache (
  id          BIGSERIAL PRIMARY KEY,
  mc          TEXT,
  dot         TEXT,
  source      TEXT NOT NULL,                       -- 'QCMOBILE' | 'L_AND_I'
  parsed_json JSONB NOT NULL,
  raw_html    TEXT,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fmcsa_cache_mc          ON fmcsa_cache(mc);
CREATE INDEX IF NOT EXISTS idx_fmcsa_cache_dot         ON fmcsa_cache(dot);
CREATE INDEX IF NOT EXISTS idx_fmcsa_cache_last_checked ON fmcsa_cache(last_checked DESC);

-- Bulk registry of all licensed brokers, refreshed periodically from FMCSA Socrata.
-- The single-broker /api/fmcsa/lookup is still the source of truth for a profile view;
-- this table is the haystack for the directory + search.
--
-- MC and DOT stored as bare digits (no "MC-" prefix, no zero padding) to match the
-- canonical format used by the cache and lookup API.
CREATE TABLE IF NOT EXISTS brokers (
  mc            TEXT PRIMARY KEY,
  dot           TEXT,
  legal_name    TEXT,
  dba_name      TEXT,
  address       TEXT,
  city          TEXT,
  state         TEXT,
  zip           TEXT,
  phone         TEXT,
  -- Authority codes (single-letter): A=Active, I=Inactive, N=None, S=Suspended, R=Revoked
  broker_stat   TEXT,
  common_stat   TEXT,
  contract_stat TEXT,
  -- Bond / insurance flags from the bulk dataset (provider name + actual amount
  -- live in QCMobile/Socrata per-broker — fetched on profile click, not stored here).
  bond_required TEXT,                              -- 'Y'/'N'
  bond_on_file  TEXT,                              -- 'Y'/'N'
  bipd_on_file  TEXT,                              -- amount in thousands when on file
  cargo_on_file TEXT,
  -- Provenance
  mcs150_date   DATE,                              -- last MCS-150 update from carrier
  imported_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_brokers_dot         ON brokers(dot);
CREATE INDEX IF NOT EXISTS idx_brokers_state       ON brokers(state);
CREATE INDEX IF NOT EXISTS idx_brokers_broker_stat ON brokers(broker_stat);
-- Lower-cased name index supports case-insensitive search without scanning.
CREATE INDEX IF NOT EXISTS idx_brokers_legal_name_lower ON brokers(LOWER(legal_name));
CREATE INDEX IF NOT EXISTS idx_brokers_dba_name_lower   ON brokers(LOWER(dba_name));

-- Internal flags. Independent from FMCSA data — these are *our* warnings,
-- shown in a separate UI section so users can tell what's a public-record fact
-- vs. an opinion we attached.
CREATE TABLE IF NOT EXISTS internal_flags (
  id         BIGSERIAL PRIMARY KEY,
  mc         TEXT,
  dot        TEXT,
  reason     TEXT NOT NULL,
  severity   TEXT NOT NULL CHECK (severity IN ('low','medium','high')),
  source     TEXT NOT NULL,                          -- 'manual' | 'automated' | etc.
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internal_flags_mc  ON internal_flags(mc);
CREATE INDEX IF NOT EXISTS idx_internal_flags_dot ON internal_flags(dot);

-- Broker-supplied claim data. Separate from the `brokers` table so the weekly
-- FMCSA refresh doesn't blow it away. One claim per MC.
--
-- affiliation:
--   'self'     — the broker themselves claimed and verified ownership
--   'operator' — Verified Auto Brokers (the registry operator) is the broker.
--                Surfaces a disclosure stamp in the UI per FTC 16 CFR Part 255.
CREATE TABLE IF NOT EXISTS broker_claims (
  mc              TEXT PRIMARY KEY REFERENCES brokers(mc) ON DELETE CASCADE,
  status          TEXT NOT NULL CHECK (status IN ('pending','verified','rejected')),
  affiliation     TEXT NOT NULL CHECK (affiliation IN ('self','operator')),
  claimed_by      TEXT,
  display_phone   TEXT,
  display_email   TEXT,
  display_website TEXT,
  bio             TEXT,
  specialties     TEXT[],
  -- Self-reported metrics. Always rendered with a "(self-reported)" footnote so
  -- users can tell these aren't from FMCSA or independent verification.
  carrier_network_size INT,                       -- e.g. "200 carriers" GMF has dispatched to
  years_in_business    INT,                       -- e.g. "4" — caller-supplied
  -- Submission metadata (from the public /claim form). Untrusted until admin verifies.
  submitted_email      TEXT,
  submitted_ip         TEXT,
  admin_notes          TEXT,
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_broker_claims_status      ON broker_claims(status);
CREATE INDEX IF NOT EXISTS idx_broker_claims_affiliation ON broker_claims(affiliation);
