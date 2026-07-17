import type { MetadataRoute } from "next";
import { SITE_URL, IS_INDEXABLE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Staging (vercel.app / localhost): keep the whole thing out of search.
  // Reverts to the rules below automatically once SITE_URL is the real domain.
  if (!IS_INDEXABLE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Guest event pages are private to the host, and the rest is signed-in
      // or machine-only. Crawling them serves nobody and leaks event links.
      disallow: ["/api/", "/e/", "/dashboard", "/onboarding", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
