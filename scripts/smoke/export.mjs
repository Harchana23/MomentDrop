import { readFileSync } from "node:fs";
const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.trimStart().startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { createClient } = await import("@supabase/supabase-js");
const archiver = require("archiver");
const URL = env.NEXT_PUBLIC_SUPABASE_URL,
  SR = env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(URL, SR, { auth: { persistSession: false } });
const stamp = Date.now();

const { data: u } = await admin.auth.admin.createUser({
  email: `export-${stamp}@example.com`,
  password: "Password123!",
  email_confirm: true,
});
const { data: ev } = await admin
  .from("events")
  .insert({ owner_id: u.user.id, slug: `export-${stamp}`, title: "Export Smoke" })
  .select("id")
  .single();

// upload a real file to storage
const path = `${ev.id}/test/${stamp}-pixel.png`;
const { data: sgn } = await admin.storage.from("event-media").createSignedUploadUrl(path);
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64",
);
const fd = new FormData();
fd.append("cacheControl", "3600");
fd.append("", new Blob([png], { type: "image/png" }), "pixel.png");
await fetch(`${URL}/storage/v1/object/upload/sign/event-media/${path}?token=${encodeURIComponent(sgn.token)}`, {
  method: "PUT",
  body: fd,
});
await admin.from("uploads").insert({
  event_id: ev.id, guest_name: "Guest A", original_file_name: "pixel.png",
  media_type: "photo", storage_path: path, review_status: "published",
});

// replicate the route core: download + buffered zip
const { data: rows } = await admin.from("uploads").select("storage_path, original_file_name, guest_name, review_status").eq("event_id", ev.id);
const files = (rows ?? []).filter((r) => r.storage_path && r.review_status !== "hidden");
const archive = archiver("zip", { store: true });
const chunks = [];
archive.on("data", (c) => chunks.push(c));
const finished = new Promise((res, rej) => { archive.on("end", res); archive.on("error", rej); });
for (const f of files) {
  const { data: blob } = await admin.storage.from("event-media").download(f.storage_path);
  archive.append(Buffer.from(await blob.arrayBuffer()), { name: `${f.guest_name}/${f.original_file_name}` });
}
await archive.finalize();
await finished;
const zip = Buffer.concat(chunks);
console.log("zip bytes:", zip.length, "| PK header:", zip.slice(0, 2).toString() === "PK" ? "ok" : "FAIL", "| entries:", files.length);

await admin.storage.from("event-media").remove([path]);
await admin.from("events").delete().eq("id", ev.id);
await admin.auth.admin.deleteUser(u.user.id);
console.log("cleaned up");
