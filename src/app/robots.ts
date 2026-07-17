import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
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
