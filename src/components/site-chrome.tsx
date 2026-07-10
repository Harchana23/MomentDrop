import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="px-4 pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full glass px-4 py-2.5 md:px-5">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold tracking-tight text-[#2A1B24]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" aria-hidden="true" className="h-7 w-auto" />
          Moment<span className="text-[#B5654A]">Drop</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/how-it-works" className="hidden text-[#4A3540] hover:underline sm:inline">
            How it works
          </Link>
          <Link href="/use-cases/wedding" className="hidden text-[#4A3540] hover:underline sm:inline">
            Weddings
          </Link>
          <Link href="/pricing" className="text-[#4A3540] hover:underline">
            Pricing
          </Link>
          <Link href="/contact" className="hidden text-[#4A3540] hover:underline sm:inline">
            Contact
          </Link>
          <Link href="/login" className="text-[#4A3540] hover:underline">
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-full btn-grad px-4 font-bold text-white"
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
    <footer className="mt-24 border-t border-[#E4D9CF]">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7A6570]">
            MomentDrop
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[#7A6570]">
            Collect every guest&apos;s photos and videos with one QR scan. Scan. Drop. Remember.
          </p>
          <a
            href="mailto:momentdropsharing@gmail.com"
            className="mt-3 inline-block text-sm font-semibold text-[#B5654A] hover:underline"
          >
            momentdropsharing@gmail.com
          </a>
        </div>
        <div className="text-sm">
          <p className="font-medium text-[#4A3540]">Use cases</p>
          <ul className="mt-3 space-y-2 text-[#7A6570]">
            <li><Link href="/use-cases/wedding" className="hover:underline">Weddings</Link></li>
            <li><Link href="/use-cases/birthday" className="hover:underline">Birthdays</Link></li>
            <li><Link href="/use-cases/party" className="hover:underline">Parties</Link></li>
            <li><Link href="/use-cases/corporate" className="hover:underline">Corporate events</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium text-[#4A3540]">Product</p>
          <ul className="mt-3 space-y-2 text-[#7A6570]">
            <li><Link href="/how-it-works" className="hover:underline">How it works</Link></li>
            <li><Link href="/pricing" className="hover:underline">Pricing</Link></li>
            <li><Link href="/faq" className="hover:underline">FAQ</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            <li><Link href="/login" className="hover:underline">Log in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#E4D9CF]">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-[#9B8676]">
          © MomentDrop — Scan. Drop. Remember.
        </p>
      </div>
    </footer>
  );
}
