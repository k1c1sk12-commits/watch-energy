"use client";

import { useId } from "react";
import type { Metal, StrapType } from "@/lib/types";
import { METAL } from "./WatchVisual";

const SIZE = 44;

/** A rounded chip filled with a watch-case metal gradient. */
export function CaseSwatch({ metal }: { metal: Metal }) {
  const uid = useId().replace(/:/g, "");
  const [a, b, c] = METAL[metal];
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 44 44" aria-hidden>
      <defs>
        <linearGradient id={`cs${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.55" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="40" height="40" rx="12" fill={`url(#cs${uid})`} stroke="rgba(255,255,255,0.12)" />
    </svg>
  );
}

/** A disc filled with the dial colour. */
export function DialSwatch({ hex }: { hex: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 44 44" aria-hidden>
      <defs>
        <radialGradient id={`ds${uid}`} cx="0.42" cy="0.36" r="0.75">
          <stop offset="0" stopColor={lighten(hex, 0.18)} />
          <stop offset="0.7" stopColor={hex} />
          <stop offset="1" stopColor={darken(hex, 0.3)} />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="18" fill={`url(#ds${uid})`} stroke="rgba(255,255,255,0.12)" />
    </svg>
  );
}

const STRAP_COLOR: Record<StrapType, string> = {
  integratedSteelBracelet: "#aab0b6",
  steelBracelet: "#aab0b6",
  brownLeather: "#7a4a2b",
  blackLeather: "#1d1d20",
  blueLeather: "#27406d",
  greenTextile: "#3f6b4a",
  blueRubber: "#21507e",
  blackRubber: "#1a1a1d",
  blueTextile: "#2c4f7c",
};

/** A small strap / bracelet icon coloured for the strap type. */
export function StrapSwatch({ strap }: { strap: StrapType }) {
  const col = STRAP_COLOR[strap];
  const isBracelet = strap === "integratedSteelBracelet" || strap === "steelBracelet";
  const isTextile = strap === "greenTextile" || strap === "blueTextile";
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 44 44" aria-hidden>
      {/* central case stub */}
      <rect x="15" y="17" width="14" height="10" rx="2" fill="#2a2a2e" stroke="rgba(255,255,255,0.15)" />
      {[6, 31].map((y, i) => (
        <g key={i}>
          {isBracelet ? (
            // three links
            [0, 1, 2].map((k) => (
              <rect
                key={k}
                x={13}
                y={y + k * 2.4}
                width={18}
                height={1.8}
                rx={0.9}
                fill={k % 2 ? darken(col, 0.18) : col}
              />
            ))
          ) : (
            // tapered strap band
            <path
              d={i === 0 ? `M16 ${y + 7} L28 ${y + 7} L26 ${y} L18 ${y} Z` : `M18 ${y} L26 ${y} L28 ${y + 7} L16 ${y + 7} Z`}
              fill={col}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          )}
          {isTextile &&
            [0, 1, 2, 3].map((k) => (
              <line key={k} x1={17 + k * 3} y1={y} x2={17 + k * 3} y2={y + 7} stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
            ))}
        </g>
      ))}
    </svg>
  );
}

// tiny hex utils (local copy to keep this component standalone)
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, "$1$1") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function toHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lighten(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return toHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
}
function darken(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return toHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}
