import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gptwatchcollector.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The OG image route is for social cards, not a page to index.
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
