"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { BR_UI, BRACKET_SIZE, roundName, signatureText } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { shareChampion, type ShareOutcome } from "@/lib/shareCard";
import type { Watch } from "@/lib/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { WATCHES } from "@/lib/watches";
import IgPreview from "./IgPreview";
import WatchImage from "./WatchImage";

const IG_URL = "https://www.instagram.com/gptwatchcollector/";

function shuffle(arr: Watch[]): Watch[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The owned (real-collection) pieces ALWAYS enter; fill the rest of the 32
// randomly from the non-owned pool. So only non-owned watches ever sit out.
function buildEntrants(): Watch[] {
  const owned = WATCHES.filter((w) => w.owned);
  const fill = shuffle(WATCHES.filter((w) => !w.owned)).slice(0, BRACKET_SIZE - owned.length);
  return shuffle([...owned, ...fill]);
}

// A round-transition announcement ("Next round · 8 strong remain").
type Announce = { size: number; first: boolean };

export default function Bracket({ onBack }: { onBack: () => void }) {
  const { lang } = useLang();
  const t = BR_UI[lang];
  const reduced = useReducedMotion();

  const [pool, setPool] = useState<Watch[]>([]);
  const [round, setRound] = useState<Watch[]>([]);
  const [nextRound, setNextRound] = useState<Watch[]>([]);
  const [pairIndex, setPairIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [champion, setChampion] = useState<Watch | null>(null);
  const [semis, setSemis] = useState<Watch[]>([]); // round-of-4 contenders
  const [finalists, setFinalists] = useState<Watch[]>([]); // round-of-2 contenders
  const [announce, setAnnounce] = useState<Announce | null>(null);
  const [shareState, setShareState] = useState<"idle" | "working" | ShareOutcome>("idle");
  const [copied, setCopied] = useState(false);

  function start() {
    const picks = buildEntrants();
    setPool(picks);
    setRound(picks);
    setNextRound([]);
    setPairIndex(0);
    setMatchCount(0);
    setChampion(null);
    setSemis([]);
    setFinalists([]);
    setAnnounce({ size: picks.length, first: true });
    setShareState("idle");
    setCopied(false);
  }

  // Top 4, ordered: champion, runner-up, then the two semi-final losers.
  function computeTop4(winner: Watch): Watch[] {
    const runnerUp = finalists.find((w) => w.id !== winner.id);
    const semiLosers = semis.filter((w) => !finalists.some((f) => f.id === w.id));
    return [winner, runnerUp, ...semiLosers].filter(Boolean) as Watch[];
  }

  // auto-dismiss the round announcement after a beat (tap also dismisses)
  useEffect(() => {
    if (!announce) return;
    const id = setTimeout(() => setAnnounce(null), reduced ? 800 : 1500);
    return () => clearTimeout(id);
  }, [announce, reduced]);

  // draw the bracket on mount (client-only — avoids an SSR/hydration mismatch
  // from the random shuffle)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    start();
  }, []);

  function pick(winner: Watch) {
    setMatchCount((c) => c + 1);
    const pairs = Math.floor(round.length / 2);
    const isLastPair = pairIndex === pairs - 1;
    if (isLastPair) {
      // odd round -> the unpaired last contender gets a bye into the next round
      let nr = [...nextRound, winner];
      if (round.length % 2 === 1) nr = [...nr, round[round.length - 1]];
      if (nr.length === 1) {
        setChampion(nr[0]);
        track("bracket_champion", { watch_id: nr[0].id });
      } else {
        if (nr.length === 4) setSemis(nr);
        if (nr.length === 2) setFinalists(nr);
        setRound(nr);
        setNextRound([]);
        setPairIndex(0);
        setAnnounce({ size: nr.length, first: false });
      }
    } else {
      setNextRound([...nextRound, winner]);
      setPairIndex(pairIndex + 1);
    }
  }

  async function handleShare() {
    if (!champion) return;
    setShareState("working");
    const outcome = await shareChampion(computeTop4(champion), lang);
    setShareState(outcome);
    track("save_top4", { outcome, watch_id: champion.id });
    if (outcome !== "error") setTimeout(() => setShareState("idle"), 2600);
  }

  async function handleCopy() {
    if (!champion) return;
    try {
      const handle = "@gptwatchcollector";
      const caption =
        lang === "zh"
          ? `我的 grail：${champion.brand} ${champion.model} 👉 ${handle}`
          : `My grail watch: ${champion.brand} ${champion.model} 👉 ${handle}`;
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      track("copy_grail_caption", { watch_id: champion.id });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  // ---- loading ----
  if (pool.length === 0 || round.length === 0) {
    return (
      <section className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <button onClick={onBack} className="absolute left-4 top-12 text-sm text-low hover:text-mid">
          {t.back}
        </button>
        <p className="text-sm tracking-wide text-mid">{t.loading}</p>
      </section>
    );
  }

  // ---- champion ----
  if (champion) {
    const top4 = computeTop4(champion);
    return (
      <section className="mx-auto flex min-h-[100svh] max-w-[440px] flex-col items-center px-5 pb-16 pt-12 text-center">
        <button onClick={onBack} className="self-start text-sm text-low underline-offset-4 hover:text-mid hover:underline">
          {t.back}
        </button>

        <p className="eyebrow mt-6 rise-in">{t.championEyebrow}</p>

        <div className="relative mt-3 flex items-center justify-center watch-in">
          <div
            aria-hidden
            className="absolute h-[240px] w-[240px] rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(90,72,40,0.14), transparent 70%)" }}
          />
          <div className="relative overflow-hidden rounded-[28px]" style={{ filter: "drop-shadow(0 12px 24px rgba(60,45,15,0.18))" }}>
            <WatchImage watch={champion} size={236} />
          </div>
        </div>

        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gold rise-in" style={{ animationDelay: "80ms" }}>
          {champion.brand}
        </p>
        <h2 className="mt-1 font-display text-[1.7rem] font-light leading-tight text-hi rise-in" style={{ animationDelay: "120ms" }}>
          {champion.model}
        </h2>
        <p className="mt-3 font-display text-[1.02rem] italic leading-relaxed text-gold-bright/90 rise-in" style={{ animationDelay: "160ms" }}>
          {signatureText(champion, lang)}
        </p>
        <p className="mt-2 text-xs text-low rise-in" style={{ animationDelay: "200ms" }}>
          {t.championBeat(pool.length - 1)}
        </p>

        {/* Top 4 */}
        <div className="mt-7 w-full rise-in" style={{ animationDelay: "220ms" }}>
          <p className="eyebrow mb-3">{t.top4Title}</p>
          <div className="grid grid-cols-4 gap-2">
            {top4.map((w, i) => (
              <div
                key={w.id}
                title={`${w.brand} ${w.model}`}
                className={[
                  "relative flex flex-col items-center rounded-[var(--radius-md)] border p-2",
                  i === 0 ? "border-border-gold bg-gold/[0.08]" : "border-border bg-raised",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-bold text-[#1a1305]",
                    i === 0 ? "bg-gold" : "bg-low",
                  ].join(" ")}
                >
                  {i + 1}
                </span>
                <WatchImage watch={w} size={54} priority={false} />
                <span className="mt-1 line-clamp-2 text-center text-[0.58rem] leading-tight text-mid">
                  {w.model}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* IG funnel */}
        <div className="mt-7 w-full rounded-[var(--radius-md)] border border-border-gold/60 bg-gold/[0.05] px-5 py-5 rise-in" style={{ animationDelay: "240ms" }}>
          <p className="text-sm leading-relaxed text-hi">{champion.owned ? t.ctaOwned : t.ctaUnowned}</p>
          <IgPreview />
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("follow_ig", { from: "bracket", watch_id: champion.id })}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-gold px-6 py-3.5 text-sm font-semibold text-[#1a1305] transition-all duration-300 hover:bg-gold-bright active:scale-[0.98]"
          >
            {t.follow}
            <span aria-hidden>→</span>
          </a>
        </div>

        {/* share */}
        <div className="mt-3 grid w-full grid-cols-2 gap-2.5 rise-in" style={{ animationDelay: "280ms" }}>
          <button
            onClick={handleShare}
            disabled={shareState === "working"}
            className="rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.06] px-5 py-3.5 text-sm font-medium text-gold-bright transition-all hover:bg-gold/[0.14] active:scale-[0.98] disabled:opacity-60"
          >
            {shareState === "working"
              ? t.shareCreating
              : shareState === "downloaded"
                ? t.shareSaved
                : shareState === "shared"
                  ? t.shareShared
                  : shareState === "error"
                    ? t.shareError
                    : t.shareIdle}
          </button>
          <button
            onClick={handleCopy}
            className="rounded-[var(--radius-lg)] border border-border bg-overlay px-5 py-3.5 text-sm font-medium text-mid transition-all hover:bg-hover active:scale-[0.98]"
          >
            {copied ? t.copied : t.copyCaption}
          </button>
        </div>

        <button onClick={start} className="mt-7 text-sm text-low underline-offset-4 hover:text-mid hover:underline">
          {t.playAgain} ↻
        </button>
      </section>
    );
  }

  // ---- matchup ----
  const a = round[pairIndex * 2];
  const b = round[pairIndex * 2 + 1];
  const matchNo = matchCount + 1;
  const total = pool.length - 1;

  return (
    <>
      {announce && (
        <button
          onClick={() => setAnnounce(null)}
          aria-live="polite"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-base/90 px-6 text-center backdrop-blur-sm"
        >
          <p className="eyebrow rise-in">{announce.first ? t.bracketStart : t.nextRound}</p>
          <p
            className="mt-3 font-display text-[3rem] font-light leading-none text-gold-bright rise-in"
            style={{ animationDelay: "60ms" }}
          >
            {roundName(announce.size, lang)}
          </p>
          <p className="mt-3 text-sm text-mid rise-in" style={{ animationDelay: "120ms" }}>
            {t.watchesLeft(announce.size)}
          </p>
          <p className="mt-8 text-xs text-low rise-in" style={{ animationDelay: "220ms" }}>
            {t.tapContinue}
          </p>
        </button>
      )}

      <section className="mx-auto flex min-h-[100svh] max-w-[440px] flex-col px-5 pb-10 pt-12">
        <button onClick={onBack} className="self-start text-sm text-low underline-offset-4 hover:text-mid hover:underline">
          {t.back}
        </button>

      <div className="mt-4 text-center">
        <p className="eyebrow">{roundName(round.length, lang)}</p>
        <h2 className="mt-2 font-display text-[1.5rem] font-light text-hi">{t.prompt}</h2>
        <p className="mt-1 text-xs text-low">{t.match(matchNo, total)}</p>
      </div>

      {/* progress bar */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-overlay">
        <div className="h-full bg-gold transition-all duration-300" style={{ width: `${((matchNo - 1) / total) * 100}%` }} />
      </div>

      <div key={`${round.length}-${pairIndex}`} className="mt-5 flex flex-col gap-3 rise-in">
        <Contender watch={a} onPick={() => pick(a)} />
        <div className="flex items-center justify-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="font-display text-sm italic text-gold">{t.vs}</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <Contender watch={b} onPick={() => pick(b)} />
      </div>
      </section>
    </>
  );
}

function Contender({ watch, onPick }: { watch: Watch; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-border bg-raised px-4 py-4 text-left transition-all duration-200 hover:border-border-gold hover:bg-gold/[0.06] hover:shadow-[0_0_24px_var(--gold-glow)] active:scale-[0.98]"
    >
      <span className="flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-[16px] border border-border bg-overlay/60">
        <WatchImage watch={watch} size={100} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs uppercase tracking-[0.18em] text-gold">{watch.brand}</span>
        <span className="mt-1 font-display text-[1.15rem] font-light leading-tight text-hi">{watch.model}</span>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gold-bright opacity-0 transition-opacity group-hover:opacity-100">
          →
        </span>
      </span>
    </button>
  );
}
