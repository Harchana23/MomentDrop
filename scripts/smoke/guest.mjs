import { readFileSync } from "node:fs";
const BASE = "http://127.0.0.1:3100";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);
const { createClient } = await import("@supabase/supabase-js");
const URL = env.NEXT_PUBLIC_SUPABASE_URL,
  SR = env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(URL, SR, { auth: { persistSession: false } });
const stamp = Date.now();

const { data: u } = await admin.auth.admin.createUser({
  email: `guest-${stamp}@example.com`,
  password: "Password123!",
  email_confirm: true,
});
const slug = `smoke-guest-${stamp}`;
const { data: ev } = await admin
  .from("events")
  .insert({ owner_id: u.user.id, slug, title: "Smoke Guest Event" })
  .select("id")
  .single();
console.log("event:", slug);

// 1) sign (through the real route)
const sign = await fetch(`${BASE}/api/upload/sign`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    eventSlug: slug,
    guestName: "Smoke Guest",
    files: [{ name: "pixel.png", type: "image/png", size: 69 }],
  }),
});
const signData = await sign.json();
console.log("1) sign:", sign.status, sign.ok ? "ok" : JSON.stringify(signData));
const f = signData.files?.[0];

// 2) upload to signed URL (browser path)
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64",
);
const fd = new FormData();
fd.append("cacheControl", "3600");
fd.append("", new Blob([png], { type: "image/png" }), "pixel.png");
const put = await fetch(
  `${URL}/storage/v1/object/upload/sign/${signData.bucket}/${f.path}?token=${encodeURIComponent(f.token)}`,
  { method: "PUT", body: fd },
);
console.log("2) storage PUT:", put.status);

// 3) complete
const done = await fetch(`${BASE}/api/upload/complete`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    eventSlug: slug,
    guestName: "Smoke Guest",
    files: [{ storagePath: f.path, originalFileName: "pixel.png", mimeType: "image/png", size: 69 }],
  }),
});
const doneData = await done.json();
console.log("3) complete:", done.status, JSON.stringify(doneData));

// 4) verify recorded
const { count } = await admin
  .from("uploads")
  .select("*", { count: "exact", head: true })
  .eq("event_id", ev.id);
console.log("4) uploads recorded for event:", count === 1 ? "ok (1)" : "FAIL (" + count + ")");

// cleanup
await admin.storage.from("event-media").remove([f.path]);
await admin.from("events").delete().eq("id", ev.id);
await admin.auth.admin.deleteUser(u.user.id);
console.log("cleaned up");
