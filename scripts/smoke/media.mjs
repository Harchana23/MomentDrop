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
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const stamp = Date.now();
const { data: u } = await admin.auth.admin.createUser({
  email: `media-${stamp}@example.com`,
  password: "Password123!",
  email_confirm: true,
});
const { data: ev } = await admin
  .from("events")
  .insert({ owner_id: u.user.id, slug: `media-${stamp}`, title: "Media Smoke" })
  .select("id")
  .single();

await admin.from("uploads").insert([
  { event_id: ev.id, guest_name: "A", original_file_name: "a.jpg", media_type: "photo", storage_path: "p/a.jpg", review_status: "published" },
  { event_id: ev.id, guest_name: "B", original_file_name: "b.jpg", media_type: "photo", storage_path: "p/b.jpg", review_status: "pending" },
  { event_id: ev.id, guest_name: "C", original_file_name: "c.mov", media_type: "video", storage_path: "p/c.mov", review_status: "hidden" },
]);

const countOf = async (s) => {
  const { count } = await admin
    .from("uploads")
    .select("*", { count: "exact", head: true })
    .eq("event_id", ev.id)
    .eq("review_status", s);
  return count ?? 0;
};
console.log("counts published/pending/hidden:", await countOf("published"), await countOf("pending"), await countOf("hidden"));

// approve the pending one
await admin
  .from("uploads")
  .update({ review_status: "published" })
  .eq("event_id", ev.id)
  .eq("review_status", "pending");
console.log("after approve -> published:", (await countOf("published")) === 2 ? "ok (2)" : "FAIL");

await admin.from("events").delete().eq("id", ev.id);
await admin.auth.admin.deleteUser(u.user.id);
console.log("cleaned up");
