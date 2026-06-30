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
const { createClient } = await import("@supabase/supabase-js");
const URL = env.NEXT_PUBLIC_SUPABASE_URL,
  SR = env.SUPABASE_SERVICE_ROLE_KEY;
const admin = createClient(URL, SR, { auth: { persistSession: false } });
const stamp = Date.now();
const { data: u } = await admin.auth.admin.createUser({
  email: `set-${stamp}@example.com`,
  password: "Password123!",
  email_confirm: true,
});
const { data: a } = await admin.from("events").insert({ owner_id: u.user.id, slug: `a-${stamp}`, title: "A" }).select("id").single();
const { data: b } = await admin.from("events").insert({ owner_id: u.user.id, slug: `b-${stamp}`, title: "B" }).select("id, slug").single();

// details update
await admin.from("events").update({ title: "A2", eyebrow: "tag", require_approval: true, allow_uploads: false }).eq("id", a.id);
const { data: a1 } = await admin.from("events").select("title, eyebrow, require_approval, allow_uploads").eq("id", a.id).single();
console.log("details:", a1.title === "A2" && a1.eyebrow === "tag" && a1.require_approval === true && a1.allow_uploads === false ? "ok" : "FAIL " + JSON.stringify(a1));

// slug uniqueness
const dup = await admin.from("events").update({ slug: b.slug }).eq("id", a.id);
console.log("slug dup rejected:", dup.error ? "ok (" + (/(duplicate|unique)/i.test(dup.error.message) ? "unique" : dup.error.code) + ")" : "FAIL (allowed)");
const free = await admin.from("events").update({ slug: `c-${stamp}` }).eq("id", a.id);
console.log("slug change to free:", free.error ? "FAIL " + free.error.message : "ok");

// upload + delete cascade + storage cleanup
const path = `${a.id}/d/${stamp}-pixel.png`;
const { data: sgn } = await admin.storage.from("event-media").createSignedUploadUrl(path);
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC", "base64");
const fd = new FormData(); fd.append("cacheControl", "3600"); fd.append("", new Blob([png], { type: "image/png" }), "pixel.png");
await fetch(`${URL}/storage/v1/object/upload/sign/event-media/${path}?token=${encodeURIComponent(sgn.token)}`, { method: "PUT", body: fd });
await admin.from("uploads").insert({ event_id: a.id, guest_name: "G", storage_path: path, review_status: "published" });

await admin.storage.from("event-media").remove([path]);
await admin.from("events").delete().eq("id", a.id);
const { count: upLeft } = await admin.from("uploads").select("*", { count: "exact", head: true }).eq("event_id", a.id);
const { data: evGone } = await admin.from("events").select("id").eq("id", a.id).maybeSingle();
const { data: stGone } = await admin.storage.from("event-media").download(path);
console.log("delete cascade uploads:", upLeft === 0 ? "ok" : "FAIL (" + upLeft + ")");
console.log("event removed:", evGone ? "FAIL" : "ok");
console.log("storage object removed:", stGone ? "FAIL" : "ok");

await admin.from("events").delete().eq("id", b.id);
await admin.auth.admin.deleteUser(u.user.id);
console.log("cleaned up");
