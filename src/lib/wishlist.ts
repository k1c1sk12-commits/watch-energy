// The Hunt — watches Kenson is actively looking to buy (want-to-buy list).
// Shown on /hunt. This is a BUYER's list: nothing here is for sale, and the
// page must never show prices or price talk — the only call to action is a
// DM on Instagram.
//
// Each `why` line is first-person in Kenson's voice: one honest sentence on
// why this piece, no hype.

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
    id: "pp-3940g",
    brand: "Patek Philippe",
    model: "Perpetual Calendar",
    reference: "3940G",
    detail: "White gold, second or third series",
    why: "The most classic perpetual calendar Patek ever made — the reference the whole genre still answers to.",
  },
  {
    id: "pp-5130p",
    brand: "Patek Philippe",
    model: "World Time",
    reference: "5130P",
    detail: "Platinum",
    why: "Hong Kong on the city disc — my own hour, named on a Patek dial.",
  },
  {
    id: "breguet-3337",
    brand: "Breguet",
    model: "Classique Day-Date Moonphase",
    reference: "3337",
    detail: "White gold",
    why: "Daniel Roth's hand at Breguet, before the world knew his name.",
  },
  {
    id: "breguet-3330",
    brand: "Breguet",
    model: "Classique",
    reference: "3330",
    detail: "White gold",
    why: "Same era, same DNA — the bridge between my Daniel Roth and the house that trained him.",
  },
];
