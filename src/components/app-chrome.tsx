import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

/** Top bar for signed-in pages: brand logo → dashboard, current email, and Sign out. */
export async function AppHeader() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getClaims();
  const email = data?.claims?.email ?? "";

  return (
    <header className="border-b border-[#e6ddcf] bg-[#fbf6ee]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/dashboard" className="text-lg font-bold tracking-tight text-[#231a12]">
          Moment<span className="text-[#e0734f]">Drop</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {email && <span className="hidden text-[#74664f] sm:inline">{String(email)}</span>}
          <form action={signOut}>
            <button className="h-9 rounded-full border border-[#d8cdbb] px-4 font-semibold text-[#5c4a2e] hover:border-[#8d7147]">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

/** Slim brand bar for the auth pages (login / signup / reset). */
export function AuthHeader() {
  return (
    <header className="border-b border-[#e6ddcf] bg-[#fbf6ee]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-[#231a12]">
          Moment<span className="text-[#e0734f]">Drop</span>
        </Link>
        <Link href="/" className="text-sm text-[#5c4a2e] hover:underline">
          ← Back to site
        </Link>
      </div>
    </header>
  );
}
