# AI Moments — design

Date: 2026-07-20
Status: approved (pending spec review)

## Why

MomentDrop hands the host a ZIP and stops. The moment of "I have 612 photos, now
what" is where the product currently abandons them, and it is the one place a
competitor has not already staked out.

Market check (July 2026): Kululu shipped AI moderation on Pro in August 2025.
GuestCam has selfie-based face matching ("MagicFind"); Waldo added facial and
object-recognition search in January 2026. **So AI moderation and face search are
catch-up, not differentiation.** What none of them do — and none of them will,
because Malaysia is a rounding error to a global platform — is understand that a
Malaysian wedding has an akad nikah, a berinai, a bersanding, and a makan beradab.

That is the wedge: not "AI for photos", but *this* market's ceremonies, named
correctly, by the product that already says it is made for Malaysian celebrations.

## What it produces

A **shareable recap page** — "Aisyah & Daniel's wedding, in 9 moments" — that the
host publishes and sends to their guests.

The recap is the growth loop. It lands in the same WhatsApp group that failed to
collect the photos in the first place, every guest who opens it sees the event
organised beautifully, and a quiet "collecting photos at your own event?" line sits
at the bottom. Guests who did not upload realise they should have.

Each moment leads with **6–12 curated photos** and a "see all" link to the full set.
A recap must be skimmable in about a minute — that is what makes it get shared. The
archive is one click away, not the front page.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Deliverable | Shareable recap page | Only option with a growth loop; the others are host-only |
| Review model | Draft → host approves → publish | A wrong ceremony name on a public page gets screenshotted |
| Tradition detection | Infer from photos, correct in draft | No setup question that reads as asking about race; handles mixed-tradition weddings |
| Plans | Plus and Pro | Restores the headline feature Plus lost when the Photo Wall went free; caps AI spend to paid events |
| Photos per moment | Curated few + "see all" | Skimmable beats complete for something meant to be shared |

## The honesty rule: additive, never subtractive

AI curation **suggests, it never decides**. No photo is ever deleted, hidden by
default, or excluded from the archive because a model scored it low. Curation only
chooses what *leads* a moment on the recap page; every photo remains in the gallery
and in the ZIP.

The failure this prevents: quietly burying the one photo of a grandparent who has
since died. That is unrecoverable and unforgivable, and no amount of tidier output
is worth risking it.

## Architecture: two passes

### Pass 1 — per photo, once, cached

Each photo is scored once, on a ~512px thumbnail via the existing
`driveThumbUrl(fileId, 512)`, and the result is stored on the `uploads` row.

```
{
  caption: string        // one line: what is happening
  tags: string[]         // e.g. ["ceremony", "indoor", "group", "formal-dress"]
  quality: 0..1          // sharpness, exposure, composition
  isJunk: boolean        // screenshot, pocket shot, accidental
  isSafe: boolean        // moderation flag
  wallWorthy: boolean    // fit to project on a screen
  capturedAt: string?    // EXIF DateTimeOriginal when present
}
```

**One pass serves three features.** This same record is what moderation needs (flag
the inappropriate and the accidental), what the Photo Wall needs (never project a
blurry frame — see `2026-07-17-photo-wall-settings-design.md`), and what Moments
needs. Build one scoring pass, three features consume it.

Runs per upload, not as one spike, so cost spreads across the event and moderation
is live — which it has to be anyway, since with auto-publish a bad photo reaches the
Photo Wall in seconds.

### Pass 2 — group the records into moments

Triggered by the host clicking **Create recap**. Never automatic: a recap nobody
asked for is money spent on an event that may never be looked at.

Pass 2 sends **only the text records** — captions, tags, timestamps, ordering — to a
text-only Gemini call that returns moment groupings with names and confidence. No
images. This is why it is cheap enough to re-run every time the host edits the draft,
which they will.

### Why two passes rather than one big call

Rejected: sending all 600 thumbnails in one call. Every regeneration costs full
price, one failure loses everything, and the host waits minutes.

Rejected: clustering by time first, then naming clusters. **Verified: there is no
capture time in the schema.** `uploads` stores only `created_at` — upload time. A
guest who shoots all day and uploads at 11pm gives 200 photos stamped 11pm. Time
clustering on that is worthless. Pass 1 opportunistically reads EXIF where it exists,
as an *additional* ordering signal, never the primary mechanism — photos forwarded
through WhatsApp arrive stripped.

## The neutral-fallback rule

When pass 2 is not confident about a ceremony, it must return a **descriptive
name from what it can see** — "Afternoon at the pelamin", "Before the ceremony" —
and mark the moment low-confidence. It must never guess a named ceremony it is
unsure of.

The draft view surfaces low-confidence moments in amber with "not sure — rename
this?". A hedged label is a two-second chore; a confident wrong one ("Tea ceremony"
on an akad nikah) is an insult on a page the whole family opens.

## Draft and publish

1. Host clicks **Create recap** → pass 2 runs → private draft.
2. Draft view lists moments: rename, reorder, split, merge, remove, and swap which
   photos lead. Low-confidence moments are flagged.
3. **Regenerate** re-runs pass 2 only (cheap — no images).
4. **Publish** makes the recap live at `/e/[slug]/recap`.
5. The host can unpublish at any time.

Nothing is public until step 4.

## Privacy and access

**Guest disclosure (PDPA).** Photos are sent to Google's Gemini API for analysis —
a disclosure to a third-party processor, and guests are the data subjects. Required:

- A line on the guest upload page stating photos may be automatically analysed to
  organise the album.
- A section in `/privacy` naming Google as a processor, what is sent (a reduced-size
  copy), what is derived (a caption and quality flags), and that it is not used to
  train models.
- Analysis is per-event and off by default for events on Free (which cannot use
  Moments anyway).

**The recap inherits the event's access rules.** If the event is password-protected,
so is the recap. If `guests_see_only_own` is on, the host is warned that publishing a
recap contradicts it, and publishing is blocked until they turn it off. A privacy
setting that one feature silently ignores is worse than no setting.

**Only published photos** are eligible. Anything pending approval, or rejected, never
reaches pass 2.

## Cost

Pass 1 is roughly 600 tokens per photo (a 512px thumbnail plus a short prompt and a
short structured response). A 612-photo wedding is therefore ~370K tokens, one time,
cached forever. Pass 2 is text-only over ~600 short records — a fraction of that, and
the only part that repeats.

At current Gemini Flash rates this is a small single-digit fraction of a RM49 upgrade.
**Verify live pricing before launch** rather than trusting this estimate.

Cost controls: Plus/Pro only; pass 1 runs once per photo and is cached; pass 2 is
manual; a per-event cap on regenerations if abuse appears.

## Non-goals

- **No face recognition.** Faces are biometric data — sensitive personal data under
  Malaysia's PDPA, amended in 2024 with breach-notification and DPO duties phasing in
  through 2025. Guests here have no accounts and sign nothing, so this would mean
  processing biometrics of people who never agreed, at scale, with no legal function
  in the company. Two competitors do it; that means they accepted a risk, not that it
  is safe for us. Revisit only with explicit consent flows and actual legal advice.
- **No video analysis.** Photos only in pass 1; video is far more expensive and the
  wall already filters to photos.
- **No auto-generated highlight video.** Separate, much larger feature.
- **No AI editing or enhancement of guest photos.** It would undermine the
  authenticity the whole product sells.
- **No moment detection for non-wedding events in v1.** Birthdays and corporate
  events get generic moments; the ceremony vocabulary is wedding-specific.

## Testing

No test framework in this repo, so verification follows the loop used throughout:
`tsc`, `pnpm build`, then drive the real pages.

1. Pass 1 writes a well-formed record; a photo it fails on leaves an unscored row and
   breaks nothing downstream.
2. The gallery, the ZIP, and the Photo Wall are all unchanged when scoring is absent
   (pre-migration, or API key missing, or quota exhausted).
3. Pass 2 returns moments covering every published photo, with no photo in two moments.
4. A low-confidence moment renders with a neutral name and the amber flag.
5. Draft is unreachable to anyone but the owner; recap 404s until published.
6. A password-protected event's recap requires the password.
7. `guests_see_only_own` blocks publishing with a clear message.
8. Free-plan events cannot reach Create recap.
9. Regenerate does not re-run pass 1 (assert no image calls).
10. No page-level overflow at 375px on the recap.

## Risks

- **Cultural error is the reputational risk.** Mitigated by neutral fallback, draft
  review, and never publishing without the host. Accept that it will still sometimes
  be wrong and make correction trivial.
- **A public recap is a new exposure surface.** It publishes guest photos to anyone
  with the link. Mitigated by inheriting event access rules, host-controlled publish,
  and unpublish.
- **Model dependency.** Gemini quota, outage, or price change directly affects a paid
  feature. Every path must degrade to "recap unavailable, everything else works".
- **Scope.** This is meaningfully larger than the guides or the wall settings. If it
  needs splitting, pass 1 (scoring + moderation + wall-worthiness) is a coherent
  standalone first phase that delivers value with no recap page at all.
