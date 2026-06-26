"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@/lib/analytics";
import { TIER_META, TIER_UI, TIERS, tierCaption, tierLabel, type Tier } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { shareTierList, type ShareOutcome } from "@/lib/shareCard";
import { WATCHES } from "@/lib/watches";
import WatchImage from "./WatchImage";

const STORAGE_KEY = "we-tiers";
const TOTAL = WATCHES.length;

type Placement = Record<string, Tier>;

function isTier(v: unknown): v is Tier {
  return typeof v === "string" && (TIERS as string[]).includes(v);
}

export default function TierList({ onBack }: { onBack: () => void }) {
  const { lang } = useLang();
  const t = TIER_UI[lang];
  const [placement, setPlacement] = useState<Placement>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "working" | ShareOutcome>("idle");
  const [copied, setCopied] = useState(false);

  // restore the visitor's previous ranking
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const clean: Placement = {};
      for (const w of WATCHES) {
        const v = parsed[w.id];
        if (isTier(v)) clean[w.id] = v;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlacement(clean);
    } catch {
      /* ignore */
    }
  }, []);

  function persist(next: Placement) {
    setPlacement(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function placeInto(tier: Tier) {
    if (!selected) return;
    persist({ ...placement, [selected]: tier });
    setSelected(null);
  }

  function toggleSelect(id: string) {
    setSelected((cur) => (cur === id ? null : id));
  }

  function removeSelected() {
    if (!selected) return;
    const next = { ...placement };
    delete next[selected];
    persist(next);
    setSelected(null);
  }

  function reset() {
    persist({});
    setSelected(null);
  }

  const rankedCount = Object.keys(placement).length;
  const selectedWatch = selected ? WATCHES.find((w) => w.id === selected) ?? null : null;
  const byTier = useMemo(() => {
    const map: Record<Tier, typeof WATCHES> = { S: [], A: [], B: [], NOPE: [], NEVER: [] };
    for (const w of WATCHES) {
      const tier = placement[w.id];
      if (tier) map[tier].push(w);
    }
    return map;
  }, [placement]);
  const unranked = WATCHES.filter((w) => !placement[w.id]);

  async function handleShare() {
    if (rankedCount === 0) return;
    setShareState("working");
    const outcome = await shareTierList(placement, lang);
    setShareState(outcome);
    track("save_tier_list", { outcome, ranked: rankedCount });
    if (outcome !== "error") setTimeout(() => setShareState("idle"), 2600);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(tierCaption(lang));
      setCopied(true);
      track("copy_tier_caption");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-[460px] flex-col px-4 pb-40 pt-12">
      <button onClick={onBack} className="self-start text-sm text-low underline-offset-4 hover:text-mid hover:underline">
        {t.back}
      </button>

      <p className="eyebrow mt-4 rise-in">{t.title}</p>
      <h2 className="mt-2 font-display text-[1.5rem] font-light leading-snug text-hi rise-in" style={{ animationDelay: "40ms" }}>
        {t.subtitle}
      </h2>
      <p className="mt-2 text-sm text-mid">
        {selected ? t.selectHint : t.instruction}{" "}
        <span className="text-low">· {t.progress(rankedCount, TOTAL)}</span>
      </p>

      {/* tier rows */}
      <div className="mt-6 flex flex-col gap-2.5">
        {TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => placeInto(tier)}
            disabled={!selected}
            aria-label={tierLabel(tier, lang)}
            className={[
              "flex min-h-[68px] items-stretch overflow-hidden rounded-[var(--radius-md)] border text-left transition-colors",
              selected
                ? "border-border-gold/70 bg-gold/[0.04] cursor-pointer"
                : "border-border bg-raised cursor-default",
            ].join(" ")}
          >
            <span
              className="flex w-14 shrink-0 items-center justify-center font-display text-lg font-medium text-[#1a1305]"
              style={{ backgroundColor: TIER_META[tier].color }}
            >
              {tierLabel(tier, lang)}
            </span>
            <span className="flex flex-1 flex-wrap content-center gap-1.5 px-2 py-2">
              {byTier[tier].map((w) => (
                <WatchTile
                  key={w.id}
                  watchId={w.id}
                  selected={selected === w.id}
                  onSelect={toggleSelect}
                />
              ))}
            </span>
          </button>
        ))}
      </div>

      {/* unranked tray */}
      <div className="mt-7">
        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-low">
          {t.unranked} · {unranked.length}
        </p>
        {unranked.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-border-gold/40 bg-gold/[0.04] px-4 py-4 text-center text-sm text-gold-bright">
            {t.allRanked}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 rounded-[var(--radius-md)] border border-border bg-overlay/60 px-3 py-3">
            {unranked.map((w) => (
              <WatchTile key={w.id} watchId={w.id} selected={selected === w.id} onSelect={toggleSelect} />
            ))}
          </div>
        )}
      </div>

      {/* sticky bottom — preview sheet while a watch is selected, else actions */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-base via-base/95 to-transparent px-4 pb-5 pt-8">
        <div className="mx-auto max-w-[460px]">
          {selectedWatch ? (
            <div className="rounded-[var(--radius-lg)] border border-border-gold/50 bg-raised px-4 pb-4 pt-3 shadow-[0_-10px_34px_rgba(20,15,5,0.4)]">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-[16px] border border-border bg-overlay">
                  <WatchImage watch={selectedWatch} size={110} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs uppercase tracking-[0.18em] text-gold">{selectedWatch.brand}</p>
                  <p className="font-display text-[1.1rem] leading-tight text-hi">{selectedWatch.model}</p>
                  <p className="mt-1.5 text-xs text-gold-bright">{t.selectHint}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  aria-label={t.cancel}
                  className="self-start rounded-full px-2 py-1 text-low transition-colors hover:text-mid"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {TIERS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => placeInto(tier)}
                    className="flex items-center justify-center rounded-[var(--radius-sm)] py-3 text-center font-display text-sm font-semibold text-[#1a1305] transition-transform active:scale-95"
                    style={{ backgroundColor: TIER_META[tier].color }}
                  >
                    {tierLabel(tier, lang)}
                  </button>
                ))}
              </div>
              {placement[selectedWatch.id] && (
                <button
                  onClick={removeSelected}
                  className="mt-2.5 w-full text-xs text-low underline-offset-4 hover:text-mid hover:underline"
                >
                  {t.remove}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={reset}
                disabled={rankedCount === 0}
                className="rounded-[var(--radius-lg)] border border-border bg-overlay px-4 py-3.5 text-sm font-medium text-mid transition-all hover:bg-hover active:scale-[0.98] disabled:opacity-40"
              >
                {t.reset}
              </button>
              <button
                onClick={handleShare}
                disabled={rankedCount === 0 || shareState === "working"}
                className="flex-1 rounded-[var(--radius-lg)] bg-gold px-5 py-3.5 text-sm font-semibold text-[#1a1305] shadow-[0_0_30px_var(--gold-glow)] transition-all hover:bg-gold-bright active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
                disabled={rankedCount === 0}
                className="rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.06] px-4 py-3.5 text-sm font-medium text-gold-bright transition-all hover:bg-gold/[0.14] active:scale-[0.98] disabled:opacity-40"
              >
                {copied ? t.copied : t.copyCaption}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const TILE = 50;

function WatchTile({
  watchId,
  selected,
  onSelect,
}: {
  watchId: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const watch = WATCHES.find((w) => w.id === watchId)!;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect(watchId);
      }}
      title={`${watch.brand} ${watch.model}`}
      className={[
        "flex items-center justify-center rounded-[10px] border transition-all",
        selected
          ? "border-gold-bright bg-gold/[0.16] shadow-[0_0_14px_var(--gold-glow)] scale-105"
          : "border-border bg-raised hover:border-white/25",
      ].join(" ")}
      style={{ width: TILE, height: TILE }}
    >
      <WatchImage watch={watch} size={TILE - 8} priority={false} />
    </button>
  );
}
