import { ENERGIES, type Energy, type Reading, type Vibe, type Watch } from "./types";
import { WATCHES } from "./watches";

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

export const ENERGY_META: Record<
  Energy,
  { name: string; tagline: string; keywords: string[] }
> = {
  VERDANT: {
    name: "Verdant",
    tagline: "Growth, momentum, fresh ambition.",
    keywords: ["growth", "vision", "renewal", "drive"],
  },
  EMBER: {
    name: "Ember",
    tagline: "Passion, presence, magnetic warmth.",
    keywords: ["passion", "charisma", "spark", "radiance"],
  },
  TERRA: {
    name: "Terra",
    tagline: "Stability, trust, grounded calm.",
    keywords: ["stability", "trust", "patience", "foundation"],
  },
  LUMEN: {
    name: "Lumen",
    tagline: "Clarity, precision, sharp focus.",
    keywords: ["clarity", "precision", "focus", "structure"],
  },
  TIDE: {
    name: "Tide",
    tagline: "Depth, intuition, fluid calm.",
    keywords: ["depth", "intuition", "flow", "stillness"],
  },
};

export const VIBE_TARGET: Record<Vibe, Energy> = {
  CALM: "TIDE",
  BOLD: "EMBER",
  FOCUSED: "LUMEN",
  MAGNETIC: "VERDANT",
  GROUNDED: "TERRA",
};

export const VIBE_META: Record<Vibe, { label: string; hint: string }> = {
  CALM: { label: "Calm", hint: "settled & reflective" },
  BOLD: { label: "Bold", hint: "expressive & seen" },
  FOCUSED: { label: "Focused", hint: "sharp & precise" },
  MAGNETIC: { label: "Magnetic", hint: "charismatic & rising" },
  GROUNDED: { label: "Grounded", hint: "stable & assured" },
};

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
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: string, salt: string): T {
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

function scoreWatch(w: Watch, base: Energy, vibe: Vibe): number {
  const target = VIBE_TARGET[vibe];
  const baseScore = rel(w.caseEnergy, base) * 1.0 + rel(w.dialEnergy, base) * 0.8;
  const vibeScore = rel(w.caseEnergy, target) * 0.7 + rel(w.dialEnergy, target) * 0.7;
  // Gentle nudge toward the real collection: the payoff of the experience is
  // "this watch is actually his — go see it on Instagram", so owned pieces
  // should surface a little more often without crowding out variety.
  const ownedBonus = w.owned ? 0.25 : 0;
  return baseScore + vibeScore + ownedBonus;
}

const SCORE_MIN = 3.2;
const SCORE_MAX = 12.8;

// Width of the "still a great match" band below the top score. Watches within
// this band of the best score become candidates; the exact pick is then chosen
// deterministically from the full birth date + vibe. This keeps every result
// highly relevant while spreading outcomes across the pool, so different people
// with the same base energy can still discover different watches (and the whole
// collection is reachable, powering the "unlock the set" mechanic).
const BAND = 1.4;

function pickWatch(pool: Watch[], base: Energy, vibe: Vibe, seed: string): Watch {
  const scored = pool.map((w) => ({ w, s: scoreWatch(w, base, vibe) }));
  const maxS = Math.max(...scored.map((x) => x.s));
  const candidates = scored
    .filter((x) => x.s >= maxS - BAND)
    // Stable ordering for reproducible indexing: score desc, then id.
    .sort((a, b) => b.s - a.s || (a.w.id < b.w.id ? -1 : 1))
    .map((x) => x.w);
  if (candidates.length === 1) return candidates[0];
  const h = hashStr(seed + "|" + vibe);
  return candidates[h % candidates.length];
}

function matchPercent(score: number, seed: string, vibe: Vibe): number {
  const norm = Math.min(1, Math.max(0, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)));
  const base = 80 + norm * 17;
  const jitter = hashStr(seed + vibe) % 3;
  return Math.min(99, Math.round(base + jitter));
}

// ---------------------------------------------------------------------------
// 5. Reasoning copy generator
// ---------------------------------------------------------------------------
const ENERGY_ADJ: Record<Energy, string[]> = {
  VERDANT: ["rising", "expansive", "forward-leaning", "fresh"],
  EMBER: ["radiant", "magnetic", "spirited", "bold"],
  TERRA: ["grounded", "steady", "assured", "enduring"],
  LUMEN: ["precise", "lucid", "sharp", "composed"],
  TIDE: ["deep", "fluid", "intuitive", "serene"],
};
const VERB_OPEN = ["leans", "gravitates", "draws", "points"];
const CASE_VERB = ["channels", "carries", "anchors", "holds"];
const DIAL_VERB = ["amplifies", "reflects", "echoes", "releases"];
const DIAL_NOUN = ["light", "tone", "character", "undertone"];
const CLOSE_VERB = ["balances", "grounds", "amplifies", "sharpens", "channels"];
const CLOSE_NOUN: Record<Vibe, string[]> = {
  CALM: ["quiet confidence", "a settled mind", "effortless poise"],
  BOLD: ["your presence", "a confident statement", "standout energy"],
  FOCUSED: ["clear intent", "sharp focus", "decisive clarity"],
  MAGNETIC: ["a natural pull", "magnetic ease", "rising charisma"],
  GROUNDED: ["a steady centre", "quiet assurance", "rooted calm"],
};
const VIBE_ADJ: Record<Vibe, string> = {
  CALM: "calm",
  BOLD: "bold",
  FOCUSED: "focused",
  MAGNETIC: "magnetic",
  GROUNDED: "grounded",
};
const MATERIAL_PHRASE: Record<string, string> = {
  "stainless steel": "cool steel case",
  oystersteel: "cool steel case",
  "white gold": "bright white-gold case",
  "rose gold": "warm rose-gold case",
  "yellow gold": "rich yellow-gold case",
  titanium: "light titanium case",
  platinum: "dense platinum case",
  "black ceramic": "deep ceramic case",
  "steel & black ceramic": "steel-and-ceramic case",
};

function materialPhrase(m: string): string {
  return MATERIAL_PHRASE[m.toLowerCase()] ?? `${m.toLowerCase()} case`;
}

function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function buildReason(w: Watch, base: Energy, vibe: Vibe, seed: string): string {
  const s = seed + "|" + vibe + "|" + w.id;
  const dial = `${w.dialColor.toLowerCase()} dial`;
  const dialAdj = pick(ENERGY_ADJ[w.dialEnergy], s, "da");
  const s1 = `Your ${pick(ENERGY_ADJ[base], s, "ba")} energy ${pick(
    VERB_OPEN,
    s,
    "vo",
  )} toward the ${w.brand} ${w.model}.`;
  const s2 = `Its ${materialPhrase(w.caseMaterial)} ${pick(CASE_VERB, s, "cv")} ${pick(
    ENERGY_ADJ[w.caseEnergy],
    s,
    "ca",
  )} energy, while the ${dial} ${pick(DIAL_VERB, s, "dv")} ${article(dialAdj)} ${dialAdj} ${pick(
    DIAL_NOUN,
    s,
    "dn",
  )}.`;
  const s3 = `For a ${VIBE_ADJ[vibe]} day, this piece ${pick(CLOSE_VERB, s, "cl")} ${pick(
    CLOSE_NOUN[vibe],
    s,
    "cn",
  )}.`;
  return `${s1} ${s2} ${s3}`;
}

function buildTraits(w: Watch, base: Energy, vibe: Vibe, seed: string): string[] {
  const s = seed + "|t|" + w.id;
  const a = pick(ENERGY_ADJ[base], s, "t1");
  const b = pick(ENERGY_ADJ[w.dialEnergy], s, "t2");
  const c = VIBE_META_KEYWORD[vibe];
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  return [cap(a), cap(b), cap(c)];
}

const VIBE_META_KEYWORD: Record<Vibe, string> = {
  CALM: "serene",
  BOLD: "expressive",
  FOCUSED: "precise",
  MAGNETIC: "magnetic",
  GROUNDED: "grounded",
};

// ---------------------------------------------------------------------------
// 6. Public facade
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

export function getReading(dob: DOB, vibe: Vibe, pool: Watch[] = WATCHES): Reading {
  const seed = `${dob.y}-${String(dob.m).padStart(2, "0")}-${String(dob.d).padStart(2, "0")}`;
  const base = baseEnergy(dob.y, dob.m, dob.d);
  const watch = pickWatch(pool, base, vibe, seed);
  const score = scoreWatch(watch, base, vibe);
  return {
    watch,
    baseEnergy: base,
    vibe,
    matchPercent: matchPercent(score, seed, vibe),
    rarity: watch.rarity,
    reason: buildReason(watch, base, vibe, seed),
    traits: buildTraits(watch, base, vibe, seed),
    seed,
  };
}

// ---------------------------------------------------------------------------
// 7. Integrity self-tests (run in dev only; never throws in production runtime)
// ---------------------------------------------------------------------------
export function assertPoolBalance(pool: Watch[] = WATCHES): string[] {
  const errors: string[] = [];
  for (const e of ENERGIES) {
    if (!pool.some((w) => w.caseEnergy === e)) errors.push(`No case covers ${e}`);
    if (!pool.some((w) => w.dialEnergy === e)) errors.push(`No dial covers ${e}`);
  }
  return errors;
}

export function distinctPickCount(pool: Watch[] = WATCHES): number {
  const picks = new Set<string>();
  for (const base of ENERGIES) {
    for (const vibe of Object.keys(VIBE_TARGET) as Vibe[]) {
      picks.add(pickWatch(pool, base, vibe, "2000-01-01").id);
    }
  }
  return picks.size;
}
