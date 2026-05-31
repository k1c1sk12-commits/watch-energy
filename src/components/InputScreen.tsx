"use client";

import { useMemo, useRef, useState } from "react";
import { VIBE_META } from "@/lib/engine";
import { VIBES, type Vibe } from "@/lib/types";

const TODAY = new Date();
const MAX_DATE = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, "0")}-${String(
  TODAY.getDate(),
).padStart(2, "0")}`;

function formatNice(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d} ${months[m - 1]} ${y}`;
}

export default function InputScreen({
  initialDate,
  initialVibe,
  onReveal,
}: {
  initialDate: string;
  initialVibe: Vibe | null;
  onReveal: (iso: string, vibe: Vibe) => void;
}) {
  const [iso, setIso] = useState(initialDate);
  const [vibe, setVibe] = useState<Vibe | null>(initialVibe);
  const dateRef = useRef<HTMLInputElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const ready = Boolean(iso) && Boolean(vibe);
  const justReady = useMemo(() => ready, [ready]);

  return (
    <section className="mx-auto flex min-h-[100svh] max-w-[420px] flex-col justify-center px-5 pb-28 pt-10">
      <p className="eyebrow mb-2 rise-in">Step 1 of 1 · two taps</p>
      <h2
        className="mb-8 font-display text-[1.7rem] font-light leading-tight text-hi rise-in"
        style={{ animationDelay: "40ms" }}
      >
        Read your energy.
      </h2>

      {/* ---- Birth date ---- */}
      <div className="rise-in" style={{ animationDelay: "90ms" }}>
        <label htmlFor="dob" className="mb-2 block text-sm font-medium text-mid">
          When were you born?
        </label>
        <div className="relative flex w-full items-center justify-between rounded-[var(--radius-md)] border border-border bg-overlay px-5 py-4 text-left transition-colors hover:border-border-gold focus-within:border-border-gold">
          <span className={iso ? "text-hi" : "text-low"}>
            {iso ? formatNice(iso) : "Select your date"}
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gold" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={dateRef}
            id="dob"
            type="date"
            value={iso}
            min="1900-01-01"
            max={MAX_DATE}
            onChange={(e) => setIso(e.target.value)}
            onClick={() => {
              const el = dateRef.current;
              if (!el) return;
              try {
                el.showPicker?.();
              } catch {
                /* picker already open — ignore */
              }
            }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Birth date"
          />
        </div>
        <p className="mt-2 text-xs text-low">Just for the reading — nothing is stored or sent.</p>
      </div>

      {/* ---- Vibe ---- */}
      <div className="mt-8 rise-in" style={{ animationDelay: "140ms" }}>
        <p className="mb-3 block text-sm font-medium text-mid" id="vibe-label">
          Pick today&apos;s energy
        </p>
        <div role="radiogroup" aria-labelledby="vibe-label" className="grid grid-cols-2 gap-2.5">
          {VIBES.map((v, i) => {
            const meta = VIBE_META[v];
            const selected = vibe === v;
            // Roving tabindex: the selected chip (or the first, if none yet) is
            // the single tab stop; arrow keys move and select.
            const tabbable = vibe ? selected : i === 0;
            return (
              <button
                key={v}
                ref={(el) => {
                  chipRefs.current[i] = el;
                }}
                role="radio"
                aria-checked={selected}
                tabIndex={tabbable ? 0 : -1}
                onClick={() => setVibe(v)}
                onKeyDown={(e) => {
                  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
                  e.preventDefault();
                  const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
                  const next = (i + dir + VIBES.length) % VIBES.length;
                  setVibe(VIBES[next]);
                  chipRefs.current[next]?.focus();
                }}
                className={[
                  "flex min-h-[60px] flex-col items-start justify-center rounded-[var(--radius-sm)] border px-4 py-3 text-left transition-all duration-200",
                  selected
                    ? "border-border-gold bg-gold/[0.1] shadow-[0_0_18px_var(--gold-glow)]"
                    : "border-border bg-overlay hover:border-white/20 hover:bg-hover",
                  v === "GROUNDED" ? "col-span-2" : "",
                ].join(" ")}
              >
                <span
                  className={["text-[0.98rem] font-medium", selected ? "text-gold-bright" : "text-hi"].join(
                    " ",
                  )}
                >
                  {meta.label}
                </span>
                <span className="text-xs text-low">{meta.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Sticky CTA ---- */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-base via-base/95 to-transparent px-5 pb-6 pt-8">
        <div className="mx-auto max-w-[420px]">
          <button
            disabled={!ready}
            onClick={() => ready && vibe && onReveal(iso, vibe)}
            className={[
              "w-full rounded-[var(--radius-lg)] px-8 py-4 text-[0.98rem] font-semibold tracking-wide transition-all duration-300",
              ready
                ? "bg-gold text-[#1a1305] shadow-[0_0_30px_var(--gold-glow)] hover:bg-gold-bright active:scale-[0.98] pulse-once"
                : "cursor-not-allowed bg-overlay text-low",
            ].join(" ")}
            key={justReady ? "on" : "off"}
          >
            Reveal my watch
          </button>
        </div>
      </div>
    </section>
  );
}
