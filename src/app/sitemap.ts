import type { MetadataRoute } from "next";
import { FEATURES } from "@/lib/features";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://watch-energy.vercel.app";

// Static date keeps this route cacheable (no request-time API). Bump on
// meaningful content changes so crawlers know the page was refreshed.
const LAST_MODIFIED = "2026-07-08";

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
    // flag-gated: the routes 404 until launch, so keep them out of the sitemap
    ...(FEATURES.smash
      ? [
          {
            url: `${SITE_URL}/smash`,
            lastModified: LAST_MODIFIED,
            changeFrequency: "monthly" as const,
            priority: 0.8,
          },
        ]
      : []),
    ...(FEATURES.hunt
      ? [
          {
            url: `${SITE_URL}/hunt`,
            lastModified: LAST_MODIFIED,
            changeFrequency: "monthly" as const,
            priority: 0.6,
          },
        ]
      : []),
  ];
}
