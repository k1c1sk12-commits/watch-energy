// The Hunt — watches Kenson is actively looking to buy (want-to-buy list).
// Shown on /hunt. This is a BUYER's list: nothing here is for sale, and the
// page must never show prices or price talk — the only call to action is a
// DM on Instagram.
//
// ⚠️ PLACEHOLDER ENTRIES — replace with Kenson's real hunt list before
// flipping FEATURES.hunt to true. Each `why` line is written first-person in
// Kenson's voice: one honest sentence on why this piece, no hype.

export interface HuntWatch {
  id: string;
  brand: string;
  model: string;
  reference?: string;
  detail: string; // case / dial / era — what exactly he's after
  why: string; // first-person, one sentence
}

export const HUNT_LIST: HuntWatch[] = [
  {
    id: "example-journe-cb",
    brand: "F.P. Journe",
    model: "Chronomètre Bleu",
    detail: "Tantalum case, chrome-blue dial — any honest example",
    why: "The quiet one on every list I make and unmake — time to stop making lists.",
  },
  {
    id: "example-daniel-roth-papillon",
    brand: "Daniel Roth",
    model: "Papillon",
    detail: "Yellow or white gold, double-ellipse case",
    why: "My skeleton chronograph deserves its strangest sibling.",
  },
  {
    id: "example-voutilainen-vingt8",
    brand: "Voutilainen",
    model: "Vingt-8",
    detail: "Any dial — the movement is the point",
    why: "One watch that would end arguments about what hand-finishing means.",
  },
];
