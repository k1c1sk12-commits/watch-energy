// Feature flags for staged launches.
//
// Each flag gates a later game that already ships in the codebase but stays
// hidden until its launch moment. To go live: set the flag true, bump the home
// headline in copy.ts to match the new game count (UI.en/zh.homeHeadline),
// then commit + push.
//
//   bracket — Game 3 (Watch Bracket / 腕錶對決) — LIVE 2026-07-02
//   quiz    — Game 4 (Watch Knowledge Quiz / 腕錶知識測驗) — LIVE 2026-07-02
//   hunt    — The Hunt (/hunt, want-to-buy list) — real list added 2026-07-03
//   smash   — Game 5 (Watch Smash / 腕錶亂打, /smash) — LIVE 2026-07-08
//   bone    — Game 6 (Bone Eater / 食骨模擬器, /bone) — LIVE 2026-07-17
export const FEATURES = {
  bracket: true,
  quiz: true,
  hunt: true,
  smash: true,
  bone: true,
} as const;
