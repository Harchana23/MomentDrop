import { createEvent } from "@/lib/events/actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#F4ECE3] px-5 py-10 text-[#2A1B24]">
      <div className="w-full max-w-lg glass p-7 shadow-[0_24px_80px_rgba(90,50,40,0.12)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7A6570]">
          MomentDrop
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight">Create your event</h1>
        <p className="mt-2 text-sm text-[#7A6570]">
          Guests will scan a QR code and upload photos — no app, no account.
        </p>
        {sp.error && (
          <p className="mt-4 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
            {sp.error}
          </p>
        )}
        <form action={createEvent} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#4A3540]">Event name</span>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Summer Wedding 2026"
              className="mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#4A3540]">Type</span>
              <select
                name="event_type"
                defaultValue="wedding"
                className="mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="party">Party</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#4A3540]">Date</span>
              <input
                name="event_date"
                type="date"
                className="mt-2 h-12 w-full rounded-xl border border-[#E4D9CF] bg-[#FFFBF6] px-4 outline-none focus:border-[#B5654A]"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-[#4A3540]">
              Welcome message (optional)
            </span>
            <textarea
              name="host_message"
              placeholder="A note your guests see on the upload page"
              className="mt-2 min-h-20 w-full resize-none border border-[#E4D9CF] bg-[#FFFBF6] px-4 py-3 outline-none focus:border-[#B5654A]"
            />
          </label>
          <button className="h-12 w-full rounded-full btn-grad text-base font-semibold text-white">
            Create event
          </button>
        </form>
      </div>
    </main>
  );
}
