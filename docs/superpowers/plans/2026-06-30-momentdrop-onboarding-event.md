# MomentDrop Onboarding + Create Event — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** A signed-in owner can create an event through an onboarding wizard and land on that event's Overview, which shows the shareable guest link, a QR code, plan/usage, and live counts. The dashboard lists their events and links into each.

**Architecture:** Builds on Phase 1 (auth + RLS). A `createEvent` server action inserts an event owned by `auth.uid()` with a unique, readable+random slug and trial defaults. Read paths use the RLS-enforced server client so owners only see their own events. QR codes are generated server-side with the `qrcode` library.

**Tech Stack:** Next.js 16 App Router, Supabase (Auth + RLS), `qrcode`, TypeScript, Tailwind v4.

**Scope:** Phase 2 only. The per-event Media gallery, Guests, Access Control, and Settings sub-pages are Phase 3; the public guest upload page (`/e/[slug]`) is Phase 4. Until Phase 4 the share link/QR point at a page not yet built — noted in the UI.

**Verification:** `pnpm.cmd lint` + `pnpm.cmd build`, a pure-function check for the slug util, and a Node smoke script that creates a user and an event via the RLS client and asserts trial defaults + ownership.

---

## File Structure

```
package.json                                      + qrcode, @types/qrcode
src/lib/slug.ts                                   NEW — slugify + makeEventSlug (pure)
src/lib/site-url.ts                               NEW — base URL from headers/env
src/lib/qr.ts                                     NEW — server-side QR data URL
src/lib/events/actions.ts                         NEW — "use server" createEvent
src/lib/events/queries.ts                         NEW — getEventForOwner, getEventStats
src/app/(app)/onboarding/page.tsx                 NEW — create-event wizard
src/app/(app)/dashboard/events/[id]/page.tsx      NEW — event Overview (share+QR+usage+stats)
src/app/(app)/dashboard/page.tsx                  MODIFY — link list items to the event overview
scripts/smoke/slug.mjs                            NEW — pure slug assertions
scripts/smoke/event.mjs                           NEW — create event via RLS, assert defaults
```

---

## Task 1: Dependencies + slug utility

**Files:**
- Modify: `package.json` (via pnpm)
- Create: `src/lib/slug.ts`
- Create: `scripts/smoke/slug.mjs`

- [ ] **Step 1: Install qrcode**

Run: `pnpm.cmd add qrcode && pnpm.cmd add -D @types/qrcode`
Expected: `package.json` gains `qrcode` and `@types/qrcode`.

- [ ] **Step 2: Slug utility**

Create `src/lib/slug.ts`:

```ts
/** Lowercase, hyphenate, strip punctuation; bounded length. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** Short random base36 token for slug uniqueness + unguessability. */
export function randomToken(len = 5): string {
  let s = "";
  while (s.length < len) s += Math.random().toString(36).slice(2);
  return s.slice(0, len);
}

/** Event slug: readable stem from the title + random tail (globally unique enough). */
export function makeEventSlug(title: string): string {
  const stem = slugify(title) || "event";
  return `${stem}-${randomToken(5)}`;
}
```

- [ ] **Step 3: Pure assertions for the slug util**

Create `scripts/smoke/slug.mjs`:

```js
import { slugify, makeEventSlug } from "../../src/lib/slug.ts";
const assert = (c, m) => console.log(c ? "ok: " + m : "FAIL: " + m);
assert(slugify("Harchana & Vikram's Wedding!") === "harchana-vikram-s-wedding", "slugify punctuation");
assert(slugify("  Spaced  Out  ") === "spaced-out", "slugify trim/collapse");
const s = makeEventSlug("Summer Party");
assert(/^summer-party-[a-z0-9]{5}$/.test(s), "makeEventSlug shape: " + s);
assert(makeEventSlug("Summer Party") !== makeEventSlug("Summer Party"), "random tail differs");
```

- [ ] **Step 4: Run it**

Run: `node --experimental-strip-types scripts/smoke/slug.mjs`
Expected: four `ok:` lines. (If the Node version rejects `--experimental-strip-types`, transpile inline isn't needed — the build in Task 5 will type-check the util regardless; record the result and continue.)

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/slug.ts scripts/smoke/slug.mjs
git commit -m "feat: qrcode dep + event slug utility"
```

---

## Task 2: Site URL + QR helpers

**Files:**
- Create: `src/lib/site-url.ts`
- Create: `src/lib/qr.ts`

- [ ] **Step 1: Site URL helper**

Create `src/lib/site-url.ts`:

```ts
import { headers } from "next/headers";

/** Absolute base URL for building public links. Prefers NEXT_PUBLIC_SITE_URL. */
export async function getSiteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
```

- [ ] **Step 2: QR helper**

Create `src/lib/qr.ts`:

```ts
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const QRCode = require("qrcode") as typeof import("qrcode");

/** PNG data URL for a QR code of `text`. Server-only. */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 320, color: { dark: "#1f1b16", light: "#ffffff" } });
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm.cmd build`
Expected: compiles (helpers unused yet but must typecheck).

- [ ] **Step 4: Commit**

```bash
git add src/lib/site-url.ts src/lib/qr.ts
git commit -m "feat: site-url and server-side QR helpers"
```

---

## Task 3: Event creation action + queries

**Files:**
- Create: `src/lib/events/actions.ts`
- Create: `src/lib/events/queries.ts`

- [ ] **Step 1: createEvent action**

Create `src/lib/events/actions.ts`:

```ts
"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { makeEventSlug } from "@/lib/slug";

export async function createEvent(formData: FormData) {
  const sb = await supabaseServer();
  const { data: claims } = await sb.auth.getClaims();
  const uid = claims?.claims?.sub;
  if (!uid) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/onboarding?error=" + encodeURIComponent("Please enter an event name."));
  const eventType = String(formData.get("event_type") ?? "wedding");
  const eventDate = String(formData.get("event_date") ?? "");
  const hostMessage = String(formData.get("host_message") ?? "").trim();

  const { data, error } = await sb
    .from("events")
    .insert({
      owner_id: uid,
      slug: makeEventSlug(title),
      title,
      event_type: eventType,
      event_date: eventDate || null,
      host_message: hostMessage || null,
    })
    .select("id")
    .single();

  if (error) redirect("/onboarding?error=" + encodeURIComponent(error.message));
  redirect(`/dashboard/events/${data.id}`);
}
```

- [ ] **Step 2: Read queries**

Create `src/lib/events/queries.ts`:

```ts
import { supabaseServer } from "@/lib/supabase/server";

export type EventRow = {
  id: string;
  slug: string;
  title: string;
  event_type: string;
  event_date: string | null;
  host_message: string | null;
  plan: string;
  file_limit: number;
  active_until: string;
  status: string;
};

/** The event if it belongs to the signed-in owner, else null (RLS-enforced). */
export async function getEventForOwner(id: string): Promise<EventRow | null> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("events")
    .select("id, slug, title, event_type, event_date, host_message, plan, file_limit, active_until, status")
    .eq("id", id)
    .maybeSingle();
  return (data as EventRow) ?? null;
}

export async function getEventStats(eventId: string): Promise<{ uploads: number; guests: number }> {
  const sb = await supabaseServer();
  const [uploads, guests] = await Promise.all([
    sb.from("uploads").select("*", { count: "exact", head: true }).eq("event_id", eventId),
    sb.from("guests").select("*", { count: "exact", head: true }).eq("event_id", eventId),
  ]);
  return { uploads: uploads.count ?? 0, guests: guests.count ?? 0 };
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm.cmd build`
Expected: compiles.

- [ ] **Step 4: Commit**

```bash
git add src/lib/events/
git commit -m "feat: createEvent action + owner-scoped event queries"
```

---

## Task 4: Onboarding wizard

**Files:**
- Create: `src/app/(app)/onboarding/page.tsx`

- [ ] **Step 1: Onboarding page**

Create `src/app/(app)/onboarding/page.tsx`:

```tsx
import { createEvent } from "@/lib/events/actions";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-5 py-10 text-[#22211f]">
      <div className="w-full max-w-lg border border-[#e1d8ca] bg-white p-7 shadow-[0_24px_80px_rgba(70,55,35,0.12)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">MomentDrop</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your event</h1>
        <p className="mt-2 text-sm text-[#695b49]">
          Guests will scan a QR code and upload photos — no app, no account.
        </p>
        {sp.error && (
          <p className="mt-4 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">{sp.error}</p>
        )}
        <form action={createEvent} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#4a4035]">Event name</span>
            <input name="title" type="text" required placeholder="e.g. Harchana & Vikram's Wedding"
              className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">Type</span>
              <select name="event_type" defaultValue="wedding"
                className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]">
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="party">Party</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-[#4a4035]">Date</span>
              <input name="event_date" type="date"
                className="mt-2 h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-[#4a4035]">Welcome message (optional)</span>
            <textarea name="host_message" placeholder="A note your guests see on the upload page"
              className="mt-2 min-h-20 w-full resize-none border border-[#d8cdbb] bg-[#fffdf9] px-4 py-3 outline-none focus:border-[#8f7245]" />
          </label>
          <button className="h-12 w-full bg-[#1f1b16] text-base font-semibold text-white hover:bg-[#3a3127]">
            Create event
          </button>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm.cmd build`
Expected: compiles; `/onboarding` listed.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/onboarding"
git commit -m "feat: onboarding create-event wizard"
```

---

## Task 5: Event Overview + dashboard links

**Files:**
- Create: `src/app/(app)/dashboard/events/[id]/page.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Event Overview page**

Create `src/app/(app)/dashboard/events/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventForOwner, getEventStats } from "@/lib/events/queries";
import { getSiteUrl } from "@/lib/site-url";
import { qrDataUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";

export default async function EventOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventForOwner(id);
  if (!event) notFound();

  const stats = await getEventStats(event.id);
  const shareUrl = `${await getSiteUrl()}/e/${event.slug}`;
  const qr = await qrDataUrl(shareUrl);
  const activeUntil = new Date(event.active_until).toLocaleDateString();

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-3 border-b border-[#ded4c4] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/dashboard" className="text-sm text-[#8b6e3f]">← All events</Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{event.title}</h1>
            <p className="mt-1 text-sm text-[#74664f]">
              {event.event_type}{event.event_date ? ` · ${event.event_date}` : ""} · {event.plan} plan
            </p>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Uploads", value: String(stats.uploads) },
            { label: "Guests", value: String(stats.guests) },
            { label: "Plan", value: `${stats.uploads}/${event.file_limit} files` },
          ].map((s) => (
            <div key={s.label} className="border border-[#ded4c4] bg-white p-5">
              <p className="text-sm text-[#74664f]">{s.label}</p>
              <p className="mt-3 text-2xl font-semibold">{s.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="border border-[#ded4c4] bg-white p-6">
            <h2 className="text-xl font-semibold">Share your event</h2>
            <p className="mt-1 text-sm text-[#74664f]">
              Guests open this link (or scan the QR) to upload. Active until {activeUntil}.
            </p>
            <div className="mt-4 flex items-center gap-2 border border-[#e6ddcf] bg-[#fbf7ef] px-3 py-2">
              <code className="flex-1 break-all text-sm text-[#5c4a2e]">{shareUrl}</code>
            </div>
            <p className="mt-3 text-xs text-[#a18e73]">
              The guest upload page goes live in the next build step.
            </p>
          </div>
          <div className="border border-[#ded4c4] bg-white p-6 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8b6e3f]">QR code</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Event QR code" className="mx-auto mt-4 h-48 w-48" />
            <a href={qr} download={`${event.slug}-qr.png`}
              className="mt-4 inline-flex h-10 items-center justify-center border border-[#d8cdbb] px-4 text-sm font-semibold text-[#5c4a2e]">
              Download QR
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Link dashboard list items to the overview**

In `src/app/(app)/dashboard/page.tsx`, change the events list item from a static `<li>` to a link. Replace the list-item block:

```tsx
            {(events ?? []).map((e) => (
              <li key={e.id as string} className="border border-[#ded4c4] bg-white p-5">
                <p className="text-lg font-semibold">{e.title as string}</p>
                <p className="mt-1 text-sm text-[#74664f]">
                  /e/{e.slug as string} · {String(e.plan)}
                </p>
              </li>
            ))}
```

with:

```tsx
            {(events ?? []).map((e) => (
              <li key={e.id as string}>
                <Link href={`/dashboard/events/${e.id as string}`}
                  className="block border border-[#ded4c4] bg-white p-5 transition hover:border-[#8d7147]">
                  <p className="text-lg font-semibold">{e.title as string}</p>
                  <p className="mt-1 text-sm text-[#74664f]">
                    /e/{e.slug as string} · {String(e.plan)}
                  </p>
                </Link>
              </li>
            ))}
```

- [ ] **Step 3: Verify build**

Run: `pnpm.cmd lint` then `pnpm.cmd build`
Expected: both pass; route `/dashboard/events/[id]` listed as dynamic.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/dashboard"
git commit -m "feat: event overview with share link, QR, usage; link from dashboard"
```

---

## Task 6: Event-creation smoke test

**Files:**
- Create: `scripts/smoke/event.mjs`

- [ ] **Step 1: Smoke script**

Create `scripts/smoke/event.mjs` — create a user (admin), sign in as them (anon
client), insert an event the way the action does, and assert trial defaults + that
they can read it back:

```js
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l && !l.trimStart().startsWith("#") && l.includes("="))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const { createClient } = await import("@supabase/supabase-js");
const { makeEventSlug } = await import("../../src/lib/slug.ts");
const URL = env.NEXT_PUBLIC_SUPABASE_URL, SR = env.SUPABASE_SERVICE_ROLE_KEY, ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL, SR, { auth: { persistSession: false } });
const stamp = Date.now();
const { data: u } = await admin.auth.admin.createUser({ email: `ev-${stamp}@example.com`, password: "Password123!", email_confirm: true });
const asUser = createClient(URL, ANON, { auth: { persistSession: false } });
await asUser.auth.signInWithPassword({ email: `ev-${stamp}@example.com`, password: "Password123!" });
const { data: ev, error } = await asUser.from("events")
  .insert({ owner_id: u.user.id, slug: makeEventSlug("Smoke Wedding"), title: "Smoke Wedding" })
  .select("id, slug, plan, file_limit, active_until").single();
if (error) throw new Error("insert: " + error.message);
console.log("created event:", ev.slug);
console.log("trial plan:", ev.plan === "trial" ? "ok" : "FAIL " + ev.plan);
console.log("file_limit default:", ev.file_limit === 30 ? "ok" : "FAIL " + ev.file_limit);
console.log("active_until ~7d:", (new Date(ev.active_until) - Date.now()) > 6 * 864e5 ? "ok" : "FAIL");
const { data: readBack } = await asUser.from("events").select("id").eq("id", ev.id).maybeSingle();
console.log("owner reads own event:", readBack ? "ok" : "FAIL");
await admin.from("events").delete().eq("id", ev.id);
await admin.auth.admin.deleteUser(u.user.id);
console.log("cleaned up");
```

- [ ] **Step 2: Run it**

Run: `node scripts/smoke/event.mjs`
Expected: `trial plan: ok`, `file_limit default: ok`, `active_until ~7d: ok`, `owner reads own event: ok`, `cleaned up`.

- [ ] **Step 3: Commit**

```bash
git add scripts/smoke/event.mjs
git commit -m "test: event creation defaults + owner read smoke test"
```

---

## Definition of done

- `lint` + `build` pass.
- `node scripts/smoke/event.mjs` → trial defaults correct, owner can read own event.
- In a browser: `/onboarding` creates an event and redirects to `/dashboard/events/<id>` showing the share link + a scannable QR; `/dashboard` lists the event and links into it.
- Branch `saas-mvp` has one commit per task.

## Next plan

`2026-06-30-momentdrop-event-console.md` — per-event Media gallery (tabs/approve/ZIP),
Guests, Access Control, Settings — then Phase 4 brings the guest page live at `/e/[slug]`.
