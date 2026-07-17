# MomentDrop SEO content: `/guides/` — design

Date: 2026-07-17
Status: approved (pending spec review)

## Why

MomentDrop has four thin marketing pages and no content that answers what a buyer
actually asks before paying. Search Console isn't live, the domain isn't bought, and
the site is deliberately `noindex` until it is — so this is the work that can be done
now and lose nothing.

The research that shaped this: a Malaysian wedding portal article,
["Buku Foto QR Majlis Kahwin: Trend Ganti Kamera Pakai Buang"](https://www.portalkahwin.com/berita/buku-foto-qr-majlis-kahwin-trend-ganti-kamera-pakai-buang/),
covers exactly this category and tells couples to DIY it with a Google Photos album, a
free QR generator, and a Canva card. It names Kululu and Wedbox. It does not name us.

**The competitor is not Kululu. It is Google Photos, the WhatsApp group, and disposable
cameras.** The query that converts is not "best wedding photo app" — it is *"why pay
RM99 when a Google Photos QR is free?"* Nobody answers that honestly, which is the gap.

## Approach: comparison-led cluster

Rejected: standalone guides (no reinforcement, head-on with incumbents) and a classic
pillar+cluster on generic terms (Kululu and Guestpix have years of authority there).

Chosen: a pillar guide plus a cluster aimed at the real alternatives. Lower competition
because incumbents avoid these queries, higher intent because the reader is mid-decision,
and it plays to genuine product strengths (per-guest caps, approval, ZIP foldered by guest).

### Pages

| Route | Query it answers |
|---|---|
| `/guides` | index — lists the guides |
| `/guides/collect-wedding-photos-from-guests` | pillar: the whole how-to, Malaysian context |
| `/guides/google-photos-vs-photo-sharing-app` | "why not just use Google Photos?" |
| `/guides/whatsapp-group-wedding-photos` | the incumbent habit, and where it breaks |
| `/guides/qr-code-photo-book-wedding` | "buku foto QR" / disposable-camera replacement |

### Non-goals

- **No `/blog/`.** Guides are evergreen and edited in place; a blog is dated, expects a
  cadence, and rots when unfed. `/blog/` can be added beside `/guides/` later with no
  rework, for things that are genuinely news.
- **No Malay.** English only, per decision — that's where the commercial intent is.
  Malay is a later, separate call (needs hreflang and translation upkeep).
- **No FAQPage schema.** Google stopped showing FAQ rich results on 7 May 2026.
- **No competitor-vs-competitor pages** (e.g. "MomentDrop vs Kululu"). They demand we
  keep rivals' prices accurate forever or we are publishing misleading claims.

## The honesty constraint

This is the design's load-bearing decision, not a nicety.

Each comparison page **must state plainly where the free option wins.** A Google Photos
album genuinely is the right answer for a 15-person birthday. A WhatsApp group is fine
for ten photos. Saying so is what makes the page trustworthy enough to sell the RM99
wedding — and content that pretends otherwise reads as an ad and ranks like one.

Concretely, every comparison page carries a "When you should just use X instead" section
that gives away real business. That section is the point.

## Architecture

Follow existing patterns. Nothing new invented.

- **Content lives in `src/lib/guides/*.ts`**, one module per guide, exporting a typed
  `Guide` object (slug, title, description, updated, intro, sections, related). Prose is
  data, not JSX, so a guide can be edited without touching layout.
- **`src/lib/guides/index.ts`** exports the registry (`GUIDES`) and a `getGuide(slug)`
  lookup. Sitemap and the index page derive from the registry — adding a guide means
  adding one module and one registry line, and the sitemap follows automatically.
- **`src/components/guide.tsx`** — `GuideLayout`, the shared shell: header, prose body,
  "related guides", CTA. Mirrors `LegalPage` / `UseCaseLayout`.
- **`src/app/guides/page.tsx`** — the index.
- **`src/app/guides/[slug]/page.tsx`** — one dynamic route, `generateStaticParams` from
  the registry, `generateMetadata` per guide. Statically rendered like the rest of the site.
- **`.guideprose` in `globals.css`**, alongside `.legalprose`.

### Facts must stay single-sourced

Guides state limits and prices (30/400/1,000 uploads; 7 days / 3 months / 6 months;
RM0/49/99). Those already exist in three places that must agree: the plan cards in
`pricing/page.tsx`, the offers in `lib/seo.tsx`, and `lib/chat/knowledge.ts`.

Guides must not become a fourth. Where a guide needs a number, it imports from a single
`src/lib/plans.ts` constant — introduced by this work and adopted by the existing three —
so a price change is one edit. This is a targeted fix to a real problem the guides would
otherwise multiply, not unrelated refactoring.

### SEO

- `BreadcrumbList` per guide (Home → Guides → this guide) via the existing
  `breadcrumbSchema`.
- Canonical per guide.
- Registry-driven `sitemap.ts` entries.
- Internal links: each guide → the pillar, the pillar → each guide, all → `/use-cases/wedding`
  and `/pricing`.
- Footer gains a "Guides" link under Product.
- Indexing stays governed by the existing `IS_INDEXABLE` gate — these ship blocked until
  the real domain lands, by design.

## Testing

No test framework exists in this repo, so verification is the loop already used all
session, not new infrastructure:

1. `npx tsc --noEmit` and `pnpm build` clean.
2. Every guide renders; `/guides` lists all four; sitemap contains all five new URLs.
3. Breadcrumbs and canonicals resolve per guide; JSON-LD parses.
4. Prices rendered in guides match `/pricing`'s visible cards (the assertion already run
   against the live pricing markup).
5. No page-level overflow at 375px.

## Risks

- **Volume.** Four guides is a lot of prose. Each must earn its page or it's thin content,
  which is worse than no page. If one can't be written honestly and usefully, drop it.
- **Drift.** Mitigated by `src/lib/plans.ts`.
- **Tone.** The honesty constraint is easy to erode under a later "make it convert better"
  edit. It's recorded here as a design decision so that erosion is a visible choice.
