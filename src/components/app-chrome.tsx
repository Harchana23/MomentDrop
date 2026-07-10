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
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-[#231a12]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" aria-hidden="true" className="h-7 w-auto" />
          Moment<span className="text-[#e0734f]">Drop</span>
        </Link>
        <div className="flex items-center gap-3 text-sm sm:gap-4">
          {email && <span className="hidden text-[#74664f] md:inline">{String(email)}</span>}
          <Link
            href="/contact"
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 font-semibold text-[#5c4a2e] hover:text-[#c85f3c]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
              <path d="M4 5h16v12H7l-3 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Support
          </Link>
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
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-[#231a12]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" aria-hidden="true" className="h-7 w-auto" />
          Moment<span className="text-[#e0734f]">Drop</span>
        </Link>
        <Link href="/" className="text-sm text-[#5c4a2e] hover:underline">
          ← Back to site
        </Link>
      </div>
    </header>
  );
}
