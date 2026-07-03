// Feature flags for staged launches.
//
// Each flag gates a later game that already ships in the codebase but stays
// hidden until its launch moment. To go live: set the flag true, bump the home
// headline in copy.ts to match the new game count (UI.en/zh.homeHeadline),
// then commit + push.
//
//   bracket — Game 3 (Watch Bracket / 腕錶對決) — LIVE 2026-07-02
//   quiz    — Game 4 (Watch Knowledge Quiz / 腕錶知識測驗) — LIVE 2026-07-02
//   hunt    — The Hunt (/hunt, want-to-buy list) — hidden until Kenson's real
//             list replaces the placeholder entries in wishlist.ts
export const FEATURES = {
  bracket: true,
  quiz: true,
  hunt: false,
} as const;
