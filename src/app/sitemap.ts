import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

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
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/security", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
