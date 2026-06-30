import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sb = await supabaseServer();
  const { data: claims } = await sb.auth.getClaims();
  const email = claims?.claims?.email ?? "";
  const { data: events } = await sb
    .from("events")
    .select("id, title, slug, event_date, plan")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-[#ded4c4] pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6e3f]">
              MomentDrop
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your events</h1>
            <p className="mt-1 text-sm text-[#74664f]">{email}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-11 items-center bg-[#1f1b16] px-5 text-sm font-semibold text-white"
            >
              Create event
            </Link>
            <form action={signOut}>
              <button className="h-11 border border-[#d8cdbb] px-4 text-sm font-semibold text-[#5c4a2e]">
                Sign out
              </button>
            </form>
          </div>
        </header>

        {(events ?? []).length === 0 ? (
          <div className="mt-10 border border-dashed border-[#cbbfa9] bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">No events yet</h2>
            <p className="mt-2 text-sm text-[#74664f]">
              Create your first event to get a QR code your guests can scan.
            </p>
            <Link
              href="/onboarding"
              className="mt-6 inline-flex h-11 items-center bg-[#1f1b16] px-5 text-sm font-semibold text-white"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {(events ?? []).map((e) => (
              <li key={e.id as string}>
                <Link
                  href={`/dashboard/events/${e.id as string}`}
                  className="block border border-[#ded4c4] bg-white p-5 transition hover:border-[#8d7147]"
                >
                  <p className="text-lg font-semibold">{e.title as string}</p>
                  <p className="mt-1 text-sm text-[#74664f]">
                    /e/{e.slug as string} · {String(e.plan)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
