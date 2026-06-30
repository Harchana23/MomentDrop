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
  SR = env.SUPABASE_SERVICE_ROLE_KEY,
  ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL, SR, { auth: { persistSession: false } });
const stamp = Date.now();
const email = `ev-${stamp}@example.com`,
  password = "Password123!";
const { data: u } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
const asUser = createClient(URL, ANON, { auth: { persistSession: false } });
await asUser.auth.signInWithPassword({ email, password });
const { data: ev, error } = await asUser
  .from("events")
  .insert({ owner_id: u.user.id, slug: `smoke-wedding-${stamp}`, title: "Smoke Wedding" })
  .select("id, slug, plan, file_limit, active_until")
  .single();
if (error) throw new Error("insert: " + error.message);
console.log("created event:", ev.slug);
console.log("trial plan:", ev.plan === "trial" ? "ok" : "FAIL " + ev.plan);
console.log("file_limit default:", ev.file_limit === 30 ? "ok" : "FAIL " + ev.file_limit);
console.log("active_until ~7d:", new Date(ev.active_until) - Date.now() > 6 * 864e5 ? "ok" : "FAIL");
const { data: readBack } = await asUser.from("events").select("id").eq("id", ev.id).maybeSingle();
console.log("owner reads own event:", readBack ? "ok" : "FAIL");
await admin.from("events").delete().eq("id", ev.id);
await admin.auth.admin.deleteUser(u.user.id);
console.log("cleaned up");
