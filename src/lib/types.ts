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
  | "ceramicBlack"
  | "steelCeramic";

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
  signature: string; // evocative one-liner
  fact: string; // one accurate horological fact
  owned: boolean; // part of the real collection
  rarity: number; // "TOP X%" — lower is rarer
  metal: Metal;
  dialHex: string;
  complication: Complication;
}

// ----- A computed reading -----
export interface Reading {
  watch: Watch;
  baseEnergy: Energy;
  vibe: Vibe;
  matchPercent: number;
  rarity: number;
  reason: string;
  traits: string[];
  seed: string;
}
