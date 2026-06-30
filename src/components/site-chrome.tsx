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
          <Link href="/how-it-works" className="hidden text-[#5c4a2e] hover:underline sm:inline">
            How it works
          </Link>
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
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7f6a46]">
            MomentDrop
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[#74664f]">
            Collect every guest&apos;s photos and videos with one QR scan. Scan. Drop. Remember.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium text-[#4a4035]">Use cases</p>
          <ul className="mt-3 space-y-2 text-[#74664f]">
            <li><Link href="/use-cases/wedding" className="hover:underline">Weddings</Link></li>
            <li><Link href="/use-cases/birthday" className="hover:underline">Birthdays</Link></li>
            <li><Link href="/use-cases/party" className="hover:underline">Parties</Link></li>
            <li><Link href="/use-cases/corporate" className="hover:underline">Corporate events</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium text-[#4a4035]">Product</p>
          <ul className="mt-3 space-y-2 text-[#74664f]">
            <li><Link href="/how-it-works" className="hover:underline">How it works</Link></li>
            <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/login" className="hover:underline">Log in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#e6ddcf]">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-[#a18e73]">
          © MomentDrop — Scan. Drop. Remember.
        </p>
      </div>
    </footer>
  );
}
