"use server";

import { revalidatePath } from "next/cache";
import { addContact, type ContactType } from "@/lib/contacts";

export type FormValues = {
  type: ContactType;
  company: string;
  name: string;
  email: string;
  phone: string;
  remarks: string;
};

export type FormState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<keyof FormValues, string>>;
  values?: FormValues;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s\-()]{6,20}$/;

export async function saveContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const rawType = String(formData.get("type") ?? "");
  const type: ContactType = rawType === "company" ? "company" : "individual";
  const values: FormValues = {
    type,
    company: type === "company" ? String(formData.get("company") ?? "").trim() : "",
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    remarks: String(formData.get("remarks") ?? "").trim(),
  };

  const errors: FormState["errors"] = {};
  if (rawType !== "individual" && rawType !== "company") errors.type = "Choose Individual or Company.";
  if (type === "company" && !values.company) errors.company = "Company name is required.";
  else if (values.company.length > 150) errors.company = "Company name is too long.";
  if (!values.name) errors.name = "Name is required.";
  else if (values.name.length > 100) errors.name = "Name is too long.";
  if (!values.email && !values.phone) {
    errors.email = "Provide an email or a phone number.";
    errors.phone = "Provide an email or a phone number.";
  }
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "Enter a valid email.";
  if (values.phone && !PHONE_RE.test(values.phone)) errors.phone = "Enter a valid phone number.";
  if (values.remarks.length > 1000) errors.remarks = "Remarks are too long (max 1000).";

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please fix the highlighted fields.", errors, values };
  }

  try {
    await addContact(values);
  } catch (err) {
    console.error("Failed to save contact", err);
    return { ok: false, message: "Could not save. Please try again.", values };
  }

  revalidatePath("/contacts");
  return { ok: true, message: `Thanks, ${values.name}! Your details were saved.` };
}
