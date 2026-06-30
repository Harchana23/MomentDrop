import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[#e6ddcf]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7f6a46]"
        >
          MomentDrop
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/use-cases/wedding" className="hidden text-[#5c4a2e] hover:underline sm:inline">
            Weddings
          </Link>
          <Link href="/pricing" className="text-[#5c4a2e] hover:underline">
            Pricing
          </Link>
          <Link href="/login" className="text-[#5c4a2e] hover:underline">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center bg-[#1f1b16] px-4 font-semibold text-white hover:bg-[#3a3127]"
          >
            Create event
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[#e6ddcf]">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-4 px-5 py-10 text-sm text-[#74664f] sm:flex-row">
        <p>© MomentDrop — Scan. Drop. Remember.</p>
        <div className="flex gap-5">
          <Link href="/use-cases/wedding" className="hover:underline">Weddings</Link>
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/login" className="hover:underline">Log in</Link>
        </div>
      </div>
    </footer>
  );
}
