// Feature flags for staged launches.
//
// `bracket` gates the third game (Watch Bracket / 腕錶對決). It ships in the
// codebase but stays hidden until launch. To go live next week:
//   1. set `bracket: true` here
//   2. switch the home headline in copy.ts from "Two games" to "Three games"
//      (UI.en.homeHeadline / UI.zh.homeHeadline)
// then commit + push.
export const FEATURES = {
  bracket: false,
} as const;
