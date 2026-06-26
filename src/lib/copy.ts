// ---------------------------------------------------------------------------
// All human-facing copy lives here, in two languages. Watch BRANDS and MODEL
// references stay English in both (e.g. "Audemars Piguet", "16202ST"); every
// other string — including case material, dial colour, the evocative signature
// and the horological fact — is translated. The engine (engine.ts) stays
// language-neutral; these helpers render a Reading into the chosen language so
// the toggle updates everything live.
// ---------------------------------------------------------------------------
import { pick, type QuestionKey } from "./engine";
import type { Energy, Reading, StrapType, Vibe, Watch } from "./types";

export type Lang = "en" | "zh";
export const LANGS: Lang[] = ["en", "zh"];

// ===========================================================================
// 1. Static UI chrome
// ===========================================================================
export const UI: Record<Lang, {
  // Home (two games)
  homeHeadline: string;
  homeSub: string;
  game1Title: string;
  game1Blurb: string;
  game1Cta: string;
  game2Title: string;
  game2Blurb: string;
  game2Cta: string;
  disclaimer: string;
  // Input
  inputEyebrow: string;
  inputTitle: string;
  nameLabel: string;
  namePlaceholder: string;
  dobLabel: string;
  dobPlaceholder: string;
  dobAria: string;
  naturePrompt: string;
  natureSub: string;
  ctaReady: string;
  ctaNotReady: string;
  // Reading (loading)
  readingSteps: string[];
  // Result — recipe act
  recipeEyebrowOwn: (name: string) => string;
  recipeEyebrow: string;
  energySuffix: string; // "{name} energy" vs "{name}能量"
  sentenceEnd: string; // "." vs "。"
  recipeCalls: string;
  caseLabel: string;
  dialLabel: string;
  strapLabel: string;
  findingWatch: string;
  // Result — watch act
  destinyWatch: string;
  match: string;
  rarityStamp: (r: number) => string;
  refPrefix: string;
  ownPossessive: (name: string, model: string) => string; // "{name}'s {model}"
  whyOpen: string;
  whyClose: string;
  ctaOwned: string;
  ctaUnowned: string;
  seeOwnedPre: string;
  seeOwnedPost: string;
  seeUnownedPre: string;
  seeUnownedPost: string;
  igLatest: string;
  follow: string;
  shareCreating: string;
  shareSaved: string;
  shareShared: string;
  shareError: string;
  shareIdle: string;
  copied: string;
  copyCaption: string;
  enduring: string[]; // two lines
  revealAnother: string;
}> = {
  en: {
    homeHeadline: "Two games. One collection.",
    homeSub: "Pick how you want to play.",
    game1Title: "Your Destiny Watch",
    game1Blurb:
      "Your birth and your nature decide one haute-horlogerie watch written for you — case, dial, strap, and the energy it carries.",
    game1Cta: "Two taps · about 15 seconds",
    game2Title: "Watch Tier List",
    game2Blurb:
      "Rank all 35 watches in the collection into your own tiers — S down to Never — then share your taste.",
    game2Cta: "Build your tier list",
    disclaimer: "For fun. Not financial or astrological advice.",
    inputEyebrow: "Your destiny watch · the reading",
    inputTitle: "A few questions, then your watch.",
    nameLabel: "What should we call you?",
    namePlaceholder: "Your name (optional)",
    dobLabel: "When were you born?",
    dobPlaceholder: "Select your date",
    dobAria: "Birth date",
    naturePrompt: "What is your inner nature?",
    natureSub: "The one that's true no matter the day.",
    ctaReady: "Reveal my destiny watch",
    ctaNotReady: "Answer all to reveal",
    readingSteps: [
      "Reading your nature…",
      "Tracing the watch written for you…",
      "Your destiny watch is near…",
    ],
    recipeEyebrowOwn: (name) => `${name}'s destiny recipe`,
    recipeEyebrow: "Your destiny recipe",
    energySuffix: " energy",
    sentenceEnd: ".",
    recipeCalls: "It calls for a watch built like this.",
    caseLabel: "Case",
    dialLabel: "Dial",
    strapLabel: "Strap",
    findingWatch: "Finding the watch that wears it…",
    destinyWatch: "Your destiny watch",
    match: "match",
    rarityStamp: (r) => `TOP ${r}% RARITY`,
    refPrefix: "Ref. ",
    ownPossessive: (name, model) => `${name}'s ${model}`,
    whyOpen: "Why this watch?",
    whyClose: "Hide the detail",
    ctaOwned: "This watch is real — it's part of the actual collection.",
    ctaUnowned: "One of the pieces a real collector would chase.",
    seeOwnedPre: "See it (and 9 others) on ",
    seeOwnedPost: ".",
    seeUnownedPre: "See the collection on ",
    seeUnownedPost: ".",
    igLatest: "Latest from @gptwatchcollector",
    follow: "Follow @gptwatchcollector",
    shareCreating: "Creating…",
    shareSaved: "Saved ✓",
    shareShared: "Shared ✓",
    shareError: "Try again",
    shareIdle: "Save my card",
    copied: "Copied ✓",
    copyCaption: "Copy caption",
    enduring: ["Not for today — for who you are.", "One nature. One watch. Yours."],
    revealAnother: "Reveal another person's →",
  },
  zh: {
    homeHeadline: "兩個遊戲。一個收藏。",
    homeSub: "選一種你想玩的方式。",
    game1Title: "你的命定之錶",
    game1Blurb:
      "由你的出生與本質，配對一枚為你而寫的高級腕錶 —— 錶殼、錶面、錶帶，以及它所承載的能量。",
    game1Cta: "兩個動作 · 約 15 秒",
    game2Title: "腕錶 tier list",
    game2Blurb:
      "將收藏中的 35 枚腕錶排進你自己的 tier —— 由 S 到絕不 —— 再分享你的品味。",
    game2Cta: "打造你的 tier list",
    disclaimer: "純屬娛樂，並非投資或占星建議。",
    inputEyebrow: "你的命定之錶 · 解讀",
    inputTitle: "回答幾個問題，便揭曉你的腕錶。",
    nameLabel: "我們該怎麼稱呼你？",
    namePlaceholder: "你的名字（可不填）",
    dobLabel: "你的出生日期？",
    dobPlaceholder: "選擇日期",
    dobAria: "出生日期",
    naturePrompt: "你內在的本質是？",
    natureSub: "無論哪一天，都不變的那一個。",
    ctaReady: "揭曉我的命定之錶",
    ctaNotReady: "全部回答後即可揭曉",
    readingSteps: [
      "正在解讀你的本質…",
      "正在描繪為你而寫的腕錶…",
      "你的命定之錶即將揭曉…",
    ],
    recipeEyebrowOwn: (name) => `${name}的命定配方`,
    recipeEyebrow: "你的命定配方",
    energySuffix: "能量",
    sentenceEnd: "。",
    recipeCalls: "它呼喚一枚這樣構成的腕錶。",
    caseLabel: "錶殼",
    dialLabel: "錶面",
    strapLabel: "錶帶",
    findingWatch: "正在尋找承載它的那枚腕錶…",
    destinyWatch: "你的命定之錶",
    match: "匹配",
    rarityStamp: (r) => `稀有度 前 ${r}%`,
    refPrefix: "型號 ",
    ownPossessive: (name, model) => `${name}的 ${model}`,
    whyOpen: "為何是這枚錶？",
    whyClose: "收起細節",
    ctaOwned: "這枚錶是真實存在的 —— 它是這個收藏的一部分。",
    ctaUnowned: "一枚真正藏家會追逐的腕錶。",
    seeOwnedPre: "在 ",
    seeOwnedPost: " 看它（及另外 9 枚）。",
    seeUnownedPre: "在 ",
    seeUnownedPost: " 看這個收藏。",
    igLatest: "@gptwatchcollector 的最新動態",
    follow: "追蹤 @gptwatchcollector",
    shareCreating: "製作中…",
    shareSaved: "已儲存 ✓",
    shareShared: "已分享 ✓",
    shareError: "再試一次",
    shareIdle: "儲存我的卡片",
    copied: "已複製 ✓",
    copyCaption: "複製文案",
    enduring: ["不是為了今天 —— 而是為了你是誰。", "一種本質。一枚腕錶。屬於你。"],
    revealAnother: "為另一個人揭曉 →",
  },
};

// ===========================================================================
// 2. Energy + vibe names
// ===========================================================================
const ENERGY_COPY: Record<Lang, Record<Energy, { name: string; tagline: string }>> = {
  en: {
    VERDANT: { name: "Verdant", tagline: "Growth, momentum, fresh ambition." },
    EMBER: { name: "Ember", tagline: "Passion, presence, magnetic warmth." },
    TERRA: { name: "Terra", tagline: "Stability, trust, grounded calm." },
    LUMEN: { name: "Lumen", tagline: "Clarity, precision, sharp focus." },
    TIDE: { name: "Tide", tagline: "Depth, intuition, fluid calm." },
  },
  zh: {
    VERDANT: { name: "蒼木", tagline: "生長、衝勁、嶄新的野心。" },
    EMBER: { name: "熾焰", tagline: "熱情、存在感、磁性的溫度。" },
    TERRA: { name: "厚土", tagline: "穩定、信任、沉穩的平靜。" },
    LUMEN: { name: "皓光", tagline: "清晰、精準、銳利的專注。" },
    TIDE: { name: "深潮", tagline: "深邃、直覺、流動的平靜。" },
  },
};

export function energyName(e: Energy, lang: Lang): string {
  return ENERGY_COPY[lang][e].name;
}
export function energyTagline(e: Energy, lang: Lang): string {
  return ENERGY_COPY[lang][e].tagline;
}

const VIBE_COPY: Record<Lang, Record<Vibe, { label: string; hint: string }>> = {
  en: {
    CALM: { label: "The Deep", hint: "calm surface, vast underneath" },
    BOLD: { label: "The Flame", hint: "passion, presence, felt at once" },
    FOCUSED: { label: "The Clear", hint: "sharp, lucid, you see what others miss" },
    MAGNETIC: { label: "The Striver", hint: "always growing, reaching for next" },
    GROUNDED: { label: "The Anchor", hint: "steady, grounded, unshakable" },
  },
  zh: {
    CALM: { label: "深海", hint: "表面平靜，底下浩瀚" },
    BOLD: { label: "烈焰", hint: "熱情與存在感，瞬間可感" },
    FOCUSED: { label: "澄明", hint: "銳利通透，看見別人看不到的" },
    MAGNETIC: { label: "進取者", hint: "不斷生長，向著下一步" },
    GROUNDED: { label: "定錨", hint: "穩定、踏實、不可動搖" },
  },
};

export function vibeLabel(v: Vibe, lang: Lang): string {
  return VIBE_COPY[lang][v].label;
}
export function vibeHint(v: Vibe, lang: Lang): string {
  return VIBE_COPY[lang][v].hint;
}

// ===========================================================================
// 3. Quiz copy (prompts + per-option label/hint, keyed by option id)
// ===========================================================================
export const Q_PROMPTS: Record<Lang, Record<QuestionKey, string>> = {
  en: {
    metal: "Pick the metal your soul answers to",
    mind: "Where does your mind drift?",
    feel: "Your watch should feel…",
    misread: "What do people misread in you?",
  },
  zh: {
    metal: "選一種你靈魂會回應的金屬",
    mind: "你的思緒會飄向何處？",
    feel: "你的腕錶應該帶來怎樣的感覺…",
    misread: "人們最常誤讀你哪一點？",
  },
};

// Keyed by the (globally unique) option ids defined in engine.QUESTIONS.
export const Q_OPTIONS: Record<Lang, Record<string, { label: string; hint: string }>> = {
  en: {
    steel: { label: "Cool steel", hint: "honest, unshakable" },
    gold: { label: "Warm gold", hint: "born to be seen" },
    titanium: { label: "Light titanium", hint: "modern, unbound" },
    rosegold: { label: "Rose gold", hint: "quiet fire" },
    ocean: { label: "The deep ocean", hint: "blue, fathomless" },
    valley: { label: "A wild green valley", hint: "alive, growing" },
    embers: { label: "Embers in the dark", hint: "warm, glowing" },
    snow: { label: "First snow at dawn", hint: "clean, bright" },
    engineered: { label: "Seamless & engineered", hint: "integrated metal" },
    classic: { label: "Classic & warm", hint: "fine leather" },
    deep: { label: "Quiet & deep", hint: "dark, understated" },
    ready: { label: "Ready for anything", hint: "sporty, free" },
    quiet: { label: "“I'm quieter than my mind”", hint: "" },
    soft: { label: "“I'm softer than I look”", hint: "" },
    cold: { label: "“All focus, but I feel a lot”", hint: "" },
    restless: { label: "“Restless, but I see far”", hint: "" },
  },
  zh: {
    steel: { label: "冷冽精鋼", hint: "誠實、不可動搖" },
    gold: { label: "溫潤黃金", hint: "天生被注視" },
    titanium: { label: "輕盈鈦金屬", hint: "現代、不受束縛" },
    rosegold: { label: "玫瑰金", hint: "靜默的火" },
    ocean: { label: "深海", hint: "湛藍、深不可測" },
    valley: { label: "野綠山谷", hint: "鮮活、生長" },
    embers: { label: "暗夜餘燼", hint: "溫暖、微光" },
    snow: { label: "破曉初雪", hint: "純淨、明亮" },
    engineered: { label: "渾然一體、工程感", hint: "一體式金屬" },
    classic: { label: "經典、溫潤", hint: "上等皮革" },
    deep: { label: "靜謐、深邃", hint: "深色、內斂" },
    ready: { label: "隨時就緒", hint: "運動、自由" },
    quiet: { label: "「我比我的思緒更安靜」", hint: "" },
    soft: { label: "「我比看上去更柔軟」", hint: "" },
    cold: { label: "「看似只有專注，其實感受很多」", hint: "" },
    restless: { label: "「看似躁動，其實看得很遠」", hint: "" },
  },
};

// ===========================================================================
// 4. Strap / material / dial labels
// ===========================================================================
const STRAP_COPY: Record<Lang, Record<StrapType, string>> = {
  en: {
    integratedSteelBracelet: "Integrated bracelet",
    steelBracelet: "Steel bracelet",
    brownLeather: "Brown leather",
    blackLeather: "Black leather",
    blueLeather: "Blue leather",
    whiteLeather: "White leather",
    greyLeather: "Grey leather",
    greenTextile: "Green textile",
    blueRubber: "Blue rubber",
    blackRubber: "Black rubber",
    blueTextile: "Blue textile",
  },
  zh: {
    integratedSteelBracelet: "一體式鋼鏈帶",
    steelBracelet: "精鋼鏈帶",
    brownLeather: "啡色皮帶",
    blackLeather: "黑色皮帶",
    blueLeather: "藍色皮帶",
    whiteLeather: "白色皮帶",
    greyLeather: "灰色皮帶",
    greenTextile: "綠色織物帶",
    blueRubber: "藍色橡膠帶",
    blackRubber: "黑色橡膠帶",
    blueTextile: "藍色織物帶",
  },
};

export function strapText(s: StrapType, lang: Lang): string {
  return STRAP_COPY[lang][s];
}

// Case materials (keyed by the exact English string in watches.ts).
const MATERIAL_ZH: Record<string, string> = {
  "Stainless steel": "精鋼",
  "Steel & black ceramic": "精鋼配黑陶瓷",
  "White gold": "白金",
  "Rose gold": "玫瑰金",
  "Red gold": "紅金",
  "Yellow gold": "黃金",
  Titanium: "鈦金屬",
  Oystersteel: "蠔式鋼",
  Platinum: "鉑金",
  Tantalum: "鉭金屬",
};

// Dial colours (keyed by the exact English string in watches.ts).
const DIAL_ZH: Record<string, string> = {
  Blue: "藍色",
  Green: "綠色",
  White: "白色",
  "Smoked grey": "煙燻灰",
  "Blue aventurine": "藍色砂金石",
  "Silver (argenté)": "銀色",
  "Skeleton salmon": "鏤空三文魚粉",
  Salmon: "三文魚粉",
  "Silver (guilloché)": "銀色機刻雕花",
  Black: "黑色",
  Silver: "銀色",
  "Blue (sunray)": "藍色旭日紋",
  "White (textured)": "白色雪花紋理",
  "Deep blue": "深藍色",
  "Silver guilloché": "銀色機刻雕花",
  "Blue fumé": "藍色煙燻漸層",
  "Green opaline": "綠色蛋白光",
  "Blued mirror-polished": "藍鋼鏡面拋光",
  "Ice blue": "冰藍色",
  "Hand-guilloché silver": "手工機刻銀色",
  "Black grand feu enamel": "黑色大明火琺瑯",
  "Off-centred silver": "偏心銀色",
  "Charcoal grey": "炭灰色",
  "Silver-grey": "銀灰色",
};

const stripParen = (s: string) => s.replace(/\s*\([^)]*\)/g, "").trim();

// `full` keeps the English parenthetical descriptor (used in the spec row);
// the recipe uses the clean form. Chinese has no parentheticals either way.
export function materialText(m: string, lang: Lang, full = false): string {
  if (lang === "zh") return MATERIAL_ZH[m] ?? m;
  return full ? m : stripParen(m);
}
export function dialText(d: string, lang: Lang, full = false): string {
  if (lang === "zh") return DIAL_ZH[d] ?? d;
  return full ? d : stripParen(d);
}

// ===========================================================================
// 5. Per-watch evocative copy (signature) + horological fact, in Chinese.
//    English originals stay on the Watch object (watches.ts).
// ===========================================================================
const SIGNATURE_ZH: Record<string, string> = {
  "ap-ro-16202st": "銳利而從容的自信，無需再證明甚麼。",
  "ap-ro-26240st": "把躁動的衝勁，收束成乾淨而從容的運轉。",
  "ap-ro-77450st": "靜謐的沉著，讓設計本身說話。",
  "ap-code-15210qt": "現代的雙重性 —— 工業的硬朗，包裹著一份溫度。",
  "ap-code-15212nb": "宇宙般的耐性，以一顆游動的星辰讀時。",
  "lange-1-moonphase": "溫潤的精準；在發光的夜空下，是舊世界的秩序。",
  "daniel-roth-447": "巴洛克的張力被赤裸呈現 —— 機械化作裝飾佩戴。",
  "chronoswiss-regulator": "克制的分離 —— 每根指針，各有自己的舞台。",
  "cw-bel-canto": "不造作的靈魂，帶著一聲輕柔的喜悅鳴響。",
  "breguet-3357ba": "貴族般的靜止，環繞著一顆緩慢的機械之心。",
  "rolex-sub-126610ln": "不可動搖、全天候的堅定。",
  "patek-nautilus-5711": "不費力的尊貴，從不提高聲線。",
  "omega-speedmaster": "任務至上的堅毅，為極限而生。",
  "cartier-tank-louis": "精煉的智性 —— 把優雅化約到本質。",
  "vc-overseas-4500v": "見過世面的從容，在哪裡都自在。",
  "jlc-reverso-tribute": "兩面的沉著 —— 翻轉之間，內斂化為展露。",
  "gs-snowflake": "寧靜的澄澈，如晨光初照的新雪。",
  "panerai-luminor": "沉穩的份量 —— 未看清，已先感受到它的存在。",
  "vc-patrimony-platinum": "低調的重量 —— 最稀有的金屬，安靜地佩戴。",
  "lange-zeitwerk": "機械的耐性 —— 先一躍，再靜候。",
  "iwc-big-pilot": "沉穩的掌控 —— 清晰易讀，本身就是一種平靜。",
  "fpjourne-bleu": "一抹邪典般的藍，靜靜地凌駕一半所謂的神錶。",
  "fpjourne-octa-lune": "建築感與月光，以工程師的冷靜取得平衡。",
  "moser-endeavour-fume": "無字可讀，只餘感受 —— 一塊只剩純粹色調的錶面。",
  "laurent-ferrier-origin": "大師的克制 —— 在腕上安靜，在藏家之間響亮。",
  "debethune-db28": "面向未來的製錶，卻仍像是手工雕琢出來。",
  "czapek-antarctique": "獨立製錶對一體式鏈帶主流的一個回答。",
  "mbf-lm101": "腕上的動態藝術 —— 擺輪如行星般懸浮。",
  "voutilainen-vingt8": "整個業界私下用來衡量自己的手工修飾標桿。",
  "gronefeld-1941": "低調的荷蘭頂尖工藝，機芯令藏家著迷。",
  "akrivia-cc2": "當下最受追捧的年輕獨立製錶，幾乎出自一雙手。",
  "lange-datograph": "行家爭論誰是最佳計時碼錶時，總會搬出的那一枚。",
  "breguet-tradition": "機芯結構被坦然攤開，直承寶璣本人的手筆。",
  "patek-calatrava-5226": "低調的百達翡麗 —— 正裝錶的沉著，毫無炒作氣味。",
  "greubel-balancier": "極致手工被完整呈現 —— 這就是腕錶何以如此昂貴的理由。",
};

const FACT_ZH: Record<string, string> = {
  "ap-ro-16202st": "16202 於 2022 年接替 15202，搭載全新自製 7121 機芯。",
  "ap-ro-26240st": "41 毫米的 26240 計時碼錶於 2021 年改良了一體式鏈帶的銜接。",
  "ap-ro-77450st": "34 毫米的 77450 屬於 AP 更中性、更現代的系列。",
  "ap-code-15210qt": "其雙曲面藍寶石鏡面兩面皆呈弧形，修正側視變形。",
  "ap-code-15212nb": "其游時顯示復刻 17 世紀的古老複雜功能，AP 於 1990 年代重新演繹。",
  "lange-1-moonphase": "其軌道式月相，要 122.6 年才偏差一天。",
  "daniel-roth-447": "Roth 的雙橢圓錶殼，是製錶界最易辨認的非圓形之一。",
  "chronoswiss-regulator": "Chronoswiss 於 1980 年代末，把規範式佈局帶進腕錶。",
  "cw-bel-canto": "Bel Canto 把過路報時的鳴響複雜功能，帶到 5,000 英鎊以內。",
  "breguet-3357ba": "寶璣於 1801 年為陀飛輪註冊專利；此機刻雕花錶面由手工鐫刻。",
  "rolex-sub-126610ln": "其 Cerachrom 字圈幾乎防刮，並抗紫外線褪色。",
  "patek-nautilus-5711": "Gérald Genta 於 1976 年設計 Nautilus；精鋼 5711 已於 2021 年停產。",
  "omega-speedmaster": "NASA 於 1965 年認證 Speedmaster 通過所有載人任務。",
  "cartier-tank-louis": "Tank 的設計靈感源自一戰雷諾坦克，時為 1917 年。",
  "vc-overseas-4500v": "江詩丹頓創立於 1755 年，是持續營運至今最古老的製錶廠。",
  "jlc-reverso-tribute": "Reverso 的翻轉錶殼誕生於 1931 年，用以保護馬球員的錶鏡。",
  "gs-snowflake": "其 Spring Drive 機芯的秒針滑行無聲，沒有一絲跳動。",
  "panerai-luminor": "其護冠橋式裝置，源自沛納海 20 世紀中期的潛水儀錶。",
  "vc-patrimony-platinum": "鉑金密度比 18K 金高約六成，份量感截然不同。",
  "lange-zeitwerk": "Zeitwerk 的數字跳字顯示，由恆定動力擒縱驅動。",
  "iwc-big-pilot": "其七天動力機芯，可追溯至 1940 年代的大型 B-Uhr 領航錶。",
  "fpjourne-bleu": "Chronomètre Bleu 獨特地以鉭金屬製殼 —— 一種罕見的藍灰色金屬。",
  "fpjourne-octa-lune": "其自製 Octa 自動機芯，具備 120 小時動力儲備。",
  "moser-endeavour-fume": "Moser 的 Concept 錶面沒有標誌、沒有刻度 —— 只有 fumé 漸層。",
  "laurent-ferrier-origin": "Laurent Ferrier 曾在百達翡麗任製錶師數十年，2010 年才創立自己的品牌。",
  "debethune-db28": "De Bethune 標誌性的浮動錶耳，讓錶殼幾乎能貼合任何手腕。",
  "czapek-antarctique": "Czapek 復興了一個自 19 世紀 Patek–Czapek 合夥後沉寂的名字。",
  "mbf-lm101": "其超大擺輪懸於錶面之上，罩在高拱的藍寶石之下。",
  "voutilainen-vingt8": "Kari Voutilainen 親手機刻並修飾錶面與機芯，年產極少。",
  "gronefeld-1941": "Grönefeld 兄弟是來自荷蘭 Oldenzaal 的第三代製錶師。",
  "akrivia-cc2": "Rexhep Rexhepi 在日內瓦，幾乎全手工修飾每一枚 Chronomètre Contemporain。",
  "lange-datograph": "其飛返計時機芯，配以手工雕刻的擺輪夾板。",
  "breguet-tradition": "Tradition 把機芯對稱地鋪陳在錶面一側，呼應寶璣 1796 年的訂購錶。",
  "patek-calatrava-5226": "5226G 以鏨刻釘紋中心，配上帶顆粒質感的復古風外圈錶面。",
  "greubel-balancier": "Greubel Forsey 對每一個零件 —— 即使看不見的 —— 都施以近乎偏執的手工修飾。",
};

export function signatureText(w: Watch, lang: Lang): string {
  return lang === "zh" ? SIGNATURE_ZH[w.id] ?? w.signature : w.signature;
}
export function factText(w: Watch, lang: Lang): string {
  return lang === "zh" ? FACT_ZH[w.id] ?? w.fact : w.fact;
}

// ===========================================================================
// 6. The "recipe" — the destiny watch's own configuration, shown before its
//    name. Derived from the watch + language (no aspiration gap).
// ===========================================================================
export interface RecipeText {
  caseText: string;
  dialText: string;
  strapText: string;
}
export function recipeText(w: Watch, lang: Lang): RecipeText {
  return {
    caseText: materialText(w.caseMaterial, lang),
    dialText: dialText(w.dialColor, lang),
    strapText: strapText(w.strapType, lang),
  };
}

// ===========================================================================
// 7. The personal "people misread…" line
// ===========================================================================
const MISREAD_LINE: Record<Lang, Record<Energy, string>> = {
  en: {
    TIDE: "People read your calm as distance — really, it's depth.",
    EMBER: "People mistake your warmth for show — it's the real thing.",
    LUMEN: "People take your focus for coldness — it's just clarity.",
    VERDANT: "People misread your drive as restlessness — it's vision.",
    TERRA: "People see your steadiness as simple — it's quiet strength.",
  },
  zh: {
    TIDE: "人們把你的平靜讀成疏離 —— 其實那是深度。",
    EMBER: "人們誤把你的溫度當成表演 —— 它是真的。",
    LUMEN: "人們把你的專注當成冷漠 —— 那只是清醒。",
    VERDANT: "人們誤讀你的衝勁為躁動 —— 那是遠見。",
    TERRA: "人們看你的穩定以為簡單 —— 那是安靜的力量。",
  },
};
export function personalLineText(reading: Reading, lang: Lang): string {
  return MISREAD_LINE[lang][reading.misread];
}

// ===========================================================================
// 8. Traits (three keywords)
// ===========================================================================
const ENERGY_ADJ: Record<Lang, Record<Energy, string[]>> = {
  en: {
    VERDANT: ["rising", "expansive", "forward-leaning", "fresh"],
    EMBER: ["radiant", "magnetic", "spirited", "bold"],
    TERRA: ["grounded", "steady", "assured", "enduring"],
    LUMEN: ["precise", "lucid", "sharp", "composed"],
    TIDE: ["deep", "fluid", "intuitive", "serene"],
  },
  zh: {
    VERDANT: ["昂揚", "開闊", "前傾", "清新"],
    EMBER: ["熾烈", "磁性", "奔放", "大膽"],
    TERRA: ["沉穩", "踏實", "篤定", "恆久"],
    LUMEN: ["精準", "澄澈", "銳利", "從容"],
    TIDE: ["深邃", "流動", "直覺", "寧靜"],
  },
};

const VIBE_KEYWORD: Record<Lang, Record<Vibe, string>> = {
  en: { CALM: "serene", BOLD: "expressive", FOCUSED: "precise", MAGNETIC: "magnetic", GROUNDED: "grounded" },
  zh: { CALM: "寧靜", BOLD: "張揚", FOCUSED: "精準", MAGNETIC: "磁性", GROUNDED: "沉穩" },
};

export function traitList(reading: Reading, lang: Lang): string[] {
  const w = reading.watch;
  const s = reading.seed + "|t|" + w.id;
  const a = pick(ENERGY_ADJ[lang][reading.baseEnergy], s, "t1");
  const b = pick(ENERGY_ADJ[lang][w.dialEnergy], s, "t2");
  const c = VIBE_KEYWORD[lang][reading.vibe];
  if (lang === "zh") return [a, b, c];
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  return [cap(a), cap(b), cap(c)];
}

// ===========================================================================
// 9. The reasoning sentence (generated, deterministic, per-language)
// ===========================================================================
// ----- English word banks -----
const EN_VERB_OPEN = ["leans", "gravitates", "draws", "points"];
const EN_CASE_VERB = ["channels", "carries", "anchors", "holds"];
const EN_DIAL_VERB = ["amplifies", "reflects", "echoes", "releases"];
const EN_DIAL_NOUN = ["light", "tone", "character", "undertone"];
const EN_CLOSE_VERB = ["balances", "grounds", "amplifies", "sharpens", "channels"];
const EN_CLOSE_NOUN: Record<Vibe, string[]> = {
  CALM: ["quiet confidence", "a settled mind", "effortless poise"],
  BOLD: ["your presence", "a confident statement", "standout energy"],
  FOCUSED: ["clear intent", "sharp focus", "decisive clarity"],
  MAGNETIC: ["a natural pull", "magnetic ease", "rising charisma"],
  GROUNDED: ["a steady centre", "quiet assurance", "rooted calm"],
};
const EN_MATERIAL_PHRASE: Record<string, string> = {
  "stainless steel": "cool steel case",
  oystersteel: "cool steel case",
  "white gold": "bright white-gold case",
  "rose gold": "warm rose-gold case",
  "red gold": "warm red-gold case",
  "yellow gold": "rich yellow-gold case",
  titanium: "light titanium case",
  platinum: "dense platinum case",
  tantalum: "rare tantalum case",
  "black ceramic": "deep ceramic case",
  "steel & black ceramic": "steel-and-ceramic case",
};
const enMaterialPhrase = (m: string) => EN_MATERIAL_PHRASE[m.toLowerCase()] ?? `${m.toLowerCase()} case`;
const enArticle = (w: string) => (/^[aeiou]/i.test(w) ? "an" : "a");

// ----- Chinese word banks -----
const ZH_VERB_OPEN = ["傾向了", "牽引你走向", "悄悄靠向", "最終指向"];
const ZH_CASE_VERB = ["承載著", "凝聚著", "錨定著", "托起了"];
const ZH_DIAL_VERB = ["放大了", "映照出", "回應著", "釋放出"];
const ZH_DIAL_NOUN = ["光澤", "色調", "性格", "底蘊"];
const ZH_CLOSE_VERB = ["平衡了", "沉澱出", "放大了", "銳化了", "凝聚出"];
const ZH_CLOSE_NOUN: Record<Vibe, string[]> = {
  CALM: ["從容的自信", "安定的心", "不費力的優雅"],
  BOLD: ["你的存在感", "自信的宣言", "奪目的能量"],
  FOCUSED: ["清晰的意圖", "銳利的專注", "果斷的清明"],
  MAGNETIC: ["天生的吸引力", "磁性的自在", "上升的魅力"],
  GROUNDED: ["穩定的重心", "沉靜的篤定", "紮根的平靜"],
};
const ZH_MATERIAL_PHRASE: Record<string, string> = {
  "stainless steel": "冷冽的精鋼錶殼",
  oystersteel: "冷冽的蠔式鋼錶殼",
  "white gold": "明亮的白金錶殼",
  "rose gold": "溫潤的玫瑰金錶殼",
  "red gold": "溫潤的紅金錶殼",
  "yellow gold": "醇厚的黃金錶殼",
  titanium: "輕盈的鈦金屬錶殼",
  platinum: "厚重的鉑金錶殼",
  tantalum: "罕見的鉭金屬錶殼",
  "black ceramic": "深邃的陶瓷錶殼",
  "steel & black ceramic": "鋼配陶瓷錶殼",
};
const zhMaterialPhrase = (m: string) => ZH_MATERIAL_PHRASE[m.toLowerCase()] ?? `${materialText(m, "zh")}錶殼`;

export function reasonText(reading: Reading, lang: Lang): string {
  const w = reading.watch;
  const base = reading.baseEnergy;
  const vibe = reading.vibe;
  const s = reading.seed + "|" + vibe + "|" + w.id;

  if (lang === "zh") {
    const baseAdj = pick(ENERGY_ADJ.zh[base], s, "ba");
    const caseAdj = pick(ENERGY_ADJ.zh[w.caseEnergy], s, "ca");
    const dialAdj = pick(ENERGY_ADJ.zh[w.dialEnergy], s, "da");
    const dial = dialText(w.dialColor, "zh");
    const s1 = `你${baseAdj}的能量，${pick(ZH_VERB_OPEN, s, "vo")} ${w.brand} ${w.model}。`;
    const s2 = `${zhMaterialPhrase(w.caseMaterial)}${pick(ZH_CASE_VERB, s, "cv")}${caseAdj}的能量，而${dial}錶面則${pick(
      ZH_DIAL_VERB,
      s,
      "dv",
    )}一抹${dialAdj}的${pick(ZH_DIAL_NOUN, s, "dn")}。`;
    const s3 = `對${vibeLabel(vibe, "zh")}而言，這枚腕錶${pick(ZH_CLOSE_VERB, s, "cl")}${pick(
      ZH_CLOSE_NOUN[vibe],
      s,
      "cn",
    )}。`;
    return `${s1}${s2}${s3}`;
  }

  const dialClean = stripParen(w.dialColor).toLowerCase();
  const dial = `${dialClean} dial`;
  const dialAdj = pick(ENERGY_ADJ.en[w.dialEnergy], s, "da");
  const s1 = `Your ${pick(ENERGY_ADJ.en[base], s, "ba")} energy ${pick(EN_VERB_OPEN, s, "vo")} toward the ${w.brand} ${w.model}.`;
  const s2 = `Its ${enMaterialPhrase(w.caseMaterial)} ${pick(EN_CASE_VERB, s, "cv")} ${pick(
    ENERGY_ADJ.en[w.caseEnergy],
    s,
    "ca",
  )} energy, while the ${dial} ${pick(EN_DIAL_VERB, s, "dv")} ${enArticle(dialAdj)} ${dialAdj} ${pick(
    EN_DIAL_NOUN,
    s,
    "dn",
  )}.`;
  const s3 = `For ${vibeLabel(vibe, "en")}, this piece ${pick(EN_CLOSE_VERB, s, "cl")} ${pick(
    EN_CLOSE_NOUN[vibe],
    s,
    "cn",
  )}.`;
  return `${s1} ${s2} ${s3}`;
}

// ===========================================================================
// 10. Share caption
// ===========================================================================
export function captionFor(reading: Reading, lang: Lang): string {
  const { watch, matchPercent, rarity } = reading;
  const handle = "@gptwatchcollector";
  if (lang === "zh") {
    return `我的命定之錶：${watch.brand} ${watch.model} —— ${matchPercent}% 匹配，稀有度前 ${rarity}%。來認識你的 👉 ${handle}`;
  }
  return `My destiny watch: ${watch.brand} ${watch.model} — ${matchPercent}% match, top ${rarity}%. Meet yours 👉 ${handle}`;
}

// ===========================================================================
// 11. Tier list — the visitor ranks the 35-watch pool into their own tiers
// ===========================================================================
export type Tier = "S" | "A" | "B" | "NOPE" | "NEVER";
export const TIERS: Tier[] = ["S", "A", "B", "NOPE", "NEVER"];

// Label per language + the accent colour used for the row tab and share card.
export const TIER_META: Record<Tier, { label: Record<Lang, string>; color: string }> = {
  S: { label: { en: "S", zh: "S" }, color: "#c9a86a" }, // gold — grail tier
  A: { label: { en: "A", zh: "A" }, color: "#c98a4a" }, // warm copper
  B: { label: { en: "B", zh: "B" }, color: "#8a9a6a" }, // sage
  NOPE: { label: { en: "Nope", zh: "不要" }, color: "#8a8276" }, // muted grey
  NEVER: { label: { en: "Never", zh: "絕不" }, color: "#7a4a4a" }, // dusty maroon
};

export function tierLabel(tier: Tier, lang: Lang): string {
  return TIER_META[tier].label[lang];
}

export const TIER_UI: Record<Lang, {
  title: string;
  subtitle: string;
  instruction: string;
  selectHint: string;
  cancel: string;
  remove: string;
  unranked: string;
  progress: (n: number, total: number) => string;
  allRanked: string;
  emptyTray: string;
  back: string;
  reset: string;
  shareIdle: string;
  shareCreating: string;
  shareSaved: string;
  shareShared: string;
  shareError: string;
  copyCaption: string;
  copied: string;
  needMore: string;
  cardTitle: string;
}> = {
  en: {
    title: "Your watch tier list",
    subtitle: "The 35 in the collection. Where do they land for you?",
    instruction: "Tap a watch to size it up, then drop it in a tier.",
    selectHint: "Pick its tier below ↓",
    cancel: "Cancel",
    remove: "Unrank",
    unranked: "Unranked",
    progress: (n, total) => `${n}/${total} ranked`,
    allRanked: "All ranked. Now make it official.",
    emptyTray: "Nothing left to rank.",
    back: "← Back",
    reset: "Reset",
    shareIdle: "Save my tier list",
    shareCreating: "Creating…",
    shareSaved: "Saved ✓",
    shareShared: "Shared ✓",
    shareError: "Try again",
    copyCaption: "Copy caption",
    copied: "Copied ✓",
    needMore: "Rank a few watches first.",
    cardTitle: "MY WATCH TIER LIST",
  },
  zh: {
    title: "你的腕錶 tier list",
    subtitle: "收藏中的 35 枚。在你心目中，它們各自落在哪一檔？",
    instruction: "點選一枚腕錶看清楚，再放進某個 tier。",
    selectHint: "在下方選一個 tier ↓",
    cancel: "取消",
    remove: "移除",
    unranked: "未排",
    progress: (n, total) => `已排 ${n}/${total}`,
    allRanked: "全部排好了。是時候公開你的品味。",
    emptyTray: "沒有剩下未排的了。",
    back: "← 返回",
    reset: "重排",
    shareIdle: "儲存我的 tier list",
    shareCreating: "製作中…",
    shareSaved: "已儲存 ✓",
    shareShared: "已分享 ✓",
    shareError: "再試一次",
    copyCaption: "複製文案",
    copied: "已複製 ✓",
    needMore: "請先排幾枚腕錶。",
    cardTitle: "我的腕錶 TIER LIST",
  },
};

export function tierCaption(lang: Lang): string {
  const handle = "@gptwatchcollector";
  return lang === "zh"
    ? `我的腕錶 tier list —— 你又會怎麼排？👉 ${handle}`
    : `My watch tier list — how would you rank them? 👉 ${handle}`;
}
