# MomentDrop Foundation + Auth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the multi-tenant database (owners → events → uploads/guests with RLS) and a working email/password + Google login, so a person can sign up, get a `profiles` row automatically, and land on a protected `/dashboard` that only shows their own data.

**Architecture:** Evolve the existing single-event Next.js app (Approach A in the spec). Add Supabase Auth with the `@supabase/ssr` SSR-client pattern (browser/server/middleware, validated with `getClaims()`), a clean multi-tenant schema with Row-Level Security, and a signup trigger that auto-creates the owner profile. Owner data is read through the RLS-enforced client; the existing service-role client stays for guest/admin server work.

**Tech Stack:** Next.js 16 (App Router, Turbopack), `@supabase/supabase-js`, `@supabase/ssr`, Supabase Postgres + Auth + Storage, TypeScript, Tailwind v4.

**Scope:** This plan is Phases 0–1 of the spec only. Onboarding, owner console, guest page, marketing, and billing are separate plans.

**Verification note:** No unit-test runner exists in this repo. Each task verifies with `pnpm.cmd lint` + `pnpm.cmd build` and a Node smoke script (`scripts/smoke/*.mjs`) run against live Supabase, mirroring how the upload flow was verified. Pure functions get a tiny inline assertion script.

---

## Prerequisites (owner/manual — do before Task 1)

These need the Supabase dashboard and can't be done from code:

- [ ] **Anon key**: Supabase → Project Settings → API → copy the `anon` `public` key. Add to `.env.local`:
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>`
- [ ] **Google provider** (for the Google button — email/password works without it): Supabase → Authentication → Providers → enable Google; create OAuth credentials in Google Cloud Console; add redirect `https://<project-ref>.supabase.co/auth/v1/callback`. If you defer this, the Google button will show an error until enabled; email/password is fully functional meanwhile.
- [ ] **Email confirmations**: Supabase → Authentication → Providers → Email. For first local testing, you may turn "Confirm email" OFF so signup logs in immediately; turn it back ON before launch.

---

## File Structure

```
.env.local                                  + NEXT_PUBLIC_SUPABASE_ANON_KEY (manual)
package.json                                 + @supabase/ssr
supabase/003_multitenant.sql                NEW — drop old single-event schema, create profiles/events/uploads/guests + RLS + signup trigger
src/lib/supabase/client.ts                  NEW — browser client (anon key)
src/lib/supabase/server.ts                  NEW — server client (cookies, anon key)
src/lib/supabase/admin.ts                   MOVED from src/lib/supabase.ts — service-role client (rename for clarity)
src/lib/supabase.ts                          (re-export shim kept so existing imports don't break, or update imports)
middleware.ts                               NEW — refresh session + guard /dashboard and /onboarding
src/lib/auth/actions.ts                     NEW — server actions: signUpEmail, signInEmail, signInGoogle, signOut, resetPassword
src/app/(auth)/login/page.tsx               NEW — email+password + Google
src/app/(auth)/signup/page.tsx              NEW — email+password + Google
src/app/(auth)/auth/callback/route.ts       NEW — OAuth/email-verify code exchange
src/app/(auth)/auth/reset/page.tsx          NEW — request + set new password
src/app/(app)/dashboard/page.tsx            NEW — protected; lists the signed-in owner's events (empty for now)
scripts/smoke/auth.mjs                       NEW — smoke test: signup → profile row exists → RLS isolation
scripts/smoke/schema.mjs                     NEW — smoke test: tables + policies exist
```

Note: the current `src/app/page.tsx` (single-event guest page) and `src/app/admin/page.tsx` stay untouched in this plan; they get re-homed to `/e/[slug]` and the owner console in later plans.

---

## Task 1: Multi-tenant schema migration

**Files:**
- Create: `supabase/003_multitenant.sql`
- Create: `scripts/smoke/schema.mjs`

- [ ] **Step 1: Write the migration SQL**

Create `supabase/003_multitenant.sql`:

```sql
-- MomentDrop migration 003 — multi-tenant schema. Run ONCE in the Supabase SQL editor.
-- WARNING: drops the old single-event tables and their data (disposable test data).

drop table if exists uploads cascade;
drop table if exists guests  cascade;
drop table if exists events  cascade;

-- profiles: one row per owner (auth user)
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

-- events: owned by a profile; carries its own plan/limits/expiry + access toggles
create table events (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references profiles(id) on delete cascade,
  slug                text not null unique,
  title               text not null,
  event_type          text not null default 'wedding',
  event_date          date,
  eyebrow             text,
  host_message        text,
  plan                text not null default 'trial',
  file_limit          int  not null default 30,
  active_until        timestamptz not null default (now() + interval '7 days'),
  status              text not null default 'active',
  allow_uploads       boolean not null default true,
  allow_downloads     boolean not null default true,
  require_approval    boolean not null default false,
  guests_see_only_own boolean not null default false,
  password_hash       text,
  created_at          timestamptz not null default now()
);

create table uploads (
  id                 uuid primary key default gen_random_uuid(),
  event_id           uuid not null references events(id) on delete cascade,
  guest_name         text,
  original_file_name text,
  media_type         text,
  storage_path       text,
  mime_type          text,
  size_bytes         bigint,
  review_status      text not null default 'published',
  created_at         timestamptz not null default now()
);

create table guests (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events(id) on delete cascade,
  display_name  text,
  email         text,
  upload_count  int not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_events_owner          on events (owner_id);
create index idx_events_slug           on events (slug);
create index idx_uploads_event_created on uploads (event_id, created_at desc);
create index idx_guests_event          on guests (event_id);

-- RLS
alter table profiles enable row level security;
alter table events   enable row level security;
alter table uploads  enable row level security;
alter table guests   enable row level security;

create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

create policy "own events all" on events for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "own uploads all" on uploads for all
  using (exists (select 1 from events e where e.id = uploads.event_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = uploads.event_id and e.owner_id = auth.uid()));

create policy "own guests all" on guests for all
  using (exists (select 1 from events e where e.id = guests.event_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = guests.event_id and e.owner_id = auth.uid()));

-- auto-create a profile row when a user signs up
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

- [ ] **Step 2: Run the migration**

Paste the file's contents into Supabase → SQL Editor → New query → Run. Expected: "Success. No rows returned."

- [ ] **Step 3: Write the schema smoke script**

Create `scripts/smoke/schema.mjs`:

```js
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l && !l.trimStart().startsWith("#") && l.includes("="))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const { createClient } = await import("@supabase/supabase-js");
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
for (const t of ["profiles", "events", "uploads", "guests"]) {
  const { error } = await sb.from(t).select("*", { count: "exact", head: true });
  console.log(`table ${t}:`, error ? "MISSING " + error.message : "ok");
}
```

- [ ] **Step 4: Run it**

Run: `node scripts/smoke/schema.mjs`
Expected: all four tables print `ok`.

- [ ] **Step 5: Commit**

```bash
git add supabase/003_multitenant.sql scripts/smoke/schema.mjs
git commit -m "feat: multi-tenant schema with RLS and signup trigger"
```

---

## Task 2: Install @supabase/ssr and add env validation

**Files:**
- Modify: `package.json` (via pnpm)
- Create: `src/lib/supabase/env.ts`

- [ ] **Step 1: Install the package**

Run: `pnpm.cmd add @supabase/ssr`
Expected: `package.json` gains `@supabase/ssr`.

- [ ] **Step 2: Write the env helper**

Create `src/lib/supabase/env.ts`:

```ts
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function authConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm.cmd build`
Expected: compiles (the helper is unused yet, but must typecheck).

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/supabase/env.ts
git commit -m "feat: add @supabase/ssr and auth env helper"
```

---

## Task 3: Supabase SSR clients (browser + server) and admin rename

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/admin.ts` (moved content of current `src/lib/supabase.ts`)
- Modify: `src/lib/supabase.ts` → re-export shim

- [ ] **Step 1: Browser client**

Create `src/lib/supabase/client.ts`:

```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

export function supabaseBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
```

- [ ] **Step 2: Server client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try { toSet.forEach(({ name, value, options }) => store.set(name, value, options)); } catch {}
      },
    },
  });
}
```

- [ ] **Step 3: Move the service-role client to admin.ts**

Create `src/lib/supabase/admin.ts` with the exact current contents of `src/lib/supabase.ts` (the `isSupabaseConfigured` + `getSupabaseAdmin` functions). Then replace `src/lib/supabase.ts` with a shim so existing imports keep working:

```ts
export { isSupabaseConfigured, getSupabaseAdmin } from "./supabase/admin";
```

- [ ] **Step 4: Verify build**

Run: `pnpm.cmd build`
Expected: compiles; existing `@/lib/supabase` imports (db.ts, storage.ts, routes) still resolve via the shim.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat: add SSR browser/server Supabase clients; isolate admin client"
```

---

## Task 4: Middleware — session refresh + route guard

**Files:**
- Create: `middleware.ts` (project root, next to package.json)

- [ ] **Step 1: Write middleware**

Create `middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/onboarding"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthed = Boolean(data?.claims);
  const path = request.nextUrl.pathname;

  if (!isAuthed && PROTECTED.some((p) => path.startsWith(p))) {
    const redirect = new URL("/login", request.url);
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 2: Verify build + guard**

Run: `pnpm.cmd build`, then `pnpm.cmd dev --hostname 127.0.0.1 --port 3100` and
`curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://127.0.0.1:3100/dashboard`
Expected: `307` redirect to `/login?next=/dashboard`. Stop the dev server after.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat: middleware refreshes session and guards app routes"
```

---

## Task 5: Auth server actions

**Files:**
- Create: `src/lib/auth/actions.ts`

- [ ] **Step 1: Write the actions**

Create `src/lib/auth/actions.ts`:

```ts
"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function signUpEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const sb = await supabaseServer();
  const { error } = await sb.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } },
  });
  if (error) fail("/signup", error.message);
  redirect("/dashboard");
}

export async function signInEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) fail("/login", error.message);
  redirect(next || "/dashboard");
}

export async function signInGoogle() {
  const sb = await supabaseServer();
  const origin = (await headers()).get("origin") ?? "";
  const { data, error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error) fail("/login", error.message);
  redirect(data.url);
}

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm.cmd build`
Expected: compiles.

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth/actions.ts
git commit -m "feat: auth server actions (email signup/signin, google, signout)"
```

---

## Task 6: Login, signup, reset pages + OAuth callback

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/app/(auth)/auth/callback/route.ts`
- Create: `src/app/(auth)/auth/reset/page.tsx`

- [ ] **Step 1: OAuth callback route**

Create `src/app/(auth)/auth/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  if (code) {
    const sb = await supabaseServer();
    await sb.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
```

- [ ] **Step 2: Login page**

Create `src/app/(auth)/login/page.tsx` — warm-themed card matching the existing brand
(`bg-[#fbfaf7]`, ink text, gold accents). Email + password fields posting to
`signInEmail`, a hidden `next` field from `searchParams`, a "Continue with Google"
button posting to `signInGoogle`, a link to `/signup`, and an error banner when
`searchParams.error` is present.

```tsx
import Link from "next/link";
import { signInEmail, signInGoogle } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-5 text-[#22211f]">
      <div className="w-full max-w-md border border-[#e1d8ca] bg-white p-7 shadow-[0_24px_80px_rgba(70,55,35,0.12)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">MomentDrop</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back</h1>
        {sp.error && (
          <p className="mt-4 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">{sp.error}</p>
        )}
        <form action={signInEmail} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={sp.next ?? "/dashboard"} />
          <input name="email" type="email" required placeholder="Email"
            className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]" />
          <input name="password" type="password" required placeholder="Password"
            className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]" />
          <button className="h-12 w-full bg-[#1f1b16] text-base font-semibold text-white hover:bg-[#3a3127]">Log in</button>
        </form>
        <form action={signInGoogle} className="mt-3">
          <button className="h-12 w-full border border-[#d8cdbb] text-base font-semibold text-[#3a3127] hover:border-[#8f7245]">Continue with Google</button>
        </form>
        <p className="mt-5 text-sm text-[#695b49]">
          No account? <Link href="/signup" className="font-semibold text-[#5c4a2e] underline">Sign up</Link>
          <span className="mx-2">·</span>
          <Link href="/auth/reset" className="text-[#5c4a2e] underline">Forgot password</Link>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Signup page**

Create `src/app/(auth)/signup/page.tsx` — same layout as login with an added
`full_name` field, posting to `signUpEmail`, plus the Google button (`signInGoogle`),
and a link to `/login`. (Repeat the login structure with the name field and "Create
account" button — do not abbreviate.)

```tsx
import Link from "next/link";
import { signUpEmail, signInGoogle } from "@/lib/auth/actions";

export default async function SignupPage({
  searchParams,
}: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-5 text-[#22211f]">
      <div className="w-full max-w-md border border-[#e1d8ca] bg-white p-7 shadow-[0_24px_80px_rgba(70,55,35,0.12)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#7f6a46]">MomentDrop</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your account</h1>
        {sp.error && (
          <p className="mt-4 border border-[#e7c9c2] bg-[#fbf1ef] px-4 py-3 text-sm text-[#9a3b2b]">{sp.error}</p>
        )}
        <form action={signUpEmail} className="mt-6 space-y-4">
          <input name="full_name" type="text" required placeholder="Your name"
            className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]" />
          <input name="email" type="email" required placeholder="Email"
            className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]" />
          <input name="password" type="password" required minLength={8} placeholder="Password (8+ characters)"
            className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]" />
          <button className="h-12 w-full bg-[#1f1b16] text-base font-semibold text-white hover:bg-[#3a3127]">Create account</button>
        </form>
        <form action={signInGoogle} className="mt-3">
          <button className="h-12 w-full border border-[#d8cdbb] text-base font-semibold text-[#3a3127] hover:border-[#8f7245]">Continue with Google</button>
        </form>
        <p className="mt-5 text-sm text-[#695b49]">
          Have an account? <Link href="/login" className="font-semibold text-[#5c4a2e] underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Reset page (minimal)**

Create `src/app/(auth)/auth/reset/page.tsx` — a single email field that calls
`supabase.auth.resetPasswordForEmail` via a client component, showing "Check your
email" on success. (Client component using `supabaseBrowser()`.)

```tsx
"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email);
    if (error) setError(error.message); else setSent(true);
  }
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbfaf7] px-5 text-[#22211f]">
      <div className="w-full max-w-md border border-[#e1d8ca] bg-white p-7">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-[#695b49]">Check your email for a reset link.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {error && <p className="text-sm text-[#9a3b2b]">{error}</p>}
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email"
              className="h-12 w-full border border-[#d8cdbb] bg-[#fffdf9] px-4 outline-none focus:border-[#8f7245]" />
            <button className="h-12 w-full bg-[#1f1b16] text-base font-semibold text-white">Send reset link</button>
          </form>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `pnpm.cmd build`
Expected: compiles; routes `/login`, `/signup`, `/auth/reset`, `/auth/callback` listed.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(auth)"
git commit -m "feat: login, signup, reset pages and OAuth callback"
```

---

## Task 7: Protected dashboard (proves the loop)

**Files:**
- Create: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Dashboard page**

Create `src/app/(app)/dashboard/page.tsx` — server component: read the user via
`supabaseServer().auth.getClaims()`, query the owner's `events` (RLS returns only
theirs), show their email, a sign-out button (calls `signOut`), and an empty-state
"Create your first event" (link to `/onboarding`, built in the next plan).

```tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sb = await supabaseServer();
  const { data: claims } = await sb.auth.getClaims();
  const email = claims?.claims?.email ?? "";
  const { data: events } = await sb
    .from("events")
    .select("id, title, slug, event_date, plan")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-5 py-6 text-[#25211b] md:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b border-[#ded4c4] pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8b6e3f]">MomentDrop</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your events</h1>
            <p className="mt-1 text-sm text-[#74664f]">{email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/onboarding" className="inline-flex h-11 items-center bg-[#1f1b16] px-5 text-sm font-semibold text-white">Create event</Link>
            <form action={signOut}><button className="h-11 border border-[#d8cdbb] px-4 text-sm font-semibold text-[#5c4a2e]">Sign out</button></form>
          </div>
        </header>

        {(events ?? []).length === 0 ? (
          <div className="mt-10 border border-dashed border-[#cbbfa9] bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">No events yet</h2>
            <p className="mt-2 text-sm text-[#74664f]">Create your first event to get a QR code your guests can scan.</p>
            <Link href="/onboarding" className="mt-6 inline-flex h-11 items-center bg-[#1f1b16] px-5 text-sm font-semibold text-white">Create your first event</Link>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {(events ?? []).map((e) => (
              <li key={e.id as string} className="border border-[#ded4c4] bg-white p-5">
                <p className="text-lg font-semibold">{e.title as string}</p>
                <p className="mt-1 text-sm text-[#74664f]">/e/{e.slug as string} · {String(e.plan)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm.cmd build`
Expected: compiles; `/dashboard` listed as dynamic.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)"
git commit -m "feat: protected dashboard with owner-scoped events list"
```

---

## Task 8: Auth smoke test (signup → profile → RLS isolation)

**Files:**
- Create: `scripts/smoke/auth.mjs`

- [ ] **Step 1: Write the smoke script**

Create `scripts/smoke/auth.mjs` — uses the service-role admin client to create two
users, asserts each got a `profiles` row (trigger), creates an event for user A, then
uses an anon client signed in as user B to confirm B cannot see A's event (RLS):

```js
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/)
  .filter((l) => l && !l.trimStart().startsWith("#") && l.includes("="))
  .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
const { createClient } = await import("@supabase/supabase-js");
const URL = env.NEXT_PUBLIC_SUPABASE_URL, SR = env.SUPABASE_SERVICE_ROLE_KEY, ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL, SR, { auth: { persistSession: false } });
const stamp = Date.now();
const mk = async (n) => {
  const email = `smoke+${n}-${stamp}@example.com`, password = "Password123!";
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(`create ${n}: ${error.message}`);
  return { id: data.user.id, email, password };
};
const a = await mk("a"), b = await mk("b");
for (const u of [a, b]) {
  const { data } = await admin.from("profiles").select("id").eq("id", u.id).maybeSingle();
  console.log(`profile for ${u.email.split("@")[0]}:`, data ? "ok" : "MISSING (trigger failed)");
}
const { data: ev, error: ee } = await admin.from("events")
  .insert({ owner_id: a.id, slug: `smoke-${stamp}`, title: "Smoke event" }).select("id").single();
if (ee) throw new Error("insert event: " + ee.message);
const asB = createClient(URL, ANON, { auth: { persistSession: false } });
await asB.auth.signInWithPassword({ email: b.email, password: b.password });
const { data: seen } = await asB.from("events").select("id").eq("id", ev.id);
console.log("B sees A's event:", (seen ?? []).length === 0 ? "no (RLS ok)" : "YES (RLS BROKEN)");
// cleanup
await admin.from("events").delete().eq("id", ev.id);
await admin.auth.admin.deleteUser(a.id);
await admin.auth.admin.deleteUser(b.id);
console.log("cleaned up");
```

- [ ] **Step 2: Run it**

Run: `node scripts/smoke/auth.mjs`
Expected: both profiles `ok`, `B sees A's event: no (RLS ok)`, `cleaned up`.

- [ ] **Step 3: Commit**

```bash
git add scripts/smoke/auth.mjs
git commit -m "test: smoke test for signup trigger and RLS isolation"
```

---

## Definition of done

- `pnpm.cmd lint` and `pnpm.cmd build` pass.
- `node scripts/smoke/schema.mjs` → all tables ok.
- `node scripts/smoke/auth.mjs` → profiles created by trigger, RLS blocks cross-owner reads.
- Visiting `/dashboard` unauthenticated redirects to `/login`; after signing up you land on `/dashboard` showing your email and the empty-state.
- Branch `saas-mvp` has one commit per task.

## Next plan

`2026-06-30-momentdrop-onboarding-dashboard.md` — the create-event wizard and the
events list wired to real creation, then the per-event console.
