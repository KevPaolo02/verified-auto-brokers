// Seed the first claimed broker — GMF Auto Transport LLC.
// Operator-affiliated (registry operator owns this broker), so the UI surfaces
// a disclosure stamp per FTC 16 CFR Part 255.

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const sql = neon(process.env.DATABASE_URL);

const claim = {
  mc: "1675078",
  status: "verified",
  affiliation: "operator",
  claimed_by: "kevin@gmfautotransport.com",
  display_phone: "(203) 312-1197",
  display_email: "info@gmfautotransport.com",
  display_website: "https://www.gmfautotransport.com/",
  bio:
    "Connecticut-based auto transport broker serving the Northeast and Sun Belt corridors. " +
    "Strongest lanes are NY/NJ/CT and seasonal snowbird routes to Florida and Texas. " +
    "We coordinate open and enclosed transport for all vehicle types through carriers " +
    "vetted against FMCSA active-authority and bond status.",
  specialties: ["Open Transport", "Enclosed", "Door-to-Door", "Northeast Lanes", "FL/TX Lanes"],
  carrier_network_size: 200,    // self-reported
  years_in_business: 2,         // started operating 2024
};

await sql`
  INSERT INTO broker_claims (
    mc, status, affiliation, claimed_by,
    display_phone, display_email, display_website, bio, specialties,
    carrier_network_size, years_in_business,
    verified_at
  ) VALUES (
    ${claim.mc}, ${claim.status}, ${claim.affiliation}, ${claim.claimed_by},
    ${claim.display_phone}, ${claim.display_email}, ${claim.display_website},
    ${claim.bio}, ${claim.specialties},
    ${claim.carrier_network_size}, ${claim.years_in_business},
    now()
  )
  ON CONFLICT (mc) DO UPDATE SET
    status               = EXCLUDED.status,
    affiliation          = EXCLUDED.affiliation,
    claimed_by           = EXCLUDED.claimed_by,
    display_phone        = EXCLUDED.display_phone,
    display_email        = EXCLUDED.display_email,
    display_website      = EXCLUDED.display_website,
    bio                  = EXCLUDED.bio,
    specialties          = EXCLUDED.specialties,
    carrier_network_size = EXCLUDED.carrier_network_size,
    years_in_business    = EXCLUDED.years_in_business,
    verified_at          = COALESCE(broker_claims.verified_at, EXCLUDED.verified_at),
    updated_at           = now()
`;

const [row] = await sql`SELECT * FROM broker_claims WHERE mc = ${claim.mc}`;
console.log("Seeded:", row);
