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

/* Footer link columns. */
const FOOTER_COLS: { title: string; links: [string, string][] }[] = [
  {
    title: "Product",
    links: [
      ["How it works", "/how-it-works"],
      ["Pricing", "/pricing"],
      ["FAQ", "/faq"],
      ["Live demo", "/demo"],
    ],
  },
  {
    title: "Occasions",
    links: [
      ["Weddings", "/use-cases/wedding"],
      ["Birthdays", "/use-cases/birthday"],
      ["Parties & festivals", "/use-cases/party"],
      ["Corporate", "/use-cases/corporate"],
    ],
  },
  {
    title: "Company",
    links: [
      ["Contact", "/contact"],
      ["Log in", "/login"],
      ["Create event", "/signup"],
    ],
  },
];

/* Social profiles — add your real URLs to show these icons (leave "" to hide). */
const SOCIALS: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "Instagram",
    href: "",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.5 3c.3 2 1.5 3.6 3.5 3.9V9c-1.3 0-2.5-.4-3.5-1.1v6.5a5.4 5.4 0 1 1-5.4-5.4c.3 0 .6 0 .9.1v2.3a3.1 3.1 0 1 0 2.2 3V3z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 9h3l.4-3H14V4.2c0-.9.3-1.5 1.6-1.5H17V.1C16.7.05 15.7 0 14.6 0 12.2 0 10.6 1.4 10.6 4v2H8v3h2.6v9H14z" />
      </svg>
    ),
  },
];

const iconBtn =
  "grid h-9 w-9 place-items-center rounded-full border border-[#E4D9CF] bg-white/70 text-[#7A6570] transition hover:border-[#e6c8a9] hover:text-[#B5654A]";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const socials = SOCIALS.filter((s) => s.href);
  return (
    <footer className="relative mt-24 overflow-hidden rounded-t-[32px] bg-[#EDE4D8] text-[#2A1B24]">
      {/* content panel */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-16 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* brand + statement */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-[#2A1B24]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-auto" />
            Moment<span className="text-[#B5654A]">Drop</span>
          </Link>
          <h2 className="font-serif mt-7 text-3xl font-bold leading-[1.03] tracking-tight text-[#2A1B24] md:text-[36px]">
            Keep every<br />moment.
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#7A6570]">
            Collect every guest&apos;s photos and videos with one QR scan — no app, no account.
          </p>
          <div className="mt-6 flex items-center gap-2.5">
            <a href="mailto:momentdropsharing@gmail.com" aria-label="Email us" className={iconBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </a>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className={iconBtn}>
                {s.icon}
              </a>
            ))}
          </div>
          <Link href="/signup" className="btn-grad mt-7 inline-flex h-11 items-center rounded-full px-6 text-sm font-bold text-white">
            Create your event — free →
          </Link>
        </div>

        {/* link columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.title} className="text-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B5654A]">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-[#5A4550]">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="transition hover:text-[#B5654A]">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* full-bleed photo band bleeding off the bottom */}
      <div className="relative">
        <div
          aria-hidden="true"
          className="w-full"
          style={{
            height: "clamp(190px, 26vw, 300px)",
            backgroundImage: "url(/marketing/hero.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
          }}
        />
        {/* melt the cream panel into the top of the photo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{ background: "linear-gradient(#EDE4D8, rgba(237,228,216,0))" }}
        />
        {/* copyright bar sits over the light top of the photo */}
        <div className="absolute inset-x-0 top-0">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-5 text-xs text-[#6B5B54] sm:flex-row sm:items-center sm:justify-between">
            <span>© {year} MomentDrop. Made for Malaysian celebrations.</span>
            <span className="font-semibold tracking-wide">Scan. Drop. Remember.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
