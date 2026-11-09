// One-time import of data/contacts.json into the Postgres database.
// Usage: node --env-file=.env.local scripts/import-json.mjs
// Safe to re-run: contacts already imported (same id) are skipped.
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (put it in .env.local).");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

const contacts = JSON.parse(await readFile("data/contacts.json", "utf8"));

await sql`
  CREATE TABLE IF NOT EXISTS contacts (
    id         TEXT PRIMARY KEY,
    type       TEXT NOT NULL DEFAULT 'individual',
    company    TEXT NOT NULL DEFAULT '',
    name       TEXT NOT NULL,
    email      TEXT NOT NULL DEFAULT '',
    phone      TEXT NOT NULL DEFAULT '',
    remarks    TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;

let added = 0;
for (const c of contacts) {
  const rows = await sql`
    INSERT INTO contacts (id, type, company, name, email, phone, remarks, created_at)
    VALUES (${c.id}, ${c.type ?? "individual"}, ${c.company ?? ""}, ${c.name},
            ${c.email ?? ""}, ${c.phone ?? ""}, ${c.remarks ?? ""}, ${c.createdAt})
    ON CONFLICT (id) DO NOTHING
    RETURNING id`;
  added += rows.length;
}
console.log(`Imported ${added} of ${contacts.length} contacts (${contacts.length - added} already there).`);
