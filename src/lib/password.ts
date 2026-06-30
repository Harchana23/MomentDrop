import { scryptSync, randomBytes, timingSafeEqual, createHash } from "node:crypto";

/** Hash an event password as `salt:hash` (scrypt). */
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(plain, salt, 32);
  const orig = Buffer.from(hash, "hex");
  return orig.length === test.length && timingSafeEqual(orig, test);
}

/** Stable, non-reversible token derived from the stored hash — used as the unlock cookie. */
export function cookieToken(passwordHash: string): string {
  return createHash("sha256").update("md:" + passwordHash).digest("hex").slice(0, 32);
}
