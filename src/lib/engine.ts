import {
  ENERGIES,
  type Energy,
  type Reading,
  type StrapType,
  type Vibe,
  type Watch,
} from "./types";
import { WATCHES } from "./watches";

// ---------------------------------------------------------------------------
// This file owns the language-NEUTRAL engine: the energy cycles, the
// deterministic watch selection, scoring and match%. All human-facing copy
// (energy names, vibe labels, question text, the reasoning sentence, the
// recipe/strap labels) lives in `copy.ts` and is rendered per-language at
// display time, so the language toggle updates everything live without ever
// changing which watch was picked.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 1. Energy cycles (internal — never surfaced in the UI as "elements")
// ---------------------------------------------------------------------------
const GENERATES: Record<Energy, Energy> = {
  VERDANT: "EMBER",
  EMBER: "TERRA",
  TERRA: "LUMEN",
  LUMEN: "TIDE",
  TIDE: "VERDANT",
};
const GENERATED_BY: Record<Energy, Energy> = {
  EMBER: "VERDANT",
  TERRA: "EMBER",
  LUMEN: "TERRA",
  TIDE: "LUMEN",
  VERDANT: "TIDE",
};
const CONTROLS: Record<Energy, Energy> = {
  VERDANT: "TERRA",
  TERRA: "TIDE",
  TIDE: "EMBER",
  EMBER: "LUMEN",
  LUMEN: "VERDANT",
};
const CONTROLLED_BY: Record<Energy, Energy> = {
  TERRA: "VERDANT",
  TIDE: "TERRA",
  EMBER: "TIDE",
  LUMEN: "EMBER",
  VERDANT: "LUMEN",
};

export const VIBE_TARGET: Record<Vibe, Energy> = {
  CALM: "TIDE",
  BOLD: "EMBER",
  FOCUSED: "LUMEN",
  MAGNETIC: "VERDANT",
  GROUNDED: "TERRA",
};

// ----- Quiz structure -----
// metal -> biases the CASE, mind -> the DIAL, feel -> the STRAP. misread is
// flavour only (drives the personal reading line, no effect on the watch).
// The option LABELS / HINTS / PROMPTS live in copy.ts (keyed by these ids).
export type QuestionKey = "metal" | "mind" | "feel" | "misread";

export interface QuizOption {
  id: string;
  energy: Energy;
}

export interface Question {
  key: QuestionKey;
  options: QuizOption[];
}

export const QUESTIONS: Question[] = [
  {
    key: "metal",
    options: [
      { id: "steel", energy: "LUMEN" },
      { id: "gold", energy: "TERRA" },
      { id: "titanium", energy: "VERDANT" },
      { id: "rosegold", energy: "EMBER" },
    ],
  },
  {
    key: "mind",
    options: [
      { id: "ocean", energy: "TIDE" },
      { id: "valley", energy: "VERDANT" },
      { id: "embers", energy: "EMBER" },
      { id: "snow", energy: "LUMEN" },
    ],
  },
  {
    key: "feel",
    options: [
      { id: "engineered", energy: "LUMEN" },
      { id: "classic", energy: "TERRA" },
      { id: "deep", energy: "TIDE" },
      { id: "ready", energy: "VERDANT" },
    ],
  },
  {
    key: "misread",
    options: [
      { id: "quiet", energy: "TIDE" },
      { id: "soft", energy: "EMBER" },
      { id: "cold", energy: "LUMEN" },
      { id: "restless", energy: "VERDANT" },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Birth date -> base energy (deterministic, no lunar deps)
// ---------------------------------------------------------------------------
export function baseEnergy(year: number, month: number, day: number): Energy {
  const digitSum = String(year)
    .split("")
    .reduce((a, c) => a + Number(c), 0);
  const raw = (digitSum + month + day) % 5;
  return ENERGIES[raw];
}

// ---------------------------------------------------------------------------
// 3. Stable string hash (FNV-1a) for deterministic, seedable choices
// ---------------------------------------------------------------------------
export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministically pick from an array given a seed + salt. Used by the
// per-language copy generators in copy.ts so both languages stay stable.
export function pick<T>(arr: T[], seed: string, salt: string): T {
  return arr[hashStr(seed + salt) % arr.length];
}

// ---------------------------------------------------------------------------
// 4. Scoring + pick
// ---------------------------------------------------------------------------
function rel(E: Energy, A: Energy): number {
  if (E === A) return 4; // resonance
  if (GENERATES[A] === E) return 3; // anchor amplifies slot
  if (GENERATED_BY[A] === E) return 3; // slot amplifies anchor
  if (CONTROLS[A] === E) return 1; // mild tension
  if (CONTROLLED_BY[A] === E) return 1;
  return 2; // neutral safety
}

// Strap type -> energy. MUST mirror each watch's `strapEnergy` (self-test checks).
export const STRAP_ENERGY: Record<StrapType, Energy> = {
  integratedSteelBracelet: "LUMEN",
  steelBracelet: "LUMEN",
  brownLeather: "TERRA",
  blackLeather: "TIDE",
  blueLeather: "TIDE",
  whiteLeather: "LUMEN",
  greyLeather: "LUMEN",
  greenTextile: "VERDANT",
  blueRubber: "TIDE",
  blackRubber: "EMBER",
  blueTextile: "TIDE",
};

// Per-slot energy bias from the quiz answers (metal -> case, mind -> dial,
// feel -> strap). The chosen "nature" sets the overall vibe target.
export interface Bias {
  metal: Energy;
  mind: Energy;
  feel: Energy;
}

// Score a watch across all THREE slots, blending: the birth-date base energy,
// the chosen nature (vibe target), and the per-slot quiz biases. Case dominates,
// dial second, strap lightest. Owned pieces get a gentle nudge.
function scoreWatch(w: Watch, base: Energy, target: Energy, bias: Bias): number {
  const caseS =
    rel(w.caseEnergy, base) * 1.0 +
    rel(w.caseEnergy, target) * 0.7 +
    rel(w.caseEnergy, bias.metal) * 0.9;
  const dialS =
    rel(w.dialEnergy, base) * 0.8 +
    rel(w.dialEnergy, target) * 0.7 +
    rel(w.dialEnergy, bias.mind) * 0.8;
  const strapS =
    rel(w.strapEnergy, base) * 0.5 +
    rel(w.strapEnergy, target) * 0.4 +
    rel(w.strapEnergy, bias.feel) * 0.6;
  return caseS + dialS + strapS + (w.owned ? 0.25 : 0);
}

const SCORE_MIN = 6.4; // all rel = 1, unowned
const SCORE_MAX = 25.85; // all rel = 4, owned

// Width of the "still a great match" band below the top score (~15% of range).
const BAND = 2.9;

function pickWatch(
  pool: Watch[],
  base: Energy,
  target: Energy,
  bias: Bias,
  seed: string,
): Watch {
  const scored = pool.map((w) => ({ w, s: scoreWatch(w, base, target, bias) }));
  const maxS = Math.max(...scored.map((x) => x.s));
  const candidates = scored
    .filter((x) => x.s >= maxS - BAND)
    .sort((a, b) => b.s - a.s || (a.w.id < b.w.id ? -1 : 1))
    .map((x) => x.w);
  if (candidates.length === 1) return candidates[0];
  const h = hashStr(seed + "|" + bias.metal + bias.mind + bias.feel);
  return candidates[h % candidates.length];
}

function matchPercent(score: number, seed: string, vibe: Vibe): number {
  const norm = Math.min(1, Math.max(0, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)));
  const base = 80 + norm * 17;
  const jitter = hashStr(seed + vibe) % 3;
  return Math.min(99, Math.round(base + jitter));
}

// ---------------------------------------------------------------------------
// 5. Public facade
// ---------------------------------------------------------------------------
export interface DOB {
  y: number;
  m: number;
  d: number;
}

export type ParseResult = { ok: true; dob: DOB } | { ok: false; error: string };

export function parseDOB(input: string): ParseResult {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (!m) return { ok: false, error: "Pick a valid date." };
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12) return { ok: false, error: "Month must be 01–12." };
  const dim = new Date(y, mo, 0).getDate();
  if (d < 1 || d > dim) return { ok: false, error: `Day must be 01–${dim} for that month.` };
  const dob = new Date(y, mo - 1, d);
  if (dob.getTime() > Date.now()) return { ok: false, error: "Birth date can't be in the future." };
  if (y < 1900) return { ok: false, error: "Please enter a year from 1900 onward." };
  return { ok: true, dob: { y, m: mo, d } };
}

export interface Answers {
  dob: DOB;
  nature: Vibe;
  bias: Bias; // metal -> case, mind -> dial, feel -> strap
  misread: Energy;
  name?: string;
}

export function getReading(a: Answers, pool: Watch[] = WATCHES): Reading {
  const { dob, nature } = a;
  const seed =
    `${dob.y}-${String(dob.m).padStart(2, "0")}-${String(dob.d).padStart(2, "0")}` +
    `|${a.bias.metal}${a.bias.mind}${a.bias.feel}`;
  const base = baseEnergy(dob.y, dob.m, dob.d);
  const target = VIBE_TARGET[nature];
  const watch = pickWatch(pool, base, target, a.bias, seed);
  const score = scoreWatch(watch, base, target, a.bias);
  return {
    watch,
    baseEnergy: base,
    vibe: nature,
    name: (a.name ?? "").trim(),
    matchPercent: matchPercent(score, seed, nature),
    rarity: watch.rarity,
    misread: a.misread,
    seed,
  };
}

// ---------------------------------------------------------------------------
// 6. Integrity self-tests (run in dev only; never throws in production runtime)
// ---------------------------------------------------------------------------
export function assertPoolBalance(pool: Watch[] = WATCHES): string[] {
  const errors: string[] = [];
  for (const e of ENERGIES) {
    if (!pool.some((w) => w.caseEnergy === e)) errors.push(`No case covers ${e}`);
    if (!pool.some((w) => w.dialEnergy === e)) errors.push(`No dial covers ${e}`);
    if (!pool.some((w) => w.strapEnergy === e)) errors.push(`No strap covers ${e}`);
  }
  for (const w of pool) {
    if (STRAP_ENERGY[w.strapType] !== w.strapEnergy) {
      errors.push(`strap energy mismatch on ${w.id}`);
    }
  }
  return errors;
}

export function distinctPickCount(pool: Watch[] = WATCHES): number {
  const picks = new Set<string>();
  for (const base of ENERGIES) {
    for (const e of ENERGIES) {
      const bias: Bias = { metal: e, mind: e, feel: e };
      for (const vibe of Object.keys(VIBE_TARGET) as Vibe[]) {
        picks.add(pickWatch(pool, base, VIBE_TARGET[vibe], bias, "2000-01-01").id);
      }
    }
  }
  return picks.size;
}
