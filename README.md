# MomentDrop

Event hosts collect every guest's photos and videos with one QR scan — guests upload
from any phone browser, with no app and no account. The host gets a private album and
downloads the lot as a single ZIP.

Multi-tenant SaaS, priced one-time per event, built for Malaysian celebrations.
**Private and proprietary — not open source.**

> This file covers getting the app running. The full handover — architecture,
> third-party accounts, and runbook — is kept **outside this repo** and shared
> directly; ask Harchana for it.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 |
| Auth & database | Supabase (Postgres + RLS) |
| Media storage | Google Drive (OAuth refresh token, resumable uploads) |
| Payments | Stripe Checkout (MYR, **test mode**) |
| Chatbot | Google Gemini (`gemini-2.5-flash`) |
| Hosting | Vercel |

## Run locally

```bash
pnpm install
cp /path/to/your/.env.local .env.local   # never commit this file
pnpm dev
```

Then open http://localhost:3000.

`.env.local` is gitignored and holds live secrets — **never commit it**. Ask Harchana for
the values; the variables it must define are:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (**server-only**) |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode for now) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `GDRIVE_CLIENT_ID` / `GDRIVE_CLIENT_SECRET` | Google OAuth app for Drive |
| `GDRIVE_REFRESH_TOKEN` | Long-lived Drive access (**server-only**) |
| `GDRIVE_ROOT_FOLDER_ID` | Drive folder holding all event uploads |
| `MAKE_CONTACT_WEBHOOK_URL` | Make.com webhook behind the contact form |
| `GEMINI_API_KEY` | Gemini key powering the chat widget (**server-only**) |
| `NEXT_PUBLIC_SITE_URL` | Public origin, no trailing slash. Feeds canonical URLs, `sitemap.xml`, `robots.txt`, OG images, and JSON-LD. See the gotcha below |

Only the three `NEXT_PUBLIC_*` values reach the browser. The rest are read server-side
only — the chat widget talks to `/api/chat`, never to Gemini directly.

```bash
pnpm build     # production build
pnpm start     # serve the production build
pnpm lint      # eslint
npx tsc --noEmit   # typecheck
```

## Where things live

```
src/
  app/
    page.tsx + immersive-home.tsx   marketing homepage
    (app)/dashboard/                host dashboard (signed in)
    (auth)/{login,signup}/          auth screens
    e/[slug]/                       guest upload page — one per event, public
    api/                            upload signing, Stripe, chat, contact
    {pricing,faq,how-it-works,...}  marketing pages
    sitemap.ts · robots.ts          SEO routes
  components/
    site-chrome.tsx                 header + footer
    marketing.tsx                   shared marketing blocks (Faq, UseCaseLayout, …)
    chat-widget.tsx                 floating assistant
  lib/
    seo.tsx                         canonical origin + JSON-LD schema builders
    faqs.ts                         per-page FAQ copy
    chat/knowledge.ts               chatbot's source of truth for product facts
docs/
  archive/                          superseded plans — historical only
  superpowers/                      design specs and implementation plans
```

## Gotchas

Each of these has cost real debugging time.

**`NEXT_PUBLIC_SITE_URL` is read at build time, not runtime.** `NEXT_PUBLIC_*` values are
inlined into the bundle when Next builds. It must be set in Vercel *before* a build, or the
sitemap, canonical tags, and OG images ship pointing at `localhost:3000`. Setting it at
runtime does nothing.

**Three files must agree on pricing.** The plan cards in `src/app/pricing/page.tsx`, the
offers in `src/lib/seo.tsx`, and the facts in `src/lib/chat/knowledge.ts` all state the same
limits and prices. Change one, change all three — otherwise the page, the search-engine
markup, and the chatbot start contradicting each other, and the markup becomes a Google
policy violation.

**Deleting a route can leave stale types.** If `pnpm build` fails with
`Cannot find module '../../src/app/<deleted-route>/page.js'`, the `.next` cache is stale:
`rm -rf .next` and rebuild.

**The dev server doesn't hydrate under a proxied browser.** When driving the app with an
automated browser, `pnpm dev` can serve HTML that never hydrates (the HMR websocket doesn't
survive the proxy), so interactive checks silently fail. Test against `pnpm build && pnpm start`.

## Status

Live, with two known caveats: **Stripe is in test mode** pending business verification, and
the homepage testimonials are **placeholders** flagged in `src/app/immersive-home.tsx` —
they must be replaced with genuine, permissioned quotes before launch.
