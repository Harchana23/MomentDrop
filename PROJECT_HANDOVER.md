# MomentDrop Project Handover

Last updated: 2026-06-29

## Project Summary

MomentDrop is a private QR-based wedding photo/video upload platform inspired by Guestpix and Wedding Studio.

The goal is not to build a public SaaS first. The goal is a personal-use web platform for Harchana Wedding:

- Guests scan a QR code.
- Guests open a normal mobile web page.
- Guests upload photos/videos without downloading an app.
- Guests do not need a Google account.
- Admin manages the event from a web dashboard.
- Media is stored in Google Drive.
- Metadata is stored in Firebase Cloud Firestore.
- The app will be hosted on Vercel.

## Final Project Name

Name chosen: **MomentDrop**

Suggested naming across services:

```text
App display name: MomentDrop
Vercel project: momentdrop
Firebase project: momentdrop
Google Drive folder: MomentDrop - Harchana Wedding
Event slug: harchana-wedding
GitHub repo: Harchana23/MomentDrop
```

Tagline idea:

```text
Scan. Drop. Remember.
```

## Product Flow

### Guest Flow

1. Guest scans QR code at the wedding.
2. Browser opens the MomentDrop guest upload page.
3. Guest enters:
   - name
   - optional message
   - later optional table number
4. Guest selects photos/videos from phone.
5. Upload starts with progress feedback.
6. Backend uploads original media into Google Drive.
7. Backend saves metadata into Firebase.
8. Guest sees a thank-you/success screen.

Guests do **not** download an app.

Guests do **not** log in.

Guests do **not** access Google Drive directly.

### Admin Flow

1. Admin opens `/admin`.
2. Admin sees upload count, guest count, Drive status, and recent uploads.
3. Admin later connects Firebase and Google Drive.
4. Admin can view uploaded records and Drive file links.
5. Admin can generate/use the final QR link after deployment.

Admin remains a web platform, not a native app.

## Architecture Decision

Chosen stack:

```text
Next.js on Vercel
  -> guest upload page
  -> admin dashboard
  -> API routes for upload/auth logic

Firebase Cloud Firestore
  -> event config
  -> guest records
  -> upload records
  -> Google Drive file IDs
  -> admin settings

Google Drive
  -> original photos
  -> original videos
  -> long-term human-friendly archive
```

Rejected/avoided for now:

- Stripe/payment, because this is personal use.
- Guest app downloads.
- Direct shared Google Drive folder upload, because it exposes Drive permissions and creates a worse guest experience.
- Public SaaS multi-tenant logic, because v1 only needs Harchana Wedding.

## Google Drive Storage Plan

Use Google Drive as the archive, with the app uploading files on behalf of guests.

Recommended folder:

```text
MomentDrop - Harchana Wedding/
  00_Metadata/
    uploads.csv
    uploads.json
  Photos/
    2026-06-29 - Guest Name - original-file-name.jpg
  Videos/
    2026-06-29 - Guest Name - original-file-name.mov
  Messages/
    guestbook.csv
  QR/
    momentdrop-harchana-wedding-qr.png
```

Important rule:

Guests should upload through MomentDrop, not directly into a shared Drive folder.

## Firebase Plan

Use **Cloud Firestore**, not Firebase Realtime Database.

Suggested Firestore structure:

```text
events/{eventId}
  name
  slug
  date
  timezone
  driveRootFolderId
  isActive
  uploadPinEnabled
  createdAt

events/{eventId}/guests/{guestId}
  displayName
  tableNumber
  firstSeenAt
  lastUploadAt
  uploadCount

events/{eventId}/uploads/{uploadId}
  guestId
  guestName
  originalFileName
  safeFileName
  mimeType
  size
  driveFileId
  driveWebViewLink
  mediaType
  status
  message
  createdAt

admins/{uid}
  email
  role
  createdAt
```

Recommended auth:

- Firebase Authentication with Google sign-in for admin.
- Only the admin account should log in.
- Guests should remain anonymous/no-login.

Security approach:

- Guests call Vercel API routes.
- API routes validate input and write to Firestore using Firebase Admin SDK.
- Do not allow broad direct browser writes to Firestore in v1.

## Vercel Plan

Vercel is used for:

- guest upload page
- admin dashboard
- API routes
- future production deployment

Routes currently planned:

```text
/                  guest upload page
/admin             admin dashboard
/e/[eventSlug]     future event-specific guest page
/api/upload        future upload endpoint
/api/admin/*       future admin endpoints
```

Important upload caution:

Large wedding videos can run into payload/time limits if uploaded naively through a basic serverless function. For v1:

- keep conservative upload limits
- use Google Drive resumable uploads where possible
- avoid loading large files fully into memory
- if videos become unreliable, keep Vercel for UI and add a small upload worker later

## Current Local Project

Local project path:

```text
C:\Users\cyber\Downloads\Claude MCP\Harchana\Wedding\wedding-qr-app
```

Research/handover parent folder:

```text
C:\Users\cyber\Downloads\Claude MCP\Harchana\Wedding
```

Existing research file:

```text
C:\Users\cyber\Downloads\Claude MCP\Harchana\Wedding\wedding-qr-photo-app-google-drive-research.md
```

## Current Code Status

Completed:

- Next.js app scaffolded.
- Tailwind configured by `create-next-app`.
- Project renamed to `momentdrop` in `package.json`.
- Guest upload page created at `/`.
- Admin dashboard shell created at `/admin`.
- App metadata updated to MomentDrop.
- README updated with run commands and integration plan.
- Nested Git repo initialized in `wedding-qr-app`.
- Initial commit created locally.

Local commit:

```text
83e2f4f Initial MomentDrop app
```

Verification passed:

```powershell
pnpm.cmd lint
pnpm.cmd build
```

Local dev server command:

```powershell
cd "C:\Users\cyber\Downloads\Claude MCP\Harchana\Wedding\wedding-qr-app"
pnpm.cmd dev --hostname 127.0.0.1 --port 3000
```

Local URLs:

```text
Guest page: http://127.0.0.1:3000
Admin page: http://127.0.0.1:3000/admin
```

## GitHub Status

GitHub repo created by user:

```text
https://github.com/Harchana23/MomentDrop.git
```

Remote configured locally:

```text
origin https://github.com/Harchana23/MomentDrop.git
```

Push status:

- Local commit exists.
- Push is currently blocked by GitHub credentials.
- The machine is authenticated as `Cyberg7tech`.
- GitHub rejects push to `Harchana23/MomentDrop` because `Cyberg7tech` does not have write access.

Observed error:

```text
remote: Permission to Harchana23/MomentDrop.git denied to Cyberg7tech.
fatal: unable to access 'https://github.com/Harchana23/MomentDrop.git/': The requested URL returned error: 403
```

To complete push:

Option 1:

- Add `Cyberg7tech` as collaborator with write access to `Harchana23/MomentDrop`.
- Then run:

```powershell
cd "C:\Users\cyber\Downloads\Claude MCP\Harchana\Wedding\wedding-qr-app"
git push -u origin main
```

Option 2:

- Use a GitHub PAT from `Harchana23` with repo write access.
- Clear cached GitHub credential if needed.
- Push as `Harchana23`.

## Environment Variables Planned

Future `.env.local` / Vercel environment variables:

```text
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_ROOT_FOLDER_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

ADMIN_EMAIL=
SESSION_SECRET=
NEXT_PUBLIC_EVENT_SLUG=harchana-wedding
```

Do not commit real secrets.

## Implementation Roadmap

### Step 1: Webpage

Status: done.

Includes:

- guest upload UI
- admin dashboard shell
- local Next.js app
- lint/build verification

### Step 2: Firebase

Next implementation step.

Tasks:

1. Create Firebase project named `momentdrop`.
2. Enable Cloud Firestore.
3. Create Firebase Admin service account.
4. Add Firebase env vars to `.env.local`.
5. Add Firebase Admin SDK to app.
6. Create server-side Firestore helpers.
7. Replace mock admin stats/uploads with Firestore data.
8. Create event seed/config for `harchana-wedding`.

### Step 3: Google Drive

Tasks:

1. Create Google Cloud OAuth credentials.
2. Enable Google Drive API.
3. Add redirect URL for local dev and later Vercel.
4. Build admin Drive connect flow.
5. Store refresh token securely.
6. Create/find `MomentDrop - Harchana Wedding` Drive folder.
7. Add Drive upload helper.
8. Store Drive file IDs in Firestore.

### Step 4: Real Guest Uploads

Tasks:

1. Make guest form interactive.
2. Validate name/message/files.
3. Add upload progress.
4. Upload files to Google Drive.
5. Write upload metadata to Firestore.
6. Show success state.
7. Show errors cleanly.
8. Test on iPhone Safari and Android Chrome.

### Step 5: Admin Dashboard

Tasks:

1. Add admin authentication.
2. Show real upload list.
3. Show Drive links.
4. Add delete/hide status if needed.
5. Add QR code download.
6. Add event settings.

### Step 6: Vercel Deployment

Tasks:

1. Create Vercel project named `momentdrop`.
2. Add environment variables.
3. Add Google OAuth production redirect URL.
4. Deploy.
5. Test production URL on mobile.
6. Generate final QR code only after URL is stable.

## Design Notes

UI direction:

- Warm, elegant wedding feel.
- Quiet admin platform, not a marketing landing page.
- Mobile-first guest upload page.
- Admin page should stay functional and scannable.

Current UI colors:

- warm off-white background
- dark ink primary text
- gold/brown accents
- simple bordered cards

Current copy:

```text
MomentDrop
Share the moments we missed.
Harchana Wedding guest photos and videos, gathered in one private Drive folder.
```

## Key Decisions Made

- Project name: MomentDrop.
- Guest experience: web page only, no app download.
- Admin experience: web dashboard.
- Hosting: Vercel.
- Database: Firebase Cloud Firestore.
- Media storage: Google Drive.
- Payment: no Stripe for v1.
- Auth: admin only; guests no-login.
- Repo: `Harchana23/MomentDrop`.

## Known Risks

- GitHub push requires correct `Harchana23` credentials or collaborator access.
- Google Drive API OAuth setup can be fiddly.
- Large video uploads may need resumable upload implementation or later upload worker.
- Vercel serverless functions should not naively buffer huge files.
- Firebase security rules/Admin SDK boundaries must be kept tight.
- Final QR code should only be printed after production URL is stable.

## Resume Prompt

Use this to resume work in a new session:

```text
We are building MomentDrop at:
C:\Users\cyber\Downloads\Claude MCP\Harchana\Wedding\wedding-qr-app

Read PROJECT_HANDOVER.md first.

Current status:
- Next.js app exists.
- Guest page and admin shell are built.
- lint/build pass.
- local commit exists: 83e2f4f Initial MomentDrop app.
- GitHub push is blocked until Harchana23 repo credentials/collaborator access are fixed.

Next implementation step:
Set up Firebase Cloud Firestore integration for event config, guests, and uploads.
```
