"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPublicEventBySlug } from "./public";
import { verifyPassword, cookieToken } from "@/lib/password";

/** Guest enters an event password; on success we set an unlock cookie for that event. */
export async function verifyEventPassword(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const password = String(formData.get("password") ?? "");
  const event = slug ? await getPublicEventBySlug(slug) : null;
  if (!event || !event.password_hash) redirect(`/e/${slug}`);
  if (!verifyPassword(password, event.password_hash)) redirect(`/e/${slug}?pwerror=1`);

  const store = await cookies();
  store.set(`md_pw_${event.id}`, cookieToken(event.password_hash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(`/e/${slug}`);
}
