# MomentDrop — Project Handover

A practical, everything-you-need guide to run, deploy, and continue this project.
Read the **Quick Start** first; the rest is reference.

---

## 1. What MomentDrop is

A multi-tenant SaaS web app for **event photo/video collection**. A host creates an
event, shares a **QR code + link**, and guests upload photos/videos straight from
their phones — **no app, no account**. Everything lands in the host's private album,
downloadable as a single ZIP.

- **Tagline:** "Scan. Drop. Remember." · Made for Malaysian celebrations.
- **Live site:** https://moment-drop.vercel.app (deployed from the `main` branch)
- **Pricing model:** every event is free to start; upgrade a specific event
  (one-time, per-event, MYR) — Free / Plus RM49 / Pro RM99.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack), **React 19**, TypeScript |
| Styling | **Tailwind CSS v4** + inline styles; design system = terracotta + glass, `Space Grotesk` (display) / `Plus Jakarta Sans` (body) |
| Package manager | **pnpm** |
| Auth + Database | **Supabase** (Postgres + Auth + Row Level Security) |
| File storage | **Google Drive** (via OAuth refresh token, resumable uploads) |
| Payments | **Stripe** Checkout (test mode; MYR; inline `price_data`, no dashboard products) |
| Contact form | **Make.com** webhook → two-way email (staff + client) |
| Chatbot | **Google Gemini** (`gemini-2.5-flash`) via `@google/genai` |
| Hosting | **Vercel** |
| Source control | **GitHub** — `github.com/Harchana23/MomentDrop` |

---

## 3. Quick Start (local dev)

```bash
# 1. From the app folder
cd moment-drop-app

# 2. Install deps
pnpm install          # if it errors after a folder move: CI=true pnpm install

# 3. Create .env.local (see Section 6) — this file is gitignored, never commit it

# 4. Run
pnpm dev              # http://localhost:3000
```

Other scripts: `pnpm build` (production build), `pnpm start` (serve the build),
`pnpm lint`.

> ⚠️ Environment variables load only at **startup** — restart `pnpm dev` after editing `.env.local`.

---

## 4. Repository & branches

- **`main`** — production. **Vercel auto-deploys from `main`.**
- **`saas-mvp`** — the active working branch. New work is committed here, then merged
  into `main`. The two are kept **byte-for-byte identical** (verify with
  `git diff --stat main saas-mvp` → empty).

**Standard flow used in this project:**
```bash
git checkout saas-mvp
# ...work, commit...
git push origin saas-mvp
git checkout main && git merge saas-mvp && git push origin main
git checkout saas-mvp        # return to the working branch
```

Commits are authored as **Harchana <harchanasubramaniam2306@gmail.com>**; the push
credential lives at `~/.momentdrop-git-credentials` (not in the repo).

**Untracked-on-purpose:** `Loading.zip`, `New UI.zip`, `public/MomentDrop - Logo.png`
(design source inputs) — leave them uncommitted.

---

## 5. Third-party services (accounts & where to manage)

| Service | Used for | Console |
|---|---|---|
| Supabase | DB, auth, RLS | supabase.com/dashboard (project `pxpmkcpvddikaxmmhrec`) |
| Google Cloud | Drive storage OAuth (client id/secret + refresh token) | console.cloud.google.com |
| Stripe | Payments (currently **test mode**) | dashboard.stripe.com |
| Make.com | Contact-form → email automation | make.com (scenario on the contact webhook) |
| Google AI Studio | Gemini API key (chatbot) | aistudio.google.com → "Get API key" |
| Vercel | Hosting + env vars for production | vercel.com |
| GitHub | Code (`Harchana23/MomentDrop`) | github.com |

**Stripe note:** running in **test mode**. FPX / Touch 'n Go payment methods
auto-appear once Stripe business verification (BRN 010623011566) clears; then swap
the test keys for live keys (and rotate any key that was ever exposed).

---

## 6. Environment variables

All live in **`moment-drop-app/.env.local`** for local dev (gitignored), and must be
mirrored in **Vercel → Project → Settings → Environment Variables** for production.
Get each value from the matching service console (Section 5).

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (browser-safe) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (**server-only secret**) |
| `NEXT_PUBLIC_EVENT_SLUG` | Default/demo event slug |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` now) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_…`) |
| `GDRIVE_CLIENT_ID` / `GDRIVE_CLIENT_SECRET` | Google OAuth app for Drive |
| `GDRIVE_REFRESH_TOKEN` | Long-lived Drive access (server-only) |
| `GDRIVE_ROOT_FOLDER_ID` | Drive folder that holds all event uploads |
| `MAKE_CONTACT_WEBHOOK_URL` | Make.com contact webhook |
| `GEMINI_API_KEY` | Gemini key powering the chatbot |
| `NEXT_PUBLIC_SITE_URL` | Public origin (e.g. `https://momentdrop.com`). Feeds canonical URLs, `sitemap.xml`, `robots.txt`, OG images, and JSON-LD `@id`s |

> **Production reminder:** the deployed site needs every one of these set in **Vercel**.
> `.env.local` only affects your local machine.
>
> `NEXT_PUBLIC_SITE_URL` is special: `NEXT_PUBLIC_*` values are **inlined at build
> time**, not read at runtime. It must be set in Vercel *before* the build, or the
> sitemap and canonical tags ship pointing at `localhost:3000`.

---

## 7. Architecture — how it fits together

```
Guest phone ──scan QR──► /e/[slug] (upload page)
     │ picks/records photo                        Host ──► /(app)/dashboard/...
     ▼                                                        │ manage events, media,
/api/upload/sign  ──►  Google Drive (resumable)               │ albums, access, export
/api/upload/complete ──► records upload row (Supabase)        ▼
                                                     /dashboard/events/[id]/export
Marketing pages (/, /pricing, /faq, use-cases...)     ──► ZIP (archiver) of Drive files
     │
     ├─ ChatWidget (all pages except /e/*) ──► /api/chat ──► Gemini (grounded on
     │                                                        src/lib/chat/knowledge.ts)
     ├─ Contact form ──► src/lib/contact-actions ──► Make.com webhook ──► email
     └─ Upgrade ──► src/lib/billing/actions ──► Stripe Checkout ──► /api/billing/stripe/webhook
                                                              └─► grant plan (Supabase)
```

- **Storage:** originals live in **Google Drive**, not Supabase. Supabase stores the
  metadata (events, uploads, guests, albums). Each event maps to a Drive folder
  (`drive_folder_id`).
- **Auth:** Supabase Auth (Google OAuth + email). RLS enforces that hosts only see
  their own events. Server code uses `supabaseServer()` (RLS-scoped) or
  `supabase/admin.ts` (service role) where needed.
- **Payments:** Stripe Checkout with inline MYR `price_data`; the webhook
  (`/api/billing/stripe/webhook`) verifies the signature and upgrades the event.

---

## 8. Feature / route map

**Marketing (public):**
`/` (immersive homepage), `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/demo`,
`/use-cases/{wedding,birthday,party,corporate}`.

**Guest (public, per event):**
`/e/[slug]` (upload page + in-app camera), `/e/[slug]/wall` (Live Photo Wall).

**Auth:** `/login`, `/signup`, `/auth/reset`, `/auth/callback`.

**Host app (auth-gated, under `(app)/dashboard`):**
`/dashboard` (events list), `/dashboard/events/[id]` and its tabs:
`settings`, `media`, `guests`, `albums`, `access`, `countdown`, `print`, and
`export` (ZIP download). Plus `/onboarding`.

**API routes:**
`/api/upload/sign`, `/api/upload/complete`, `/api/e/[slug]/wall`,
`/api/billing/stripe/webhook`, `/api/chat`.

---

## 9. Data model & migrations

SQL lives in **`supabase/`**, applied in order in the Supabase SQL editor:

`schema.sql` → `002_storage_columns` → `003_multitenant` → `004_countdown` →
`005_albums` → `006_limits_and_cover` (per-guest limit, cover image) →
`007_guest_token` (per-device cookie cap) → `008_drive_folder_id`.

Core tables: events, uploads, guests, albums (+ the plan/limit columns on events).
When adding a schema change, add a new numbered `.sql` file and run it in Supabase.

---

## 10. Key code areas (`src/lib`)

| Area | Files |
|---|---|
| Supabase | `supabase/{server,client,admin,env}.ts` |
| Events | `events/{actions,queries,public,guest-actions,countdown,countdown-actions}.ts` |
| Uploads | `uploads/{actions,queries}.ts`, `storage.ts`, `gdrive.ts` |
| Albums | `albums.ts`, `albums-actions.ts` |
| Billing | `billing/{plans,actions,stripe,grant}.ts` |
| Auth | `auth/actions.ts`, `password.ts` |
| Contact | `contact-actions.ts`, `support.ts` |
| Chatbot | `chat/knowledge.ts` (+ route `src/app/api/chat/route.ts`, widget `src/components/chat-widget.tsx`) |
| Utilities | `qr.ts`, `slug.ts`, `site-url.ts`, `loader.ts`, `db.ts` |

UI chrome: `src/components/{site-chrome,app-chrome,global-loader,chat-widget,marketing}.tsx`;
the homepage is `src/app/immersive-home.tsx`.

---

## 11. The chatbot (Gemini)

- **Widget:** `src/components/chat-widget.tsx` — floating glass bubble, streams replies,
  mounted globally in `layout.tsx`, hidden on guest pages (`/e/*`).
- **Route:** `src/app/api/chat/route.ts` — streams from `gemini-2.5-flash`
  (`@google/genai`); "thinking" disabled for fast, direct answers; detects Supabase
  login to switch between **pre-sales** (visitor) and **support** (owner) framing;
  escalates to `momentdropsharing@gmail.com` when unsure. Needs `GEMINI_API_KEY`.
- **Knowledge base:** `src/lib/chat/knowledge.ts` — the single source of truth
  (product facts, pricing, rules). **Edit this file to change what the bot knows or how
  it talks.** It's provider-neutral plain text.
- Swap model in one line in the route (`gemini-2.5-flash` → `gemini-2.5-pro` for
  smarter, or `gemini-2.5-flash-lite` for cheaper).

---

## 12. Runbook — common tasks

- **Update chatbot facts/tone:** edit `src/lib/chat/knowledge.ts`, commit, push.
- **Change pricing:** `src/lib/billing/plans.ts` (paid tiers) + the `/pricing` page +
  `src/lib/chat/knowledge.ts` (so the bot stays accurate).
- **Add a DB column:** new `supabase/00N_*.sql`, run in Supabase SQL editor, update the
  relevant `queries.ts`/`actions.ts`.
- **Go live on Stripe:** swap `sk_test_`/`whsec_` for live values in `.env.local` + Vercel,
  re-point the Stripe webhook, redeploy.
- **Deploy:** merge to `main` and push → Vercel auto-builds. Verify env vars exist in
  Vercel first.
- **Print QR cards:** keep them **black-on-white** (print requirement).

---

## 13. Known gaps / follow-ups

- **Production env vars:** ensure **all** Section-6 variables (especially the newly
  added `GEMINI_API_KEY`) are set in **Vercel**, not just `.env.local`.
- **Stripe:** still test mode; go live after BRN verification clears; rotate any key
  that was exposed during setup.
- **Chatbot polish (optional):** starter-question chips; nicer link labels in edge
  answers; wire chat leads into GHL/Make capture.
- **Repo size:** the original full-res marketing images (~34 MB) remain in `main`'s git
  **history** (commit `39a73cb`); the working tree is optimized (~1.5 MB). Cleaning
  history would need a force-push (destructive) — only do if repo size matters.
- **Auth'd dashboard pages** couldn't be automatically responsive-tested (need login);
  they reuse the same responsive components as public pages.

---

## 14. Security notes

- **Never commit `.env.local`** — it holds the Supabase service-role key, Stripe secret,
  Google Drive client secret + refresh token, and the Gemini key. It is gitignored.
- The Anthropic/Gemini API key and all server secrets are read **server-side only**;
  the browser never sees them (the chat widget talks to `/api/chat`, not the model).
- Don't paste `.env.local` contents into chats, screenshots, or issues.

---

_Last updated: handover generated at the end of the Gemini-chatbot integration._
