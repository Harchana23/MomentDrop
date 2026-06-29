# MomentDrop

Private QR photo/video upload web app.

## Run Locally

```bash
pnpm.cmd dev --hostname 127.0.0.1 --port 3000
```

Open:

- Guest page: http://127.0.0.1:3000
- Admin page: http://127.0.0.1:3000/admin

## Current Status

- Project name set to MomentDrop.
- Next.js app scaffolded.
- Guest upload page created.
- Admin dashboard shell created.
- Lint passes.
- Production build passes.

## Step-By-Step Integration Plan

### Step 1: Webpage

Done. The app runs locally and has the first guest/admin screens.

### Step 2: Firebase

Add Firebase Cloud Firestore for:

- event config
- guest records
- upload records
- Google Drive file IDs
- admin settings

### Step 3: Google Drive

Add Google OAuth and Drive API for:

- creating/finding the wedding folder
- uploading photos/videos
- storing Drive file IDs in Firebase

### Step 4: Real Uploads

Wire the guest form to:

- validate name/files
- upload to Drive
- write metadata to Firestore
- show progress and success state

### Step 5: Vercel

Deploy the app to Vercel after Firebase and Google OAuth redirect URLs are ready.

## Environment Variables Later

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
