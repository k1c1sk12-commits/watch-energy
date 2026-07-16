"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import { UI } from "@/lib/copy";
import { FEATURES } from "@/lib/features";
import { useLang } from "@/lib/i18n";
import { WATCHES } from "@/lib/watches";
import WatchVisual from "./WatchVisual";

const IG_URL = "https://www.instagram.com/gptwatchcollector/";
const OWNED = WATCHES.filter((w) => w.owned);

export default function Home() {
  const { lang } = useLang();
  const t = UI[lang];

  const games = [
    { key: "destiny", href: "/destiny", title: t.game1Title, blurb: t.game1Blurb, show: true },
    { key: "quiz", href: "/quiz", title: t.game4Title, blurb: t.game4Blurb, show: FEATURES.quiz },
    { key: "tier", href: "/tier", title: t.game2Title, blurb: t.game2Blurb, show: true },
    { key: "bracket", href: "/bracket", title: t.game3Title, blurb: t.game3Blurb, show: FEATURES.bracket },
    { key: "smash", href: "/smash", title: t.game5Title, blurb: t.game5Blurb, show: FEATURES.smash },
  ].filter((g) => g.show);

  return (
    <main className="mx-auto min-h-[100svh] max-w-[640px] px-5 pb-16 pt-14">
      {/* hero — the collector, not the tool */}
      <header className="text-center">
        <p className="eyebrow rise-in">GPT Watch Collector</p>
        <h1
          className="mt-4 font-display text-[2rem] font-light leading-[1.16] text-hi rise-in sm:text-[2.4rem]"
          style={{ animationDelay: "60ms" }}
        >
          {t.hubHeadline}
        </h1>
        <p
          className="mx-auto mt-4 max-w-[460px] text-[0.95rem] leading-relaxed text-mid rise-in"
          style={{ animationDelay: "120ms" }}
        >
          {t.hubSub}
        </p>
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("follow_ig", { src: "hub_hero" })}
          className="mt-5 inline-block rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.08] px-6 py-2.5 text-sm font-medium text-gold-bright transition-all hover:bg-gold/[0.16] active:scale-[0.98] rise-in"
          style={{ animationDelay: "180ms" }}
        >
          {t.follow}
        </a>
      </header>

      {/* the collection — the spine of the site */}
      <section className="mt-14 rise-in" style={{ animationDelay: "240ms" }}>
        <h2 className="text-center font-display text-[1.3rem] font-light text-hi">
          {t.hubCollectionTitle}
        </h2>
        <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-5">
          {OWNED.map((w) => (
            <figure key={w.id} className="flex flex-col items-center text-center">
              <WatchVisual watch={w} size={72} still />
              <figcaption className="mt-2">
                <p className="text-[0.6rem] uppercase tracking-[0.14em] text-low">{w.brand}</p>
                <p className="mt-0.5 text-[0.7rem] leading-snug text-mid">{w.model}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-6 text-center text-[0.82rem] leading-relaxed text-low">
          {t.hubCollectionNote}
        </p>
      </section>

      {/* play — the front door */}
      <section className="mt-14">
        <h2 className="text-center font-display text-[1.3rem] font-light text-hi">{t.hubPlayTitle}</h2>
        <p className="mt-1.5 text-center text-[0.85rem] text-mid">{t.hubPlaySub}</p>
        <div className="mt-6 flex flex-col gap-3.5">
          {games.map((g, i) => (
            <Link
              key={g.key}
              href={g.href}
              className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-raised px-5 py-4 text-left transition-all duration-300 hover:border-border-gold/70 hover:bg-hover active:scale-[0.985]"
            >
              <span className="text-[0.65rem] font-medium tabular-nums text-low">0{i + 1}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-[1.12rem] font-light leading-tight text-hi">
                  {g.title}
                </span>
                <span className="mt-1 text-[0.8rem] leading-snug text-mid">{g.blurb}</span>
              </span>
              <span className="text-gold-bright transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* the hunt — proof this is a living collection */}
      {FEATURES.hunt && (
        <section className="mt-14">
          <Link
            href="/hunt"
            className="group block rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.06] px-5 py-5 text-center transition-all hover:bg-gold/[0.12]"
          >
            <h2 className="font-display text-[1.2rem] font-light text-hi">{t.hubHuntTitle}</h2>
            <p className="mt-1.5 text-[0.85rem] leading-relaxed text-mid">{t.hubHuntBlurb}</p>
            <span className="mt-2 inline-block text-xs font-medium text-gold-bright">
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </section>
      )}

      {/* trust line + disclaimer */}
      <footer className="mt-14 border-t border-border pt-6 text-center">
        <p className="text-[0.8rem] leading-relaxed text-mid">{t.hubTrust}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-low/70">{t.disclaimer}</p>
      </footer>
    </main>
  );
}
