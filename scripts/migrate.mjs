// Apply db/schema.sql to the database in DATABASE_URL.
// Idempotent: every CREATE uses IF NOT EXISTS, so re-running is safe.

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Load .env.local manually — Node doesn't read it automatically.
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "..", ".env.local");
try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // .env.local may not exist in CI — fall through to process.env
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);
const schemaPath = resolve(__dirname, "..", "db", "schema.sql");
const schema = readFileSync(schemaPath, "utf8");

// neon() supports raw multi-statement SQL via .query() — use that for the migration.
// Statements split on ';' and run individually so a partial failure shows up cleanly.
// Strip line comments first so a CREATE preceded by a `--` block isn't treated as a comment.
const statements = schema
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
  .filter((s) => s.length > 0);

console.log(`Applying ${statements.length} statements to ${url.replace(/:[^:@]+@/, ":***@")}`);

for (const stmt of statements) {
  const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
  process.stdout.write(`  ${preview}${stmt.length > 80 ? "…" : ""} ... `);
  try {
    await sql.query(stmt);
    console.log("ok");
  } catch (err) {
    console.log("FAIL");
    console.error(err);
    process.exit(1);
  }
}

console.log("Migration complete.");
