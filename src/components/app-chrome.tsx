import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

/** Top bar for signed-in pages: brand logo → dashboard, current email, and Sign out. */
export async function AppHeader() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getClaims();
  const email = data?.claims?.email ?? "";

  return (
    <header className="border-b border-[#E4D9CF] bg-[#F4ECE3]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-[#2A1B24]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" aria-hidden="true" className="h-7 w-auto" />
          Moment<span className="text-[#B5654A]">Drop</span>
        </Link>
        <div className="flex items-center gap-3 text-sm sm:gap-4">
          {email && <span className="hidden text-[#7A6570] md:inline">{String(email)}</span>}
          <Link
            href="/contact"
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 font-semibold text-[#4A3540] hover:text-[#B5654A]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4" aria-hidden="true">
              <path d="M4 5h16v12H7l-3 3z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Support
          </Link>
          <form action={signOut}>
            <button className="h-9 rounded-full border border-[#E4D9CF] px-4 font-semibold text-[#4A3540] hover:border-[#B5654A]">
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
    <header className="border-b border-[#E4D9CF] bg-[#F4ECE3]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-[#2A1B24]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" aria-hidden="true" className="h-7 w-auto" />
          Moment<span className="text-[#B5654A]">Drop</span>
        </Link>
        <Link href="/" className="text-sm text-[#4A3540] hover:underline">
          ← Back to site
        </Link>
      </div>
    </header>
  );
}
