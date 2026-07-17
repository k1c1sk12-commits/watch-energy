// Bone Eater (食骨模擬器) — game data + bilingual strings.
// Parody brands only; prices are fictional HK$ amounts.

import type { Lang } from "./copy";

export interface BoneWatch {
  id: string;
  brand: "RLX" | "AP" | "PP";
  name: string; // shared EN display name
  nameZh?: string; // zh override where it differs
  tier: "grail" | "hot" | "entry" | "bone";
  retail: number;
  start: number;
  drift: number;
  vol: number;
  req: number;
  dial: string; // list-dot colour
}

export const BONE_BRANDS: Record<string, string> = {
  RLX: "Rolodex",
  AP: "Apple Piguet",
  PP: "Pasta Phillpe",
};
export const BONE_MONO: Record<string, string> = { RLX: "RX", AP: "AP", PP: "PP" };

export const BONE_WATCHES: BoneWatch[] = [
  // Rolodex — Level 1
  { id: "submarine", brand: "RLX", name: "Submarine 126610", tier: "hot", retail: 80000, start: 150000, drift: 0.006, vol: 0.028, req: 90000, dial: "#10131a" },
  { id: "tutor", brand: "RLX", name: "Tutor BB58", tier: "entry", retail: 30000, start: 33000, drift: 0.003, vol: 0.02, req: 0, dial: "#1a1d24" },
  { id: "celery", brand: "RLX", name: "Celery", nameZh: "Celery 芹菜", tier: "bone", retail: 60000, start: 32000, drift: -0.007, vol: 0.02, req: 0, dial: "#f5f0e2" },
  // Apple Piguet — Level 2
  { id: "yolk", brand: "AP", name: "Royal Yolk 16202", tier: "hot", retail: 250000, start: 520000, drift: 0.008, vol: 0.032, req: 300000, dial: "#27436e" },
  { id: "millennial", brand: "AP", name: "Millennial 4101", tier: "entry", retail: 140000, start: 160000, drift: 0.002, vol: 0.02, req: 0, dial: "#cdbfae" },
  { id: "code", brand: "AP", name: "Code 23.59", tier: "bone", retail: 180000, start: 95000, drift: -0.006, vol: 0.022, req: 0, dial: "#3a3f4a" },
  // Pasta Phillpe — Level 3
  { id: "noodilus", brand: "PP", name: "Noodilus 5711", tier: "grail", retail: 400000, start: 1150000, drift: 0.011, vol: 0.035, req: 450000, dial: "#1d3a5f" },
  { id: "aquanot", brand: "PP", name: "Aquanot 5167", tier: "entry", retail: 160000, start: 205000, drift: 0.004, vol: 0.025, req: 0, dial: "#14161a" },
  { id: "carbonara", brand: "PP", name: "Carbonara 5227", tier: "bone", retail: 150000, start: 82000, drift: -0.007, vol: 0.02, req: 0, dial: "#f5f0e2" },
];

export interface BoneLevel {
  n: number;
  brand: "RLX" | "AP" | "PP";
  cash: number;
  days: number;
  target: string;
}
export const BONE_LEVELS: BoneLevel[] = [
  { n: 1, brand: "RLX", cash: 250000, days: 10, target: "submarine" },
  { n: 2, brand: "AP", cash: 500000, days: 12, target: "yolk" },
  { n: 3, brand: "PP", cash: 800000, days: 14, target: "noodilus" },
];

// Hero images from the real collection library (public/watches).
export const BONE_IMG: Record<string, string> = {
  submarine: "/watches/rolex-sub-126610ln.png",
  yolk: "/watches/ap-ro-16202st.png",
  noodilus: "/watches/patek-nautilus-5711.png",
};

// Event mechanics (text lives in BONE_UI[lang].events, same order).
export const BONE_EVENTS_META: { k: "watch" | "brand" | "hotAll" | "all"; hot?: 1; m: number }[] = [
  { k: "watch", hot: 1, m: 1.15 },
  { k: "watch", hot: 1, m: 1.11 },
  { k: "brand", m: 1.06 },
  { k: "brand", m: 0.88 },
  { k: "watch", m: 0.9 },
  { k: "hotAll", m: 0.93 },
  { k: "all", m: 1.03 },
  { k: "all", m: 1.04 },
];

export interface BoneStrings {
  gameTitle: string;
  tier: Record<"grail" | "hot" | "entry" | "bone", string>;
  levelIntro: string[]; // per level
  events: string[]; // parallel to BONE_EVENTS_META, {W}/{B} placeholders
  quietDay: string;
  openingNews: string;
  sellers: string[];
  flavorOk: string[];
  flavorSus: string[];
  teaseHint: string[];
  teaser: string; // {B} {H}
  teaserNone: string;
  // top bar / chrome
  newsLabel: string;
  nwLabel: string;
  plan: string; // {n} {NAME}
  goalRemain: string; // {x}/{y} {d}
  tabMarket: string;
  tabBoutique: string;
  tabCollection: string;
  closeDefault: string;
  closeOffer: string;
  closeOffers: string; // {n}
  closeLastDay: string;
  stHold: string; // {x}
  stWaitCall: string;
  stExpire: string; // {n}
  stListed: string; // {n}
  openDay: string; // {d}
  tapContinue: string;
  // market
  secListings: string;
  secListingsSub: string;
  noListings: string;
  seller: string; // {s}
  expTonight: string;
  soldTag: string;
  atMarket: string;
  underMarket: string; // {p}
  overMarket: string; // {p}
  authBtn: string; // {x}
  buyBtn: string; // {x}
  verdictFake: string;
  verdictReal: string;
  secPrices: string;
  secPricesSub: string;
  sourceBtn: string;
  // boutique
  saOffer: string;
  saReady: string;
  saHalf: string;
  saPend: string;
  saCold: string;
  relOwn: string;
  relOffer: string;
  relReady: string;
  relHalf: string;
  relCold: string;
  credit: string; // {x} {y}
  creditPend: string; // {x} {d}
  dailyLimit: string;
  hotOfferNote: string;
  hotReadyNote: string;
  hotNeedNote: string; // {x}
  pushBtn: string;
  askBtn: string;
  noStockNote: string;
  noStockBtn: string;
  inStockTag: string;
  boneNote: string; // {x} {y}
  entryOkNote: string; // {x}
  retailBuyBtn: string;
  retailLine: string; // {x} {d}
  allocChip: string;
  allocSub: string;
  orderBtn: string; // {x}
  marketAt: string; // {x}
  // collection
  cash: string;
  colValue: string;
  netWorth: string;
  secTrophies: string;
  trophyChip: string; // {n}
  trophySub: string;
  trophyView: string;
  emptyCol: string;
  paidMarket: string; // {x} {y}
  paper: string; // {sign}{x}
  pendVestTonight: string; // {x}
  pendVestWait: string; // {x} {d}
  fakeTag: string;
  fakeLine: string;
  sellScrap: string; // {x}
  offerHead: string;
  offerPct: string; // {p}
  offerNet: string; // {x}
  declineBtn: string;
  acceptBtn: string; // {x}
  listedLine: string; // {n} {p}
  withdrawBtn: string;
  listedTag: string;
  listBtn: string;
  dealerBtn: string; // {x}
  retailChip: string;
  // reveal
  rvBeforeOpen: string; // {n} {d}
  rvUp: string;
  rvDown: string;
  rvTotal: string; // {x}
  rvExpired: string; // {n}
  rvMover: string;
  rvNowAt: string; // {x}
  rvNews: string;
  rvYesterday: string;
  rvPassedFakeT: string; // {w}
  rvPassedFakeB: string;
  rvSoldT: string; // {w}
  rvSoldB: string; // {x}
  rvSoldHigher: string;
  rvUnsoldT: string; // {w}
  rvUnsoldB: string;
  rvAppraiser: string;
  rvFakeT: string; // {w}
  rvFakeB: string; // {x}
  rvOffersK: string;
  rvOfferStrong: string;
  rvOfferNormal: string;
  rvOfferMore: string; // {n}
  rvOfferDeadline: string;
  rvNoOfferT: string;
  rvNoOfferB: string;
  rvBoutiqueK: string;
  rvVestT: string;
  rvVestB: string; // {list}
  rvMissedT: string;
  rvMissedB: string; // {w}
  rvCallK: string;
  rvCallT: string; // {w}
  rvCallB: string; // {b} {x} {y}
  rvNoCallT: string;
  rvNoCallB: string;
  rvTomorrow: string;
  rvDaysLeft: string; // {d}
  // toasts
  tNoCash: string;
  tBought: string; // {w}
  tSourced: string; // {w}
  tAdLimit: string;
  tBone: string; // {d} {x}
  tEntry: string; // {w} {d} {x}
  tListed: string;
  tWithdrawn: string;
  tSold: string; // {x}
  tLostCredit: string; // {x}
  tDeclined: string;
  tDealer: string; // {x}
  tAuthFake: string;
  tAuthReal: string;
  tMaxListings: string;
  // modals
  mThink: string;
  mConfirm: string;
  mBoutique: string;
  mAlloc: string;
  mRetail: string;
  mCashAfter: string;
  mCreditRow: string; // {d}
  mResultRow: string;
  mClearRow: string;
  mSourceHead: string;
  mSourceFee: string;
  mSourceNote: string;
  mLockReadyQ: string;
  mLockNotQ: string;
  mLockReadyB: string;
  mLockNotB: string; // {x} {d}
  mLockReadyBtn: string;
  mLockNotBtn: string;
  // level intro
  liHead: string; // {n} {b}
  liTarget: string; // {w}
  liCash: string;
  liDays: string;
  liDaysV: string; // {d}
  liReq: string;
  liRetail: string;
  liGo: string;
  // intro
  inSub: string;
  inP1: string;
  inP2: string; // {d}
  inDisclaimer: string;
  inStart: string;
  inRestart: string;
  inContinue: string;
  // level complete / fail / end
  lcHead: string; // {n}
  lcTitle: string; // {w}
  lcQuote: string;
  lcUsed: string;
  lcUsedV: string; // {d} {max}
  lcGain: string;
  lcCashPl: string;
  lcMarketOf: string; // {w}
  lcLiquid: string; // {x}
  lcTrophyNote: string; // {w}
  lcNext: string; // {n} {b}
  lcFinal: string;
  ceremonyBtn: string;
  ceremonyClose: string;
  ceremonyQuote: string;
  lfHead: string; // {n}
  lfTitle: string;
  lfQuote: string;
  lfBody: string; // {d} {w}
  lfRetry: string; // {n}
  egHead: string;
  egT1: string;
  egL1: string;
  egT2: string;
  egL2: string;
  egT3: string;
  egL3: string;
  egPl: string;
  egDays: string;
  egDaysV: string; // {d}
  egBones: string;
  egBonesV: string; // {n}
  egFakes: string;
  egFakesV: string; // {n}
  egTrophies: string; // {list}
  egAgain: string;
  backHome: string;
}

export const BONE_UI: Record<Lang, BoneStrings> = {
  en: {
    gameTitle: "Bone Eater",
    tier: { grail: "GRAIL", hot: "HOT", entry: "SOLID", bone: "SHELF SITTER" },
    levelIntro: [
      "The SA hasn't even looked at you yet. Want the black Sub? Buy a Tutor first to show sincerity.",
      "Promoted. The bones cost more here and the SA's smile is faker. Your budget won't cover it all — learn to sell.",
      "The boss level. Your budget can't even cover the bones — work the listings or you'll never touch a Noodilus.",
    ],
    events: [
      "A-lister wears {W} on the red carpet — the whole town wants one",
      "A {W} hammers for a record at auction — the grey market stirs",
      "{B} announces a price rise next month — queues form outside the AD",
      "{B} executive misspeaks in an interview — collectors threaten a boycott",
      "A whale suddenly dumps {W} — price under pressure",
      "The hype cools — hot pieces pull back across the board",
      "The watch fair opens — every brand in the spotlight",
      "Money rotates into alternative assets — watches catch a bid",
    ],
    quietDay: "A quiet day in the watch world.",
    openingNews: "New season allocations just landed. The AD says: “Regulars first.”",
    sellers: ["WatchBro K", "Emigrating, must sell", "Uncle B", "Bored of it", "Mystery seller", "Shop clearance", "Wife doesn't know", "New watch, new me"],
    flavorOk: ["Full set, box and papers", "Owner says barely worn", "Fresh from a service", "On consignment at a shop — can view", "Complete set with original receipt"],
    flavorSus: ["No box, no papers — “bought abroad”", "Photos are suspiciously blurry", "Serial number has no record", "Engraving looks polished off", "Seller refuses a video check"],
    teaseHint: ["price not disclosed", "claims full set", "photos look odd", "seller says it's urgent", "word is it's a steal"],
    teaser: "Tomorrow: someone is selling a {B} — {H}.",
    teaserNone: "Tomorrow's listings: no word yet.",
    newsLabel: "NEWS",
    nwLabel: "Net",
    plan: "L{n} · PROJECT {NAME}",
    goalRemain: "{x}/{y} · {d}d left",
    tabMarket: "Market",
    tabBoutique: "Boutique",
    tabCollection: "Collection",
    closeDefault: "Close the day ▸ see what happens",
    closeOffer: "Close the day ▸ the allocation expires!",
    closeOffers: "Close the day ▸ {n} offer(s) expire",
    closeLastDay: "Close the day ▸ final day!",
    stHold: "Holdings {x}",
    stWaitCall: "waiting for the SA's call",
    stExpire: "{n} listings expire tonight",
    stListed: "{n} listed, awaiting buyers",
    openDay: "Open · Day {d}",
    tapContinue: "tap · continue",
    secListings: "Today's listings",
    secListingsSub: "expire at close",
    noListings: "No listings today. Come back tomorrow.",
    seller: "Seller: {s}",
    expTonight: "expires tonight",
    soldTag: "sold",
    atMarket: "at market",
    underMarket: "{p}% under market",
    overMarket: "{p}% over market",
    authBtn: "Authenticate {x}",
    buyBtn: "Buy {x}",
    verdictFake: "Authenticated: FAKE — walk away",
    verdictReal: "Authenticated: genuine ✓",
    secPrices: "Prices",
    secPricesSub: "Source = market +12%, guaranteed genuine",
    sourceBtn: "Source",
    saOffer: "“I've set something aside for you. I'll need an answer today.”",
    saReady: "“You're a valued client now. Keep your phone close.”",
    saHalf: "“Your journey with us is coming along nicely. These things take time.”",
    saPend: "“That piece from earlier — do enjoy it. We love seeing our pieces stay with clients.”",
    saCold: "“Have you considered starting your journey with something from the current collection?”",
    relOwn: "Family",
    relOffer: "Allocation secured — today only",
    relReady: "Valued client — awaiting the call",
    relHalf: "On their radar",
    relCold: "No relationship yet",
    credit: "Journey {x} / allocation at {y}",
    creditPend: "+{x} joins your journey after {d} held days",
    dailyLimit: "SA: “Let's not rush your journey.” (limit 2 per day)",
    hotOfferNote: "Allocation live — order above, today only",
    hotReadyNote: "Your journey qualifies. Await the call — check after each close.",
    hotNeedNote: "Your journey needs {x} more, then you wait for the call",
    pushBtn: "Push",
    askBtn: "Ask",
    noStockNote: "No allocation today. Ask again tomorrow.",
    noStockBtn: "None",
    inStockTag: "IN STOCK TODAY",
    boneNote: "Grey market only {x} — retail is an instant {y} loss. The boutique calls this “building a relationship”.",
    entryOkNote: "Grey market {x} — in stock, move fast",
    retailBuyBtn: "Buy at retail",
    retailLine: "Retail {x} · builds your journey (counts after {d} days)",
    allocChip: "ALLOCATION ✦",
    allocSub: "Held for you · today only · buy it and clear the level",
    orderBtn: "Order · {x}",
    marketAt: "market {x}",
    cash: "Cash",
    colValue: "Collection",
    netWorth: "Net worth",
    secTrophies: "Trophies",
    trophyChip: "L{n} TROPHY",
    trophySub: "Not for sale · tap to admire",
    trophyView: "View",
    emptyCol: "Nothing yet.<br>Today's listings vanish at close — strike when it's right.",
    paidMarket: "Paid {x} · market {y}",
    paper: "Paper {sign}{x}",
    pendVestTonight: "+{x} joins your journey tonight",
    pendVestWait: "+{x} journey pending — hold {d} more day(s) (sell it and it never happened)",
    fakeTag: "FAKE",
    fakeLine: "Fake. Scrap value only.",
    sellScrap: "Sell scrap {x}",
    offerHead: "Buyer's offer · today only",
    offerPct: "({p}% of market)",
    offerNet: "Net after 4% fee: {x}",
    declineBtn: "Decline",
    acceptBtn: "Accept {x}",
    listedLine: "Listed · night {n} · ~{p}% chance of an offer tonight",
    withdrawBtn: "Withdraw",
    listedTag: "LISTED",
    listBtn: "List for offers",
    dealerBtn: "Dealer cash ~{x}",
    retailChip: "RETAIL",
    rvBeforeOpen: "L{n} · Day {d} · before open",
    rvUp: "Net worth up",
    rvDown: "Net worth down",
    rvTotal: "Total {x}",
    rvExpired: "{n} offer(s) expired",
    rvMover: "Biggest mover",
    rvNowAt: "Now at {x}",
    rvNews: "Watch world news",
    rvYesterday: "Yesterday's listings",
    rvPassedFakeT: "You passed on that {w}.",
    rvPassedFakeB: "Word in the circle: it was a fake. Good eye.",
    rvSoldT: "{w} got snapped up.",
    rvSoldB: "Sold for {x}",
    rvSoldHigher: " — above asking.",
    rvUnsoldT: "{w} went unsold.",
    rvUnsoldB: "The seller took it back. “Maybe later.”",
    rvAppraiser: "Appraiser",
    rvFakeT: "Bad news: your {w} is a fake.",
    rvFakeB: "Scrap value {x}. It looked cheap for a reason — now you know.",
    rvOffersK: "Tonight's offers",
    rvOfferStrong: "Serious buyer: ",
    rvOfferNormal: "Buyer's offer: ",
    rvOfferMore: "Plus {n} more offer(s). ",
    rvOfferDeadline: "Answer by tomorrow or it lapses.",
    rvNoOfferT: "No bites.",
    rvNoOfferB: "No offers on your listings tonight. The longer it sits, the better the odds.",
    rvBoutiqueK: "Boutique",
    rvVestT: "Your journey grew.",
    rvVestB: "{list} added to your purchase history. The SA is starting to remember your name.",
    rvMissedT: "You didn't take that call.",
    rvMissedB: "The SA reclaimed the {w} allocation. The tone got noticeably cooler. (Your journey survives — but you're back of the queue.)",
    rvCallK: "Boutique · the phone rings",
    rvCallT: "“{w}. One piece. Answer me today.”",
    rvCallB: "The {b} SA says an allocation just opened up. Retail {x} (market {y}).",
    rvNoCallT: "The phone stayed silent.",
    rvNoCallB: "The SA says this season's allocations “went to long-standing clients”. But don't lose heart… should be soon.",
    rvTomorrow: "Tomorrow",
    rvDaysLeft: "{d} day(s) left.",
    tNoCash: "Not enough cash.",
    tBought: "Bought {w}. Off to the appraiser tonight.",
    tSourced: "Sourced a {w} (+12% fee). Delivered today.",
    tAdLimit: "AD: “That's enough for today. Come back tomorrow.”",
    tBone: "Shelf sitter bundled. Keep it {d} days and +{x} joins your journey.",
    tEntry: "Bought {w}. Keep it {d} days and +{x} joins your journey.",
    tListed: "Listed. Offers may come in after close.",
    tWithdrawn: "Listing withdrawn.",
    tSold: "Sold. {x} after fees.",
    tLostCredit: " (Pending journey {x} gone — they noticed the flip.)",
    tDeclined: "Offer declined. Still listed.",
    tDealer: "The dealer pays {x} on the spot.",
    tAuthFake: "Verdict: fake. Close call.",
    tAuthReal: "Verdict: genuine.",
    tMaxListings: "Max 6 active listings.",
    mThink: "Let me think",
    mConfirm: "Confirm",
    mBoutique: "Boutique",
    mAlloc: "Boutique · allocation",
    mRetail: "Retail",
    mCashAfter: "Cash after",
    mCreditRow: "Journey (counts after {d} days)",
    mResultRow: "Result",
    mClearRow: "Level clear ✓",
    mSourceHead: "Sourcing service",
    mSourceFee: "Market +12%",
    mSourceNote: "Guaranteed genuine, same-day delivery. Pricey, but safe.",
    mLockReadyQ: "“Soon. Keep your phone close.”",
    mLockNotQ: "“Sir, money alone doesn't buy this one.”",
    mLockReadyB: "Your journey qualifies. Every close of day has a chance the phone rings — the longer you wait, the better the odds.",
    mLockNotB: "Your journey is {x} short. Retail purchases build the relationship — but only pieces you keep {d} days count. Flippers get remembered, not rewarded.",
    mLockReadyBtn: "Got it — waiting for the call",
    mLockNotBtn: "Got it — time to bundle",
    liHead: "Level {n} / 3 · {b}",
    liTarget: "Target: {w}",
    liCash: "Capital",
    liDays: "Deadline",
    liDaysV: "{d} days",
    liReq: "Journey required",
    liRetail: "The meat, at retail",
    liGo: "Let's go",
    inSub: "Bone Eater · the AD allocation game",
    inP1: "Three levels of the AD game: Rolodex → Apple Piguet → Pasta Phillpe.",
    inP2: "Each level: limited days, limited cash. It's pay-to-play — bundle the shelf sitters nobody wants and keep them {d} days so they count toward your journey, then wait for the call and <b>buy the hot piece to clear the level</b>. Short on cash? Work the grey-market listings.",
    inDisclaimer: "All brands and prices are fictional. Any resemblance… you know the one.",
    inStart: "Start Level 1",
    inRestart: "Restart",
    inContinue: "Continue",
    lcHead: "Level {n} complete ✦",
    lcTitle: "{w} secured",
    lcQuote: "“Knew you had it in you. Wear it well — collectors notice what you do next.”",
    lcUsed: "Days used",
    lcUsedV: "{d}/{max}",
    lcGain: "Result incl. the meat",
    lcCashPl: "Cash P&L",
    lcMarketOf: "{w} market",
    lcLiquid: "Exit liquidation: +{x} (counted in the result)",
    lcTrophyNote: "{w} moved to the trophy cabinet — not for sale. You said you'd never sell.",
    lcNext: "Level {n} · {b}",
    lcFinal: "Final results",
    ceremonyBtn: "Take delivery ▸ results",
    ceremonyClose: "Close",
    ceremonyQuote: "“Knew you had it in you.”",
    lfHead: "Level {n} failed",
    lfTitle: "Time's up.",
    lfQuote: "“No rush, take your time. The watches won't wait, though.”",
    lfBody: "{d} days weren't enough to land the {w}. Capital resets; credit carries over — the SA still remembers you.",
    lfRetry: "Retry Level {n}",
    egHead: "All levels · final results",
    egT1: "True Collector",
    egL1: "All three pieces of meat — and you made money doing it. The ADs will whisper your name.",
    egT2: "Dues Paid in Full",
    egL2: "From queueing at Rolodex to a seat at Pasta Phillpe. You played the AD game and won.",
    egT3: "Ashore in Tears",
    egL3: "You crawled to the top at a loss. You fully understand this game — and the real one.",
    egPl: "Total P&L",
    egDays: "Total days",
    egDaysV: "{d} days",
    egBones: "Shelf sitters bundled",
    egBonesV: "{n}",
    egFakes: "Fakes bought",
    egFakesV: "{n}",
    egTrophies: "Trophies: {list}",
    egAgain: "Run it back",
    backHome: "Exit game?",
  },
  zh: {
    gameTitle: "食骨模擬器",
    tier: { grail: "神級", hot: "肉", entry: "穩陣", bone: "骨" },
    levelIntro: [
      "SA 連正眼都未望過你。想要隻黑水鬼？先買隻 Tutor 證明你有誠意。",
      "升咗班。呢度嘅骨貴啲，SA 嘅笑容假啲。資金唔夠使 — 學識放盤回血。",
      "大佬關。份錢連食骨都唔夠 — 唔炒盤源，你摸唔到 Noodilus。",
    ],
    events: [
      "明星喺頒獎禮戴住{W}現身，全城瘋搶",
      "拍賣會一枚{W}以天價成交，二手市場起哄",
      "{B} 宣布下月加價，AD 門外開始排隊",
      "{B} 高層接受訪問失言，藏家發起罷買",
      "大戶突然清倉{W}，價格受壓",
      "炒風退卻，熱門款全線回調",
      "國際錶展開幕，全線品牌受關注",
      "財經新聞：資金流入另類資產，錶市受惠",
    ],
    quietDay: "今日錶壇風平浪靜。",
    openingNews: "新一季配額已到店。AD 話：「熟客先有。」",
    sellers: ["錶友K", "移民急放", "Uncle B", "玩厭咗", "神秘賣家", "錶房清倉", "太太唔知", "舊錶新歡"],
    flavorOk: ["盒單齊全，行貨", "錶主自稱冇點戴過", "啱啱先做完保養", "店舖寄賣，可上手", "全套齊，連購買單據"],
    flavorSus: ["冇盒冇單，話喺外國買", "張相影得有啲朦", "序號查唔到紀錄", "刻字好似磨過", "賣家唔肯視像驗錶"],
    teaseHint: ["開價未公開", "聲稱全套齊", "睇相有啲怪", "賣家話急放", "據講係筍價"],
    teaser: "聽日有人放 {B} — {H}。",
    teaserNone: "聽日盤源：暫時未有風聲。",
    newsLabel: "快訊",
    nwLabel: "身家",
    plan: "L{n} · {NAME} 計劃",
    goalRemain: "{x}/{y} · 剩 {d} 日",
    tabMarket: "市場",
    tabBoutique: "專門店",
    tabCollection: "收藏",
    closeDefault: "收市 ▸ 睇下發生咩事",
    closeOffer: "收市 ▸ 配額仲未答覆！",
    closeOffers: "收市 ▸ {n} 個出價會過期",
    closeLastDay: "收市 ▸ 最後一日！",
    stHold: "持倉 {x}",
    stWaitCall: "等緊 SA 電話",
    stExpire: "{n} 個盤今晚過期",
    stListed: "{n} 個盤等買家",
    openDay: "開市 · 第 {d} 日",
    tapContinue: "撳一下 · 繼續",
    secListings: "今日盤源",
    secListingsSub: "收市即過期",
    noListings: "今日冇盤。聽日再嚟。",
    seller: "賣家：{s}",
    expTonight: "今晚過期",
    soldTag: "已成交",
    atMarket: "貼市",
    underMarket: "平市價 {p}%",
    overMarket: "高市價 {p}%",
    authBtn: "鑑定 {x}",
    buyBtn: "買入 {x}",
    verdictFake: "鑑定：假錶 — 咪掂",
    verdictReal: "鑑定：真品 ✓",
    secPrices: "行情",
    secPricesSub: "搵貨 = 市價 +12%，保真",
    sourceBtn: "搵貨",
    saOffer: "「我幫你留咗件嘢。今日內答覆我。」",
    saReady: "「就快㗎啦，得閒留意電話。」",
    saHalf: "「你都算有心。不過前面仲有好多熟客。」",
    saPend: "「頭先嗰隻，記住揸住先。即刻轉手嘅嘢，我哋睇在眼裏。」",
    saCold: "「今季好緊張㗎。新朋友，慢慢嚟。」",
    relOwn: "自己人",
    relOffer: "配額到手 — 今日有效",
    relReady: "熟客 — 等緊電話",
    relHalf: "有印象",
    relCold: "冷淡",
    credit: "貢獻值 {x} ／ 門檻 {y}",
    creditPend: "未入帳 +{x}（要揸滿 {d} 日）",
    dailyLimit: "AD：「今日買夠喇，聽日再嚟。」（每日限 2 隻）",
    hotOfferNote: "配額到手 — 今日有效，喺上面落訂",
    hotReadyNote: "夠鐘喇，等 SA 電話。收市後注意來電。",
    hotNeedNote: "仲差 {x} 貢獻值，之後等電話",
    pushBtn: "催單",
    askBtn: "查詢",
    noStockNote: "今日冇配貨。聽日再問。",
    noStockBtn: "冇貨",
    inStockTag: "今日有貨",
    boneNote: "二手價僅 {x} — 正價買即蝕 {y}（＝食骨）",
    entryOkNote: "二手價 {x} — 有現貨，行快啲",
    retailBuyBtn: "正價買入",
    retailLine: "正價 {x} · +貢獻值（{d} 日後入帳）",
    allocChip: "配額 ✦",
    allocSub: "SA 留咗畀你 · 今日有效 · 買到即過關",
    orderBtn: "落訂 {x}",
    marketAt: "市價 {x}",
    cash: "現金",
    colValue: "藏品估值",
    netWorth: "身家",
    secTrophies: "戰利品",
    trophyChip: "L{n} 戰利品",
    trophySub: "非賣品 · 撳入去欣賞",
    trophyView: "欣賞",
    emptyCol: "未有藏品。<br>今日盤源收市就過期 — 睇啱就落手。",
    paidMarket: "買入 {x} · 市價 {y}",
    paper: "帳面 {sign}{x}",
    pendVestTonight: "貢獻值 +{x} 今晚入帳",
    pendVestWait: "貢獻值 +{x} — 仲要揸 {d} 日（賣咗就冇）",
    fakeTag: "假錶",
    fakeLine: "假錶。得返廢錶價。",
    sellScrap: "出售廢錶 {x}",
    offerHead: "買家出價 · 今日內有效",
    offerPct: "（市價 {p}%）",
    offerNet: "扣 4% 佣後實收 {x}",
    declineBtn: "拒絕",
    acceptBtn: "接受 {x}",
    listedLine: "放緊盤 · 第 {n} 晚 · 今晚有 offer 機會約 {p}%",
    withdrawBtn: "收回",
    listedTag: "放緊盤",
    listBtn: "放盤等出價",
    dealerBtn: "收錶佬 ~{x}",
    retailChip: "正價入手",
    rvBeforeOpen: "L{n} · 第 {d} 日 · 開市前",
    rvUp: "身家升咗",
    rvDown: "身家跌咗",
    rvTotal: "總身家 {x}",
    rvExpired: "{n} 個出價過咗期",
    rvMover: "最大異動",
    rvNowAt: "而家市價 {x}",
    rvNews: "錶壇快訊",
    rvYesterday: "昨日盤源",
    rvPassedFakeT: "你冇買 {w} 嗰個盤。",
    rvPassedFakeB: "圈內消息：隻嘢原來係假嘅。好眼光。",
    rvSoldT: "{w} 畀人執咗。",
    rvSoldB: "成交價 {x}",
    rvSoldHigher: "，仲高過開價。",
    rvUnsoldT: "{w} 流咗。",
    rvUnsoldB: "賣家收返隻錶，話遲下先算。",
    rvAppraiser: "鑑定行",
    rvFakeT: "壞消息：你隻 {w} 係假嘅。",
    rvFakeB: "廢錶價 {x}。你當初見佢平……而家明啦。",
    rvOffersK: "今晚出價",
    rvOfferStrong: "有心買家：",
    rvOfferNormal: "買家出價：",
    rvOfferMore: "仲有另外 {n} 個出價。",
    rvOfferDeadline: "聽日內答覆，過期作廢。",
    rvNoOfferT: "冇人吼。",
    rvNoOfferB: "放緊嘅盤今晚冇 offer。愈放得耐，機會愈大。",
    rvBoutiqueK: "專門店",
    rvVestT: "貢獻值入帳。",
    rvVestB: "{list}。SA 開始記得你個名。",
    rvMissedT: "你冇接嗰個電話。",
    rvMissedB: "SA 收返 {w} 個配額，語氣即刻淡咗。（貢獻值保留，重新排隊）",
    rvCallK: "專門店 · 電話響咗",
    rvCallT: "「{w}，一件。今日內答覆我。」",
    rvCallB: "{b} SA 話配額突然騰出嚟。正價 {x}（市價 {y}）。",
    rvNoCallT: "電話冇響。",
    rvNoCallB: "SA 話今季配額「畀咗長期客」，不過叫你唔好灰心……應該就快。",
    rvTomorrow: "聽日",
    rvDaysLeft: "剩 {d} 日。",
    tNoCash: "現金不足。",
    tBought: "買入 {w}。今晚送鑑定行過眼。",
    tSourced: "搵貨成功，{w} 到手（+12% 服務費）。",
    tAdLimit: "AD：「今日買夠喇，聽日再嚟。」",
    tBone: "食骨 +1。揸滿 {d} 日，貢獻值 +{x}。",
    tEntry: "買入 {w}。揸滿 {d} 日，貢獻值 +{x}。",
    tListed: "放咗盤。收市後等買家出價。",
    tWithdrawn: "收回咗個盤。",
    tSold: "成交。扣佣後收 {x}。",
    tLostCredit: "（未入帳貢獻值 {x} 冇咗）",
    tDeclined: "拒絕咗個 offer。個盤繼續放。",
    tDealer: "收錶佬即場找數 {x}。",
    tAuthFake: "鑑定結果：假錶。好彩冇買。",
    tAuthReal: "鑑定結果：真品。",
    tMaxListings: "最多同時放 6 個盤。",
    mThink: "諗諗先",
    mConfirm: "確認買入",
    mBoutique: "專門店",
    mAlloc: "專門店 · 配額",
    mRetail: "正價",
    mCashAfter: "交易後現金",
    mCreditRow: "貢獻值（揸滿 {d} 日入帳）",
    mResultRow: "結果",
    mClearRow: "過關 ✓",
    mSourceHead: "搵貨服務",
    mSourceFee: "市價 +12%",
    mSourceNote: "保證真品，即日到手。貴，但穩陣。",
    mLockReadyQ: "「就快㗎啦，得閒留意電話。」",
    mLockNotQ: "「先生，呢隻錶唔係有錢就買到㗎。」",
    mLockReadyB: "你已經夠貢獻值。每晚收市都有機會接到電話，愈等得耐機會愈大。",
    mLockNotB: "貢獻值仲差 {x}。正價買錶先計數 — 記住要揸滿 {d} 日先入帳，即買即賣係冇數㗎。",
    mLockReadyBtn: "明白，等電話",
    mLockNotBtn: "明白，我去食骨",
    liHead: "Level {n} / 3 · {b}",
    liTarget: "目標：{w}",
    liCash: "資金",
    liDays: "限期",
    liDaysV: "{d} 日",
    liReq: "配額門檻",
    liRetail: "肉嘅正價",
    liGo: "開工",
    inSub: "Bone Eater · 配貨求生遊戲",
    inP1: "三關：Rolodex → Apple Piguet → Pasta Phillpe。",
    inP2: "每關限時限錢，喺 AD 食骨儲貢獻值（要揸滿 {d} 日先入帳），等 SA 電話派配額，<b>買到隻肉就過關</b>。錢唔夠？去二手市場執平貨、放盤等人出價。",
    inDisclaimer: "所有品牌與價格純屬虛構。如有雷同，你懂的。",
    inStart: "開始 Level 1",
    inRestart: "重新開始",
    inContinue: "繼續上次",
    lcHead: "Level {n} 完成 ✦",
    lcTitle: "{w} 到手",
    lcQuote: "「就知你得㗎啦。戴得開心啲 — 藏家做啲乜，我哋都會留意。」",
    lcUsed: "用咗",
    lcUsedV: "{d}/{max} 日",
    lcGain: "連肉計戰績",
    lcCashPl: "現金賺蝕",
    lcMarketOf: "{w} 市價",
    lcLiquid: "離場清倉：+{x}（已計入成績）",
    lcTrophyNote: "{w} 已放入戰利品櫃 — 非賣品。你話過永遠唔賣。",
    lcNext: "去 Level {n} · {b}",
    lcFinal: "睇總結算",
    ceremonyBtn: "收貨 ▸ 睇結算",
    ceremonyClose: "閂返",
    ceremonyQuote: "「就知你得㗎啦。」",
    lfHead: "Level {n} 失敗",
    lfTitle: "限期已到。",
    lfQuote: "「唔緊要，慢慢嚟。啲錶又唔會等你。」",
    lfBody: "{d} 日內買唔到 {w}。資金重置，貢獻值保留 — SA 仲記得你。",
    lfRetry: "重試 Level {n}",
    egHead: "全關完成 · 總結算",
    egT1: "真・藏家",
    egL1: "三隻肉全部到手，仲要賺住咁攞。AD 之間會流傳你個名。",
    egT2: "食骨成仙",
    egL2: "由 Rolodex 排隊仔變 Pasta Phillpe 座上客。呢條路你行完喇。",
    egT3: "含淚上岸",
    egL3: "蝕住都爬到上頂。你完全理解呢個遊戲 — 同埋現實。",
    egPl: "三關總賺蝕",
    egDays: "總日數",
    egDaysV: "{d} 日",
    egBones: "食骨總數",
    egBonesV: "{n} 隻",
    egFakes: "中伏假錶",
    egFakesV: "{n} 隻",
    egTrophies: "戰利品：{list}",
    egAgain: "由頭再嚟",
    backHome: "離開遊戲？",
  },
};
