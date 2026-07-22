/**
 * Official MomentDrop profiles.
 *
 * One list, two consumers: the footer icons and the Organization `sameAs` in
 * JSON-LD. `sameAs` is how Google ties this site, the Instagram account and the
 * TikTok account together as one entity rather than three unrelated pages — which
 * is what earns Knowledge Graph recognition and AI-answer citation.
 *
 * Leave an href empty and it disappears from both the footer and the markup.
 * Never list a profile you don't control: `sameAs` is an identity claim.
 */
export type SocialLink = { label: string; href: string };

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", href: "" },
  { label: "TikTok", href: "" },
  { label: "Facebook", href: "" },
];

/** Just the configured URLs, for Organization.sameAs. */
export const socialUrls = (): string[] => SOCIAL_LINKS.filter((s) => s.href).map((s) => s.href);
