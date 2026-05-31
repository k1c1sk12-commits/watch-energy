"use client";

import { useId, type Ref } from "react";
import type { Complication, Metal, Watch } from "@/lib/types";

// Three-stop metal gradients (top highlight -> mid -> lower shade).
const METAL: Record<Metal, [string, string, string]> = {
  steel: ["#eef0f2", "#aab0b6", "#d2d6da"],
  whiteGold: ["#f4f5f6", "#c2c6cb", "#e2e5e8"],
  yellowGold: ["#f8ecb8", "#caa23f", "#ecca6a"],
  roseGold: ["#f6dcc9", "#cd8e6c", "#e9b194"],
  titanium: ["#d2d5d7", "#888d92", "#b0b4b8"],
  platinum: ["#eff1f2", "#b6bbc0", "#d9dce0"],
  ceramicBlack: ["#3c3c41", "#101012", "#2a2a2e"],
  steelCeramic: ["#e4e7ea", "#7d8389", "#bcc1c6"],
};

function caseShape(model: string): "octagon" | "rect" | "round" {
  if (/royal oak/i.test(model)) return "octagon";
  if (/reverso|tank/i.test(model)) return "rect";
  return "round";
}

// Build an N-gon path centred at (cx,cy).
function polygon(cx: number, cy: number, r: number, n: number, rot = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

interface Props {
  watch: Watch;
  size?: number;
  className?: string;
  /** static (no animation) — used for the share card render */
  still?: boolean;
  ref?: Ref<SVGSVGElement>;
}

export default function WatchVisual({ watch, size = 240, className, still = false, ref }: Props) {
  const uid = useId().replace(/[:]/g, "");
  const metal = METAL[watch.metal];
  const shape = caseShape(watch.model);
  const dial = watch.dialHex;
  const C = 100; // centre
  const gold = "#c9a86a";

  const isLight = isLightColor(dial);
  const tick = isLight ? "rgba(20,20,24,0.55)" : "rgba(245,243,238,0.7)";
  const handColor = isLight ? "#1b1b1f" : "#f2efe7";

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${watch.brand} ${watch.model}, ${watch.caseMaterial} case with ${watch.dialColor} dial`}
    >
      <defs>
        <linearGradient id={`m${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={metal[0]} />
          <stop offset="0.55" stopColor={metal[1]} />
          <stop offset="1" stopColor={metal[2]} />
        </linearGradient>
        <radialGradient id={`d${uid}`} cx="0.5" cy="0.38" r="0.75">
          <stop offset="0" stopColor={lighten(dial, 0.16)} />
          <stop offset="0.7" stopColor={dial} />
          <stop offset="1" stopColor={darken(dial, 0.28)} />
        </radialGradient>
        <radialGradient id={`g${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={gold} stopOpacity="0.55" />
          <stop offset="1" stopColor={gold} stopOpacity="0" />
        </radialGradient>
        <filter id={`s${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* ambient floor glow */}
      <ellipse cx={C} cy={172} rx={66} ry={12} fill={`url(#g${uid})`} />

      <g filter={`url(#s${uid})`}>
        {/* ---- case + bezel ---- */}
        {shape === "round" && (
          <>
            <circle cx={C} cy={C} r={92} fill={`url(#m${uid})`} />
            <circle cx={C} cy={C} r={80} fill={darken(metal[2], 0.1)} />
          </>
        )}
        {shape === "octagon" && (
          <>
            <path d={polygon(C, C, 96, 8, Math.PI / 8)} fill={`url(#m${uid})`} />
            <path d={polygon(C, C, 82, 8, Math.PI / 8)} fill={darken(metal[2], 0.12)} />
            {/* signature screws */}
            {Array.from({ length: 8 }).map((_, i) => {
              const a = Math.PI / 8 + (i / 8) * Math.PI * 2;
              const sx = C + 88 * Math.cos(a);
              const sy = C + 88 * Math.sin(a);
              return <circle key={i} cx={sx} cy={sy} r={2.4} fill={darken(metal[1], 0.2)} />;
            })}
          </>
        )}
        {shape === "rect" && (
          <>
            <rect x={28} y={16} width={144} height={168} rx={16} fill={`url(#m${uid})`} />
            <rect x={40} y={28} width={120} height={144} rx={10} fill={darken(metal[2], 0.1)} />
            {/* Reverso/Tank gadroons */}
            <rect x={28} y={20} width={144} height={5} rx={2.5} fill={lighten(metal[0], 0.05)} opacity="0.6" />
            <rect x={28} y={175} width={144} height={5} rx={2.5} fill={darken(metal[2], 0.15)} opacity="0.6" />
          </>
        )}

        {/* ---- dial ---- */}
        {shape === "rect" ? (
          <rect x={46} y={34} width={108} height={132} rx={8} fill={`url(#d${uid})`} />
        ) : (
          <circle cx={C} cy={C} r={shape === "octagon" ? 74 : 72} fill={`url(#d${uid})`} />
        )}

        {/* dial furniture by complication */}
        <DialFurniture
          complication={watch.complication}
          shape={shape}
          tick={tick}
          hand={handColor}
          gold={gold}
          dial={dial}
          uid={uid}
          still={still}
        />

        {/* crown */}
        {shape !== "rect" && (
          <rect
            x={shape === "octagon" ? 188 : 190}
            y={94}
            width={9}
            height={12}
            rx={2}
            fill={`url(#m${uid})`}
          />
        )}
      </g>
    </svg>
  );
}

function DialFurniture({
  complication,
  shape,
  tick,
  hand,
  gold,
  dial,
  uid,
  still,
}: {
  complication: Complication;
  shape: "octagon" | "rect" | "round";
  tick: string;
  hand: string;
  gold: string;
  dial: string;
  uid: string;
  still: boolean;
}) {
  const C = 100;
  const markerR = shape === "rect" ? 52 : shape === "octagon" ? 64 : 62;

  // Index markers (skip where a sub-dial / aperture sits at 6 o'clock)
  const skip6 = complication === "moonphase" || complication === "tourbillon";
  const markers = Array.from({ length: 12 }).map((_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    if (skip6 && i === 6) return null;
    const x1 = C + (markerR - (i % 3 === 0 ? 9 : 6)) * Math.cos(a);
    const y1 = C + (markerR - (i % 3 === 0 ? 9 : 6)) * Math.sin(a);
    const x2 = C + markerR * Math.cos(a);
    const y2 = C + markerR * Math.sin(a);
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={i % 3 === 0 ? gold : tick}
        strokeWidth={i % 3 === 0 ? 2.6 : 1.4}
        strokeLinecap="round"
      />
    );
  });

  const hands = (
    <>
      <line x1={C} y1={C} x2={C} y2={C - 40} stroke={hand} strokeWidth={4} strokeLinecap="round" transform={`rotate(${HOUR_ROT} ${C} ${C})`} />
      <line x1={C} y1={C} x2={C} y2={C - 56} stroke={hand} strokeWidth={2.6} strokeLinecap="round" transform={`rotate(${MIN_ROT} ${C} ${C})`} />
      <line x1={C} y1={C} x2={C} y2={C - 60} stroke={gold} strokeWidth={1.2} strokeLinecap="round" transform={`rotate(${SEC_ROT} ${C} ${C})`}>
        {!still && (
          <animateTransform attributeName="transform" type="rotate" from={`${SEC_ROT} ${C} ${C}`} to={`${SEC_ROT + 360} ${C} ${C}`} dur="60s" repeatCount="indefinite" />
        )}
      </line>
      <circle cx={C} cy={C} r={3.4} fill={gold} />
    </>
  );

  switch (complication) {
    case "chronograph":
      return (
        <>
          {markers}
          {subdial(C, 70, dial, tick, gold)}
          {subdial(70, C, dial, tick, gold)}
          {subdial(130, C, dial, tick, gold)}
          {hands}
        </>
      );
    case "regulator":
      return (
        <>
          {subdial(C, 68, dial, tick, gold, "h")}
          {subdial(C, 138, dial, tick, gold, "s")}
          {/* large central minutes hand */}
          <line x1={C} y1={C + 12} x2={C} y2={C - 58} stroke={hand} strokeWidth={2.8} strokeLinecap="round" transform={`rotate(${MIN_ROT} ${C} ${C})`} />
          <circle cx={C} cy={C} r={3} fill={gold} />
        </>
      );
    case "moonphase":
      return (
        <>
          {markers}
          {/* moon aperture at 6 */}
          <path d={`M${C - 18} 138 a18 11 0 0 1 36 0 Z`} fill="#0d1330" />
          <circle cx={C - 7} cy={134} r={5} fill="#e8e2c8" />
          <circle cx={C + 7} cy={135} r={4} fill="#cfc9b0" opacity="0.8" />
          {hands}
        </>
      );
    case "tourbillon":
      return (
        <>
          {markers}
          {/* open cage at 6 */}
          <circle cx={C} cy={132} r={16} fill={darken(dial, 0.4)} stroke={gold} strokeWidth={1} />
          <path d={polygon(C, 132, 14, 3, -Math.PI / 2)} fill="none" stroke={gold} strokeWidth={1.2} />
          <line x1={C - 14} y1={132} x2={C + 14} y2={132} stroke={gold} strokeWidth={1} opacity="0.7">
            {!still && <animateTransform attributeName="transform" type="rotate" from={`0 ${C} 132`} to={`360 ${C} 132`} dur="8s" repeatCount="indefinite" />}
          </line>
          {hands}
        </>
      );
    case "skeleton":
      return (
        <>
          {/* exposed bridges / gears */}
          <circle cx={C} cy={C} r={62} fill="none" stroke={gold} strokeWidth={0.8} opacity="0.5" />
          {gear(C, 78, 13, gold)}
          {gear(124, 120, 11, gold)}
          {gear(74, 122, 9, gold)}
          <circle cx={C} cy={C} r={26} fill="none" stroke={tick} strokeWidth={1} opacity="0.6" />
          {markers}
          {hands}
        </>
      );
    case "wandering":
      return (
        <>
          {/* off-centre wandering-hours arc */}
          <path d={`M70 78 A40 40 0 0 1 130 78`} fill="none" stroke={gold} strokeWidth={1.4} opacity="0.8" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={70 + i * 30} cy={72 + (i === 1 ? -6 : 0)} r={9} fill={darken(dial, 0.3)} stroke={gold} strokeWidth={0.8} />
          ))}
          <circle cx={C} cy={118} r={16} fill="none" stroke={tick} strokeWidth={1} opacity="0.6" />
          <line x1={C} y1={118} x2={C} y2={96} stroke={hand} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={C} cy={118} r={2.6} fill={gold} />
        </>
      );
    case "digital":
      return (
        <>
          {/* jumping hour + minute windows */}
          <rect x={58} y={88} width={30} height={26} rx={3} fill={lighten(dial, 0.08)} stroke={gold} strokeWidth={0.8} />
          <rect x={112} y={88} width={30} height={26} rx={3} fill={lighten(dial, 0.08)} stroke={gold} strokeWidth={0.8} />
          <text x={73} y={107} textAnchor="middle" fill={hand} fontSize="16" fontFamily="monospace">10</text>
          <text x={127} y={107} textAnchor="middle" fill={hand} fontSize="16" fontFamily="monospace">09</text>
          {subdial(C, 150, dial, tick, gold, "s")}
          <line x1={C} y1={70} x2={C} y2={62} stroke={gold} strokeWidth={2} />
        </>
      );
    case "dive":
      return (
        <>
          {/* rotating bezel pip + lume markers */}
          <circle cx={C} cy={C} r={shape === "round" ? 78 : 76} fill="none" stroke={gold} strokeWidth={2.4} opacity="0.55" />
          <circle cx={C} cy={C - (shape === "round" ? 78 : 76)} r={3.4} fill={gold} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            return <circle key={i} cx={C + 60 * Math.cos(a)} cy={C + 60 * Math.sin(a)} r={i % 3 === 0 ? 4 : 2.6} fill={tick} />;
          })}
          {hands}
        </>
      );
    case "pilot":
      return (
        <>
          {/* triangle at 12 + bold markers */}
          <path d={`M${C - 6} 46 L${C + 6} 46 L${C} 58 Z`} fill={gold} />
          {Array.from({ length: 12 }).map((_, i) => {
            if (i === 0) return null;
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            return (
              <text key={i} x={C + 56 * Math.cos(a)} y={C + 56 * Math.sin(a) + 5} textAnchor="middle" fill={tick} fontSize="13" fontFamily="var(--font-sans, sans-serif)" fontWeight="600">
                {i === 0 ? 12 : i}
              </text>
            );
          })}
          {hands}
        </>
      );
    default: // "time"
      return (
        <>
          {markers}
          {hands}
        </>
      );
  }
}

// Static hand angles (a pleasing ~10:09 layout, the watch-photography standard)
const HOUR_ROT = 305; // ~10:08
const MIN_ROT = 52; // ~:09
const SEC_ROT = 168;

function subdial(cx: number, cy: number, dial: string, tick: string, gold: string, kind?: "h" | "s") {
  return (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={15} fill={darken(dial, 0.16)} stroke={tick} strokeWidth={0.8} />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <circle key={i} cx={cx + 12 * Math.cos(a)} cy={cy + 12 * Math.sin(a)} r={0.7} fill={tick} />;
      })}
      <line x1={cx} y1={cy} x2={cx + (kind === "s" ? 8 : 6)} y2={cy - (kind === "h" ? 9 : 7)} stroke={gold} strokeWidth={1.1} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={1.6} fill={gold} />
    </g>
  );
}

function gear(cx: number, cy: number, r: number, color: string) {
  const teeth = 10;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const rr = i % 2 === 0 ? r : r * 0.78;
    const a = (i / (teeth * 2)) * Math.PI * 2;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <g opacity="0.6">
      <path d={`M${pts.join("L")}Z`} fill="none" stroke={color} strokeWidth={0.8} />
      <circle cx={cx} cy={cy} r={r * 0.34} fill="none" stroke={color} strokeWidth={0.8} />
    </g>
  );
}

// ---- tiny colour utils (hex only) ----
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
function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  // perceived luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}
