# MomentDrop SaaS — Design Spec

Date: 2026-06-30
Status: Approved (brainstorming) — ready for implementation planning
Repo: `Harchana23/MomentDrop` · branch `saas-mvp`

## 1. Goal

Turn MomentDrop from a single hardcoded wedding-upload app into a **multi-tenant,
commercial photo-sharing SaaS** for event owners (the Chivent model, wedding-first).
An owner signs up, creates an event, shares a QR/link, guests upload photos/videos
with no app and no account, and the owner manages and downloads everything from a
per-event dashboard.

## 2. Approved decisions

| Decision | Choice |
|---|---|
| Target | Real commercial SaaS (multi-tenant, per-owner isolation, billing-ready) |
| First release | Lean sellable MVP; richer features phased in after |
| Owner auth | Email/password **and** "Continue with Google" |
| Monetization | **Per-event plans** — free trial (capped files, expires), then upgrade the event |
| Architecture | Approach A — evolve the existing app in one Next.js project |
| Guest page (MVP) | Upload-only; public gallery view deferred to a later phase |

## 3. Architecture

One Next.js 16 app (the current `wedding-qr-app`), one Supabase project.

- **Auth + owner data**: Supabase Auth (email/password + Google) with Row-Level
  Security. Owners read/write only their own rows via the SSR Supabase client
  (browser/server/middleware, validated with `getClaims()`).
- **Guest path**: anonymous. The public event page and upload routes read the
  event's public config server-side (service-role) keyed by slug; files upload
  straight to Supabase Storage via one-time signed URLs (the verified flow already
  built), namespaced per `event_id`.
- **Storage**: existing private `event-media` bucket, object path
  `<event_id>/<yyyy-mm-dd>/<rand>-<safe-name>`.

Route groups:

```
(marketing) public     /  /use-cases/wedding  /pricing
(auth)      public     /login  /signup  /auth/callback  /auth/reset
(app)       PROTECTED  /onboarding  /dashboard  /dashboard/events/[id]{,/media,/guests,/access,/settings}
guest       public     /e/[slug]
```

Middleware refreshes the session and guards every `(app)` route (unauthenticated →
`/login`).

## 4. Data model

All tables owner-scoped with RLS. Today's hardcoded single event becomes rows owned
by a signed-in user. Existing seed/test data is disposable — a clean migration.

```
profiles            one row per owner (= auth.users)
  id (uuid = auth.users.id) PK, email, full_name, created_at
  └ auto-created by a trigger on auth signup

events              owned by a profile
  id (uuid) PK, owner_id → profiles ON DELETE CASCADE,
  slug (unique) , title, event_type, event_date, eyebrow, host_message,
  -- per-event pricing:
  plan ('trial' | paid tier), file_limit (int), active_until (timestamptz), status,
  -- access control (MVP toggles):
  allow_uploads (bool), allow_downloads (bool), require_approval (bool),
  guests_see_only_own (bool), password_hash (nullable), created_at

uploads             event_id (uuid) instead of the old text slug
  id PK, event_id → events ON DELETE CASCADE, guest_name, original_file_name,
  media_type, storage_path, mime_type, size_bytes,
  review_status ('published' | 'pending' | 'hidden'),   -- gallery tabs + approval
  created_at

guests              per event
  id PK, event_id → events ON DELETE CASCADE, display_name, email (nullable),
  upload_count, created_at
```

RLS summary:
- `profiles`: owner selects/updates own row (`auth.uid() = id`); insert via signup trigger.
- `events`: full CRUD where `owner_id = auth.uid()`.
- `uploads`, `guests`: owner access where the parent event's `owner_id = auth.uid()`;
  guest inserts happen only through service-role API routes, never direct browser writes.
- Index every column used in an RLS `USING` clause and every FK.

## 5. Owner journey

1. Sign up (email or Google) → logged in.
2. No events yet → redirect to `/onboarding`: short wizard (title, type, date, URL
   slug, optional welcome message). On finish, create the event on the `trial` plan
   and land on its Overview.
3. Overview shows: live stats (photos/videos/files/guests), the share link + QR code,
   and plan & usage (files used / limit, active-until). Returning owners land on
   `/dashboard` (their event list).

Owner console (MVP sections):
- **Overview** — stats, share link + QR, plan & usage.
- **Media** — gallery with Published / Approval / Hidden tabs; approve/hide; "Download
  all (ZIP)" (the verified export, now per event).
- **Guests** — registered list + optional guest self-registration toggle.
- **Access Control** — toggles: allow uploads, allow downloads, require approval,
  guests-see-only-own, password protection.
- **Settings** — event details (title/eyebrow/host message/date/type), custom URL
  (slug), danger zone (delete event).

## 6. Guest journey (`/e/[slug]`)

Server reads the event's public config by slug. If inactive/expired/uploads-off →
friendly "not active" message. Otherwise render the upload page (name, optional
message, files, live progress, thank-you), wired to the signed-URL flow and
respecting `allow_uploads`, `file_limit`, `active_until`, and `require_approval`
(new uploads land `pending` when approval is on, else `published`). Password
protection, when set, gates the page first.

## 7. Per-event pricing (billing-ready; Stripe built last)

- New event defaults: `plan='trial'`, a starter `file_limit`, `active_until = now()+7d`.
  (Exact trial numbers are configurable and finalized when billing is built.)
- Enforcement points: the upload `sign`/`complete` routes refuse new files once the
  event reaches `file_limit` or passes `active_until`.
- Upgrade (later) sets `plan`, raises `file_limit`, extends `active_until` via Stripe
  per-event checkout. Schema is ready now; no Stripe code in the MVP.

## 8. Scope

In MVP: marketing (landing/use-case/pricing), auth, onboarding, owner console
(Overview/Media/Guests/Access/Settings), per-event guest upload, trial/limit gating.

Deferred (later phases, with their own tables when built): albums & hashtags, photo
wall (live slideshow), countdown, print templates, collaboration/team, reactions,
comments, photo notes, social sharing, public guest gallery view, Stripe billing.

## 9. Build phases (execution order)

0. **Foundation** — new schema + RLS + signup trigger migration; env (anon key,
   Google OAuth). Discard old single-event seed.
1. **Auth** — SSR Supabase clients, middleware guard, signup/login/Google, profiles.
2. **Onboarding + dashboard** — create-event wizard, events list.
3. **Owner console** — Overview (stats/share/QR), Media (tabs/approve/ZIP), Guests,
   Access Control, Settings.
4. **Guest page** — `/e/[slug]` adapted from the current page; enforce toggles/limits.
5. **Marketing site** — landing, use-case, pricing.
6. **Billing** — Stripe per-event checkout (last).

Each phase ends green: `lint` + `build` + a smoke test of the new surface.

## 10. Prerequisites the owner (you) must provide

- Supabase **anon/publishable key** added to `.env.local` as
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser auth needs it; only the service-role key
  is set today).
- Enable **Google** provider in Supabase Auth + Google Cloud OAuth credentials
  (for the "Continue with Google" button).
- Run the Phase-0 SQL migration in the Supabase SQL editor.
