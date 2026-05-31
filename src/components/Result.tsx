"use client";

import { useEffect, useRef, useState } from "react";
import { ENERGY_META, VIBE_META } from "@/lib/engine";
import { captionFor, shareReading, type ShareOutcome } from "@/lib/shareCard";
import type { Reading } from "@/lib/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CaseSwatch, DialSwatch, StrapSwatch } from "./ConfigSwatch";
import WatchVisual from "./WatchVisual";

const IG_URL = "https://www.instagram.com/gptwatchcollector/";

function useCountUp(target: number, durationMs: number, animate: boolean): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(2, -10 * t);
      setV(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, animate]);
  return animate ? v : target;
}

export default function Result({ reading, onRetry }: { reading: Reading; onRetry: () => void }) {
  const reduced = useReducedMotion();
  const [act, setAct] = useState<"recipe" | "watch">("recipe");

  // Act 1 (recipe) auto-advances to Act 2 (watch).
  useEffect(() => {
    const t = setTimeout(() => setAct("watch"), reduced ? 650 : 2700);
    return () => clearTimeout(t);
  }, [reduced]);

  if (act === "recipe") {
    return <RecipeAct reading={reading} />;
  }
  return <WatchAct reading={reading} onRetry={onRetry} reduced={reduced} />;
}

// ---------------------------------------------------------------------------
// Act 1 — the energy recipe builds in, case -> dial -> strap
// ---------------------------------------------------------------------------
function RecipeAct({ reading }: { reading: Reading }) {
  const { recipe } = reading;
  const energy = ENERGY_META[reading.baseEnergy];
  const rows = [
    { key: "Case", value: recipe.caseText, el: <CaseSwatch metal={reading.watch.metal} /> },
    { key: "Dial", value: recipe.dialText, el: <DialSwatch hex={reading.watch.dialHex} /> },
    { key: "Strap", value: recipe.strapText, el: <StrapSwatch strap={reading.watch.strapType} /> },
  ];
  return (
    <section className="mx-auto flex min-h-[100svh] max-w-[400px] flex-col justify-center px-6 text-center">
      <p className="eyebrow rise-in">Your energy recipe</p>
      <h2
        className="mt-2 font-display text-[1.6rem] font-light leading-snug text-hi rise-in"
        style={{ animationDelay: "60ms" }}
      >
        <span className="italic text-gold-bright">{energy.name}</span> energy ·{" "}
        {VIBE_META[reading.vibe].label} day
      </h2>
      <p className="mt-2 text-sm text-mid rise-in" style={{ animationDelay: "120ms" }}>
        It calls for a watch built like this.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {rows.map((r, i) => (
          <div
            key={r.key}
            className="flex items-center gap-4 rounded-[var(--radius-md)] border border-border bg-raised px-4 py-3 text-left rise-in"
            style={{ animationDelay: `${260 + i * 240}ms` }}
          >
            <span className="shrink-0">{r.el}</span>
            <span className="flex flex-col">
              <span className="text-[0.62rem] uppercase tracking-[0.2em] text-low">{r.key}</span>
              <span className="text-[1.02rem] text-hi">{r.value}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-7 text-xs tracking-wide text-low rise-in" style={{ animationDelay: "1000ms" }}>
        Finding the watch that wears it…
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Act 2 — the watch is revealed
// ---------------------------------------------------------------------------
function WatchAct({
  reading,
  onRetry,
  reduced,
}: {
  reading: Reading;
  onRetry: () => void;
  reduced: boolean;
}) {
  const pct = useCountUp(reading.matchPercent, 1100, !reduced);
  const captureRef = useRef<SVGSVGElement>(null);
  const [shareState, setShareState] = useState<"idle" | "working" | ShareOutcome>("idle");
  const [copied, setCopied] = useState(false);
  const [why, setWhy] = useState(false);
  const { watch, recipe } = reading;
  const energy = ENERGY_META[reading.baseEnergy];

  async function handleShare() {
    if (!captureRef.current) return;
    setShareState("working");
    const outcome = await shareReading(reading, captureRef.current);
    setShareState(outcome);
    if (outcome !== "error") setTimeout(() => setShareState("idle"), 2600);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(captionFor(reading));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-[440px] flex-col items-center px-5 pb-16 pt-10 text-center">
      {/* banked recipe chip-row */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rise-in">
        {[recipe.caseText, recipe.dialText, recipe.strapText].map((t, i) => (
          <span key={t} className="text-xs text-mid">
            {i > 0 && <span className="mr-2 text-low">·</span>}
            {t}
          </span>
        ))}
      </div>

      {/* match badge */}
      <p className="eyebrow mt-5 rise-in" style={{ animationDelay: "40ms" }}>
        Your watch
      </p>
      <div className="mt-1 flex items-end justify-center gap-2 rise-in" style={{ animationDelay: "70ms" }}>
        <span className="tnum font-display text-[3.2rem] font-light leading-none text-gold-bright">{pct}%</span>
        <span className="mb-2 text-sm text-mid">match</span>
      </div>
      <p className="mt-1 text-xs tracking-[0.18em] text-low rise-in" style={{ animationDelay: "90ms" }}>
        TOP {reading.rarity}% RARITY
      </p>

      {/* watch */}
      <div className="relative mt-3 watch-in">
        <div className="shimmer rounded-full">
          <WatchVisual watch={watch} size={244} />
        </div>
      </div>

      {/* name */}
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold rise-in" style={{ animationDelay: "120ms" }}>
        {watch.brand}
      </p>
      <h2 className="mt-1 font-display text-[1.7rem] font-light leading-tight text-hi rise-in" style={{ animationDelay: "160ms" }}>
        {watch.model}
      </h2>
      {watch.reference && (
        <p className="mt-1 text-xs text-low rise-in" style={{ animationDelay: "180ms" }}>
          Ref. {watch.reference}
        </p>
      )}

      {/* traits */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 rise-in" style={{ animationDelay: "200ms" }}>
        {reading.traits.map((t) => (
          <span key={t} className="rounded-full border border-border bg-overlay px-3 py-1 text-xs text-mid">
            {t}
          </span>
        ))}
      </div>

      {/* reasoning */}
      <p className="mt-5 text-[1.02rem] leading-relaxed text-mid rise-in" style={{ animationDelay: "240ms" }}>
        {reading.reason}
      </p>

      {/* spec row: case / dial / strap */}
      <div className="mt-5 grid w-full grid-cols-3 gap-2.5 rise-in" style={{ animationDelay: "280ms" }}>
        {[
          { k: "Case", v: watch.caseMaterial },
          { k: "Dial", v: watch.dialColor },
          { k: "Strap", v: recipe.strapText },
        ].map((s) => (
          <div key={s.k} className="rounded-[var(--radius-md)] border border-border bg-raised px-3 py-3 text-left">
            <p className="text-[0.6rem] uppercase tracking-[0.16em] text-low">{s.k}</p>
            <p className="mt-0.5 text-[0.82rem] leading-tight text-hi">{s.v}</p>
          </div>
        ))}
      </div>

      {/* why this watch */}
      <button
        onClick={() => setWhy((w) => !w)}
        className="mt-4 text-xs text-gold underline-offset-4 hover:underline rise-in"
        style={{ animationDelay: "300ms" }}
        aria-expanded={why}
      >
        {why ? "Hide the detail" : "Why this watch?"}
      </button>
      {why && (
        <div className="mt-3 w-full rounded-[var(--radius-md)] border border-border bg-raised/60 px-4 py-4 text-left text-sm leading-relaxed text-mid rise-in">
          <p>
            <span className="text-gold">{energy.name} energy.</span> {energy.tagline} {watch.signature}
          </p>
          <p className="mt-2 text-low">{watch.fact}</p>
        </div>
      )}

      {/* CTA block */}
      <div className="mt-8 w-full rounded-[var(--radius-md)] border border-border-gold/60 bg-gold/[0.05] px-5 py-5 rise-in" style={{ animationDelay: "320ms" }}>
        <p className="text-sm leading-relaxed text-hi">
          {watch.owned ? (
            <>This watch is real — it&apos;s part of the actual collection.</>
          ) : (
            <>One of the pieces a real collector would chase.</>
          )}
        </p>
        <p className="mt-1 text-sm text-mid">
          {watch.owned ? "See it (and 9 others) on" : "See the collection on"}{" "}
          <span className="text-gold-bright">@gptwatchcollector</span>.
        </p>
        <a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-gold px-6 py-3.5 text-sm font-semibold text-[#1a1305] transition-all duration-300 hover:bg-gold-bright active:scale-[0.98]"
        >
          Follow @gptwatchcollector
          <span aria-hidden>→</span>
        </a>
      </div>

      {/* share */}
      <div className="mt-3 grid w-full grid-cols-2 gap-2.5 rise-in" style={{ animationDelay: "340ms" }}>
        <button
          onClick={handleShare}
          disabled={shareState === "working"}
          className="rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.06] px-5 py-3.5 text-sm font-medium text-gold-bright transition-all hover:bg-gold/[0.14] active:scale-[0.98] disabled:opacity-60"
        >
          {shareState === "working"
            ? "Creating…"
            : shareState === "downloaded"
              ? "Saved ✓"
              : shareState === "shared"
                ? "Shared ✓"
                : shareState === "error"
                  ? "Try again"
                  : "Save my card"}
        </button>
        <button
          onClick={handleCopy}
          className="rounded-[var(--radius-lg)] border border-border bg-overlay px-5 py-3.5 text-sm font-medium text-mid transition-all hover:bg-hover active:scale-[0.98]"
        >
          {copied ? "Copied ✓" : "Copy caption"}
        </button>
      </div>

      {/* retry + re-roll teaser */}
      <button onClick={onRetry} className="mt-6 text-sm text-low underline-offset-4 hover:text-mid hover:underline">
        Try a different energy
      </button>
      <p className="mt-5 text-xs leading-relaxed text-low/80">
        Your energy shifts. Your watch shifts.
        <br />
        Come back tomorrow for today&apos;s match.
      </p>

      {/* hidden static render used to rasterise the share card */}
      <div className="pointer-events-none absolute -left-[9999px] top-0" aria-hidden>
        <WatchVisual ref={captureRef} watch={watch} size={560} still />
      </div>
    </section>
  );
}
