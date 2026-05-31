"use client";

import type { Watch } from "@/lib/types";
import WatchVisual from "./WatchVisual";

export default function Landing({ teaser, onBegin }: { teaser: Watch; onBegin: () => void }) {
  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center px-5 text-center">
      {/* dim rotating hero watch */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="opacity-[0.06]"
          style={{ animation: "slow-sweep 80s linear infinite" }}
          aria-hidden
        >
          <WatchVisual watch={teaser} size={460} still />
        </div>
      </div>

      <div className="relative z-10 flex max-w-[360px] flex-col items-center">
        <p className="eyebrow mb-7 rise-in">Watch Energy</p>

        <h1
          className="font-display text-[2rem] font-light leading-[1.12] text-hi rise-in sm:text-[2.4rem]"
          style={{ animationDelay: "60ms" }}
        >
          Every collector has one
          <br />
          <span className="italic text-gold-bright">destined watch.</span> Meet yours.
        </h1>

        <p
          className="mt-5 text-[0.95rem] leading-relaxed text-mid rise-in"
          style={{ animationDelay: "140ms" }}
        >
          Your birth and your nature decide a single watch written for you — case, dial, strap, and
          the energy it carries. Not a mood. Not a trend. Your destiny watch.
        </p>

        <button
          onClick={onBegin}
          className="group mt-9 w-full max-w-[280px] rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.06] px-8 py-4 text-[0.95rem] font-medium tracking-wide text-gold-bright transition-all duration-300 hover:bg-gold/[0.14] hover:shadow-[0_0_28px_var(--gold-glow)] active:scale-[0.98] rise-in"
          style={{ animationDelay: "220ms" }}
        >
          Begin
          <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>

        <p
          className="mt-5 text-xs text-low rise-in"
          style={{ animationDelay: "300ms" }}
        >
          Two taps · about 15 seconds
        </p>
      </div>

      <p className="absolute bottom-5 left-0 right-0 px-6 text-center text-[11px] leading-relaxed text-low/70">
        For fun. Not financial or astrological advice.
      </p>
    </section>
  );
}
