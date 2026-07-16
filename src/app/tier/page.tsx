import type { Metadata } from "next";
import Experience from "@/components/Experience";

export const metadata: Metadata = {
  title: "Watch Tier List — Rank 35 Luxury Watches | GPT Watch Collector",
  description:
    "Rank all 35 watches in a real collector's pool into your own tiers — S down to Never — then share your taste as a tier-list card. Audemars Piguet, Lange, F.P. Journe, independents and more. ｜腕錶 tier list：35 枚高級腕錶任你排。",
  alternates: { canonical: "/tier" },
  openGraph: {
    title: "Watch Tier List — rank 35 luxury watches, share your taste",
    description:
      "S down to Never: rank a real collector's 35-watch pool and share your tier list.",
    url: "/tier",
    siteName: "GPT Watch Collector",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Watch Tier List" }],
    type: "website",
  },
};

export default function TierPage() {
  return <Experience initialMode="tier" />;
}
