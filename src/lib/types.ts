// ----- Energy model -----
export const ENERGIES = ["VERDANT", "EMBER", "TERRA", "LUMEN", "TIDE"] as const;
export type Energy = (typeof ENERGIES)[number];

export const VIBES = ["CALM", "BOLD", "FOCUSED", "MAGNETIC", "GROUNDED"] as const;
export type Vibe = (typeof VIBES)[number];

// ----- Visual hints for the generative watch illustration -----
export type Metal =
  | "steel"
  | "whiteGold"
  | "yellowGold"
  | "roseGold"
  | "titanium"
  | "platinum"
  | "tantalum"
  | "ceramicBlack"
  | "steelCeramic";

// ----- Strap / bracelet dimension -----
export type StrapType =
  | "integratedSteelBracelet" // Royal Oak / Nautilus / Overseas — design-locked
  | "steelBracelet" // non-integrated (Submariner, Speedmaster)
  | "brownLeather"
  | "blackLeather"
  | "blueLeather"
  | "greenTextile" // NATO / fabric
  | "blueRubber"
  | "blackRubber"
  | "blueTextile";

export type Complication =
  | "time" // clean two/three-hand
  | "chronograph" // sub-registers
  | "moonphase"
  | "tourbillon" // open aperture at 6
  | "skeleton" // exposed movement
  | "regulator" // separated hours/min/sec
  | "wandering" // off-centre wandering hours
  | "digital" // jumping-hour windows
  | "dive" // rotating bezel + lume
  | "pilot" // oversized crown + triangle
  | "chiming"; // exposed hammer + gong (sonnerie)

export interface Watch {
  id: string;
  brand: string;
  model: string;
  reference?: string;
  caseMaterial: string;
  dialColor: string;
  caseEnergy: Energy;
  dialEnergy: Energy;
  strapType: StrapType;
  strapEnergy: Energy;
  signature: string; // evocative one-liner
  fact: string; // one accurate horological fact
  owned: boolean; // part of the real collection
  rarity: number; // "TOP X%" — lower is rarer
  metal: Metal;
  dialHex: string;
  complication: Complication;
}

// ----- The energy "recipe": the ideal configuration derived from the user -----
export interface Recipe {
  caseEnergy: Energy;
  dialEnergy: Energy;
  strapEnergy: Energy;
  caseText: string;
  dialText: string;
  strapText: string;
}

// ----- A computed reading -----
export interface Reading {
  watch: Watch;
  baseEnergy: Energy;
  vibe: Vibe;
  name: string; // visitor name ("" if not given)
  matchPercent: number;
  rarity: number;
  recipe: Recipe;
  reason: string;
  personalLine: string; // the "people misread…" reading line
  traits: string[];
  seed: string;
}
