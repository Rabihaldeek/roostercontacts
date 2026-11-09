"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveContact, type FormState } from "./actions";
import type { ContactType } from "@/lib/contacts";

const initialState: FormState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-lg border border-rooster-border bg-white px-4 py-3 text-base text-rooster-dark outline-none transition placeholder:text-rooster-muted/70 focus:border-rooster focus:ring-2 focus:ring-rooster/25 aria-[invalid=true]:border-rooster-danger";

const TYPES: { value: ContactType; label: string }[] = [
  { value: "individual", label: "Individual" },
  { value: "company", label: "Company" },
];

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(saveContact, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<ContactType>("individual");

  // Sync the toggle with the server result: keep the choice on errors, reset after a save.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    setType(state.ok ? "individual" : (state.values?.type ?? type));
  }

  // After a successful save, clear the form and focus Name for the next visitor.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      formRef.current?.querySelector<HTMLInputElement>("#name")?.focus();
    }
  }, [state]);

  // On validation errors, keep what was typed (React resets forms after an action).
  const v = state.ok ? undefined : state.values;
  const key = JSON.stringify(state);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {state.message && (
        <p
          role="status"
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            state.ok ? "bg-rooster-light text-rooster-dark" : "bg-red-50 text-rooster-danger"
          }`}
        >
          {state.message}
        </p>
      )}

      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 block text-sm font-medium text-rooster-text">
          I am visiting as <span className="text-rooster-danger">*</span>
        </legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-xl bg-rooster-pale p-1">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className="cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-rooster-text transition has-checked:bg-rooster has-checked:text-white has-checked:shadow-sm has-focus-visible:ring-2 has-focus-visible:ring-rooster/40"
            >
              <input
                type="radio" name="type" value={t.value} className="sr-only"
                checked={type === t.value} onChange={() => setType(t.value)}
              />
              {t.label}
            </label>
          ))}
        </div>
        {state.errors?.type && <p className="text-sm text-rooster-danger">{state.errors.type}</p>}
      </fieldset>

      {type === "company" && (
        <Field label="Company name" htmlFor="company" error={state.errors?.company} required>
          <input key={key} id="company" name="company" autoComplete="organization"
            defaultValue={v?.company} aria-invalid={!!state.errors?.company} className={inputClass}
            placeholder="Acme Trading SAL" />
        </Field>
      )}

      <Field label={type === "company" ? "Contact person" : "Full name"} htmlFor="name"
        error={state.errors?.name} required>
        <input key={key} id="name" name="name" autoComplete="name" autoFocus defaultValue={v?.name}
          aria-invalid={!!state.errors?.name} className={inputClass} placeholder="Jane Doe" />
      </Field>

      <Field label="Email" htmlFor="email" error={state.errors?.email}>
        <input key={key} id="email" name="email" type="email" inputMode="email" autoComplete="email"
          defaultValue={v?.email} aria-invalid={!!state.errors?.email} className={inputClass}
          placeholder="jane@company.com" />
      </Field>

      <Field label="Phone number" htmlFor="phone" error={state.errors?.phone}>
        <input key={key} id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel"
          defaultValue={v?.phone} aria-invalid={!!state.errors?.phone} className={inputClass}
          placeholder="+961 70 123 456" />
      </Field>

      <Field label="Remarks" htmlFor="remarks" error={state.errors?.remarks}>
        <textarea key={key} id="remarks" name="remarks" rows={4} defaultValue={v?.remarks}
          aria-invalid={!!state.errors?.remarks} className={inputClass}
          placeholder="Interests, business type, follow-up notes..." />
      </Field>

      <button type="submit" disabled={pending}
        className="w-full rounded-lg bg-rooster px-4 py-3 text-base font-semibold text-white transition hover:bg-rooster-hover active:bg-rooster-active disabled:opacity-60">
        {pending ? "Saving..." : "Save contact"}
      </button>
    </form>
  );
}

function Field({ label, htmlFor, error, required, children }: {
  label: string; htmlFor: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-rooster-text">
        {label} {required && <span className="text-rooster-danger">*</span>}
      </label>
      {children}
      {error && <p className="text-sm text-rooster-danger">{error}</p>}
    </div>
  );
}
