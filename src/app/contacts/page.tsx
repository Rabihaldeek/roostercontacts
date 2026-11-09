import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getContacts } from "@/lib/contacts";
import { isUnlocked } from "@/lib/pin-auth";
import { lock } from "./unlock/actions";

export const metadata = { title: "Event contacts · Rooster" };

const secondaryBtn =
  "rounded-lg border border-rooster bg-white px-4 py-2 text-sm font-medium text-rooster transition hover:bg-rooster-light";

export default function ContactsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <Suspense fallback={<p className="text-rooster-muted">Loading contacts...</p>}>
        <ContactsTable />
      </Suspense>
    </main>
  );
}

async function ContactsTable() {
  await connection(); // always read fresh data at request time
  if (!(await isUnlocked())) redirect("/contacts/unlock");
  const contacts = (await getContacts()).slice().reverse();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image src="/rooster-logo.png" alt="Rooster" width={36} height={36} />
          <h1 className="text-2xl font-bold text-rooster-dark">
            Event contacts <span className="text-rooster-muted">({contacts.length})</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Link href="/" className={secondaryBtn}>New contact</Link>
          <a href="/contacts/export"
            className="rounded-lg bg-rooster px-4 py-2 text-sm font-semibold text-white transition hover:bg-rooster-hover">
            Export CSV
          </a>
          <form action={lock}>
            <button type="submit" className={secondaryBtn}>Lock</button>
          </form>
        </div>
      </div>

      {contacts.length === 0 ? (
        <p className="text-rooster-muted">No contacts yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-rooster-border-soft bg-white">
          <table className="w-full text-left text-sm text-rooster-text">
            <thead className="bg-rooster text-white">
              <tr>
                {["Date", "Type", "Company", "Name", "Email", "Phone", "Remarks"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-rooster-border-soft">
              {contacts.map((c) => (
                <tr key={c.id} className="align-top hover:bg-rooster-pale">
                  <td className="whitespace-nowrap px-4 py-3">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      c.type === "company" ? "bg-rooster text-white" : "bg-rooster-light text-rooster-dark"
                    }`}>
                      {c.type === "company" ? "Company" : "Individual"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{c.company}</td>
                  <td className="px-4 py-3 font-medium text-rooster-dark">{c.name}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">{c.phone}</td>
                  <td className="max-w-md whitespace-pre-wrap px-4 py-3">{c.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
