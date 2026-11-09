import UnlockForm from "./unlock-form";

export const metadata = { title: "Staff access · Rooster" };

export default function UnlockPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-rooster-border-soft bg-white p-6 shadow-sm sm:p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-rooster-dark">Staff access</h1>
          <p className="mt-1 text-sm text-rooster-muted">Enter the PIN to view event contacts.</p>
        </header>
        <UnlockForm />
      </div>
    </main>
  );
}
