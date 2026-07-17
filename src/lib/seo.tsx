import { PLANS } from "@/lib/plans";

/**
 * SEO foundation: canonical origin, JSON-LD emitter, and the schema builders.
 *
 * On structured data: it is not a ranking signal. It makes a page *eligible* for
 * a search feature (price, breadcrumbs) and tells engines which entity the page
 * describes. Everything marked up here must stay true to what a visitor can
 * actually see on the page — marking up invisible or invented data is a Google
 * policy violation, not a shortcut.
 *
 * Deliberately absent: FAQPage (Google stopped showing FAQ rich results on
 * 7 May 2026, so it buys nothing) and AggregateRating/Review (the testimonials
 * are still placeholders — marking those up as real ratings would be both a
 * policy violation and a consumer-law problem).
 */

/**
 * Absolute origin, used for canonical URLs, the sitemap, and JSON-LD `@id`s.
 * Set NEXT_PUBLIC_SITE_URL in the environment; Vercel's production URL is the
 * fallback so preview builds still emit sane absolute URLs.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

/** Absolute URL for a site-relative path. */
export const abs = (path: string) => new URL(path, SITE_URL).toString();

/**
 * Whether this deployment should be indexed by search engines.
 *
 * Only the real domain is. A vercel.app URL is a staging address we don't own —
 * letting Google index it would make it the canonical MomentDrop, and moving to
 * the real domain later would then mean redirects and re-earning authority.
 *
 * Deliberately derived from SITE_URL rather than a manual flag: indexing switches
 * itself on the moment NEXT_PUBLIC_SITE_URL points at the real domain. A hand-set
 * "noindex" that someone forgets to remove at launch is the expensive failure here
 * — the site goes live and is invisible for months, with nothing obviously broken.
 */
export const IS_INDEXABLE = !/^https?:\/\/(localhost|127\.0\.0\.1)|\.vercel\.app$/i.test(SITE_URL);

/** Stable @id values so the graph nodes can reference each other. */
const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

/**
 * Emits a JSON-LD block. `<` is escaped because a raw `</script>` inside the
 * JSON would close the tag early and let string data become markup.
 */
export function JsonLd({ schema }: { schema: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}

/** The MomentDrop entity itself. Emitted once, site-wide, from the root layout. */
export const organizationSchema = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "MomentDrop",
  url: SITE_URL,
  logo: abs("/logo.png"),
  email: "momentdropsharing@gmail.com",
  description:
    "MomentDrop lets event hosts collect every guest's photos and videos with one QR scan — no app and no account for guests.",
  areaServed: { "@type": "Country", name: "Malaysia" },
};

/** The website node. Also emitted once, site-wide. */
export const websiteSchema = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_URL,
  name: "MomentDrop",
  publisher: { "@id": ORG_ID },
  inLanguage: "en-MY",
};

/**
 * Breadcrumb trail. Still produces a real rich result, unlike FAQ markup.
 * Pass the trail without the home crumb — it is prepended here.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/**
 * The product node for /pricing. Offers are generated from lib/plans.ts — the same
 * source the visible plan cards render from, so the two cannot drift apart.
 */
export const softwareApplicationSchema = {
  "@type": "SoftwareApplication",
  name: "MomentDrop",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any (web-based)",
  url: abs("/pricing"),
  publisher: { "@id": ORG_ID },
  description:
    "Collect every guest's photos and videos at an event with one QR scan. Guests upload from any phone browser — no app, no account. Priced one-time per event.",
  offers: PLANS.map((p) => ({
    "@type": "Offer",
    name: p.name,
    price: String(p.price),
    priceCurrency: "MYR",
    description: `${p.uploadsLabel} uploads, ${p.guestsLabel}, saved for ${p.retentionLabel}.`,
    url: abs("/pricing"),
    availability: "https://schema.org/InStock",
  })),
};

/** Wraps nodes in a single @graph so one script tag carries the whole page. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
