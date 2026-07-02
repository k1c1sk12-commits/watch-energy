// Feature flags for staged launches.
//
// Each flag gates a later game that already ships in the codebase but stays
// hidden until its launch moment. To go live: set the flag true, bump the home
// headline in copy.ts to match the new game count (UI.en/zh.homeHeadline),
// then commit + push.
//
//   bracket — Game 3 (Watch Bracket / 腕錶對決)
//   quiz    — Game 4 (Watch Knowledge Quiz / 腕錶知識測驗)
export const FEATURES = {
  // MOCKUP: both on to preview the 4-game launch (Game 3 + Game 4 ship together
  // next week). Home headline in copy.ts is set to "Four games" to match.
  bracket: true,
  quiz: true,
} as const;
