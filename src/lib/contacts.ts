import "server-only";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

export type ContactType = "individual" | "company";

export type Contact = {
  id: string;
  type: ContactType;
  company: string;
  name: string;
  email: string;
  phone: string;
  remarks: string;
  createdAt: string;
};

type Row = {
  id: string;
  type: ContactType;
  company: string;
  name: string;
  email: string;
  phone: string;
  remarks: string;
  created_at: Date | string;
};

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

// Create the table on first use so a fresh database needs no manual setup.
let ready: Promise<unknown> | null = null;
function ensureTable() {
  ready ??= db()`
    CREATE TABLE IF NOT EXISTS contacts (
      id         TEXT PRIMARY KEY,
      type       TEXT NOT NULL DEFAULT 'individual',
      company    TEXT NOT NULL DEFAULT '',
      name       TEXT NOT NULL,
      email      TEXT NOT NULL DEFAULT '',
      phone      TEXT NOT NULL DEFAULT '',
      remarks    TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`.catch((err) => {
    ready = null; // retry on the next request
    throw err;
  });
  return ready;
}

function toContact(r: Row): Contact {
  return {
    id: r.id,
    type: r.type,
    company: r.company,
    name: r.name,
    email: r.email,
    phone: r.phone,
    remarks: r.remarks,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

/** All contacts, oldest first. */
export async function getContacts(): Promise<Contact[]> {
  await ensureTable();
  const rows = (await db()`SELECT * FROM contacts ORDER BY created_at ASC`) as Row[];
  return rows.map(toContact);
}

export async function addContact(
  input: Omit<Contact, "id" | "createdAt">,
  opts: { id?: string; createdAt?: string } = {},
): Promise<Contact> {
  await ensureTable();
  const id = opts.id ?? randomUUID();
  const createdAt = opts.createdAt ?? new Date().toISOString();
  const rows = (await db()`
    INSERT INTO contacts (id, type, company, name, email, phone, remarks, created_at)
    VALUES (${id}, ${input.type}, ${input.company}, ${input.name},
            ${input.email}, ${input.phone}, ${input.remarks}, ${createdAt})
    ON CONFLICT (id) DO NOTHING
    RETURNING *`) as Row[];
  return rows[0] ? toContact(rows[0]) : { id, createdAt, ...input };
}
