import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Faq } from "@/components/marketing";
import NotifyForm from "@/components/notify-form";
import { PRICING_FAQS } from "@/lib/faqs";
import { planBy } from "@/lib/plans";
import { JsonLd, graph, breadcrumbSchema, softwareApplicationSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple per-event pricing, no subscription. Start free, then upgrade only the events that need more uploads, more guests, and longer storage.",
  alternates: { canonical: "/pricing" },
};

type Plan = {
  name: string;
  blurb: string;
  price: string;
  unit: string;
  cta: string;
  popular?: boolean;
  intro?: string;
  features: { label: string }[];
};

/* Plan facts come from lib/plans.ts so the cards and the JSON-LD offers can't drift.
   The extra bullets below (branding, countdown, print templates) are copy, not facts,
   so they stay written out here.

   The Photo Wall sits in the Free list on purpose: it isn't gated in code, and a wall
   running at an event is what makes guests upload in the first place. Advertising it as
   a Plus feature while shipping it to everyone would be a claim we don't honour. */
const free = planBy("Free");
const plus = planBy("Plus");
const pro = planBy("Pro");

const PLAN_CARDS: Plan[] = [
  {
    name: free.name,
    blurb: free.blurb,
    price: free.priceLabel,
    unit: "no card required",
    cta: "Start free",
    features: [
      { label: `**${free.uploadsLabel}** photo & video uploads` },
      { label: "Up to **10 guests**" },
      { label: `Saved for **${free.retentionLabel}**` },
      { label: "QR code + shareable link" },
      { label: "Live **Photo Wall** slideshow" },
      { label: "Approve uploads before they show" },
      { label: "Download everything as a ZIP" },
    ],
  },
  {
    name: plus.name,
    blurb: plus.blurb,
    price: plus.priceLabel,
    unit: "one-time, per event",
    cta: "Choose Plus",
    intro: "Everything in Free, plus:",
    features: [
      { label: `**${plus.uploadsLabel}** photo & video uploads` },
      { label: "**Unlimited** guests" },
      { label: `Saved for **${plus.retentionLabel}**` },
      { label: "**Custom branding**" },
      { label: "**Countdown** page" },
    ],
  },
  {
    name: pro.name,
    blurb: pro.blurb,
    price: pro.priceLabel,
    unit: "one-time, per event",
    cta: "Choose Pro",
    popular: true,
    intro: "Everything in Plus, plus:",
    features: [
      { label: `**${pro.uploadsLabel}** photo & video uploads` },
      { label: "**Unlimited** guests" },
      { label: `Saved for **${pro.retentionLabel}**` },
      { label: "**Custom event URL**" },
      { label: "**Print templates** (QR cards & signs)" },
      { label: "Full brand control" },
    ],
  },
];

const TRUST = [
  { icon: "🔒", label: "Money-back guarantee" },
  { icon: "🗓️", label: "Buy now, use anytime" },
  { icon: "🇲🇾", label: "Made for Malaysian celebrations" },
];

/** Renders **bold** segments inside a feature label. */
function FeatureText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <b key={i} className="font-bold text-[#2A1B24]">
            {p}
          </b>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      {/* Offers and the cards below both derive from lib/plans.ts, so the markup
          can't claim a price the visitor doesn't see — which would be a policy
          violation, not a typo. */}
      <JsonLd
        schema={graph(
          softwareApplicationSchema,
          breadcrumbSchema([{ name: "Pricing", path: "/pricing" }]),
        )}
      />
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-5 pt-16 pb-4 text-center md:pt-24">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B5654A]">Pricing</p>
        <h1 className="font-serif mt-3 text-5xl font-bold tracking-tight text-[#2A1B24] md:text-6xl">
          Get more from your event
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#7A6570]">
          No subscription — ever. Start every event free, and upgrade only the ones that need more
          uploads, more guests, and longer storage.
        </p>
      </section>

      {/* Trust row */}
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3 px-5 pb-6">
        {TRUST.map((t) => (
          <span
            key={t.label}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold text-[#7A6570]"
          >
            <span>{t.icon}</span>
            {t.label}
          </span>
        ))}
      </div>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid items-start gap-6 lg:grid-cols-3">
          {PLAN_CARDS.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-3xl bg-white p-7 transition ${
                p.popular
                  ? "border-2 border-[#B5654A] shadow-[0_24px_60px_rgba(224,115,79,0.20)] lg:-mt-4 lg:pb-10"
                  : "border border-[#E4D9CF] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(90,50,40,0.10)]"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full btn-grad px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(224,115,79,0.35)]">
                  ★ Most popular
                </span>
              )}

              <h2 className="font-serif text-2xl font-bold text-[#2A1B24]">{p.name}</h2>
              <p className="mt-2 min-h-[44px] text-sm leading-6 text-[#7A6570]">{p.blurb}</p>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-serif text-5xl font-bold text-[#2A1B24]">{p.price}</span>
              </div>
              <p className="mt-1 text-sm text-[#9B8676]">{p.unit}</p>

              <Link
                href="/signup"
                className={`mt-6 inline-flex h-12 items-center justify-center rounded-full text-base font-bold transition ${
                  p.popular
                    ? "md-cta btn-grad text-white"
                    : "border-2 border-[#B5654A] text-[#B5654A] hover:bg-[#F1E4D8]"
                }`}
              >
                {p.cta}
              </Link>

              {p.intro && (
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#B5654A]">
                  {p.intro}
                </p>
              )}
              <ul className={`${p.intro ? "mt-3" : "mt-6"} flex-1 space-y-2.5 text-sm text-[#4A3540]`}>
                {p.features.map((f) => (
                  <li key={f.label} className="flex gap-2.5">
                    <span className="mt-0.5 text-[#B5654A]">✓</span>
                    <span className="leading-6">
                      <FeatureText text={f.label} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-[#7A6570]">
          Every event starts free — upgrade from your dashboard whenever you&apos;re ready. Prices in
          Malaysian Ringgit (MYR), one-time per event.
        </p>

        {/* AI Photobooth — coming-soon add-on. No price yet, no date: don't promise
            what isn't decided. */}
        <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-[#E4D9CF] bg-gradient-to-br from-[#2A1B24] to-[#5A3242] p-8 text-center text-[#FBF3EC]">
          <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">
            Coming soon
          </span>
          <h2 className="font-serif mt-4 text-2xl font-bold md:text-3xl">AI Photobooth add-on</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#FBF3EC]/80">
            Let guests reimagine their photo as a golden-hour portrait, a festive scene, or a
            fairytale poster — faces kept, ready to share. A paid add-on we&apos;re still building.
          </p>

          {/* before → after examples (illustrative AI output from a stock photo) */}
          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-2.5">
            {[
              { src: "/marketing/photobooth-before.jpg", tag: "Photo", original: true },
              { src: "/marketing/photobooth-wedding.jpg", tag: "Golden hour" },
              { src: "/marketing/photobooth-fantasy.jpg", tag: "Fairytale" },
            ].map((s) => (
              <figure key={s.src} className="relative m-0 aspect-square overflow-hidden rounded-xl border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.src}
                  alt={s.original ? "A guest's original photo" : `AI photobooth example — ${s.tag}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <figcaption
                  className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    s.original ? "bg-[#FBF3EC]/90 text-[#2A1B24]" : "bg-[#2A1B24]/70 text-[#FBF3EC]"
                  }`}
                >
                  {s.tag}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-2.5 text-xs text-[#FBF3EC]/50">Illustration — real AI output from one photo.</p>

          <NotifyForm feature="AI Photobooth (pricing)" />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-serif mb-8 text-center text-3xl font-bold tracking-tight">
          Pricing questions
        </h2>
        <Faq items={PRICING_FAQS} />
      </section>

      <SiteFooter />
    </div>
  );
}
