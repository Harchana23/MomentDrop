# Photo Wall settings — design

Date: 2026-07-17
Status: approved (pending spec review)

## Why

The Photo Wall is a paid feature (Plus and Pro) with zero configuration. Everything is
hard-coded in `src/app/e/[slug]/wall/photo-wall.tsx`: 6s per slide, 30s polling, fade
transition, guest name always shown, `object-contain` on flat black, no way to pause.

At a real event that is a problem. A host who wants to hold on a photo during a speech
cannot. A host projecting to a room cannot show a QR so people know how to join. And 6s
is wrong in both directions — too slow for 800 photos, too fast for 20.

## Scope

Per-event settings, edited by the owner at `/dashboard/events/[id]/wall`, applied by the
public wall at `/e/[slug]/wall`. Plus on-screen playback controls on the wall itself.

### Settings

| Setting | Column | Values | Default |
|---|---|---|---|
| Slide duration | `wall_slide_ms` | 3000–30000 | 6000 |
| Transition | `wall_transition` | `fade` \| `slide` \| `none` | `fade` |
| Order | `wall_order` | `newest` \| `oldest` \| `shuffle` | `newest` |
| Jump to new uploads | `wall_jump_to_new` | boolean | true |
| Show guest name | `wall_show_name` | boolean | true |
| Show event title | `wall_show_title` | boolean | true |
| Show join QR | `wall_show_qr` | boolean | false |
| Fit | `wall_fit` | `contain` \| `cover` | `contain` |
| Blurred backdrop | `wall_blur_bg` | boolean | true |

### Playback controls (on the wall screen)

Pause/play, previous, next, fullscreen. Hidden by default; fade in on mouse move or key
press; auto-hide after 3s idle. Keyboard: space = pause/play, arrows = prev/next,
`f` = fullscreen. Pausing must also suspend auto-advance, not merely hide the timer.

### Non-goals

- **No remote control from the host's phone.** Decided: on-screen only. Realtime sync is
  a much bigger build with more to fail live. Settings are shaped so a remote layer could
  be added later without changing the schema.
- **No video on the wall.** The wall already filters to photos; unchanged here.
- **No per-guest or per-album filtering.** Not asked for.
- **No plan gating in code.** The wall is marketed as Plus/Pro but is not currently
  gated, and adding entitlement checks is a separate concern from settings. Out of scope,
  flagged below.

## Architecture

Follows the countdown feature exactly — it is the closest analogue in the codebase
(per-event settings group, own migration, own lib, own dashboard page, own server action).

- **`supabase/009_wall_settings.sql`** — nine `add column if not exists` statements,
  idempotent, matching the house style of 004.
- **`src/lib/events/wall-settings.ts`** — `WallSettings` type, `DEFAULTS`, `fromRow`,
  `getWallSettingsPublic` (service-role, for the guest wall) and `getWallSettingsOwner`
  (RLS, for the dashboard). Both **degrade to defaults if the columns do not exist**, so
  the wall keeps working before the migration is run. This mirrors countdown's `available`
  flag but differs in one way: countdown hides the feature pre-migration, whereas the wall
  must keep playing — so defaults are returned rather than an unavailable state, and the
  dashboard separately reports whether the migration has run.
- **`src/lib/events/wall-actions.ts`** — `saveWallSettings(formData)`, `"use server"`,
  clamps and validates every field, redirects with `?saved=1` or `?error=`.
- **`src/app/(app)/dashboard/events/[id]/wall/page.tsx`** + `wall-form.tsx` — the settings
  UI, matching the countdown page's layout, `EventNav`, and saved/error banners.
- **`src/app/e/[slug]/wall/page.tsx`** — loads settings, passes to the client component.
- **`src/app/e/[slug]/wall/photo-wall.tsx`** — consumes settings, adds controls.
- **`src/components/event-nav.tsx`** — add the "Wall" tab.

### Validation lives in the action, not the form

Every value is clamped server-side (`wall_slide_ms` to 3000–30000, enums to their allowed
set) regardless of what the form posts. The form is a convenience; the action is the
boundary. A hand-crafted POST must not be able to set a 5ms slide duration and hang the
wall in a loop.

### Ordering and shuffle

`newest`/`oldest` sort by upload time. `shuffle` must be **stable within a session** —
reshuffling on every poll would make the wall jump unpredictably and repeat photos. Seed
the shuffle once per mount, and when new photos arrive, insert them without reshuffling
what is already there.

### Jump-to-new

When `wall_jump_to_new` is on and a poll returns photos not previously seen, the wall
advances to the newest one and resets the slide timer. This is the feature that makes
guests keep uploading: they see their photo appear within seconds. It must not fight
a paused wall — if the host has paused, new photos queue silently and do not seize
the display.

### The QR overlay

When `wall_show_qr` is on, a small QR pointing at the event's public upload URL sits in a
corner with a short caption.

Generated server-side via the existing `qrDataUrl()` in `src/lib/qr.ts` (already used for
print QR cards, backed by the installed `qrcode` package) and passed to the client as a
data URL. No new dependency, and no external image service — the wall may run on venue
wifi that blocks unknown hosts, so nothing on this screen should require a third-party
request at display time.

## Testing

No test framework in this repo, so verification is the loop used throughout: `tsc`,
`pnpm build`, then drive the real page.

1. Wall renders with defaults **before** the migration is run (the critical regression:
   a paid feature must not break because a SQL file has not been executed).
2. Each setting changes observable behaviour: duration timing, transition, order, name
   and title visibility, QR presence, fit, backdrop.
3. Pause stops auto-advance; play resumes; arrows move; `f` toggles fullscreen.
4. Controls auto-hide after 3s and reappear on mouse move.
5. Server action rejects out-of-range values (post `wall_slide_ms=5` → clamped, not stored).
6. Shuffle does not reorder across a poll.
7. No overflow at 375px (the dashboard form; the wall itself is a projector surface but
   should not break on a phone).

## Risks

- **The wall is a live surface.** It runs on a projector in front of a room. A crash or a
  blank screen mid-event is the worst failure mode in the product. Every settings read
  must have a defensive default, and the wall must never depend on a successful settings
  fetch to display photos.
- **Migration drift.** The columns will not exist on a database where 009 has not been
  run. Handled by defaults, and surfaced in the dashboard rather than silently.
- **Feature gating gap (pre-existing, out of scope).** Verified: there is no plan or
  entitlement check anywhere in `/e/[slug]/wall` or its API route, so the Photo Wall is
  reachable on any event — including free ones — while `/pricing` sells it as a Plus and
  Pro feature. `events.plan` exists (`003_multitenant.sql`, default `'trial'`), so the
  data is there to gate on. This design deliberately does not change it: adding
  entitlement checks is a separate piece of work with its own edge cases (what happens to
  a wall already projected when a plan lapses mid-event?). Recorded here so it is a known
  gap rather than a surprise.
