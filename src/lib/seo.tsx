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
 * The product node for /pricing. Prices mirror the plan cards exactly; if the
 * cards change, change these in the same commit or the markup becomes a lie.
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
  offers: [
    { name: "Free", price: "0", description: "30 uploads, up to 10 guests, saved for 7 days." },
    { name: "Plus", price: "49", description: "400 uploads, unlimited guests, saved for 3 months, Live Photo Wall." },
    { name: "Pro", price: "99", description: "1,000 uploads, unlimited guests, saved for 6 months, custom event URL." },
  ].map((o) => ({
    "@type": "Offer",
    name: o.name,
    price: o.price,
    priceCurrency: "MYR",
    description: o.description,
    url: abs("/pricing"),
    availability: "https://schema.org/InStock",
  })),
};

/** Wraps nodes in a single @graph so one script tag carries the whole page. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
