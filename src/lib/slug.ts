/** Lowercase, hyphenate, strip punctuation; bounded length. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

/** Short random base36 token for slug uniqueness + unguessability. */
export function randomToken(len = 5): string {
  let s = "";
  while (s.length < len) s += Math.random().toString(36).slice(2);
  return s.slice(0, len);
}

/** Event slug: readable stem from the title + random tail (globally unique enough). */
export function makeEventSlug(title: string): string {
  const stem = slugify(title) || "event";
  return `${stem}-${randomToken(5)}`;
}
