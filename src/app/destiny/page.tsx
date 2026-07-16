import type { Metadata } from "next";
import Experience from "@/components/Experience";

export const metadata: Metadata = {
  title: "Your Destiny Watch — Birthday Watch Match | GPT Watch Collector",
  description:
    "Your birth date and your nature decide one haute-horlogerie watch written for you — case, dial, strap, and the energy it carries. Two taps, about 15 seconds. Built on a real collector's watch pool. ｜你的命定之錶：以出生與本質配對一枚高級腕錶。",
  alternates: { canonical: "/destiny" },
  openGraph: {
    title: "Your Destiny Watch — which watch is written for you?",
    description:
      "Your birth and your nature decide one haute-horlogerie piece. Not a horoscope — a horological match.",
    url: "/destiny",
    siteName: "GPT Watch Collector",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Your Destiny Watch" }],
    type: "website",
  },
};

export default function DestinyPage() {
  return <Experience initialMode="destiny" />;
}
