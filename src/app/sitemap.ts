import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { GUIDES } from "@/lib/guides";

/**
 * Public marketing routes only. Event pages (/e/*) are private by design and
 * signed-in areas have nothing to index, so neither belongs in a sitemap.
 */
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" },
  { path: "/use-cases/wedding", priority: 0.8, changeFrequency: "monthly" },
  { path: "/use-cases/birthday", priority: 0.7, changeFrequency: "monthly" },
  { path: "/use-cases/party", priority: 0.7, changeFrequency: "monthly" },
  { path: "/use-cases/corporate", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/guides", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/security", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
  // Derived from the guide registry, so a new guide is listed without touching this file.
  // lastModified is the guide's own `updated` date, not the build time — a guide that
  // hasn't changed shouldn't claim it has.
  const guideRoutes = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));
  return [...staticRoutes, ...guideRoutes];
}
