"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearFailures, endSession, getPin, lockoutRemainingMs, pinMatches, recordFailure, startSession,
} from "@/lib/pin-auth";

export type UnlockState = { error?: string };

async function clientId() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}

export async function unlock(_prev: UnlockState, formData: FormData): Promise<UnlockState> {
  if (!getPin()) return { error: "No PIN is configured on the server. Set CONTACTS_PIN in .env.local." };

  const client = await clientId();
  const wait = lockoutRemainingMs(client);
  if (wait > 0) {
    return { error: `Too many wrong attempts. Try again in ${Math.ceil(wait / 60000)} min.` };
  }

  const pin = String(formData.get("pin") ?? "").trim();
  if (!pinMatches(pin)) {
    recordFailure(client);
    return { error: "Incorrect PIN." };
  }

  clearFailures(client);
  await startSession();
  redirect("/contacts");
}

export async function lock() {
  await endSession();
  redirect("/contacts/unlock");
}
