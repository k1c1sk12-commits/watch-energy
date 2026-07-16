import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Experience from "@/components/Experience";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = {
  title: "Watch Bracket — 35 Watches, One Grail | GPT Watch Collector",
  description:
    "Two watches, one tap. Knock out a real collector's 35-watch pool round by round until your grail is crowned — then share the podium. ｜腕錶對決：逐輪淘汰，選出你的 grail。",
  alternates: { canonical: "/bracket" },
  openGraph: {
    title: "Watch Bracket — knock them out until your grail is crowned",
    description: "Two watches, one tap, round by round. 35 pieces enter, one grail leaves.",
    url: "/bracket",
    siteName: "GPT Watch Collector",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Watch Bracket" }],
    type: "website",
  },
};

export default function BracketPage() {
  if (!FEATURES.bracket) notFound();
  return <Experience initialMode="bracket" />;
}
