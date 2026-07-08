# MomentDrop — Contact form Make.com scenario

Importable blueprint: **`momentdrop-contact.blueprint.json`** (schema-validated).

## What it does

```
Custom webhook  →  Gmail: email STAFF   (momentdropsharing@gmail.com)
                →  Gmail: email CLIENT  (the person who submitted the form)
```

Two-way notification: your team gets the message, and the sender gets an
instant "we got your message" confirmation. Both emails come from your
connected Gmail, so the client can just reply to reach you.

The website POSTs this JSON to the webhook:

```json
{
  "source": "momentdrop-contact",
  "to": "momentdropsharing@gmail.com",
  "name":    "Aisyah",
  "email":   "aisyah@email.com",
  "subject": "Question about pricing",
  "message": "Hi, do you support..."
}
```

Mapped in the scenario as `{{1.name}}`, `{{1.email}}`, `{{1.subject}}`, `{{1.message}}`.

## Import steps

1. In Make: **Create a new scenario → ⋯ (top bar) → Import Blueprint →** upload
   `momentdrop-contact.blueprint.json`.
2. **Reconnect Gmail** on both email modules (they'll show as "reconnect
   required" — pick/create the connection for `momentdropsharing@gmail.com`).
3. Click the **webhook** module → **Add** → it generates a new webhook URL.
   **Copy it.**
4. **Save** the scenario and toggle it **ON** (scheduling = *Immediately*, since
   it's a webhook/instant scenario).

## Wire it to the site

5. In **Vercel → your project → Settings → Environment Variables**, add:

   ```
   MAKE_CONTACT_WEBHOOK_URL = <the webhook URL from step 3>
   ```

   Then **Redeploy** (env changes only apply on a new deployment). Add the same
   line to your local `.env.local` if you test locally.

6. Submit the contact form once at **/contact** — Make receives the first payload
   and locks in the field structure. Confirm both emails arrive (staff + client).

## Notes

- **Zone**: the blueprint lists `eu2.make.com`, but Make creates the scenario in
  *your* account's region on import and the webhook URL will match — no action
  needed.
- **Gmail sending limits**: a normal Gmail account sends ~500 emails/day, far
  above a contact form's needs.
- **Reply-to**: staff can reply to the notification and reach the client because
  the client's address is in the body; the client's confirmation comes from your
  Gmail so their reply lands in your inbox.
- Want more? Add modules after the emails — e.g. **Google Sheets → Add a row** to
  log every message, or a **WhatsApp/Telegram** alert. The webhook payload already
  carries everything.
