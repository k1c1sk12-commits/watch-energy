"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { SMASH_UI, UI } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { IMAGE_READY } from "@/lib/imageManifest";
import { BRAND_IMAGES, chaosTier, LETTER_BRANDS, LETTERS, TOTAL_BRANDS } from "@/lib/smash";

const IG_URL = "https://www.instagram.com/gptwatchcollector/";

// ---------------------------------------------------------------------------
// Watch Smash — keyboard-smash / tap-frenzy game (tinyfingers.net, but watches).
// Desktop: every letter key throws out a brand chip + a big serif letter.
// Mobile: every tap bursts a brand at your finger; dragging leaves a trail.
// Meta-goal: light all 26 letters of the brand alphabet.
// ---------------------------------------------------------------------------

type SpriteKind = "brand" | "letter" | "glyph" | "dot" | "watch";

interface Sprite {
  id: number;
  kind: SpriteKind;
  x: number; // viewport px
  y: number;
  text?: string; // brand name or letter
  img?: string; // watch illustration id (/public/watches/<id>.png)
  glyph?: number; // index into GLYPHS
  variant: number; // colourway
  dx: number; // drift (px) over the sprite's life
  dy: number;
  r0: number; // start/end rotation (deg)
  r1: number;
  s: number; // scale
}

// Perf guardrails for keyboard-mash rates: cap total live sprites, cap the
// expensive watch illustrations separately, and coalesce spawns so key-repeat
// can't outrun the renderer. Smashes are always counted; only visuals throttle.
const MAX_SPRITES = 80;
const MAX_WATCH_SPRITES = 4;
const SPAWN_MIN_MS = 35;
const GLYPH_COUNT = 4;

// Digit keys throw dial numerals — Arabic or Roman at random. Watch dials
// famously use IIII rather than IV; 0 stands in for the twelve.
const ROMAN_NUMERALS: Record<string, string> = {
  "0": "XII",
  "1": "I",
  "2": "II",
  "3": "III",
  "4": "IIII",
  "5": "V",
  "6": "VI",
  "7": "VII",
  "8": "VIII",
  "9": "IX",
};
const ARABIC_NUMERALS: Record<string, string> = { "0": "12" };

type Phase = "intro" | "play" | "report";

export default function Smash({ onBack }: { onBack: () => void }) {
  const { lang } = useLang();
  const t = SMASH_UI[lang];
  const ui = UI[lang];

  const [phase, setPhase] = useState<Phase>("intro");
  const [count, setCount] = useState(0);
  const [sprites, setSprites] = useState<Sprite[]>([]);
  const [discovered, setDiscovered] = useState<Set<string>>(() => new Set());
  const [litLetters, setLitLetters] = useState<Set<string>>(() => new Set());
  const [soundOn, setSoundOn] = useState(true);
  const [alphabetDone, setAlphabetDone] = useState(false);
  const [fsSupported, setFsSupported] = useState(false);
  const [fsOn, setFsOn] = useState(false);

  // Refs mirror state the event handlers need without re-binding listeners.
  const phaseRef = useRef<Phase>("intro");
  const soundRef = useRef(true);
  const litRef = useRef(litLetters);
  const countRef = useRef(0);
  const discoveredRef = useRef(discovered);
  useEffect(() => {
    phaseRef.current = phase;
    soundRef.current = soundOn;
    litRef.current = litLetters;
    countRef.current = count;
    discoveredRef.current = discovered;
  }, [phase, soundOn, litLetters, count, discovered]);

  const idRef = useRef(0);
  const cycleRef = useRef<Record<string, number>>({}); // per-letter brand cursor
  const audioRef = useRef<AudioContext | null>(null);
  const lastDotRef = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const spritesRef = useRef<Sprite[]>([]);
  const lastSpawnRef = useRef(0);
  useEffect(() => {
    spritesRef.current = sprites;
  }, [sprites]);

  // Sprite coordinates are board-relative (the board is a normal in-flow
  // section, not fixed, so the SEO content below stays scrollable).
  const toLocal = (e: { clientX: number; clientY: number }) => {
    const rect = boardRef.current?.getBoundingClientRect();
    return rect
      ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
      : { x: e.clientX, y: e.clientY };
  };

  // ---- audio: a tiny mechanical "tick" per smash --------------------------
  const tick = (freq: number) => {
    if (!soundRef.current) return;
    try {
      const Ctx =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!audioRef.current) audioRef.current = new Ctx();
      const ctx = audioRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      /* audio unavailable — play on silently */
    }
  };

  // ---- sprite spawning -----------------------------------------------------
  const addSprites = (batch: Omit<Sprite, "id">[]) => {
    setSprites((prev) => {
      const next = [...prev, ...batch.map((s) => ({ ...s, id: idRef.current++ }))];
      return next.length > MAX_SPRITES ? next.slice(next.length - MAX_SPRITES) : next;
    });
  };

  // Stable identity so memoized sprites never re-render after mount.
  const removeSprite = useCallback((id: number) => {
    setSprites((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  const spawnBrand = (letter: string, x: number, y: number) => {
    const brands = LETTER_BRANDS[letter];
    const i = cycleRef.current[letter] ?? 0;
    cycleRef.current[letter] = (i + 1) % brands.length;
    const brand = brands[i];

    if (!discoveredRef.current.has(brand)) {
      setDiscovered((prev) => new Set(prev).add(brand));
    }
    if (!litRef.current.has(letter)) {
      const nextLit = new Set(litRef.current).add(letter);
      setLitLetters(nextLit);
      if (nextLit.size === LETTERS.length) {
        setAlphabetDone(true);
        track("smash_alphabet_complete", { smashes: countRef.current + 1 });
      }
    }

    // Brands with cartoon art throw the watch itself; the rest get the big
    // serif letter behind the chip. Watch PNGs decode to ~1.5MB each, so only
    // a few may fly at once — past the cap, fall back to the cheap letter.
    const images = (BRAND_IMAGES[brand] ?? []).filter((id) => IMAGE_READY.has(id));
    const watchesLive = spritesRef.current.filter((sp) => sp.kind === "watch").length;
    const backdrop: Omit<Sprite, "id"> =
      images.length > 0 && watchesLive < MAX_WATCH_SPRITES
        ? {
            kind: "watch",
            img: images[Math.floor(Math.random() * images.length)],
            x: x + rand(-30, 30),
            y: y + rand(-40, 20),
            variant: 0,
            dx: rand(-70, 70),
            dy: rand(-170, -70),
            r0: rand(-16, 16),
            r1: rand(-32, 32),
            s: rand(0.75, 1.2),
          }
        : {
            kind: "letter",
            text: letter.toUpperCase(),
            x: x + rand(-30, 30),
            y: y + rand(-30, 30),
            variant: Math.floor(rand(0, 3)),
            dx: rand(-60, 60),
            dy: rand(-160, -60),
            r0: rand(-14, 14),
            r1: rand(-30, 30),
            s: rand(0.8, 1.5),
          };

    addSprites([
      backdrop,
      // the brand chip itself
      {
        kind: "brand",
        text: brand,
        x,
        y,
        variant: Math.floor(rand(0, 3)),
        dx: rand(-90, 90),
        dy: rand(-190, -80),
        r0: rand(-8, 8),
        r1: rand(-14, 14),
        s: rand(0.9, 1.15),
        glyph: undefined,
      },
    ]);
  };

  const spawnGlyphs = (x: number, y: number, n: number) => {
    addSprites(
      Array.from({ length: n }, () => ({
        kind: "glyph" as const,
        x: x + rand(-24, 24),
        y: y + rand(-24, 24),
        glyph: Math.floor(rand(0, GLYPH_COUNT)),
        variant: Math.floor(rand(0, 3)),
        dx: rand(-120, 120),
        dy: rand(-180, 40),
        r0: rand(-40, 40),
        r1: rand(-220, 220),
        s: rand(0.55, 1.1),
        text: undefined,
      })),
    );
  };

  const spawnNumeral = (digit: string, x: number, y: number) => {
    const text =
      Math.random() < 0.5 ? ROMAN_NUMERALS[digit] : (ARABIC_NUMERALS[digit] ?? digit);
    addSprites([
      {
        kind: "letter",
        text,
        x,
        y,
        variant: Math.floor(rand(0, 3)),
        dx: rand(-70, 70),
        dy: rand(-170, -70),
        r0: rand(-14, 14),
        r1: rand(-30, 30),
        s: rand(0.9, 1.6),
        glyph: undefined,
      },
    ]);
  };

  // Touch/click has no letter — pick one, biased hard toward unlit letters so
  // phone players can complete the alphabet too.
  const randomLetter = () => {
    const unlit = LETTERS.filter((l) => !litRef.current.has(l));
    const pool = unlit.length > 0 && Math.random() < 0.75 ? unlit : LETTERS;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const begin = () => {
    setPhase("play");
    track("smash_start");
  };

  // Coalesce ultra-fast input: every smash counts, but visuals/sound only
  // spawn every SPAWN_MIN_MS so key-repeat can't flood the renderer.
  const spawnGate = () => {
    const now = performance.now();
    if (now - lastSpawnRef.current < SPAWN_MIN_MS) return false;
    lastSpawnRef.current = now;
    return true;
  };

  const smashAt = (x: number, y: number, letter?: string) => {
    if (phaseRef.current === "intro") begin();
    setCount((c) => c + 1);
    if (!spawnGate()) return;
    const l = letter ?? randomLetter();
    spawnBrand(l, x, y);
    spawnGlyphs(x, y, 2);
    tick(700 + LETTERS.indexOf(l) * 28 + rand(-20, 20));
  };

  const endGame = () => {
    setPhase("report");
    track("smash_report", {
      smashes: countRef.current,
      brands: discoveredRef.current.size,
      letters: litRef.current.size,
    });
  };

  const reset = () => {
    setCount(0);
    setSprites([]);
    setDiscovered(new Set());
    setLitLetters(new Set());
    setAlphabetDone(false);
    cycleRef.current = {};
    setPhase("play");
    track("smash_start", { again: true });
  };

  // ---- fullscreen ----------------------------------------------------------
  // Element fullscreen is unavailable on iPhone Safari; the button only shows
  // where it works. Board-level fullscreen also hides the site language toggle.
  useEffect(() => {
    // One-time read of browser capability on mount (SSR renders no button).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFsSupported(
      document.fullscreenEnabled === true &&
        typeof document.documentElement.requestFullscreen === "function",
    );
    const onChange = () => setFsOn(document.fullscreenElement != null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    } else {
      void boardRef.current?.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
    }
  };

  // ---- keyboard ------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return; // keep browser shortcuts
      if (phaseRef.current === "report") return;

      if (e.key === "Escape") {
        // In fullscreen, Esc belongs to the browser (exit fullscreen) — don't
        // also end the game on the same press.
        if (document.fullscreenElement) return;
        if (phaseRef.current === "play") endGame();
        return;
      }
      const key = e.key.toLowerCase();
      const w = boardRef.current?.offsetWidth ?? window.innerWidth;
      const h = boardRef.current?.offsetHeight ?? window.innerHeight;
      // spawn in the middle band of the screen, clear of the top/bottom chrome
      const x = rand(w * 0.12, w * 0.88);
      const y = rand(h * 0.2, h * 0.72);

      if (key.length === 1 && key >= "a" && key <= "z") {
        e.preventDefault();
        smashAt(x, y, key);
      } else if (key.length === 1 && key >= "0" && key <= "9") {
        // digits: dial numerals (Arabic or Roman) + a few watch parts
        e.preventDefault();
        if (phaseRef.current === "intro") begin();
        setCount((c) => c + 1);
        if (!spawnGate()) return;
        spawnNumeral(key, x, y);
        spawnGlyphs(x, y, 2);
        tick(rand(850, 1050));
      } else if (key === " " || (key.length === 1 && key >= "!" && key <= "~")) {
        // digits & symbols: no brand, just a burst of watch parts
        e.preventDefault();
        if (phaseRef.current === "intro") begin();
        setCount((c) => c + 1);
        if (!spawnGate()) return;
        spawnGlyphs(x, y, 4);
        tick(rand(400, 600));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- pointer -------------------------------------------------------------
  const onPointerDown = (e: React.PointerEvent) => {
    if (phaseRef.current === "report") return;
    const p = toLocal(e);
    lastDotRef.current = p;
    smashAt(p.x, p.y);
  };

  // Footprints follow the finger while touching, and the mouse cursor even
  // when just hovering. Not counted as smashes; every 6th print is a tiny
  // watch part instead of a dot.
  const dotSeqRef = useRef(0);
  const onPointerMove = (e: React.PointerEvent) => {
    if (phaseRef.current !== "play") return;
    const p = toLocal(e);
    const last = lastDotRef.current;
    if (!last) {
      lastDotRef.current = p;
      return;
    }
    const dist = Math.hypot(p.x - last.x, p.y - last.y);
    if (dist < 26) return;
    lastDotRef.current = p;
    const seq = dotSeqRef.current++;
    addSprites([
      seq % 6 === 5
        ? {
            kind: "glyph",
            x: p.x,
            y: p.y,
            glyph: Math.floor(rand(0, GLYPH_COUNT)),
            variant: Math.floor(rand(0, 3)),
            dx: rand(-30, 30),
            dy: rand(-50, 10),
            r0: rand(-30, 30),
            r1: rand(-160, 160),
            s: rand(0.4, 0.65),
            text: undefined,
          }
        : {
            kind: "dot",
            x: p.x,
            y: p.y,
            variant: Math.floor(rand(0, 3)),
            dx: 0,
            dy: 0,
            r0: 0,
            r1: 0,
            s: rand(0.6, 1.3),
            text: undefined,
            glyph: undefined,
          },
    ]);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // Touch lifts end the stroke; the mouse keeps trailing on hover.
    if (e.pointerType === "touch") lastDotRef.current = null;
  };

  const tier = chaosTier(count);

  return (
    <div
      ref={boardRef}
      className="relative h-[100svh] w-full touch-none select-none overflow-hidden bg-base"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* faint radial glow, echoes the site body background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, rgba(154,124,52,0.07), transparent 60%)",
        }}
        aria-hidden
      />

      {/* ---- flying sprites ---- */}
      {sprites.map((s) => (
        <SpriteEl key={s.id} sprite={s} onDone={removeSprite} />
      ))}

      {/* ---- top chrome ---- */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pt-4">
        <div className="flex gap-2">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setSoundOn((v) => !v)}
            aria-label={soundOn ? t.soundOnAria : t.soundOffAria}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-raised/80 text-mid backdrop-blur-sm transition-colors hover:text-hi"
          >
            {soundOn ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          {fsSupported && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={toggleFullscreen}
              aria-label={fsOn ? t.exitFullscreenAria : t.enterFullscreenAria}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-raised/80 text-mid backdrop-blur-sm transition-colors hover:text-hi"
            >
              {fsOn ? <CompressIcon /> : <ExpandIcon />}
            </button>
          )}
        </div>

        {phase === "play" && (
          <div key={count} className="pulse-once text-center" aria-live="off">
            <p className="tnum font-display text-[2.6rem] font-light leading-none text-hi">
              {count}
            </p>
            <p className="mt-1 text-[0.62rem] uppercase tracking-[0.22em] text-low">
              {t.counterLabel}
            </p>
          </div>
        )}

        {/* mt-12 clears the site-wide language toggle (fixed right-3 top-3 z-50) */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => (phase === "play" ? endGame() : onBack())}
          className="pointer-events-auto mt-12 rounded-full border border-border bg-raised/80 px-4 py-2 text-[0.78rem] font-medium text-mid backdrop-blur-sm transition-colors hover:text-hi"
        >
          {phase === "play" ? t.done : "✕"}
        </button>
      </div>

      {/* ---- alphabet ribbon ---- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
        {alphabetDone && (
          <p className="shimmer mx-auto mb-3 w-fit rounded-full border border-border-gold bg-gold/[0.1] px-4 py-1.5 text-[0.78rem] font-medium text-gold-deep">
            {t.alphabetComplete}
          </p>
        )}
        <div className="mx-auto flex max-w-[420px] flex-wrap items-center justify-center gap-x-[5px] gap-y-1 sm:gap-x-[7px]">
          {LETTERS.map((l) => (
            <span
              key={l}
              className={[
                "text-[0.68rem] font-medium uppercase transition-all duration-300",
                litLetters.has(l) ? "scale-110 text-gold" : "text-low/40",
              ].join(" ")}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* ---- intro overlay ---- */}
      {phase === "intro" && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
          <p className="eyebrow rise-in">Watch Smash</p>
          <h1
            className="mt-4 max-w-[420px] font-display text-[1.9rem] font-light leading-[1.14] text-hi rise-in sm:text-[2.2rem]"
            style={{ animationDelay: "60ms" }}
          >
            {t.introTitle}
          </h1>
          <p
            className="mt-3 max-w-[380px] text-[0.95rem] leading-relaxed text-mid rise-in"
            style={{ animationDelay: "120ms" }}
          >
            {t.introSub}
          </p>
          <p
            className="mt-8 animate-pulse text-[0.8rem] uppercase tracking-[0.18em] text-gold rise-in"
            style={{ animationDelay: "200ms" }}
          >
            {t.introStart}
          </p>
        </div>
      )}

      {/* ---- smash report ---- */}
      {phase === "report" && (
        <div className="absolute inset-0 z-30 overflow-y-auto bg-base/95 backdrop-blur-sm">
          <div className="mx-auto flex min-h-full max-w-[420px] flex-col items-center justify-center px-6 py-14 text-center">
            <p className="eyebrow rise-in">{t.reportEyebrow}</p>
            <h2
              className="mt-3 font-display text-[2rem] font-light leading-tight text-hi rise-in"
              style={{ animationDelay: "60ms" }}
            >
              {lang === "zh" ? tier.zh : tier.en}
            </h2>

            <div
              className="mt-8 grid w-full grid-cols-3 gap-3 rise-in"
              style={{ animationDelay: "140ms" }}
            >
              {[
                { label: t.statSmashes, value: String(count) },
                { label: t.statBrands, value: `${discovered.size}/${TOTAL_BRANDS}` },
                { label: t.statLetters, value: `${litLetters.size}/26` },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-[var(--radius-md)] border border-border bg-raised px-2 py-4"
                >
                  <p className="tnum font-display text-[1.5rem] font-light text-hi">{s.value}</p>
                  <p className="mt-1 text-[0.6rem] uppercase tracking-[0.14em] text-low">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {discovered.size > 0 && (
              <div className="mt-8 w-full rise-in" style={{ animationDelay: "220ms" }}>
                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-low">
                  {t.brandsHeading}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {[...discovered].sort().map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-border bg-raised px-3 py-1 text-[0.72rem] text-mid"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                {discovered.has(LETTER_BRANDS.q[0]) && (
                  <p className="mt-4 text-[0.78rem] italic leading-relaxed text-low">
                    {t.qFootnote}
                  </p>
                )}
              </div>
            )}

            <div
              className="mt-9 flex w-full flex-col items-center gap-3 rise-in"
              style={{ animationDelay: "300ms" }}
            >
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={reset}
                className="w-full rounded-[var(--radius-lg)] border border-border-gold bg-gold/[0.1] px-6 py-3.5 text-sm font-medium text-gold-deep transition-all hover:bg-gold/[0.18] active:scale-[0.98]"
              >
                {t.again}
              </button>
              <a
                href={IG_URL}
                target="_blank"
                rel="noopener noreferrer"
                onPointerDown={(e) => e.stopPropagation()}
                className="text-[0.85rem] font-medium text-gold-bright underline-offset-4 hover:underline"
              >
                {ui.follow}
              </a>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onBack}
                className="mt-1 text-[0.82rem] text-mid underline underline-offset-4"
              >
                {t.backHome}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sprites
// ---------------------------------------------------------------------------

// Chip colourways: dark, gold, ivory — all from the site palette.
const CHIP_VARIANTS = [
  "bg-[#221d15] text-[#f2ede3] border-[#9a7c34]/60",
  "bg-gold text-[#1a1305] border-[#6f5826]/40",
  "bg-overlay text-hi border-border",
];
const INK_VARIANTS = ["text-gold", "text-gold-deep", "text-hi/60"];

// Memoized: a sprite's props never change after mount, so spawning sprite
// #81 no longer re-renders the other 80 — key-mash renders stay O(new).
const SpriteEl = memo(function SpriteEl({
  sprite,
  onDone: onDoneById,
}: {
  sprite: Sprite;
  onDone: (id: number) => void;
}) {
  const onDone = () => onDoneById(sprite.id);
  const style: React.CSSProperties & Record<`--${string}`, string> = {
    left: sprite.x,
    top: sprite.y,
    "--dx": `${sprite.dx}px`,
    "--dy": `${sprite.dy}px`,
    "--r0": `${sprite.r0}deg`,
    "--r1": `${sprite.r1}deg`,
    "--s": String(sprite.s),
  };

  if (sprite.kind === "dot") {
    return (
      <span
        className="pointer-events-none absolute h-3 w-3 rounded-full bg-gold/70"
        style={{ ...style, animation: "smash-dot 900ms ease-out both" }}
        onAnimationEnd={onDone}
        aria-hidden
      />
    );
  }

  const float = { animation: "smash-float 1500ms cubic-bezier(0.16,1,0.3,1) both" };

  if (sprite.kind === "watch") {
    return (
      /* eslint-disable-next-line @next/next/no-img-element -- transient game
         sprite; plain img avoids next/image layout wrappers on absolute pos */
      <img
        src={`/watches/${sprite.img}.png`}
        alt=""
        width={150}
        height={150}
        decoding="async"
        draggable={false}
        className="pointer-events-none absolute"
        style={{ ...style, ...float, objectFit: "contain" }}
        onAnimationEnd={onDone}
        aria-hidden
      />
    );
  }

  if (sprite.kind === "letter") {
    return (
      <span
        className={`pointer-events-none absolute font-display text-[5rem] font-light leading-none ${INK_VARIANTS[sprite.variant]}`}
        style={{ ...style, ...float, opacity: 0.5 }}
        onAnimationEnd={onDone}
        aria-hidden
      >
        {sprite.text}
      </span>
    );
  }

  if (sprite.kind === "brand") {
    return (
      <span
        className={`pointer-events-none absolute whitespace-nowrap rounded-full border px-4 py-2 font-display text-[1.05rem] font-light shadow-lg ${CHIP_VARIANTS[sprite.variant]}`}
        style={{ ...style, ...float }}
        onAnimationEnd={onDone}
        aria-hidden
      >
        {sprite.text}
      </span>
    );
  }

  return (
    <span
      className={`pointer-events-none absolute ${INK_VARIANTS[sprite.variant]}`}
      style={{ ...style, ...float }}
      onAnimationEnd={onDone}
      aria-hidden
    >
      <WatchGlyph index={sprite.glyph ?? 0} />
    </span>
  );
});

// Little watch-part glyphs: gear, crown, dial with hands, mainspring.
function WatchGlyph({ index }: { index: number }) {
  const common = {
    width: 34,
    height: 34,
    viewBox: "0 0 34 34",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
  };
  switch (index % GLYPH_COUNT) {
    case 0: // gear
      return (
        <svg {...common}>
          <circle cx="17" cy="17" r="7" />
          <circle cx="17" cy="17" r="2.4" fill="currentColor" stroke="none" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={17 + Math.cos(a) * 8.5}
                y1={17 + Math.sin(a) * 8.5}
                x2={17 + Math.cos(a) * 12}
                y2={17 + Math.sin(a) * 12}
              />
            );
          })}
        </svg>
      );
    case 1: // crown
      return (
        <svg {...common}>
          <rect x="10" y="12" width="10" height="10" rx="3" />
          <line x1="20" y1="15" x2="24" y2="15" />
          <line x1="20" y1="19" x2="24" y2="19" />
          <line x1="13" y1="12" x2="13" y2="22" />
          <line x1="17" y1="12" x2="17" y2="22" />
        </svg>
      );
    case 2: // dial with hands
      return (
        <svg {...common}>
          <circle cx="17" cy="17" r="11" />
          <line x1="17" y1="17" x2="17" y2="9.5" />
          <line x1="17" y1="17" x2="22.5" y2="19.5" />
        </svg>
      );
    default: // mainspring spiral
      return (
        <svg {...common}>
          <path d="M17 17c0-2 2.5-3 4-1.5s1 4.5-1.5 5.5-6 0-7-3 1-6.5 4.5-7.5 8 .5 9.5 4.5" />
        </svg>
      );
  }
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
    </svg>
  );
}

function CompressIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7v4h3l4 3.5v-11L6 7H3z" fill="currentColor" stroke="none" />
      <path d="M12.5 6.5a3.5 3.5 0 010 5" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7v4h3l4 3.5v-11L6 7H3z" fill="currentColor" stroke="none" />
      <line x1="12" y1="7" x2="16" y2="11" />
      <line x1="16" y1="7" x2="12" y2="11" />
    </svg>
  );
}
