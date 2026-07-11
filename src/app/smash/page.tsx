import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/features";
import { LETTER_BRANDS, TOTAL_BRANDS } from "@/lib/smash";
import SmashClient from "./SmashClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://watch-energy.vercel.app";
const IG_URL = "https://www.instagram.com/gptwatchcollector/";

export const metadata: Metadata = {
  title: "Watch Smash — Keyboard Smash Game for Watch Lovers | Watch Energy",
  description:
    "Smash your keyboard or tap your screen and real watch brands fly out — R for Rolex and Richard Mille, A for Audemars Piguet. Light up all 26 letters of the brand alphabet. Free, no sign-up. ｜腕錶亂打：亂打鍵盤，飛出真實腕錶品牌。",
  keywords: [
    "keyboard smash game",
    "watch game",
    "tap game",
    "watch brands game",
    "watch brand alphabet",
    "horology game",
    "fidget game",
    "腕錶遊戲",
    "鍵盤遊戲",
  ],
  alternates: { canonical: "/smash" },
  openGraph: {
    title: "Watch Smash — smash the keyboard, watch brands fly out",
    description:
      "Every letter throws out a real watch brand. Can you light up all 26 letters of the brand alphabet?",
    url: `${SITE_URL}/smash`,
    siteName: "Watch Energy",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Watch Energy — Watch Smash" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch Smash — Watch Energy",
    description:
      "Smash the keyboard, watch brands fly out. Light up all 26 letters of the brand alphabet.",
    images: ["/api/og"],
  },
};

function smashJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Watch Smash",
    url: `${SITE_URL}/smash`,
    applicationCategory: "GameApplication",
    operatingSystem: "Any (browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "A free keyboard-smash and tap game for watch lovers: every letter throws out a real watch brand, from Audemars Piguet to Zenith. Light up all 26 letters of the brand alphabet.",
    provider: {
      "@type": "Person",
      name: "gptwatchcollector",
      url: IG_URL,
    },
  };
}

// A few sample letters for the crawlable section — deterministic, so the
// static build stays stable.
const SAMPLE_LETTERS = ["a", "r", "p"] as const;

export default function SmashPage() {
  if (!FEATURES.smash) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(smashJsonLd()) }}
      />

      {/* The game itself (client-rendered, full viewport, in normal flow so
          the companion content below stays reachable). */}
      <SmashClient />

      {/* Visible below-the-fold companion content — same policy as /quiz:
          no hidden-text SEO, English-only static server content. */}
      <section className="mx-auto max-w-[560px] border-t border-border px-5 pb-16 pt-12">
        <p className="text-[0.75rem] uppercase tracking-[0.18em] text-low">About this game</p>
        <h1 className="mt-2 font-display text-[1.4rem] font-light text-hi">
          Watch Smash — a keyboard-smash game for watch lovers
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-mid">
          Smash your keyboard or tap your screen, and real watch brands fly out. Every letter is
          mapped to the maisons and independents that start with it — press R and you might get
          Rolex, Richard Mille or Ressence; press A and it&apos;s Audemars Piguet or A. Lange &amp;
          Söhne. There are {TOTAL_BRANDS} brands hiding across the alphabet, from grande maisons
          to microbrands, and the goal is simple: light up all 26 letters.
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-mid">
          On a phone, every tap bursts a brand at your fingertip and dragging leaves a golden
          trail. Number keys throw dial numerals — Arabic or Roman, including the
          watchmaker&apos;s IIII. At the end you get a Smash Report — your total, your brand haul, and a collector
          chaos rating. Free, no sign-up, and quietly educational: you will leave knowing at least
          one brand you had never heard of.
        </p>

        <h2 className="mt-8 font-display text-[1.15rem] font-light text-hi">
          A taste of the brand alphabet
        </h2>
        <ul className="mt-3 flex flex-col gap-3 text-[0.9rem] leading-relaxed text-mid">
          {SAMPLE_LETTERS.map((l) => (
            <li key={l} className="rounded-[var(--radius-md)] border border-border bg-raised px-4 py-3">
              <p className="font-display text-[1.05rem] text-hi">{l.toUpperCase()}</p>
              <p className="mt-1 text-[0.85rem] text-mid">{LETTER_BRANDS[l].join(" · ")}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.85rem] leading-relaxed text-low">
          And Q? No great maison starts with Q — in this game it belongs to the Quartz Crisis of
          1969, the moment that nearly ended them all.
        </p>

        <p className="mt-8 text-[0.95rem] leading-relaxed text-mid">
          Built by the collector behind{" "}
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-bright underline underline-offset-4"
          >
            @gptwatchcollector
          </a>
          , where the real collection — haute horlogerie, independents and complications — lives.
          Watch Smash is one of five free games on Watch Energy, alongside the Destiny Watch
          match, the Watch Knowledge Quiz, the Watch Tier List and the Watch Bracket.
        </p>
      </section>
    </>
  );
}
