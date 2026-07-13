import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

const PHOTO_FILLS = [
  "#d8c3a3", "#c9a98a", "#E4D3BF", "#b98e6e", "#cdb39a",
  "#9c7a59", "#dcc8ab", "#c2a07f", "#e8dcc8", "#bda081",
  "#d3b894", "#a8855f",
];

/** A masonry-ish grid of warm tiles standing in for guest photos. */
export function PhotoWallMock({ count = 9, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {PHOTO_FILLS.slice(0, count).map((c, i) => (
        <div key={i} className="aspect-square" style={{ background: c }} aria-hidden="true" />
      ))}
    </div>
  );
}

/**
 * A real photo (from /public/marketing) with a graceful warm fallback colour, so
 * the page still looks intentional before the image files are added.
 */
export function Photo({
  src,
  alt,
  className = "",
  fallback = "#E4D3BF",
}: {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${src})`, backgroundColor: fallback }}
    />
  );
}

/** Grid of real event photos: /marketing/gallery-1..N.jpg, warm fallbacks. */
export function PhotoGrid({ count = 6, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <Photo
          key={i}
          src={`/marketing/gallery-${i + 1}.jpg`}
          alt="A guest's event photo"
          fallback={PHOTO_FILLS[i % PHOTO_FILLS.length]}
          className="aspect-square"
        />
      ))}
    </div>
  );
}

/** A phone showing the guest upload screen. */
export function PhoneMock({ title = "Sarah & James" }: { title?: string }) {
  return (
    <div className="mx-auto w-[230px] rounded-[2rem] border-[10px] border-[#1f1b16] bg-[#F4ECE3] p-4 shadow-[0_30px_80px_rgba(90,50,40,0.25)]">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7A6570]">
        {title}
      </p>
      <p className="mt-1 text-center text-[13px] font-semibold text-[#2A1B24]">Add your photos</p>
      <div className="mt-3 grid h-24 place-items-center border border-dashed border-[#bda77f] bg-[#FBF3EC] px-2 text-center text-[10px] text-[#7A6570]">
        Tap to choose photos &amp; videos
      </div>
      <div className="mt-3 grid h-7 place-items-center bg-[#1f1b16] text-[10px] font-semibold text-white">
        Upload memories
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {PHOTO_FILLS.slice(0, 6).map((c, i) => (
          <div key={i} className="aspect-square" style={{ background: c }} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}

/** A printable-style QR table card with a stylized (decorative) QR. */
export function QrCardMock({ title = "Sarah & James" }: { title?: string }) {
  const mod = (x: number, y: number) => (
    <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" fill="#1f1b16" />
  );
  const finder = (ox: number, oy: number) => (
    <g key={`f-${ox}-${oy}`}>
      <rect x={ox} y={oy} width="26" height="26" fill="#1f1b16" />
      <rect x={ox + 5} y={oy + 5} width="16" height="16" fill="#fbf6ea" />
      <rect x={ox + 9} y={oy + 9} width="8" height="8" fill="#1f1b16" />
    </g>
  );
  const dots: [number, number][] = [
    [40, 8], [54, 8], [40, 22], [62, 22], [40, 40], [48, 40], [62, 40], [40, 54],
    [8, 40], [22, 48], [40, 62], [54, 54], [62, 62], [48, 62], [40, 76], [54, 76],
    [62, 40], [70, 54], [22, 62],
  ];
  return (
    <div className="w-[200px] border-2 border-[#caa75f] bg-[#fbf6ea] px-6 py-7 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B5654A]">
        {title}
      </p>
      <p className="mt-1 text-xs text-[#6b5b44]">Scan to share your photos</p>
      <svg viewBox="0 0 100 100" className="mx-auto mt-3 h-32 w-32" role="img" aria-label="QR code">
        {finder(4, 4)}
        {finder(70, 4)}
        {finder(4, 70)}
        {dots.map(([x, y]) => mod(x, y))}
      </svg>
      <p className="mt-3 text-[10px] uppercase tracking-[0.24em] text-[#B5654A]">MomentDrop</p>
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-[#E4D9CF] border-y border-[#E4D9CF]">
      {items.map((it) => (
        <details key={it.q} className="group px-1 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-[#2A1B24]">
            {it.q}
            <span className="ml-4 text-[#B5654A] transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#7A6570]">{it.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Shared layout for use-case pages (wedding, birthday, party, corporate). */
export function UseCaseLayout({
  eyebrow,
  title,
  subtitle,
  benefits,
  ctaLabel,
  image,
  galleryTitle = "Real moments guests capture",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  benefits: { t: string; d: string }[];
  ctaLabel: string;
  /** Hero event photo from /public/marketing (e.g. "/marketing/event-wedding.jpg"). */
  image: string;
  galleryTitle?: string;
}) {
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-16 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7A6570]">{eyebrow}</p>
          <h1 className="mt-3 text-5xl font-semibold leading-[1.03] tracking-tight text-[#2A1B24] md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[#7A6570]">{subtitle}</p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full btn-grad px-7 text-base font-semibold text-white"
          >
            {ctaLabel}
          </Link>
        </div>
        {/* Real event photo, with a floating QR card telling the "scan to share" story. */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[400px]">
            <Photo
              src={image}
              alt={`${eyebrow} — guests sharing photos`}
              className="aspect-[3/4] w-full rounded-3xl shadow-[0_40px_90px_-30px_rgba(90,50,40,0.55)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{ background: "linear-gradient(to top, rgba(30,15,22,0.4), transparent 46%)" }}
            />
            <div className="absolute bottom-4 left-4 hidden origin-bottom-left scale-[0.72] sm:block">
              <QrCardMock title="Scan to join" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-14">
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.t} className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold">{b.t}</h3>
              <p className="mt-2 text-sm leading-6 text-[#7A6570]">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Real candid photos from /public/marketing/gallery-*.jpg */}
      <section className="mx-auto max-w-5xl px-5 py-10">
        <h2 className="text-center text-3xl font-semibold tracking-tight">{galleryTitle}</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[#7A6570]">
          The toasts, the dance floor, the quiet in-betweens — every angle your photographer can&apos;t be.
        </p>
        <PhotoGrid count={6} className="mt-8 rounded-2xl" />
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Ready in minutes</h2>
        <p className="mt-3 text-[#7A6570]">Create your event, share the QR, and collect every memory. Free to start.</p>
        <Link
          href="/signup"
          className="mt-7 inline-flex h-12 items-center justify-center rounded-full btn-grad px-7 text-base font-semibold text-white"
        >
          {ctaLabel}
        </Link>
      </section>
      <SiteFooter />
    </div>
  );
}
