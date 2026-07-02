import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://watch-energy.vercel.app";

// Static date keeps this route cacheable (no request-time API). Bump on
// meaningful content changes so crawlers know the page was refreshed.
const LAST_MODIFIED = "2026-07-02";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/quiz`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
