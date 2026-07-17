# SEO Content Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `/guides/` cluster of four evergreen guides that answer what a buyer
actually weighs — Google Photos, the WhatsApp group, disposable cameras — plus a
single-source `lib/plans.ts` so plan facts stop being duplicated across the codebase.

**Architecture:** Guide prose is data (`src/lib/guides/*.ts`), rendered by one shared
`GuideLayout` through one dynamic route (`/guides/[slug]`) with `generateStaticParams`
from a registry. The registry also drives the index page and the sitemap, so adding a
guide is one module plus one registry line. Mirrors the existing `LegalPage` and
`UseCaseLayout` patterns.

**Tech Stack:** Next.js 16 App Router (static rendering), React 19, TypeScript,
Tailwind v4, plain CSS in `globals.css` for prose.

**Spec:** `docs/superpowers/specs/2026-07-17-seo-content-guides-design.md`

## Global Constraints

- **Facts come from `lib/plans.ts` only.** Never hard-code a price, upload cap, or
  retention window in guide prose. Exact values: Free RM0 / 30 uploads / 10 guests /
  7 days; Plus RM49 / 400 uploads / unlimited guests / 3 months; Pro RM99 / 1,000
  uploads / unlimited guests / 6 months. One-time per event, MYR, not a subscription.
- **The honesty constraint is load-bearing.** Every comparison guide MUST include a
  "when you should just use X instead" section that concedes real cases. Removing it
  is a design change, not an edit.
- **No FAQPage schema.** Google stopped showing FAQ rich results on 7 May 2026.
- **English only.** No Malay copy, no i18n routing.
- **No `/blog/`.** Not in this plan.
- **No competitor-vs-competitor pages.** Google Photos/WhatsApp/disposable cameras only —
  never "vs Kululu" — because rivals' prices would have to stay accurate forever.
- **Indexing stays gated.** `IS_INDEXABLE` already blocks staging; do not touch it.
- **No new dependencies.**
- **Voice:** plain, warm, Malaysian context, no hype. Match `src/lib/faqs.ts`.

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/plans.ts` | **Create.** Single source of plan names, prices, caps, retention. |
| `src/lib/guides/types.ts` | **Create.** `Guide`, `GuideSection` types. |
| `src/lib/guides/collect-wedding-photos-from-guests.ts` | **Create.** Pillar guide content. |
| `src/lib/guides/google-photos-vs-photo-sharing-app.ts` | **Create.** Comparison guide content. |
| `src/lib/guides/whatsapp-group-wedding-photos.ts` | **Create.** Comparison guide content. |
| `src/lib/guides/qr-code-photo-book-wedding.ts` | **Create.** Comparison guide content. |
| `src/lib/guides/index.ts` | **Create.** `GUIDES` registry + `getGuide(slug)`. |
| `src/components/guide.tsx` | **Create.** `GuideLayout` shell. |
| `src/app/guides/page.tsx` | **Create.** Index page. |
| `src/app/guides/[slug]/page.tsx` | **Create.** Dynamic route. |
| `src/app/globals.css` | **Modify.** Add `.guideprose`, beside `.legalprose`. |
| `src/app/sitemap.ts` | **Modify.** Append registry-derived guide URLs. |
| `src/components/site-chrome.tsx:74-81` | **Modify.** Add "Guides" to the Product column. |
| `src/app/pricing/page.tsx` | **Modify.** Adopt `lib/plans.ts`. |
| `src/lib/seo.tsx` | **Modify.** Adopt `lib/plans.ts` for offers. |

---

### Task 1: Single-source plan facts

Prices/caps live in three places today and guides would make four. Do this first so no
guide is ever written against a hard-coded number.

**Files:**
- Create: `src/lib/plans.ts`
- Modify: `src/lib/seo.tsx` (the `softwareApplicationSchema` offers array)
- Modify: `src/app/pricing/page.tsx` (the `PLANS` array)

**Interfaces:**
- Consumes: nothing.
- Produces: `PLANS: Plan[]`, `planBy(name: PlanName): Plan`, `type PlanName = "Free" | "Plus" | "Pro"`.
  `Plan = { name: PlanName; price: number; priceLabel: string; uploads: number; uploadsLabel: string; guestsLabel: string; retentionLabel: string; blurb: string }`.
  `priceLabel` is `"RM0"`/`"RM49"`/`"RM99"`; `uploadsLabel` is `"30"`/`"400"`/`"1,000"`;
  `retentionLabel` is `"7 days"`/`"3 months"`/`"6 months"`.

- [ ] **Step 1: Create the constant**

```ts
// src/lib/plans.ts
/**
 * The single source of truth for plan facts.
 *
 * These numbers appear on /pricing, in the JSON-LD offers, in the chatbot's
 * knowledge base, and in the guides. They drifted apart once already. Anything
 * that states a price, an upload cap, or a retention window imports from here.
 *
 * Marking up a price the visitor cannot see on the page is a Google policy
 * violation, so /pricing and lib/seo.tsx in particular must never disagree.
 */
export type PlanName = "Free" | "Plus" | "Pro";

export type Plan = {
  name: PlanName;
  /** Numeric price in MYR, for schema markup. */
  price: number;
  /** Display price, e.g. "RM49". */
  priceLabel: string;
  uploads: number;
  /** Display uploads, e.g. "1,000". */
  uploadsLabel: string;
  guestsLabel: string;
  retentionLabel: string;
  blurb: string;
};

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: 0,
    priceLabel: "RM0",
    uploads: 30,
    uploadsLabel: "30",
    guestsLabel: "up to 10 guests",
    retentionLabel: "7 days",
    blurb: "Try MomentDrop risk-free at your next small gathering.",
  },
  {
    name: "Plus",
    price: 49,
    priceLabel: "RM49",
    uploads: 400,
    uploadsLabel: "400",
    guestsLabel: "unlimited guests",
    retentionLabel: "3 months",
    blurb: "Perfect for birthdays, engagements and mid-size events.",
  },
  {
    name: "Pro",
    price: 99,
    priceLabel: "RM99",
    uploads: 1000,
    uploadsLabel: "1,000",
    guestsLabel: "unlimited guests",
    retentionLabel: "6 months",
    blurb: "Built for weddings and large, branded celebrations.",
  },
];

export const planBy = (name: PlanName): Plan => {
  const plan = PLANS.find((p) => p.name === name);
  if (!plan) throw new Error(`Unknown plan: ${name}`);
  return plan;
};
```

- [ ] **Step 2: Point the JSON-LD offers at it**

In `src/lib/seo.tsx`, add the import and replace the hard-coded offers array inside
`softwareApplicationSchema`:

```ts
import { PLANS } from "@/lib/plans";
```

```ts
  offers: PLANS.map((p) => ({
    "@type": "Offer",
    name: p.name,
    price: String(p.price),
    priceCurrency: "MYR",
    description: `${p.uploadsLabel} uploads, ${p.guestsLabel}, saved for ${p.retentionLabel}.`,
    url: abs("/pricing"),
    availability: "https://schema.org/InStock",
  })),
```

- [ ] **Step 3: Point the pricing cards at it**

In `src/app/pricing/page.tsx`, import `planBy` and replace each card's literal `price`,
`blurb`, and the three fact bullets. Keep the hand-written feature bullets (Photo Wall,
branding, print templates) as they are — they aren't plan *facts*, they're copy.

```ts
import { planBy } from "@/lib/plans";
```

For the Free card:

```ts
  {
    name: "Free",
    blurb: planBy("Free").blurb,
    price: planBy("Free").priceLabel,
    unit: "no card required",
    cta: "Start free",
    features: [
      { label: `**${planBy("Free").uploadsLabel}** photo & video uploads` },
      { label: `Up to **10 guests**` },
      { label: `Saved for **${planBy("Free").retentionLabel}**` },
      { label: "QR code + shareable link" },
      { label: "Approve uploads before they show" },
      { label: "Download everything as a ZIP" },
    ],
  },
```

Apply the same substitution to Plus and Pro, using `planBy("Plus")` / `planBy("Pro")`
and `Unlimited` guests for both.

- [ ] **Step 4: Verify nothing moved**

```bash
npx tsc --noEmit
NEXT_PUBLIC_SITE_URL="https://momentdrop.com" pnpm build
```

Expected: both clean.

- [ ] **Step 5: Assert markup still matches the visible page**

```bash
(pnpm start --port 3131 >/dev/null 2>&1 &) ; sleep 6
curl -s http://localhost:3131/pricing | grep -oE 'RM0|RM49|RM99' | sort -u
curl -s http://localhost:3131/pricing | grep -o '"price":"[0-9]*"' | sort -u
npx --yes kill-port 3131
```

Expected: `RM0 RM49 RM99` visible, and `"price":"0"`, `"price":"49"`, `"price":"99"` in
the JSON-LD. They must correspond. If they don't, stop — that's the policy violation.

- [ ] **Step 6: Commit**

```bash
git add src/lib/plans.ts src/lib/seo.tsx src/app/pricing/page.tsx
git commit -m "Single-source plan prices and limits in lib/plans.ts"
```

---

### Task 2: Guide types, registry, and layout

Ship the shell with one placeholder-free guide stub so the route is provably working
before four long prose files land on top of it.

**Files:**
- Create: `src/lib/guides/types.ts`, `src/lib/guides/index.ts`, `src/components/guide.tsx`
- Create: `src/app/guides/page.tsx`, `src/app/guides/[slug]/page.tsx`
- Modify: `src/app/globals.css` (append `.guideprose`)
- Modify: `src/app/sitemap.ts`
- Modify: `src/components/site-chrome.tsx` (Product column)

**Interfaces:**
- Consumes: `PLANS`, `planBy` from Task 1; `breadcrumbSchema`, `graph`, `JsonLd` from `@/lib/seo`.
- Produces: `type Guide`, `type GuideSection`, `GUIDES: Guide[]`, `getGuide(slug: string): Guide | undefined`,
  and `GuideLayout({ guide }: { guide: Guide })`. Task 3 writes `Guide` objects against these exact types.

- [ ] **Step 1: Define the content types**

```ts
// src/lib/guides/types.ts
/**
 * A guide is data, not JSX, so prose can be edited without touching layout
 * and the registry can drive the index page and sitemap.
 */
export type GuideSection = {
  /** Rendered as <h2>. Also the anchor text in the on-page contents. */
  heading: string;
  /** Each string is one <p>. Markdown-ish is NOT parsed — keep prose plain. */
  body: string[];
  /** Optional bullets rendered under the body. */
  bullets?: string[];
};

export type Guide = {
  slug: string;
  /** <h1> and <title>. */
  title: string;
  /** Meta description. Aim for 140-160 chars. */
  description: string;
  /** ISO date, e.g. "2026-07-17". Rendered as "Last updated". */
  updated: string;
  /** Standfirst under the h1. One or two sentences. */
  intro: string;
  sections: GuideSection[];
  /** Slugs of sibling guides to cross-link. */
  related: string[];
};
```

- [ ] **Step 2: Create the registry with one real stub**

```ts
// src/lib/guides/index.ts
import type { Guide } from "./types";
import { collectWeddingPhotos } from "./collect-wedding-photos-from-guests";

/**
 * Every guide, in the order shown on /guides. The sitemap and the index page
 * both derive from this — adding a guide is one module plus one line here.
 */
export const GUIDES: Guide[] = [collectWeddingPhotos];

export const getGuide = (slug: string): Guide | undefined =>
  GUIDES.find((g) => g.slug === slug);

export type { Guide, GuideSection } from "./types";
```

- [ ] **Step 3: Create the pillar stub so the registry compiles**

Real prose lands in Task 3. This stub is a complete, valid `Guide` — not a placeholder.

```ts
// src/lib/guides/collect-wedding-photos-from-guests.ts
import type { Guide } from "./types";

export const collectWeddingPhotos: Guide = {
  slug: "collect-wedding-photos-from-guests",
  title: "How to collect photos from your wedding guests",
  description:
    "Every way to collect your guests' wedding photos in Malaysia — QR codes, Google Photos, WhatsApp groups and disposable cameras — and how to pick between them.",
  updated: "2026-07-17",
  intro:
    "Your photographer captures the day you planned. Your guests capture the day that actually happened. Here is how to get their photos without chasing anyone.",
  sections: [
    {
      heading: "Why guest photos go missing",
      body: [
        "Everyone at your wedding is holding a camera, and almost none of those photos reach you.",
      ],
    },
  ],
  related: [],
};
```

- [ ] **Step 4: Add the prose styles**

Append to `src/app/globals.css`, directly after the `.legalprose` block:

```css
/* ── Guide pages prose ──────────────────────────────────────── */
.guideprose { color: #4A3540; font-size: 16.5px; line-height: 1.75; }
.guideprose h2 { font-family: var(--font-grotesk), "Space Grotesk", sans-serif; font-size: 26px; font-weight: 700; color: #2A1B24; letter-spacing: -0.01em; margin: 48px 0 14px; }
.guideprose h2:first-child { margin-top: 0; }
.guideprose p { margin: 0 0 16px; }
.guideprose ul { margin: 0 0 18px; padding-left: 20px; list-style: disc; }
.guideprose li { margin: 0 0 8px; }
.guideprose a { color: #B5654A; font-weight: 600; }
.guideprose a:hover { color: #8F4A34; }
.guideprose strong { color: #2A1B24; font-weight: 700; }
```

- [ ] **Step 5: Build the shared layout**

```tsx
// src/components/guide.tsx
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { JsonLd, graph, breadcrumbSchema } from "@/lib/seo";
import { getGuide, type Guide } from "@/lib/guides";

/** Shared shell for /guides/[slug]. Mirrors LegalPage. */
export function GuideLayout({ guide }: { guide: Guide }) {
  const related = guide.related.map(getGuide).filter((g): g is Guide => Boolean(g));
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <JsonLd
        schema={graph(
          breadcrumbSchema([
            { name: "Guides", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]),
        )}
      />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 pb-8 pt-16">
        <nav aria-label="Breadcrumb" className="text-sm text-[#7A6570]">
          <Link href="/guides" className="font-semibold text-[#B5654A] hover:underline">
            Guides
          </Link>
        </nav>
        <h1 className="font-serif mt-3 text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl">
          {guide.title}
        </h1>
        <p className="mt-3 text-sm text-[#7A6570]">
          Last updated:{" "}
          {new Date(guide.updated).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-6 text-lg leading-8 text-[#4A3540]">{guide.intro}</p>

        <div className="guideprose mt-12">
          {guide.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {s.bullets ? (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {related.length ? (
          <aside className="mt-16 rounded-2xl glass p-6">
            <h2 className="text-lg font-bold">Keep reading</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/guides/${r.slug}`} className="font-semibold text-[#B5654A] hover:underline">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-full btn-grad px-7 text-base font-bold text-white"
          >
            Create your event — free
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 6: Build the index page**

```tsx
// src/app/guides/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { JsonLd, graph, breadcrumbSchema } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides to collecting photos and videos from your guests — QR codes, Google Photos, WhatsApp groups, and what actually works at a Malaysian celebration.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen bg-[#F4ECE3] text-[#2A1B24]">
      <JsonLd schema={graph(breadcrumbSchema([{ name: "Guides", path: "/guides" }]))} />
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-5 pt-16 text-center md:pt-24">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#B5654A]">Guides</p>
        <h1 className="font-serif mt-3 text-5xl font-bold tracking-tight md:text-6xl">
          Getting every photo
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#7A6570]">
          Honest guides to collecting your guests&apos; photos — including when a free
          Google Photos album is the better answer.
        </p>
      </section>
      <section className="mx-auto max-w-3xl px-5 py-14">
        <ul className="space-y-4">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/${g.slug}`}
                className="block rounded-2xl glass p-6 transition hover:-translate-y-0.5"
              >
                <h2 className="font-serif text-xl font-bold text-[#2A1B24]">{g.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#7A6570]">{g.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 7: Build the dynamic route**

```tsx
// src/app/guides/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideLayout } from "@/components/guide";
import { GUIDES, getGuide } from "@/lib/guides";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  return <GuideLayout guide={guide} />;
}
```

- [ ] **Step 8: Add guides to the sitemap**

In `src/app/sitemap.ts`, add the import and append the guide URLs. Insert `/guides`
into `ROUTES` after the `/faq` entry:

```ts
import { GUIDES } from "@/lib/guides";
```

```ts
  { path: "/guides", priority: 0.7, changeFrequency: "monthly" },
```

Then change the return so guide pages are appended from the registry:

```ts
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
  // Derived from the registry so a new guide is listed without touching this file.
  const guideRoutes = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...guideRoutes];
}
```

- [ ] **Step 9: Link guides from the footer**

In `src/components/site-chrome.tsx`, add to the Product column's `links` array, after
`["How it works", "/how-it-works"]`:

```ts
      ["Guides", "/guides"],
```

- [ ] **Step 10: Verify the route works end to end**

```bash
npx tsc --noEmit
NEXT_PUBLIC_SITE_URL="https://momentdrop.com" pnpm build
(pnpm start --port 3132 >/dev/null 2>&1 &) ; sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3132/guides
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3132/guides/collect-wedding-photos-from-guests
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3132/guides/does-not-exist
curl -s http://localhost:3132/sitemap.xml | grep -c "/guides"
npx --yes kill-port 3132
```

Expected: `200`, `200`, `404`, and `2` sitemap entries (`/guides` + the one guide).

- [ ] **Step 11: Commit**

```bash
git add src/lib/guides src/components/guide.tsx src/app/guides src/app/globals.css src/app/sitemap.ts src/components/site-chrome.tsx
git commit -m "Add /guides route, registry, and shared layout"
```

---

### Task 3: Write the pillar guide

**Files:**
- Modify: `src/lib/guides/collect-wedding-photos-from-guests.ts` (replace the stub's `sections` and `related`)

**Interfaces:**
- Consumes: `Guide` from `./types`, `planBy` from `@/lib/plans`.
- Produces: nothing new — fills in the existing export.

- [ ] **Step 1: Write the full guide**

Replace the file's `sections` and `related`. Import `planBy` and use it for every number.
Target ~1,100–1,400 words. Required sections, in order:

1. `"Why guest photos go missing"` — the WhatsApp-group failure everyone recognises.
2. `"Your four options"` — QR upload page, Google Photos album, WhatsApp group,
   disposable cameras. Fair one-paragraph summary of each.
3. `"How to choose"` — decision guidance by guest count and how much you care.
   **Must concede:** under ~20 guests and a handful of photos, a free shared album is
   genuinely the right call.
4. `"Setting up a QR upload page"` — the practical steps: create event, print the QR,
   put it on tables, decide on approval, download the ZIP.
5. `"What it costs"` — from `planBy`. State plainly that every event starts free and
   upgrades are one-time per event, not a subscription.
6. `"After the day"` — download before the retention window closes; the ZIP is
   foldered by guest and yours permanently once downloaded.

Set `related` to the other three slugs:

```ts
  related: [
    "google-photos-vs-photo-sharing-app",
    "whatsapp-group-wedding-photos",
    "qr-code-photo-book-wedding",
  ],
```

Numbers must come from `planBy`, e.g.:

```ts
import { planBy } from "@/lib/plans";

const pro = planBy("Pro");
// ...
      body: [
        `Pro covers ${pro.uploadsLabel} photos and videos from ${pro.guestsLabel}, kept for ${pro.retentionLabel}, at ${pro.priceLabel} one-time for that event.`,
      ],
```

- [ ] **Step 2: Verify no hard-coded facts crept in**

```bash
grep -nE "RM[0-9]|1,000 |400 uploads|30 uploads|7 days|3 months|6 months" src/lib/guides/collect-wedding-photos-from-guests.ts
```

Expected: no output. Every occurrence must come through `planBy`. If a line prints, fix it.

- [ ] **Step 3: Verify it renders**

```bash
npx tsc --noEmit
NEXT_PUBLIC_SITE_URL="https://momentdrop.com" pnpm build
(pnpm start --port 3133 >/dev/null 2>&1 &) ; sleep 6
curl -s http://localhost:3133/guides/collect-wedding-photos-from-guests | grep -c "<h2"
curl -s http://localhost:3133/guides/collect-wedding-photos-from-guests | grep -oE "RM0|RM49|RM99" | sort -u
npx --yes kill-port 3133
```

Expected: `6` headings, and the RM figures present (proving `planBy` resolved).

- [ ] **Step 4: Commit**

```bash
git add src/lib/guides/collect-wedding-photos-from-guests.ts
git commit -m "Write the pillar guide: collecting photos from wedding guests"
```

---

### Task 4: Write the Google Photos comparison

The highest-intent page in the cluster. This is the reader asking "why pay?".

**Files:**
- Create: `src/lib/guides/google-photos-vs-photo-sharing-app.ts`
- Modify: `src/lib/guides/index.ts` (register it)

**Interfaces:**
- Consumes: `Guide`, `planBy`.
- Produces: `export const googlePhotosVs: Guide`.

- [ ] **Step 1: Write the guide**

```ts
// src/lib/guides/google-photos-vs-photo-sharing-app.ts
import type { Guide } from "./types";

export const googlePhotosVs: Guide = {
  slug: "google-photos-vs-photo-sharing-app",
  title: "Google Photos vs a photo-sharing app for your wedding",
  description:
    "A shared Google Photos album is free. So when is a paid photo-sharing app actually worth it for a wedding? An honest comparison, including when to just use the free album.",
  updated: "2026-07-17",
  intro:
    "You can make a shared Google Photos album, turn the link into a QR code, and put it on the tables — for free, in about ten minutes. Here is when that is the right answer, and when it quietly falls apart.",
  sections: [ /* per the required outline below */ ],
  related: ["collect-wedding-photos-from-guests", "whatsapp-group-wedding-photos"],
};
```

Fill `sections` with, in order, ~1,000–1,300 words total:

1. `"The free version, honestly"` — describe the DIY setup fairly and completely. No
   strawman: it genuinely works.
2. `"When you should just use Google Photos"` — **required, and it must concede real
   ground.** Small guest counts; guests who already have Google accounts; you don't
   mind a public-ish link; nobody needs moderating. Say plainly: use the free album.
3. `"Where it breaks at a wedding"` — the honest failure modes: anyone with the link can
   *delete* others' photos; no way to cap one guest flooding it; no approval before
   photos appear; guests without Google accounts hit sign-in friction; downloads come
   out as one undifferentiated dump, not foldered by who took what.
4. `"What you're paying for"` — map each break to the feature that fixes it: per-guest
   caps, approval, no-account uploads, ZIP by guest. Use `planBy` for prices.
5. `"The short version"` — 2–3 sentences. Small and casual: free album. A wedding you
   only get once: pay.

- [ ] **Step 2: Register it**

In `src/lib/guides/index.ts`:

```ts
import { googlePhotosVs } from "./google-photos-vs-photo-sharing-app";
```

```ts
export const GUIDES: Guide[] = [collectWeddingPhotos, googlePhotosVs];
```

- [ ] **Step 3: Verify the honesty section exists**

```bash
grep -c "When you should just use Google Photos" src/lib/guides/google-photos-vs-photo-sharing-app.ts
```

Expected: `1`. If `0`, the page violates the spec's honesty constraint — do not commit.

- [ ] **Step 4: Verify no hard-coded facts**

```bash
grep -nE "RM[0-9]|1,000 |400 uploads|30 uploads|7 days|3 months|6 months" src/lib/guides/google-photos-vs-photo-sharing-app.ts
```

Expected: no output.

- [ ] **Step 5: Verify it renders**

```bash
npx tsc --noEmit
NEXT_PUBLIC_SITE_URL="https://momentdrop.com" pnpm build
(pnpm start --port 3134 >/dev/null 2>&1 &) ; sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3134/guides/google-photos-vs-photo-sharing-app
curl -s http://localhost:3134/sitemap.xml | grep -c "/guides"
npx --yes kill-port 3134
```

Expected: `200`, and `3` sitemap entries.

- [ ] **Step 6: Commit**

```bash
git add src/lib/guides/google-photos-vs-photo-sharing-app.ts src/lib/guides/index.ts
git commit -m "Write the Google Photos comparison guide"
```

---

### Task 5: Write the WhatsApp group guide

**Files:**
- Create: `src/lib/guides/whatsapp-group-wedding-photos.ts`
- Modify: `src/lib/guides/index.ts`

**Interfaces:**
- Consumes: `Guide`, `planBy`.
- Produces: `export const whatsappGroup: Guide`.

- [ ] **Step 1: Write the guide**

Slug `whatsapp-group-wedding-photos`. Title: `"Collecting wedding photos in a WhatsApp group: what goes wrong"`.
~900–1,200 words. Required sections:

1. `"Why everyone does this"` — it's free, everyone already has it, zero setup. Fair.
2. `"When a WhatsApp group is fine"` — **required concession.** Ten people, one
   afternoon, nobody printing anything: use the group.
3. `"What goes wrong at a wedding"` — the honest, specific ones: WhatsApp compresses
   photos so what you keep is smaller than what was shot; videos hit the size cap;
   messages and photos interleave so photos scroll away; you cannot tell who sent what
   after the fact; saving 300 photos means saving them one by one or letting auto-save
   flood your camera roll with memes.
4. `"The compression thing, specifically"` — this is the argument that lands. What
   arrives is not the original file. If you might print an enlargement, that matters.
   Be accurate: do not overstate the numbers, just say it re-encodes and the original
   resolution is not what you receive.
5. `"A QR page instead"` — originals, foldered by guest, approval, one ZIP. `planBy`
   for cost.

Set `related: ["collect-wedding-photos-from-guests", "google-photos-vs-photo-sharing-app"]`.

- [ ] **Step 2: Register it**

```ts
import { whatsappGroup } from "./whatsapp-group-wedding-photos";
```

```ts
export const GUIDES: Guide[] = [collectWeddingPhotos, googlePhotosVs, whatsappGroup];
```

- [ ] **Step 3: Verify the concession and facts**

```bash
grep -c "When a WhatsApp group is fine" src/lib/guides/whatsapp-group-wedding-photos.ts
grep -nE "RM[0-9]|1,000 |400 uploads|30 uploads|7 days|3 months|6 months" src/lib/guides/whatsapp-group-wedding-photos.ts
```

Expected: `1`, then no output.

- [ ] **Step 4: Verify it renders**

```bash
npx tsc --noEmit
NEXT_PUBLIC_SITE_URL="https://momentdrop.com" pnpm build
(pnpm start --port 3135 >/dev/null 2>&1 &) ; sleep 6
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3135/guides/whatsapp-group-wedding-photos
npx --yes kill-port 3135
```

Expected: `200`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/guides/whatsapp-group-wedding-photos.ts src/lib/guides/index.ts
git commit -m "Write the WhatsApp group guide"
```

---

### Task 6: Write the QR photo book guide, and cross-link the cluster

**Files:**
- Create: `src/lib/guides/qr-code-photo-book-wedding.ts`
- Modify: `src/lib/guides/index.ts`
- Modify: `src/lib/guides/collect-wedding-photos-from-guests.ts` (nothing — `related` already set in Task 3)

**Interfaces:**
- Consumes: `Guide`, `planBy`.
- Produces: `export const qrPhotoBook: Guide`.

- [ ] **Step 1: Write the guide**

Slug `qr-code-photo-book-wedding`. Title: `"QR photo books: the disposable camera replacement"`.
~900–1,200 words. This targets the Malaysian "buku foto QR / kamera pakai buang" framing —
write in English but use that framing, since it's how the trend is described locally.
Required sections:

1. `"What replaced the disposable camera"` — the table-camera tradition and why it faded:
   cost per camera, developing, and most shots unusable.
2. `"What a QR photo book actually is"` — a QR on the table pointing at an upload page.
   Demystify it.
3. `"When a disposable camera is still nicer"` — **required concession.** They are a
   physical keepsake and a talking point; the grain is the aesthetic; guests without
   smartphones can use them. If you want the object, buy the camera.
4. `"Making the QR card"` — practical: what to put on the card besides the code, where
   to place it, how many. Note Pro includes print templates via `planBy("Pro")`.
5. `"What you get at the end"` — one ZIP, foldered by guest, versus a shoebox of
   negatives.

Set `related: ["collect-wedding-photos-from-guests", "google-photos-vs-photo-sharing-app"]`.

- [ ] **Step 2: Register it**

```ts
import { qrPhotoBook } from "./qr-code-photo-book-wedding";
```

```ts
export const GUIDES: Guide[] = [collectWeddingPhotos, googlePhotosVs, whatsappGroup, qrPhotoBook];
```

- [ ] **Step 3: Verify the concession and facts**

```bash
grep -c "When a disposable camera is still nicer" src/lib/guides/qr-code-photo-book-wedding.ts
grep -nE "RM[0-9]|1,000 |400 uploads|30 uploads|7 days|3 months|6 months" src/lib/guides/qr-code-photo-book-wedding.ts
```

Expected: `1`, then no output.

- [ ] **Step 4: Verify the whole cluster**

```bash
npx tsc --noEmit
NEXT_PUBLIC_SITE_URL="https://momentdrop.com" pnpm build
(pnpm start --port 3136 >/dev/null 2>&1 &) ; sleep 6
for s in collect-wedding-photos-from-guests google-photos-vs-photo-sharing-app whatsapp-group-wedding-photos qr-code-photo-book-wedding; do
  printf "%-42s " "$s"
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3136/guides/$s"
done
curl -s http://localhost:3136/sitemap.xml | grep -c "/guides"
curl -s http://localhost:3136/guides | grep -c "guides/"
npx --yes kill-port 3136
```

Expected: four `200`s; `5` sitemap entries (`/guides` + 4); the index links all four.

- [ ] **Step 5: Commit**

```bash
git add src/lib/guides/qr-code-photo-book-wedding.ts src/lib/guides/index.ts
git commit -m "Write the QR photo book guide and complete the cluster"
```

---

### Task 7: Verify in a browser and merge

**Files:** none — verification only.

- [ ] **Step 1: Check rendering and mobile overflow**

Start the prod server on port 3137, then with Playwright load
`/guides/google-photos-vs-photo-sharing-app` and evaluate:

```js
() => {
  const nodes = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .flatMap(b => JSON.parse(b.textContent)['@graph'] || []);
  return {
    types: nodes.map(n => n['@type']),
    breadcrumb: nodes.find(n => n['@type'] === 'BreadcrumbList')?.itemListElement.map(i => i.name),
    h1: document.querySelector('h1')?.textContent,
    h2Count: document.querySelectorAll('.guideprose h2').length,
    canonical: document.querySelector('link[rel=canonical]')?.href,
    words: document.querySelector('.guideprose')?.innerText.split(/\s+/).length,
  };
}
```

Expected: `Organization, WebSite, BreadcrumbList`; breadcrumb `["Home","Guides",<title>]`;
`h2Count` 5; `words` > 800. Then resize to 375px and confirm
`document.documentElement.scrollWidth <= window.innerWidth`.

- [ ] **Step 2: Confirm staging stays blocked**

```bash
NEXT_PUBLIC_SITE_URL="https://moment-drop.vercel.app" pnpm build >/dev/null 2>&1
(pnpm start --port 3138 >/dev/null 2>&1 &) ; sleep 6
curl -s http://localhost:3138/robots.txt
npx --yes kill-port 3138
```

Expected: `Disallow: /`. The guides must not become indexable ahead of the domain.

- [ ] **Step 3: Merge and push**

```bash
git checkout main
git merge --no-ff saas-mvp -m "Merge saas-mvp: /guides SEO content cluster"
git diff --stat saas-mvp   # must be empty
git push origin main
git checkout saas-mvp
git push origin saas-mvp
```

---

## Self-Review

**Spec coverage:**

| Spec requirement | Task |
|---|---|
| `/guides` index | 2 |
| 4 guide pages | 3, 4, 5, 6 |
| Content as data in `src/lib/guides/*` | 2, 3–6 |
| Registry drives index + sitemap | 2 |
| `GuideLayout` shared shell | 2 |
| `.guideprose` in globals.css | 2 |
| `lib/plans.ts` single-sourcing, adopted by the existing three | 1 |
| BreadcrumbList per guide | 2 |
| Canonical per guide | 2 |
| Internal links (cluster ↔ pillar) | 3–6 (`related`) |
| Footer "Guides" link | 2 |
| Honesty constraint | 4, 5, 6 (grep-asserted) |
| No FAQPage schema | Global constraint; no task adds it |
| Indexing gate untouched | 7 Step 2 |
| Testing: tsc/build/render/prices/overflow | every task; 7 |

Gap found and closed: `knowledge.ts` is named in the spec as one of the three places
facts live, but Task 1 only converts `pricing/page.tsx` and `seo.tsx`. That is deliberate
— `knowledge.ts` is a prose prompt string, not structured data, so importing constants
into it would mean templating the whole document for little gain. It stays hand-maintained
and is called out in `plans.ts`'s doc comment as a place to update by hand. Recorded here
rather than silently skipped.

**Placeholder scan:** No TBD/TODO. Task 3–6 prose is specified by required section
headings, word counts, and required concessions rather than full text — the actual
sentences are the deliverable, and pre-writing 4,500 words of prose inside the plan
would just move the work, not define it. Every code step shows complete code.

**Type consistency:** `Guide`/`GuideSection` defined once in Task 2 Step 1 and used
unchanged in 3–6. `planBy`/`PlanName`/`Plan` defined in Task 1 and used unchanged after.
Registry export name `GUIDES` and lookup `getGuide` consistent across Tasks 2–6 and
`sitemap.ts`. Guide export consts (`collectWeddingPhotos`, `googlePhotosVs`,
`whatsappGroup`, `qrPhotoBook`) match their imports in `index.ts`.
