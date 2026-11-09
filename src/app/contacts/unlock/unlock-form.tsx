"use client";

import { useActionState } from "react";
import { unlock, type UnlockState } from "./actions";

export default function UnlockForm() {
  const [state, formAction, pending] = useActionState<UnlockState, FormData>(unlock, {});

  return (
    <form action={formAction} className="space-y-4">
      <label htmlFor="pin" className="block text-sm font-medium text-rooster-text">PIN</label>
      <input
        id="pin" name="pin" type="password" inputMode="numeric" autoComplete="off" autoFocus required
        aria-invalid={!!state.error}
        className="w-full rounded-lg border border-rooster-border bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-rooster-dark outline-none focus:border-rooster focus:ring-2 focus:ring-rooster/25 aria-[invalid=true]:border-rooster-danger"
      />
      {state.error && <p role="alert" className="text-sm text-rooster-danger">{state.error}</p>}
      <button type="submit" disabled={pending}
        className="w-full rounded-lg bg-rooster px-4 py-3 text-base font-semibold text-white transition hover:bg-rooster-hover disabled:opacity-60">
        {pending ? "Checking..." : "Unlock"}
      </button>
    </form>
  );
}
