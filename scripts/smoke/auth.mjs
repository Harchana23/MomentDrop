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
if (!ANON) {
  console.log("SKIP: NEXT_PUBLIC_SUPABASE_ANON_KEY not set in .env.local");
  process.exit(0);
}
const admin = createClient(URL, SR, { auth: { persistSession: false } });
const stamp = Date.now();
const mk = async (n) => {
  const email = `smoke+${n}-${stamp}@example.com`,
    password = "Password123!";
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`create ${n}: ${error.message}`);
  return { id: data.user.id, email, password };
};
const a = await mk("a"),
  b = await mk("b");
for (const u of [a, b]) {
  const { data } = await admin.from("profiles").select("id").eq("id", u.id).maybeSingle();
  console.log(`profile for ${u.email.split("@")[0]}:`, data ? "ok" : "MISSING (trigger failed)");
}
const { data: ev, error: ee } = await admin
  .from("events")
  .insert({ owner_id: a.id, slug: `smoke-${stamp}`, title: "Smoke event" })
  .select("id")
  .single();
if (ee) throw new Error("insert event: " + ee.message);
const asB = createClient(URL, ANON, { auth: { persistSession: false } });
await asB.auth.signInWithPassword({ email: b.email, password: b.password });
const { data: seen } = await asB.from("events").select("id").eq("id", ev.id);
console.log("B sees A's event:", (seen ?? []).length === 0 ? "no (RLS ok)" : "YES (RLS BROKEN)");
await admin.from("events").delete().eq("id", ev.id);
await admin.auth.admin.deleteUser(a.id);
await admin.auth.admin.deleteUser(b.id);
console.log("cleaned up");
