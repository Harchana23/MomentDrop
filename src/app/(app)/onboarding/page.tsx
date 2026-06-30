import { createEvent } from "@/lib/events/actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-5 py-10 text-[#22211f]">
      <div className="w-full max-w-lg border border-[#e1d8ca] bg-white p-7 shadow-[0_24px_80px_rgba(70,55,35,0.12)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">
          MomentDrop
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your event</h1>
        <p className="mt-2 text-sm text-[#695b49]">
          Guests will scan a QR code and upload photos — no app, no account.
        </p>
        {sp.error && (
          <p className="mt-4 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">
            {sp.error}
          </p>
        )}
        <form action={createEvent} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#4a4035]">Event name</span>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Summer Wedding 2026"
              className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">Type</span>
              <select
                name="event_type"
                defaultValue="wedding"
                className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="party">Party</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">Date</span>
              <input
                name="event_date"
                type="date"
                className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-[#4a4035]">
              Welcome message (optional)
            </span>
            <textarea
              name="host_message"
              placeholder="A note your guests see on the upload page"
              className="mt-2 min-h-20 w-full resize-none border border-[#d8cdbb] bg-[#fffdf9] px-4 py-3 outline-none focus:border-[#8f7245]"
            />
          </label>
          <button className="h-12 w-full bg-[#1f1b16] text-base font-semibold text-white hover:bg-[#3a3127]">
            Create event
          </button>
        </form>
      </div>
    </main>
  );
}
