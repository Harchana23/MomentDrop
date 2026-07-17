import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { Faq } from "@/components/marketing";
import { PRICING_FAQS } from "@/lib/faqs";
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

const PLANS: Plan[] = [
  {
    name: "Free",
    blurb: "Try MomentDrop risk-free at your next small gathering.",
    price: "RM0",
    unit: "no card required",
    cta: "Start free",
    features: [
      { label: "**30** photo & video uploads" },
      { label: "Up to **10 guests**" },
      { label: "Saved for **7 days**" },
      { label: "QR code + shareable link" },
      { label: "Approve uploads before they show" },
      { label: "Download everything as a ZIP" },
    ],
  },
  {
    name: "Plus",
    blurb: "Perfect for birthdays, engagements and mid-size events.",
    price: "RM49",
    unit: "one-time, per event",
    cta: "Choose Plus",
    intro: "Everything in Free, plus:",
    features: [
      { label: "**400** photo & video uploads" },
      { label: "**Unlimited** guests" },
      { label: "Saved for **3 months**" },
      { label: "Live **Photo Wall** slideshow" },
      { label: "**Custom branding**" },
      { label: "**Countdown** page" },
    ],
  },
  {
    name: "Pro",
    blurb: "Built for weddings and large, branded celebrations.",
    price: "RM99",
    unit: "one-time, per event",
    cta: "Choose Pro",
    popular: true,
    intro: "Everything in Plus, plus:",
    features: [
      { label: "**1,000** photo & video uploads" },
      { label: "**Unlimited** guests" },
      { label: "Saved for **6 months**" },
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
      {/* Offers mirror the PLANS cards below. Change both together — marking up
          a price the visitor can't see on the page is a policy violation. */}
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
          {PLANS.map((p) => (
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
