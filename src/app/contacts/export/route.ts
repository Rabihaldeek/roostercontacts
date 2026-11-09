import { connection } from "next/server";
import { getContacts } from "@/lib/contacts";
import { isUnlocked } from "@/lib/pin-auth";

function csvCell(value: string) {
  // Quote every cell and neutralise spreadsheet formula injection.
  // Plain phone numbers like "+961 70 123 456" are left untouched.
  const isPhone = /^\+?[0-9\s\-()]+$/.test(value);
  const safe = !isPhone && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  await connection(); // always read fresh data at request time
  if (!(await isUnlocked())) {
    return Response.redirect(new URL("/contacts/unlock", request.url), 303);
  }
  const contacts = await getContacts();
  const header = ["Date", "Type", "Company", "Name", "Email", "Phone", "Remarks"];
  const rows = contacts.map((c) => [
    c.createdAt, c.type === "company" ? "Company" : "Individual", c.company,
    c.name, c.email, c.phone, c.remarks,
  ]);
  // BOM so Excel opens UTF-8 (e.g. Arabic names) correctly.
  const BOM = String.fromCharCode(0xfeff);
  const csv = BOM + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rooster-contacts-${date}.csv"`,
    },
  });
}
