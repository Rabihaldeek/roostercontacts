import Image from "next/image";
import ContactForm from "./contact-form";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-rooster-border-soft bg-white shadow-sm">
        <header className="bg-rooster px-6 py-6 text-center text-white sm:px-8">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2.5">
            <Image src="/rooster-logo.png" alt="Rooster" width={44} height={44} priority />
          </div>
          <h1 className="text-2xl font-bold">Welcome to Rooster</h1>
          <p className="mt-1 text-sm text-white/85">
            Leave your details and our team will get in touch.
          </p>
        </header>
        <div className="p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
