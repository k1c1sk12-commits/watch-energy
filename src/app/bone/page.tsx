import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FEATURES } from "@/lib/features";
import BoneClient from "./BoneClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gptwatchcollector.com";
const IG_URL = "https://www.instagram.com/gptwatchcollector/";

export const metadata: Metadata = {
  title: "Bone Eater — the Watch Allocation Game | Watch Energy",
  description:
    "A satirical watch tycoon game about the AD game: bundle the shelf sitters, build purchase history, and wait for the sales associate's call. Three levels, three grails. Free, no sign-up. ｜食骨模擬器：配貨求生遊戲。",
  keywords: [
    "watch allocation game",
    "AD game watches",
    "watch bundling",
    "watch tycoon game",
    "watch dealer game",
    "watch collecting game",
    "authorized dealer allocation",
    "horology game",
    "watch flipping game",
    "食骨",
    "配貨遊戲",
    "腕錶遊戲",
  ],
  alternates: { canonical: "/bone" },
  openGraph: {
    title: "Bone Eater — play the AD game, earn the call, land the grail",
    description:
      "The watch-allocation satire as a game: bundle the shelf sitters, hold them, and wait for the boutique's phone call. Three levels from Rolodex to Pasta Phillpe.",
    url: `${SITE_URL}/bone`,
    siteName: "Watch Energy",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Watch Energy — Bone Eater" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bone Eater — Watch Energy",
    description:
      "Play the AD game: bundle the shelf sitters, earn the call, land the grail. A satirical watch-allocation tycoon.",
    images: ["/api/og"],
  },
};

function boneJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bone Eater",
    url: `${SITE_URL}/bone`,
    applicationCategory: "GameApplication",
    operatingSystem: "Any (browser)",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "A free satirical watch-collecting tycoon game about boutique allocation: bundle the pieces nobody wants, build purchase history, and wait for the call that offers you the hot piece at retail.",
    provider: {
      "@type": "Person",
      name: "gptwatchcollector",
      url: IG_URL,
    },
  };
}

export default function BonePage() {
  if (!FEATURES.bone) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(boneJsonLd()) }}
      />

      {/* The game (client-rendered, full viewport, in normal flow so the
          companion content below stays reachable). */}
      <BoneClient />

      {/* Visible below-the-fold companion content — same policy as /smash:
          no hidden-text SEO, English-only static server content. */}
      <section className="mx-auto max-w-[560px] border-t border-border px-5 pb-16 pt-12">
        <p className="text-[0.75rem] uppercase tracking-[0.18em] text-low">About this game</p>
        <h1 className="mt-2 font-display text-[1.4rem] font-light text-hi">
          Bone Eater — the watch allocation game
        </h1>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-mid">
          Every watch collector knows the ritual: you cannot simply walk into a boutique and buy
          the steel sports watch everyone wants. First you buy the pieces nobody wants — the
          quartz dress watch, the shelf sitters — to build your &ldquo;purchase history&rdquo;.
          In the West it&apos;s called bundling, or simply the AD game. Hong Kong collectors have
          a sharper phrase: <em>sik gwat</em> (食骨), &ldquo;eating bones&rdquo; — swallow enough
          bones and you earn the meat. That phrase gave this game its name. Three levels, three
          boutiques, one hot piece each.
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-mid">
          Each level gives you limited cash and limited days. Bundle the shelf sitters at retail
          to build your journey — but flip them too fast and the history vanishes, because the sales
          associate notices. Hunt the grey-market listings for bargains (and dodge the fakes),
          list your pieces and wait for buyers to make offers, and when the boutique finally
          calls with an allocation, you have one day to say yes. Land the hot piece and the
          level is cleared — it goes into your trophy cabinet, never to be sold.
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-mid">
          All brands in the game are parodies — Rolodex, Apple Piguet, Pasta Phillpe — and all
          prices are fictional. The behaviour they satirise is, of course, entirely real.
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
          Bone Eater is one of six free games on Watch Energy, alongside the Watch Knowledge
          Quiz, Watch Smash, the Destiny Watch match, the Watch Bracket and the Watch Tier List.
        </p>
      </section>
    </>
  );
}
