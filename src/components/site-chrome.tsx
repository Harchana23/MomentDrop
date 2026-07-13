import Link from "next/link";

export const OCCASIONS = [
  { href: "/use-cases/wedding", label: "Weddings", icon: "💍", blurb: "Malay, Chinese, Indian, church" },
  { href: "/use-cases/birthday", label: "Birthdays", icon: "🎂", blurb: "Every candid from the night" },
  { href: "/use-cases/party", label: "Parties & festivals", icon: "🪔", blurb: "Raya, CNY, Deepavali, Christmas" },
  { href: "/use-cases/corporate", label: "Corporate events", icon: "🏢", blurb: "Annual dinners, launches, off-sites" },
] as const;

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

          {/* Occasions dropdown — reveals on hover and keyboard focus */}
          <div className="group relative hidden sm:block">
            <button
              type="button"
              aria-haspopup="true"
              className="inline-flex items-center gap-1 text-[#4A3540] group-hover:text-[#2A1B24]"
            >
              Occasions
              <span aria-hidden="true" className="text-[11px] transition-transform group-hover:rotate-180 group-focus-within:rotate-180">▾</span>
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 translate-y-1 rounded-2xl glass p-2 opacity-0 shadow-[0_20px_50px_-20px_rgba(90,50,40,0.4)] transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              {OCCASIONS.map((o) => (
                <Link
                  key={o.href}
                  href={o.href}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-white/60"
                >
                  <span aria-hidden="true" className="text-lg leading-none">{o.icon}</span>
                  <span>
                    <span className="block font-semibold text-[#2A1B24]">{o.label}</span>
                    <span className="block text-xs text-[#7A6570]">{o.blurb}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

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
