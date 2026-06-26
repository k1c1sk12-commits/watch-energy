import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://watch-energy.vercel.app";

// Static date keeps this route cacheable (no request-time API). Bump on
// meaningful content changes so crawlers know the page was refreshed.
const LAST_MODIFIED = "2026-06-01";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
