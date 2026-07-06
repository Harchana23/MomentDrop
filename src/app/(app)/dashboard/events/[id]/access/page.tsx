import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner } from "@/lib/events/queries";
import { EventNav } from "@/components/event-nav";
import { updateAccessControl, setEventPassword } from "@/lib/events/actions";

export const dynamic = "force-dynamic";

type ToggleDef = {
  name: "allow_uploads" | "require_approval" | "allow_downloads";
  label: string;
  help: string;
};

const TOGGLES: ToggleDef[] = [
  { name: "allow_uploads", label: "Allow guest uploads", help: "Master switch — turn off to stop new uploads." },
  { name: "require_approval", label: "Require approval before visible", help: "New uploads wait in the Approval tab until you publish them." },
  { name: "allow_downloads", label: "Show shared album to guests", help: "Guests can view and download published photos on the upload page." },
];

export default async function AccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const event = await getEventForOwner(id);
  if (!event) notFound();

  const current: Record<string, boolean> = {
    allow_uploads: event.allow_uploads,
    require_approval: event.require_approval,
    allow_downloads: event.allow_downloads,
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href={`/dashboard/events/${id}`} className="text-sm text-[#8b6e3f]">
          ← {event.title}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Access control</h1>
        <EventNav eventId={id} active="access" />

        {sp.saved && (
          <p className="mt-5 border border-[#cfe2d0] bg-[#eef4ec] px-4 py-3 text-sm text-[#3b7a4f]">
            Saved.
          </p>
        )}

        <form action={updateAccessControl} className="mt-6 border border-[#ded4c4] bg-white">
          <input type="hidden" name="id" value={id} />
          <ul className="divide-y divide-[#eee6da]">
            {TOGGLES.map((t) => (
              <li key={t.name} className="flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="text-sm font-semibold">{t.label}</p>
                  <p className="mt-1 text-sm text-[#74664f]">{t.help}</p>
                </div>
                <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    name={t.name}
                    defaultChecked={current[t.name]}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-[#d3cabb] transition peer-checked:bg-[#8d7147]" />
                  <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                </label>
              </li>
            ))}
          </ul>
          <div className="border-t border-[#eee6da] p-5">
            <button className="h-11 bg-[#1f1b16] px-5 text-sm font-semibold text-white hover:bg-[#3a3127]">
              Save access settings
            </button>
          </div>
        </form>

        <section className="mt-6 border border-[#ded4c4] bg-white p-6">
          <h2 className="text-xl font-semibold">Password protection</h2>
          <p className="mt-1 text-sm text-[#74664f]">
            {event.password_hash
              ? "Guests must enter a password to open this event."
              : "Add a password guests must enter to open the event."}
          </p>
          <form action={setEventPassword} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="id" value={id} />
            <input
              name="password"
              type="text"
              placeholder={event.password_hash ? "New password" : "Set a password"}
              className="h-12 flex-1 border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]"
            />
            <button className="h-12 bg-[#1f1b16] px-5 text-sm font-semibold text-white hover:bg-[#3a3127]">
              {event.password_hash ? "Update password" : "Set password"}
            </button>
          </form>
          {event.password_hash && (
            <form action={setEventPassword} className="mt-3">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="password" value="" />
              <button className="text-sm text-[#9a3b2b] underline">Remove password</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
