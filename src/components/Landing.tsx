"use client";

import { TIER_META, UI } from "@/lib/copy";
import { FEATURES } from "@/lib/features";
import { useLang } from "@/lib/i18n";
import type { Watch } from "@/lib/types";
import WatchVisual from "./WatchVisual";

export default function Landing({
  teaser,
  onBegin,
  onTier,
  onBracket,
  onQuiz,
}: {
  teaser: Watch;
  onBegin: () => void;
  onTier: () => void;
  onBracket: () => void;
  onQuiz: () => void;
}) {
  const { lang } = useLang();
  const t = UI[lang];

  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center px-5 py-16 text-center">
      {/* dim rotating hero watch */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="opacity-[0.05]"
          style={{ animation: "slow-sweep 80s linear infinite" }}
          aria-hidden
        >
          <WatchVisual watch={teaser} size={460} still />
        </div>
      </div>

      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center">
        <p className="eyebrow mb-5 rise-in">Watch Energy</p>

        <h1
          className="font-display text-[1.9rem] font-light leading-[1.14] text-hi rise-in sm:text-[2.2rem]"
          style={{ animationDelay: "60ms" }}
        >
          {t.homeHeadline}
        </h1>
        <p className="mt-3 text-[0.95rem] text-mid rise-in" style={{ animationDelay: "120ms" }}>
          {t.homeSub}
        </p>

        {/* game cards — display order: Destiny · Quiz · Tier List · Bracket.
            Built as a list so the 01–04 numbering stays sequential across the
            visible cards regardless of which feature flags are on. */}
        <div className="mt-8 flex w-full flex-col gap-4">
          {[
            {
              key: "destiny",
              title: t.game1Title,
              blurb: t.game1Blurb,
              cta: t.game1Cta,
              onClick: onBegin,
              primary: true,
              show: true,
              icon: (
                <div className="opacity-90" style={{ animation: "slow-sweep 50s linear infinite" }}>
                  <WatchVisual watch={teaser} size={64} still />
                </div>
              ),
            },
            {
              key: "quiz",
              title: t.game4Title,
              blurb: t.game4Blurb,
              cta: t.game4Cta,
              onClick: onQuiz,
              primary: false,
              show: FEATURES.quiz,
              icon: <QuizGlyph />,
            },
            {
              key: "tier",
              title: t.game2Title,
              blurb: t.game2Blurb,
              cta: t.game2Cta,
              onClick: onTier,
              primary: false,
              show: true,
              icon: <TierGlyph />,
            },
            {
              key: "bracket",
              title: t.game3Title,
              blurb: t.game3Blurb,
              cta: t.game3Cta,
              onClick: onBracket,
              primary: false,
              show: FEATURES.bracket,
              icon: <BracketGlyph />,
            },
          ]
            .filter((c) => c.show)
            .map((c, i) => (
              <GameCard
                key={c.key}
                index={i + 1}
                title={c.title}
                blurb={c.blurb}
                cta={c.cta}
                onClick={c.onClick}
                primary={c.primary}
                delay={180 + i * 80}
                icon={c.icon}
              />
            ))}
        </div>
      </div>

      <p className="absolute bottom-5 left-0 right-0 px-6 text-center text-[11px] leading-relaxed text-low/70">
        {t.disclaimer}
      </p>
    </section>
  );
}

function GameCard({
  index,
  title,
  blurb,
  cta,
  onClick,
  icon,
  primary = false,
  delay = 0,
}: {
  index: number;
  title: string;
  blurb: string;
  cta: string;
  onClick: () => void;
  icon: React.ReactNode;
  primary?: boolean;
  delay?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group flex items-center gap-4 rounded-[var(--radius-lg)] border px-4 py-4 text-left transition-all duration-300 active:scale-[0.985] rise-in",
        primary
          ? "border-border-gold bg-gold/[0.06] hover:bg-gold/[0.12] hover:shadow-[0_0_28px_var(--gold-glow)]"
          : "border-border bg-raised hover:border-border-gold/70 hover:bg-hover",
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-border bg-overlay/60">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <span className="text-[0.6rem] font-medium tabular-nums text-low">0{index}</span>
          <span className="font-display text-[1.18rem] font-light leading-tight text-hi">{title}</span>
        </span>
        <span className="mt-1 text-[0.82rem] leading-snug text-mid">{blurb}</span>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-bright">
          {cta}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </span>
    </button>
  );
}

// A little quiz glyph — a gold question mark in a ring.
function QuizGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden className="text-gold">
      <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15.5 15.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4c0 2.2-1.6 3-3 3.8-1 .6-1.5 1.2-1.5 2.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="20" cy="27.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// A little knockout-bracket glyph (two pairs merging to one).
function BracketGlyph() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden className="text-gold">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M5 7h7M5 17h7M12 7v10M12 12h6" />
        <path d="M5 23h7M5 33h7M12 23v10M12 28h6" />
        <path d="M18 12v16M18 20h6" />
      </g>
      <circle cx="30" cy="20" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

// A little three-bar tier glyph using the S / A / B accent colours.
function TierGlyph() {
  const tiers = ["S", "A", "B"] as const;
  return (
    <span className="flex flex-col gap-1.5">
      {tiers.map((tier) => (
        <span key={tier} className="flex items-center gap-1.5">
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] text-[7px] font-bold text-[#1a1305]"
            style={{ backgroundColor: TIER_META[tier].color }}
          >
            {tier}
          </span>
          <span className="h-1.5 w-7 rounded-full bg-white/15" />
        </span>
      ))}
    </span>
  );
}
