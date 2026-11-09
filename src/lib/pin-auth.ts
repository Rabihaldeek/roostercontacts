import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "rc_session";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export function getPin(): string | undefined {
  const pin = process.env.CONTACTS_PIN?.trim();
  return pin ? pin : undefined;
}

// The session token is derived from the PIN, so changing the PIN logs everyone out.
function sessionToken(pin: string) {
  return createHmac("sha256", pin).update("rooster-contacts-session-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function pinMatches(input: string) {
  const pin = getPin();
  return !!pin && safeEqual(input, pin);
}

export async function isUnlocked() {
  const pin = getPin();
  if (!pin) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!token && safeEqual(token, sessionToken(pin));
}

export async function startSession() {
  const pin = getPin();
  if (!pin) return;
  (await cookies()).set(SESSION_COOKIE, sessionToken(pin), {
    httpOnly: true,
    sameSite: "lax",
    // Only mark Secure when actually served over HTTPS (the stand laptop is usually plain http).
    secure: process.env.SECURE_COOKIES === "1",
    path: "/contacts",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/contacts" });
}

// --- Brute-force protection: 5 wrong PINs per client => locked for 5 minutes.
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const attempts = new Map<string, { count: number; lockedUntil: number }>();

export function lockoutRemainingMs(client: string) {
  const entry = attempts.get(client);
  return entry && entry.lockedUntil > Date.now() ? entry.lockedUntil - Date.now() : 0;
}

export function recordFailure(client: string) {
  const entry = attempts.get(client) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.count = 0;
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  attempts.set(client, entry);
}

export function clearFailures(client: string) {
  attempts.delete(client);
}
