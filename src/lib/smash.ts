// ---------------------------------------------------------------------------
// Data for Watch Smash (/smash) — the keyboard-smash / tap-frenzy game.
//
// Every letter maps to real watch brands (haute horlogerie, independents and
// a few accessible names — the "high and low" mix the account stands for).
// Pressing a letter cycles through its brands; discovering at least one brand
// per letter lights that letter in the A–Z ribbon. Q is a deliberate
// easter egg: no famous maison starts with Q, so it teaches the Quartz Crisis.
// ---------------------------------------------------------------------------

export const LETTER_BRANDS: Record<string, string[]> = {
  a: ["Audemars Piguet", "A. Lange & Söhne", "Akrivia"],
  b: ["Breguet", "Blancpain", "Bovet", "Bulgari"],
  c: ["Cartier", "Chopard", "Christopher Ward", "Chronoswiss", "Czapek"],
  d: ["Daniel Roth", "De Bethune", "Doxa", "Damasko"],
  e: ["Eterna", "Eberhard & Co.", "Edox", "Enicar"],
  f: ["F.P. Journe", "Franck Muller", "Frederique Constant"],
  g: ["Grand Seiko", "Greubel Forsey", "Girard-Perregaux", "Glashütte Original", "Grönefeld"],
  h: ["H. Moser & Cie", "Hublot", "Hermès"],
  i: ["IWC Schaffhausen", "Ikepod", "Isotope"],
  j: ["Jaeger-LeCoultre", "Jacob & Co.", "Jaquet Droz"],
  k: ["Kurono Tokyo", "Konstantin Chaykin", "Kudoke"],
  l: ["Laurent Ferrier", "Longines", "Louis Vuitton"],
  m: ["MB&F", "Montblanc", "Mido"],
  n: ["NOMOS Glashütte", "Norqain", "Nivada Grenchen"],
  o: ["Omega", "Oris", "Ochs und Junior"],
  p: ["Patek Philippe", "Parmigiani Fleurier", "Piaget", "Panerai"],
  q: ["Quartz Crisis 1969"],
  r: ["Rolex", "Richard Mille", "Ressence", "Roger Dubuis"],
  s: ["Seiko", "Sinn", "Speake-Marin", "Swatch"],
  t: ["Tudor", "TAG Heuer", "Tissot"],
  u: ["Urwerk", "Ulysse Nardin", "Unimatic"],
  v: ["Vacheron Constantin", "Voutilainen", "Van Cleef & Arpels"],
  w: ["Wempe Glashütte", "Waltham", "Wittnauer"],
  x: ["Xeric", "Xemex", "Xicorr"],
  y: ["Yema", "Yonger & Bresson", "Yes Watch"],
  z: ["Zenith", "Zelos", "Zodiac"],
};

export const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

// Brands that have cartoon watch illustrations in /public/watches/<id>.png
// (same asset pool as the destiny game — our own generated art, no trademark
// worries). When a brand fires, one of its watches flies out with the chip.
export const BRAND_IMAGES: Record<string, string[]> = {
  "Audemars Piguet": [
    "ap-ro-16202st",
    "ap-ro-26240st",
    "ap-ro-77450st",
    "ap-code-15210qt",
    "ap-code-15212nb",
  ],
  "A. Lange & Söhne": ["lange-1-moonphase", "lange-datograph", "lange-zeitwerk"],
  Akrivia: ["akrivia-cc2"],
  Breguet: ["breguet-3357ba", "breguet-tradition"],
  Cartier: ["cartier-tank-louis"],
  "Christopher Ward": ["cw-bel-canto"],
  Chronoswiss: ["chronoswiss-regulator"],
  Czapek: ["czapek-antarctique"],
  "Daniel Roth": ["daniel-roth-447"],
  "De Bethune": ["debethune-db28"],
  "F.P. Journe": ["fpjourne-bleu", "fpjourne-octa-lune"],
  "Grand Seiko": ["gs-snowflake"],
  "Greubel Forsey": ["greubel-balancier"],
  Grönefeld: ["gronefeld-1941"],
  "H. Moser & Cie": ["moser-endeavour-fume"],
  "IWC Schaffhausen": ["iwc-big-pilot"],
  "Jaeger-LeCoultre": ["jlc-reverso-tribute"],
  "Laurent Ferrier": ["laurent-ferrier-origin"],
  "MB&F": ["mbf-lm101"],
  Omega: ["omega-speedmaster"],
  Panerai: ["panerai-luminor"],
  "Patek Philippe": ["patek-calatrava-5226", "patek-nautilus-5711"],
  Rolex: ["rolex-sub-126610ln"],
  "Vacheron Constantin": ["vc-overseas-4500v", "vc-patrimony-platinum"],
  Voutilainen: ["voutilainen-vingt8"],
};

export const TOTAL_BRANDS = Object.values(LETTER_BRANDS).reduce(
  (n, brands) => n + brands.length,
  0,
);

// Chaos tiers for the Smash Report, keyed by total smash count. Thresholds
// are the minimum count for that tier (checked from the top down).
export interface ChaosTier {
  min: number;
  en: string;
  zh: string;
}

export const CHAOS_TIERS: ChaosTier[] = [
  { min: 1000, en: "Full Horological Chaos", zh: "錶壇癲狂" },
  { min: 400, en: "Grail Hunter", zh: "聖杯獵人" },
  { min: 150, en: "Serious Collector", zh: "資深藏家" },
  { min: 50, en: "Curious Collector", zh: "初心藏家" },
  { min: 0, en: "Window Shopper", zh: "櫥窗過客" },
];

export function chaosTier(count: number): ChaosTier {
  return CHAOS_TIERS.find((t) => count >= t.min) ?? CHAOS_TIERS[CHAOS_TIERS.length - 1];
}
