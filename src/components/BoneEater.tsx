"use client";

// Bone Eater (食骨模擬器) — Game 6. A satirical AD-allocation tycoon.
//
// The game engine is deliberately imperative (innerHTML + event delegation),
// ported from the playtested standalone mockup: one state object, pure render
// functions, a nightly "reveal" sequence. React owns the mount/unmount and the
// language switch (remount via key); the engine owns everything inside.

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import {
  BONE_BRANDS,
  BONE_EVENTS_META,
  BONE_IMG,
  BONE_LEVELS,
  BONE_MONO,
  BONE_WATCHES,
  type BoneStrings,
  BONE_UI,
  type BoneWatch,
} from "@/lib/bone";
import type { Lang } from "@/lib/copy";

const SAVE_KEY = "we-bone-v1";
const AUTH_FEE = 5000;
const SCRAP = 8000;
const SOURCE_FEE = 1.12;
const VEST_DAYS = 3;
const AD_DAILY_LIMIT = 2;
const CONSIGN_FEE = 0.04;
const OFFER_CHANCE = [0.35, 0.5, 0.65, 0.75];

interface Pend {
  b: string;
  pts: number;
  vestDay: number;
}
interface Holding {
  id: string;
  paid: number;
  src: "mkt" | "ad";
  fake: boolean;
  fakeFound: boolean;
  pend: Pend | null;
  listed: boolean;
  listAge: number;
  offer: { price: number } | null;
}
interface Listing {
  uid: number;
  wid: string;
  ask: number;
  seller: string;
  flavor: string;
  sus: boolean;
  fake: boolean;
  authed: boolean;
  bought: boolean;
}
interface GameState {
  level: number;
  levelDay: number;
  cash: number;
  inv: Holding[];
  trophies: { wid: string; level: number }[];
  results: { level: number; brand: string; days: number; limit: number; profit: number; liquid: number }[];
  pts: Record<string, number>;
  pity: Record<string, number>;
  adOffer: { wid: string; brand: string; price: number } | null;
  adStock: Record<string, boolean>;
  adMiss: Record<string, number>;
  adBuysToday: number;
  prices: Record<string, number>;
  prev: Record<string, number>;
  news: string;
  listings: Listing[];
  tomorrow: Listing[];
  teaser: string;
  bones: number;
  trades: number;
  fakesBought: number;
  done: boolean;
  seed: number;
}
interface RevealCard {
  k: string;
  t: string;
  b?: string;
  num?: string;
  cls?: string;
  last?: boolean;
}

function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

function mountGame(root: HTMLDivElement, lang: Lang, onBack: () => void): () => void {
  const T: BoneStrings = BONE_UI[lang];
  const W: Record<string, BoneWatch> = Object.fromEntries(BONE_WATCHES.map((w) => [w.id, w]));
  const LV = BONE_LEVELS;
  const wname = (w: BoneWatch) => (lang === "zh" && w.nameZh ? w.nameZh : w.name);

  let S: GameState;
  let tab: "M" | "A" | "C" = "A";
  let revealQueue: RevealCard[] = [];
  let revealTimer: ReturnType<typeof setTimeout> | null = null;
  let toastT: ReturnType<typeof setTimeout> | null = null;
  let cashAnim = 0;
  let lastCash: number | null = null;
  let pendingSettle: string | null = null;
  let tvMode: "ceremony" | "view" = "view";

  /* ---------- helpers ---------- */
  const $ = <E extends HTMLElement = HTMLElement>(q: string) => root.querySelector(q) as E;
  const rng = () => {
    S.seed = (S.seed * 48271) % 2147483647;
    return S.seed / 2147483647;
  };
  const lv = () => LV[S.level];
  const targetW = () => W[lv().target];
  const unlocked = () => {
    const bs = LV.slice(0, S.level + 1).map((l) => l.brand as string);
    return BONE_WATCHES.filter((w) => bs.includes(w.brand));
  };
  const fmt = (n: number): string => {
    const neg = n < 0 ? "−" : "";
    n = Math.abs(n);
    if (lang === "zh") {
      if (n >= 10000) {
        const v = n / 10000;
        return neg + "HK$" + (v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1).replace(/\.0$/, "")) + "萬";
      }
      return neg + "HK$" + Math.round(n).toLocaleString();
    }
    if (n >= 1000000) return neg + "HK$" + (n / 1000000).toFixed(2).replace(/0$/, "").replace(/\.0$/, "") + "M";
    if (n >= 10000) return neg + "HK$" + Math.round(n / 1000) + "k";
    return neg + "HK$" + Math.round(n).toLocaleString();
  };
  const pct = (a: number, b: number) => {
    if (!b) return "0%";
    const p = (a / b - 1) * 100;
    return (p >= 0 ? "+" : "") + p.toFixed(1) + "%";
  };
  const holdingValue = (h: Holding) => (h.fakeFound ? SCRAP : Math.round(S.prices[h.id] * 0.9));
  const netWorth = () => S.cash + S.inv.reduce((a, h) => a + holdingValue(h), 0);
  const pendingPts = (b: string) => S.inv.filter((h) => h.pend && h.pend.b === b).reduce((a, h) => a + (h.pend as Pend).pts, 0);
  const pick = <X,>(arr: X[]) => arr[Math.floor(rng() * arr.length)];

  /* ---------- state init ---------- */
  function genListings(): Listing[] {
    const pool = unlocked();
    const n = 2 + (rng() < 0.6 ? 1 : 0) + (S.level > 0 && rng() < 0.4 ? 1 : 0);
    const out: Listing[] = [];
    for (let i = 0; i < n; i++) {
      const w = pick(pool);
      const r = rng();
      let mult: number, kind: string;
      if (r < 0.48) { mult = 0.95 + rng() * 0.1; kind = "normal"; }
      else if (r < 0.7) { mult = 1.06 + rng() * 0.12; kind = "rip"; }
      else if (r < 0.88) { mult = 0.88 + rng() * 0.06; kind = "deal"; }
      else if (r < 0.95) { mult = 0.78 + rng() * 0.09; kind = "steal"; }
      else if (r < 0.97) { mult = 0.65 + rng() * 0.1; kind = "jackpot"; }
      else { mult = 0.65 + rng() * 0.2; kind = "fake"; }
      const fake = kind === "fake";
      const sus = fake || ((kind === "steal" || kind === "jackpot") && rng() < 0.25);
      out.push({
        uid: Math.floor(rng() * 1e9),
        wid: w.id,
        ask: Math.round(S.prices[w.id] * mult),
        seller: pick(T.sellers),
        flavor: sus ? pick(T.flavorSus) : pick(T.flavorOk),
        sus, fake, authed: false, bought: false,
      });
    }
    return out;
  }
  function makeTeaser(listings: Listing[]): string {
    if (!listings.length) return T.teaserNone;
    const l = pick(listings);
    return fill(T.teaser, { B: BONE_BRANDS[W[l.wid].brand], H: pick(T.teaseHint) });
  }
  function rollAdStock() {
    for (const w of BONE_WATCHES.filter((x) => x.tier === "entry" && x.brand === lv().brand)) {
      const miss = S.adMiss[w.id] || 0;
      S.adStock[w.id] = rng() < (miss >= 3 ? 0.7 : 0.4);
      S.adMiss[w.id] = S.adStock[w.id] ? 0 : miss + 1;
    }
  }
  function newGame(): GameState {
    S = {
      level: 0, levelDay: 1, cash: LV[0].cash, inv: [], trophies: [], results: [],
      pts: { RLX: 0, AP: 0, PP: 0 }, pity: { RLX: 0, AP: 0, PP: 0 }, adOffer: null,
      adStock: {}, adMiss: {}, adBuysToday: 0,
      prices: Object.fromEntries(BONE_WATCHES.map((w) => [w.id, w.start])),
      prev: Object.fromEntries(BONE_WATCHES.map((w) => [w.id, w.start])),
      news: T.openingNews,
      listings: [], tomorrow: [], teaser: "",
      bones: 0, trades: 0, fakesBought: 0, done: false,
      seed: (Date.now() % 2147483647) || 42,
    };
    rollAdStock();
    S.listings = genListings();
    S.tomorrow = genListings();
    S.teaser = makeTeaser(S.tomorrow);
    return S;
  }
  function initLevel(n: number) {
    S.level = n;
    const L = LV[n];
    S.levelDay = 1;
    S.cash = L.cash;
    S.inv = [];
    S.adOffer = null;
    S.adBuysToday = 0;
    S.pity[L.brand] = 0;
    rollAdStock();
    S.listings = genListings();
    S.tomorrow = genListings();
    S.teaser = makeTeaser(S.tomorrow);
    tab = "A";
    save();
  }
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch { /* ignore */ } };
  const load = (): GameState | null => {
    try { const j = localStorage.getItem(SAVE_KEY); return j ? (JSON.parse(j) as GameState) : null; } catch { return null; }
  };

  /* ---------- market ---------- */
  function stepMarket() {
    const pool = unlocked();
    let ev: { k: string; m: number; _watch?: string; _brand?: string } | null = null;
    let evTxt = T.quietDay;
    if (rng() < 0.65) {
      const i = Math.floor(rng() * BONE_EVENTS_META.length);
      const meta = BONE_EVENTS_META[i];
      ev = { k: meta.k, m: meta.m };
      const tpl = T.events[i];
      if (meta.k === "watch") {
        const p2 = pool.filter((w) => (meta.hot ? w.tier === "grail" || w.tier === "hot" : true));
        const pw = pick(p2);
        ev._watch = pw.id;
        evTxt = tpl.replace("{W}", " " + wname(pw) + " ");
      } else if (meta.k === "brand") {
        const bs = LV.slice(0, S.level + 1).map((l) => l.brand as string);
        ev._brand = pick(bs);
        evTxt = tpl.replace("{B}", BONE_BRANDS[ev._brand]);
      } else evTxt = tpl;
    }
    for (const w of BONE_WATCHES) {
      S.prev[w.id] = S.prices[w.id];
      const noise = (rng() + rng() + rng() - 1.5) / 1.5;
      let p = S.prices[w.id] * (1 + w.drift + w.vol * noise);
      if (ev) {
        if (ev.k === "watch" && ev._watch === w.id) p *= ev.m;
        if (ev.k === "brand" && ev._brand === w.brand) p *= ev.m;
        if (ev.k === "hotAll" && (w.tier === "hot" || w.tier === "grail")) p *= ev.m;
        if (ev.k === "all") p *= ev.m;
      }
      S.prices[w.id] = Math.max(Math.round(p), Math.round(w.retail * 0.2));
    }
    S.news = evTxt;
  }
  const marketImpact = (id: string) => {
    S.prices[id] = Math.max(Math.round(S.prices[id] * 0.96), Math.round(W[id].retail * 0.2));
  };

  /* ---------- boutique ---------- */
  function relTier(b: string): { label: string; ok: boolean } {
    const hw = targetW();
    if (b !== lv().brand) return { label: "", ok: false };
    if (S.trophies.some((t) => t.wid === hw.id)) return { label: T.relOwn, ok: true };
    if (S.adOffer) return { label: T.relOffer, ok: true };
    const ratio = S.pts[b] / hw.req;
    if (ratio >= 1) return { label: T.relReady, ok: true };
    if (ratio >= 0.5) return { label: T.relHalf, ok: false };
    return { label: T.relCold, ok: false };
  }
  function saLine(b: string): string {
    const hw = targetW();
    if (S.adOffer) return T.saOffer;
    if (S.pts[b] >= hw.req) return T.saReady;
    if (S.pts[b] >= hw.req * 0.5) return T.saHalf;
    if (pendingPts(b) > 0) return T.saPend;
    return T.saCold;
  }
  function rollAdCalls(): { expiredCard: RevealCard | null; callCard: RevealCard | null } {
    const b = lv().brand;
    const hw = targetW();
    let expiredCard: RevealCard | null = null;
    if (S.adOffer) {
      expiredCard = { k: T.rvBoutiqueK, t: T.rvMissedT, b: fill(T.rvMissedB, { w: wname(hw) }) };
      S.pity[b] = 0;
      S.adOffer = null;
    }
    let callCard: RevealCard | null = null;
    if (S.pts[b] >= hw.req) {
      const p = 0.3 + 0.15 * S.pity[b];
      if (rng() < p) {
        S.adOffer = { wid: hw.id, brand: b, price: hw.retail };
        callCard = {
          k: T.rvCallK,
          t: fill(T.rvCallT, { w: wname(hw) }),
          b: fill(T.rvCallB, { b: BONE_BRANDS[b], x: fmt(hw.retail), y: fmt(S.prices[hw.id]) }),
        };
      } else {
        S.pity[b]++;
        if (S.pity[b] >= 2) callCard = { k: T.rvBoutiqueK, t: T.rvNoCallT, b: T.rvNoCallB };
      }
    }
    return { expiredCard, callCard };
  }

  /* ---------- trades ---------- */
  function addHolding(id: string, paid: number, src: "mkt" | "ad", fake: boolean): Holding {
    const w = W[id];
    const h: Holding = { id, paid, src, fake, fakeFound: false, pend: null, listed: false, listAge: 0, offer: null };
    if (src === "ad") h.pend = { b: w.brand, pts: w.retail, vestDay: S.levelDay + VEST_DAYS };
    S.inv.push(h);
    S.trades++;
    return h;
  }
  function cancelPendIfEarly(h: Holding): number {
    if (h.pend && S.levelDay < h.pend.vestDay) { const lost = h.pend.pts; h.pend = null; return lost; }
    if (h.pend) { S.pts[h.pend.b] += h.pend.pts; h.pend = null; }
    return 0;
  }
  function doBuyListing(uid: number) {
    const l = S.listings.find((x) => x.uid === uid);
    if (!l || l.bought) return;
    if (S.cash < l.ask) { toast(T.tNoCash); return; }
    S.cash -= l.ask;
    l.bought = true;
    addHolding(l.wid, l.ask, "mkt", l.fake);
    if (l.fake) S.fakesBought++;
    save(); renderAll();
    toast(fill(T.tBought, { w: wname(W[l.wid]) }));
  }
  function doSource(id: string) {
    const price = Math.round(S.prices[id] * SOURCE_FEE);
    if (S.cash < price) { toast(T.tNoCash); return; }
    S.cash -= price;
    addHolding(id, price, "mkt", false);
    save(); renderAll();
    toast(fill(T.tSourced, { w: wname(W[id]) }));
  }
  function doBuyAD(id: string, price: number, viaOffer: boolean): boolean {
    if (S.cash < price) { toast(T.tNoCash); return false; }
    const w = W[id];
    if (!viaOffer && S.adBuysToday >= AD_DAILY_LIMIT) { toast(T.tAdLimit); return false; }
    S.cash -= price;
    if (!viaOffer) S.adBuysToday++;
    if (w.tier === "bone") S.bones++;
    if (w.tier === "entry") S.adStock[id] = false;
    if (viaOffer && (w.tier === "grail" || w.tier === "hot")) {
      S.adOffer = null;
      S.pts[w.brand] += w.retail;
      S.trades++;
      if (navigator.vibrate) navigator.vibrate([30, 60, 30]);
      levelComplete(w);
      return true;
    }
    addHolding(id, price, "ad", false);
    save(); renderAll();
    return true;
  }
  function doDealer(i: number) {
    const h = S.inv[i];
    if (!h) return;
    const p = h.fakeFound ? SCRAP : Math.round(S.prices[h.id] * (0.65 + rng() * 0.07));
    const lost = cancelPendIfEarly(h);
    S.cash += p;
    S.inv.splice(i, 1);
    S.trades++;
    if (!h.fakeFound) marketImpact(h.id);
    save(); renderAll();
    toast(fill(T.tDealer, { x: fmt(p) }) + (lost ? fill(T.tLostCredit, { x: fmt(lost) }) : ""));
  }
  function doList(i: number) {
    const h = S.inv[i];
    if (!h || h.listed || h.fakeFound) return;
    if (S.inv.filter((x) => x.listed).length >= 6) { toast(T.tMaxListings); return; }
    h.listed = true;
    h.listAge = 0;
    save(); renderAll();
    toast(T.tListed);
  }
  function doWithdraw(i: number) {
    const h = S.inv[i];
    if (!h) return;
    h.listed = false;
    h.offer = null;
    h.listAge = 0;
    save(); renderAll();
    toast(T.tWithdrawn);
  }
  function doAccept(i: number) {
    const h = S.inv[i];
    if (!h || !h.offer) return;
    const net = Math.round(h.offer.price * (1 - CONSIGN_FEE));
    const lost = cancelPendIfEarly(h);
    S.cash += net;
    S.inv.splice(i, 1);
    S.trades++;
    marketImpact(h.id);
    save(); renderAll();
    toast(fill(T.tSold, { x: fmt(net) }) + (lost ? fill(T.tLostCredit, { x: fmt(lost) }) : ""));
  }
  function doDecline(i: number) {
    const h = S.inv[i];
    if (!h) return;
    h.offer = null;
    save(); renderAll();
    toast(T.tDeclined);
  }
  function doAuth(uid: number) {
    const l = S.listings.find((x) => x.uid === uid);
    if (!l || l.authed) return;
    if (S.cash < AUTH_FEE) { toast(T.tNoCash); return; }
    S.cash -= AUTH_FEE;
    l.authed = true;
    save(); renderAll();
    toast(l.fake ? T.tAuthFake : T.tAuthReal);
  }

  /* ---------- level flow ---------- */
  function levelComplete(w: BoneWatch) {
    let liquid = 0;
    for (const h of S.inv) liquid += h.fakeFound ? SCRAP : Math.round(S.prices[h.id] * 0.97);
    S.inv = [];
    S.cash += liquid;
    S.trophies.push({ wid: w.id, level: S.level + 1 });
    const L = lv();
    const profit = S.cash - L.cash;
    const trophyGain = profit + S.prices[w.id];
    S.results.push({ level: L.n, brand: L.brand, days: S.levelDay, limit: L.days, profit: trophyGain, liquid });
    save();
    track("bone_level_complete", { level: L.n, days: S.levelDay });
    const last = S.level >= LV.length - 1;
    pendingSettle = `<div class="sub">${fill(T.lcHead, { n: L.n })}</div><h2>${fill(T.lcTitle, { w: wname(w) })}</h2>
      <div class="quote">${T.lcQuote}</div>
      <div class="stats">
        <div><div class="l">${T.lcUsed}</div><div class="v">${fill(T.lcUsedV, { d: S.levelDay, max: L.days })}</div></div>
        <div><div class="l">${T.lcGain}</div><div class="v ${trophyGain >= 0 ? "up" : "down"}">${trophyGain >= 0 ? "+" : "−"}${fmt(Math.abs(trophyGain))}</div></div>
        <div><div class="l">${T.lcCashPl}</div><div class="v ${profit >= 0 ? "up" : "down"}">${profit >= 0 ? "+" : "−"}${fmt(Math.abs(profit))}</div></div>
        <div><div class="l">${fill(T.lcMarketOf, { w: wname(w).split(" ")[0] })}</div><div class="v">${fmt(S.prices[w.id])}</div></div>
      </div>
      ${liquid ? `<p class="dim">${fill(T.lcLiquid, { x: fmt(liquid) })}</p>` : ""}
      <p class="dim">${fill(T.lcTrophyNote, { w: wname(w) })}</p>
      <div id="modalBtns"><button class="btn primary" ${last ? "data-endgame" : "data-nextlevel"}>${
        last ? T.lcFinal : fill(T.lcNext, { n: L.n + 1, b: BONE_BRANDS[LV[S.level + 1].brand] })
      }</button></div>`;
    openCeremony(w.id, fill(T.lcHead, { n: L.n }), T.ceremonyQuote, true);
  }
  function levelFail() {
    const L = lv();
    track("bone_level_fail", { level: L.n });
    modal(`<div class="sub">${fill(T.lfHead, { n: L.n })}</div><h2>${T.lfTitle}</h2>
      <div class="quote">${T.lfQuote}</div>
      <p class="dim">${fill(T.lfBody, { d: L.days, w: wname(targetW()) })}</p>
      <div id="modalBtns"><button class="btn primary" data-retry>${fill(T.lfRetry, { n: L.n })}</button></div>`);
  }
  function endGameModal() {
    S.done = true;
    save();
    track("bone_complete", { pl: S.results.reduce((a, r) => a + r.profit, 0) });
    const total = S.results.reduce((a, r) => a + r.profit, 0);
    const daysUsed = S.results.reduce((a, r) => a + r.days, 0);
    let title: string, line: string;
    if (total >= 500000) { title = T.egT1; line = T.egL1; }
    else if (total >= 0) { title = T.egT2; line = T.egL2; }
    else { title = T.egT3; line = T.egL3; }
    modal(`<div class="sub">${T.egHead}</div><h2>${title}</h2>
      <p>${line}</p>
      <div class="stats">
        <div><div class="l">${T.egPl}</div><div class="v ${total >= 0 ? "up" : "down"}">${total >= 0 ? "+" : "−"}${fmt(Math.abs(total))}</div></div>
        <div><div class="l">${T.egDays}</div><div class="v">${fill(T.egDaysV, { d: daysUsed })}</div></div>
        <div><div class="l">${T.egBones}</div><div class="v">${fill(T.egBonesV, { n: S.bones })}</div></div>
        <div><div class="l">${T.egFakes}</div><div class="v">${fill(T.egFakesV, { n: S.fakesBought })}</div></div>
      </div>
      <p class="dim">${fill(T.egTrophies, { list: S.trophies.map((t) => wname(W[t.wid])).join(" · ") })}</p>
      <div id="modalBtns"><button class="btn primary" data-restart>${T.egAgain}</button></div>`);
  }

  /* ---------- rendering ---------- */
  const chgHtml = (id: string) => {
    const a = S.prices[id], b = S.prev[id];
    if (Math.abs(a / b - 1) < 0.0005) return '<span class="flat">—</span>';
    return a > b ? `<span class="up">▲ ${pct(a, b)}</span>` : `<span class="down">▼ ${pct(a, b)}</span>`;
  };
  const iconHtml = (w: BoneWatch) =>
    BONE_IMG[w.id]
      ? `<img class="thumbImg" src="${BONE_IMG[w.id]}" alt="${wname(w)}">`
      : `<div class="dot" style="background:${w.dial}"></div>`;

  function renderMarket(): string {
    let h = `<div class="secHead"><b>${T.secListings}</b><span>${T.secListingsSub}</span></div>`;
    if (!S.listings.length) h += `<div class="empty">${T.noListings}</div>`;
    for (const l of S.listings) {
      const w = W[l.wid];
      const diff = l.ask / S.prices[l.wid] - 1;
      const diffTxt = Math.abs(diff) < 0.02 ? T.atMarket : diff < 0 ? fill(T.underMarket, { p: Math.round(-diff * 100) }) : fill(T.overMarket, { p: Math.round(diff * 100) });
      const verdict = l.authed ? (l.fake ? `<div class="verdict down">${T.verdictFake}</div>` : `<div class="verdict up">${T.verdictReal}</div>`) : "";
      h += `<div class="listing ${l.bought ? "gone" : ""}">
        <div class="lrow">
          ${iconHtml(w)}
          <div class="rmain">
            <div class="rname">${wname(w)}<span class="tag exp">${l.bought ? T.soldTag : T.expTonight}</span></div>
            <div class="rsub">${BONE_BRANDS[w.brand]} · ${fill(T.seller, { s: l.seller })}</div>
          </div>
          <div class="rside"><div class="rprice">${fmt(l.ask)}</div><div class="rchg ${diff < -0.02 ? "up" : diff > 0.02 ? "down" : "flat"}">${diffTxt}</div></div>
        </div>
        <div class="flavor ${l.sus ? "sus" : ""}">${l.sus ? "⚠ " : ""}${l.flavor}</div>
        ${verdict}
        ${l.bought ? "" : `<div class="lbtns">
          ${l.authed ? "" : `<button class="btn ghost" data-auth="${l.uid}">${fill(T.authBtn, { x: fmt(AUTH_FEE) })}</button>`}
          <button class="btn" data-buylist="${l.uid}" ${l.authed && l.fake ? "disabled" : ""}>${fill(T.buyBtn, { x: fmt(l.ask) })}</button>
        </div>`}
      </div>`;
    }
    h += `<div class="secHead"><b>${T.secPrices}</b><span>${T.secPricesSub}</span></div>`;
    for (const w of unlocked()) {
      h += `<div class="row">
        ${iconHtml(w)}
        <div class="rmain">
          <div class="rname">${wname(w)}<span class="chip ${w.tier === "bone" ? "bone" : ""}">${T.tier[w.tier]}</span></div>
          <div class="rsub">${BONE_BRANDS[w.brand]}</div>
        </div>
        <div class="rside"><div class="rprice">${fmt(S.prices[w.id])}</div><div class="rchg">${chgHtml(w.id)}</div></div>
        <button class="btn ghost" data-source="${w.id}">${T.sourceBtn}</button>
      </div>`;
    }
    return h;
  }

  function renderBoutique(): string {
    let h = `<div id="brandSeg">`;
    LV.forEach((L, i) => {
      const state = i < S.level ? "done" : i === S.level ? "cur" : "locked";
      const dot = state === "cur" && (S.adOffer || BONE_WATCHES.some((w) => w.brand === L.brand && w.tier === "entry" && S.adStock[w.id]));
      h += `<button class="${state === "done" ? "done" : state === "locked" ? "locked" : "on"}">
        ${dot ? '<span class="ndot"></span>' : ""}
        <span class="mono">${state === "done" ? "✓" : state === "locked" ? "🔒" : BONE_MONO[L.brand]}</span>
        <span class="bl">${BONE_BRANDS[L.brand].split(" ")[0]}</span></button>`;
    });
    h += `</div>`;
    const b = lv().brand;
    const hw = targetW();
    const tier = relTier(b);
    const pend = pendingPts(b);
    if (S.adOffer) {
      const w = W[S.adOffer.wid];
      h += `<div class="listing invite">
        <div class="lrow">${iconHtml(w)}
        <div class="rmain"><div class="rname">${wname(w)}<span class="chip">${T.allocChip}</span></div>
        <div class="rsub">${T.allocSub}</div></div>
        <div class="rside"><div class="rprice">${fmt(S.adOffer.price)}</div><div class="rchg up">${fill(T.marketAt, { x: fmt(S.prices[w.id]) })}</div></div></div>
        <div class="lbtns"><button class="btn" data-adbuy="${w.id}" data-price="${S.adOffer.price}" data-via="1">${fill(T.orderBtn, { x: fmt(S.adOffer.price) })}</button></div>
      </div>`;
    }
    h += `<div class="relHead">
      <div class="rh1"><span class="bn">${BONE_BRANDS[b]}</span><span class="tier ${tier.ok ? "up" : ""}">${tier.label}</span></div>
      <div class="pts">${fill(T.credit, { x: fmt(S.pts[b]), y: fmt(hw.req) })}${pend ? `　<span class="pend">${fill(T.creditPend, { x: fmt(pend), d: VEST_DAYS })}</span>` : ""}</div>
      <div class="progress"><i style="width:${Math.min(100, (S.pts[b] / hw.req) * 100)}%"></i></div>
      <div class="sa"><span class="saAva">${BONE_MONO[b]}</span>${saLine(b)}</div>
    </div>`;
    if (S.adBuysToday >= AD_DAILY_LIMIT) h += `<div class="lockline" style="margin-bottom:6px">${T.dailyLimit}</div>`;
    for (const w of BONE_WATCHES.filter((x) => x.brand === b)) {
      const isHot = w.tier === "grail" || w.tier === "hot";
      const mkt = S.prices[w.id];
      const inStock = w.tier === "bone" || (w.tier === "entry" && S.adStock[w.id]);
      const limitHit = S.adBuysToday >= AD_DAILY_LIMIT;
      let note = "", btn = "", cls = "";
      if (isHot) {
        if (S.adOffer && S.adOffer.wid === w.id) { note = `<div class="adNote ok">${T.hotOfferNote}</div>`; btn = ""; }
        else if (S.pts[b] >= w.req) { note = `<div class="lockline">${T.hotReadyNote}</div>`; btn = `<button class="btn ghost" data-adlock="${w.id}">${T.pushBtn}</button>`; }
        else { note = `<div class="lockline">${fill(T.hotNeedNote, { x: fmt(w.req - S.pts[b]) })}</div>`; btn = `<button class="btn ghost" data-adlock="${w.id}">${T.askBtn}</button>`; }
      } else if (w.tier === "entry" && !inStock) {
        cls = "noStock";
        note = `<div class="lockline">${T.noStockNote}</div>`;
        btn = `<button class="btn ghost" disabled>${T.noStockBtn}</button>`;
      } else {
        const loss = w.retail - mkt;
        note = loss > 0
          ? `<div class="adNote">${fill(T.boneNote, { x: fmt(mkt), y: fmt(loss) })}</div>`
          : `<div class="adNote ok">${fill(T.entryOkNote, { x: fmt(mkt) })}</div>`;
        btn = `<button class="btn" data-adbuy="${w.id}" data-price="${w.retail}" ${limitHit ? "disabled" : ""}>${T.retailBuyBtn}</button>`;
      }
      h += `<div class="row ${cls}">
        ${iconHtml(w)}
        <div class="rmain">
          <div class="rname">${wname(w)}<span class="chip ${w.tier === "bone" ? "bone" : ""}">${T.tier[w.tier]}</span>${w.tier === "entry" && inStock ? `<span class="stockTag">${T.inStockTag}</span>` : ""}</div>
          <div class="rsub">${fill(T.retailLine, { x: fmt(w.retail), d: VEST_DAYS })}</div>
          ${note}
        </div>${btn}</div>`;
    }
    return h;
  }

  function renderCollection(): string {
    const nw = netWorth();
    let h = `<div id="nwCard">
      <div><div class="l">${T.cash}</div><div class="v">${fmt(S.cash)}</div></div>
      <div><div class="l">${T.colValue}</div><div class="v">${fmt(nw - S.cash)}</div></div>
      <div><div class="l">${T.netWorth}</div><div class="v ${nw >= lv().cash ? "up" : "down"}">${fmt(nw)}</div></div>
    </div>`;
    if (S.trophies.length) {
      h += `<div class="secHead"><b>${T.secTrophies}</b><span class="cnt">${S.trophies.length}/3</span></div>`;
      for (const t of S.trophies) {
        const w = W[t.wid];
        h += `<div class="row" data-trophy="${t.wid}" data-tlv="${t.level}">
          ${iconHtml(w)}
          <div class="rmain">
            <div class="rname">${wname(w)}<span class="tag trophy">${fill(T.trophyChip, { n: t.level })}</span></div>
            <div class="rsub">${BONE_BRANDS[w.brand]} · ${T.trophySub}</div>
          </div><button class="btn ghost" data-trophy="${t.wid}" data-tlv="${t.level}">${T.trophyView}</button></div>`;
      }
    }
    if (!S.inv.length) return h + (S.trophies.length ? "" : `<div class="empty">${T.emptyCol}</div>`);
    const withIdx: [Holding, number][] = S.inv.map((x, i) => [x, i]);
    const offers = withIdx.filter(([x]) => x.offer);
    const listed = withIdx.filter(([x]) => x.listed && !x.offer);
    const vault = withIdx.filter(([x]) => !x.listed && !x.offer);
    const card = ([hld, i]: [Holding, number]): string => {
      const w = W[hld.id];
      const mkt = S.prices[hld.id];
      const pendNote = hld.pend
        ? `<div class="plline" style="color:var(--be-brass)">${
            S.levelDay >= hld.pend.vestDay ? fill(T.pendVestTonight, { x: fmt(hld.pend.pts) }) : fill(T.pendVestWait, { x: fmt(hld.pend.pts), d: hld.pend.vestDay - S.levelDay })
          }</div>`
        : "";
      let body = "", btns = "";
      if (hld.fakeFound) {
        body = `<div class="plline down">${T.fakeLine}</div>`;
        btns = `<div class="lbtns"><button class="btn sell" data-dealer="${i}">${fill(T.sellScrap, { x: fmt(SCRAP) })}</button></div>`;
      } else if (hld.offer) {
        const net = Math.round(hld.offer.price * (1 - CONSIGN_FEE));
        body = `<div class="offerBox"><div class="ot">${T.offerHead}</div>
          <div class="ov">${fmt(hld.offer.price)} <span class="flat" style="font-size:12px">${fill(T.offerPct, { p: Math.round((hld.offer.price / mkt) * 100) })}</span></div>
          <div class="on2">${fill(T.offerNet, { x: fmt(net) })}</div></div>`;
        btns = `<div class="lbtns"><button class="btn ghost" data-decline="${i}">${T.declineBtn}</button><button class="btn" data-accept="${i}">${fill(T.acceptBtn, { x: fmt(net) })}</button></div>`;
      } else if (hld.listed) {
        const ch = Math.round(OFFER_CHANCE[Math.min(hld.listAge, 3)] * 100);
        body = `<div class="plline flat">${fill(T.listedLine, { n: hld.listAge + 1, p: ch })}</div>`;
        btns = `<div class="lbtns"><button class="btn ghost" data-withdraw="${i}">${T.withdrawBtn}</button></div>`;
      } else {
        btns = `<div class="lbtns"><button class="btn" data-listit="${i}">${T.listBtn}</button><button class="btn ghost" data-dealer="${i}">${fill(T.dealerBtn, { x: fmt(Math.round(mkt * 0.68)) })}</button></div>`;
      }
      const pl = (hld.fakeFound ? SCRAP : mkt) - hld.paid;
      return `<div class="listing">
        <div class="lrow">${iconHtml(w)}
        <div class="rmain">
          <div class="rname">${wname(w)}${hld.src === "ad" ? `<span class="chip">${T.retailChip}</span>` : ""}${hld.listed ? `<span class="tag listed">${T.listedTag}</span>` : ""}${hld.fakeFound ? `<span class="tag fake">${T.fakeTag}</span>` : ""}</div>
          <div class="rsub">${fill(T.paidMarket, { x: fmt(hld.paid), y: fmt(mkt) })}</div>
          <div class="plline ${pl >= 0 ? "up" : "down"}">${fill(T.paper, { sign: pl >= 0 ? "+" : "−", x: fmt(Math.abs(pl)) })}</div>
          ${pendNote}
        </div></div>
        ${body}${btns}
      </div>`;
    };
    if (offers.length) h += `<div class="secHead"><b>${T.offerHead}</b><span class="cnt">${offers.length}</span></div>` + offers.map(card).join("");
    if (listed.length) h += `<div class="secHead"><b>${T.listedTag}</b><span class="cnt">${listed.length}</span></div>` + listed.map(card).join("");
    if (vault.length) h += `<div class="secHead"><b>${T.tabCollection}</b><span class="cnt">${vault.length}</span></div>` + vault.map(card).join("");
    return h;
  }

  function renderPanel() {
    $("#bePanel").innerHTML = tab === "M" ? renderMarket() : tab === "A" ? renderBoutique() : renderCollection();
  }
  function animateCash(to: number) {
    const el = $("#beCash");
    if (lastCash === null || Math.abs(to - lastCash) < 1) { el.textContent = fmt(to); lastCash = to; return; }
    const from = lastCash;
    lastCash = to;
    const t0 = performance.now();
    cancelAnimationFrame(cashAnim);
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 550);
      el.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) cashAnim = requestAnimationFrame(tick);
    };
    cashAnim = requestAnimationFrame(tick);
  }
  function renderTop() {
    const L = lv();
    const hw = targetW();
    $("#beDay").textContent = `L${L.n} · DAY ${S.levelDay}/${L.days}`;
    animateCash(S.cash);
    $("#beNw").textContent = fmt(netWorth());
    $("#beNews").textContent = S.news;
    $("#beGoalT").textContent = fill(T.plan, { n: L.n, NAME: wname(hw).split(" ")[0].toUpperCase() });
    ($("#beGoalBar") as HTMLElement).style.width = Math.min(100, (S.pts[L.brand] / hw.req) * 100) + "%";
    $("#beGoalX").textContent = fill(T.goalRemain, { x: fmt(S.pts[L.brand]), y: fmt(hw.req), d: L.days - S.levelDay + 1 });
    const offers = S.inv.filter((h) => h.offer).length;
    $("#beNext").textContent = S.adOffer ? T.closeOffer : offers ? fill(T.closeOffers, { n: offers }) : S.levelDay >= L.days ? T.closeLastDay : T.closeDefault;
    const hold = netWorth() - S.cash;
    let stakes = fill(T.stHold, { x: fmt(hold) });
    if (!S.adOffer && S.pts[L.brand] >= hw.req) stakes += " · " + T.stWaitCall;
    const live = S.listings.filter((l) => !l.bought).length;
    if (live) stakes += " · " + fill(T.stExpire, { n: live });
    const listedN = S.inv.filter((h) => h.listed && !h.offer).length;
    if (listedN) stakes += " · " + fill(T.stListed, { n: listedN });
    $("#beStakes").textContent = stakes;
    const bdgC = $("#bdgC");
    bdgC.className = offers ? "bdg" : "";
    bdgC.textContent = offers ? String(offers) : "";
    const bdgA = $("#bdgA");
    bdgA.className = S.adOffer || BONE_WATCHES.some((w) => w.brand === L.brand && w.tier === "entry" && S.adStock[w.id]) ? "bdot" : "";
  }
  function renderAll() { renderTop(); renderPanel(); }

  /* ---------- modal / toast / ceremony ---------- */
  function toast(msg: string) {
    const t = $("#beToast");
    t.textContent = msg;
    t.classList.add("show");
    if (toastT) clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }
  const modal = (html: string) => { $("#beModal").innerHTML = html; $("#beModalWrap").classList.add("show"); };
  const closeModal = () => $("#beModalWrap").classList.remove("show");

  function openCeremony(wid: string, kText: string, sText: string, ceremony: boolean) {
    tvMode = ceremony ? "ceremony" : "view";
    const w = W[wid];
    $("#tvK").textContent = kText || BONE_BRANDS[w.brand];
    $("#tvN").textContent = wname(w);
    $("#tvS").textContent = sText || "";
    $("#tvBtn").textContent = ceremony ? T.ceremonyBtn : T.ceremonyClose;
    const im = $("#tvImg") as HTMLImageElement;
    im.style.animation = "none";
    void im.offsetWidth;
    im.style.animation = "";
    im.src = BONE_IMG[wid] || "";
    $("#beTv").classList.add("show");
    if (ceremony) {
      const ring = $("#beRing");
      ring.classList.remove("go");
      void ring.offsetWidth;
      ring.classList.add("go");
    }
  }
  function closeCeremony() {
    $("#beTv").classList.remove("show");
    if (tvMode === "ceremony" && pendingSettle) { const h = pendingSettle; pendingSettle = null; modal(h); }
    renderAll();
  }

  /* ---------- close day ---------- */
  function runCloseDay() {
    const L = lv();
    const nwBefore = netWorth();
    const passed = S.listings.filter((l) => !l.bought);
    let passedCard: RevealCard | null = null;
    if (passed.length) {
      const l = pick(passed);
      const w = W[l.wid];
      if (l.fake) passedCard = { k: T.rvYesterday, t: fill(T.rvPassedFakeT, { w: wname(w) }), b: T.rvPassedFakeB };
      else if (rng() < 0.6) {
        const soldAt = Math.round(l.ask * (1 + rng() * 0.12));
        passedCard = { k: T.rvYesterday, t: fill(T.rvSoldT, { w: wname(w) }), b: fill(T.rvSoldB, { x: fmt(soldAt) }) + (soldAt > l.ask ? T.rvSoldHigher : ".") };
      } else passedCard = { k: T.rvYesterday, t: fill(T.rvUnsoldT, { w: wname(w) }), b: T.rvUnsoldB };
    }
    let expiredOffers = 0;
    for (const h of S.inv) if (h.offer) { h.offer = null; expiredOffers++; }
    stepMarket();
    let fakeCard: RevealCard | null = null;
    for (const h of S.inv) {
      if (h.fake && !h.fakeFound) {
        h.fakeFound = true;
        h.listed = false;
        h.offer = null;
        fakeCard = { k: T.rvAppraiser, t: fill(T.rvFakeT, { w: wname(W[h.id]) }), b: fill(T.rvFakeB, { x: fmt(SCRAP) }) };
        break;
      }
    }
    const newOffers: Holding[] = [];
    for (const h of S.inv) {
      if (!h.listed || h.offer || h.fakeFound) continue;
      const ch = OFFER_CHANCE[Math.min(h.listAge, 3)];
      h.listAge++;
      if (rng() < ch) {
        const r = rng();
        let mult: number;
        if (r < 0.6) mult = 0.82 + rng() * 0.06;
        else if (r < 0.9) mult = 0.89 + rng() * 0.04;
        else mult = 0.94 + rng() * 0.03;
        h.offer = { price: Math.round(S.prices[h.id] * mult) };
        newOffers.push(h);
      }
    }
    let offerCard: RevealCard | null = null;
    if (newOffers.length) {
      const best = newOffers.reduce((a, b2) => ((b2.offer as { price: number }).price / S.prices[b2.id] > (a.offer as { price: number }).price / S.prices[a.id] ? b2 : a));
      const strong = (best.offer as { price: number }).price / S.prices[best.id] >= 0.94;
      offerCard = {
        k: T.rvOffersK,
        t: (strong ? T.rvOfferStrong : T.rvOfferNormal) + wname(W[best.id]) + " " + fmt((best.offer as { price: number }).price),
        b: (newOffers.length > 1 ? fill(T.rvOfferMore, { n: newOffers.length - 1 }) : "") + T.rvOfferDeadline,
      };
    } else if (S.inv.some((h) => h.listed && !h.fakeFound)) {
      offerCard = { k: T.rvOffersK, t: T.rvNoOfferT, b: T.rvNoOfferB };
    }
    const vested: Record<string, number> = {};
    for (const h of S.inv) {
      if (h.pend && S.levelDay + 1 >= h.pend.vestDay) {
        S.pts[h.pend.b] += h.pend.pts;
        vested[h.pend.b] = (vested[h.pend.b] || 0) + h.pend.pts;
        h.pend = null;
      }
    }
    let vestCard: RevealCard | null = null;
    const vb = Object.keys(vested);
    if (vb.length) vestCard = { k: T.rvBoutiqueK, t: T.rvVestT, b: fill(T.rvVestB, { list: vb.map((b2) => BONE_BRANDS[b2] + " +" + fmt(vested[b2])).join(", ") }) };
    const { expiredCard, callCard } = rollAdCalls();
    rollAdStock();
    S.adBuysToday = 0;
    S.listings = S.tomorrow;
    S.tomorrow = genListings();
    const teaserNow = S.teaser;
    S.teaser = makeTeaser(S.tomorrow);
    S.levelDay++;
    if (S.levelDay > L.days) { save(); levelFail(); return; }
    const nwAfter = netWorth();
    const d = nwAfter - nwBefore;
    let mover: BoneWatch | null = null;
    let mv = 0;
    for (const w of unlocked()) {
      const c = Math.abs(S.prices[w.id] / S.prev[w.id] - 1);
      if (c > mv) { mv = c; mover = w; }
    }
    revealQueue = [];
    revealQueue.push({
      k: fill(T.rvBeforeOpen, { n: L.n, d: S.levelDay }),
      t: d >= 0 ? T.rvUp : T.rvDown,
      num: (d >= 0 ? "+" : "−") + fmt(Math.abs(d)),
      cls: d >= 0 ? "up" : "down",
      b: fill(T.rvTotal, { x: fmt(nwAfter) }) + (expiredOffers ? " · " + fill(T.rvExpired, { n: expiredOffers }) : ""),
    });
    if (mover && mv > 0.02)
      revealQueue.push({
        k: T.rvMover,
        t: wname(mover) + " " + (S.prices[mover.id] > S.prev[mover.id] ? "▲" : "▼") + " " + pct(S.prices[mover.id], S.prev[mover.id]),
        b: fill(T.rvNowAt, { x: fmt(S.prices[mover.id]) }),
        cls: S.prices[mover.id] > S.prev[mover.id] ? "up" : "down",
      });
    revealQueue.push({ k: T.rvNews, t: S.news });
    if (passedCard) revealQueue.push(passedCard);
    if (fakeCard) revealQueue.push(fakeCard);
    if (offerCard) revealQueue.push(offerCard);
    if (vestCard) revealQueue.push(vestCard);
    if (expiredCard) revealQueue.push(expiredCard);
    if (callCard) revealQueue.push(callCard);
    const daysLeft = L.days - S.levelDay + 1;
    revealQueue.push({ k: T.rvTomorrow, t: teaserNow || S.teaser, b: daysLeft <= 3 ? fill(T.rvDaysLeft, { d: daysLeft }) : "", last: true });
    save();
    showReveal();
  }
  function showReveal() {
    const c = revealQueue.shift();
    if (!c) { $("#beReveal").classList.remove("show"); renderAll(); return; }
    const card = $("#beRevealCard");
    card.style.animation = "none";
    void card.offsetWidth;
    card.style.animation = "";
    card.innerHTML = `<div class="rc-k">${c.k}</div><div class="rc-t">${c.t}</div>
      ${c.num ? `<div class="rc-n ${c.cls || ""}">${c.num}</div>` : ""}
      ${c.b ? `<div class="rc-b">${c.b}</div>` : ""}
      ${c.last ? `<button class="btn primary" data-openday>${fill(T.openDay, { d: S.levelDay })}</button>` : ""}`;
    ($("#beRevealHint") as HTMLElement).style.display = c.last ? "none" : "block";
    $("#beReveal").classList.add("show");
    if (revealTimer) clearTimeout(revealTimer);
    if (!c.last) revealTimer = setTimeout(showReveal, 2100);
  }

  /* ---------- modals ---------- */
  function adLockModal(id: string) {
    const w = W[id];
    const ready = S.pts[w.brand] >= w.req;
    modal(`<div class="sub">${BONE_BRANDS[w.brand]}</div><h2>${wname(w)}</h2>
      <div class="quote">${ready ? T.mLockReadyQ : T.mLockNotQ}</div>
      <p class="dim">${ready ? T.mLockReadyB : fill(T.mLockNotB, { x: fmt(w.req - S.pts[w.brand]), d: VEST_DAYS })}</p>
      <div id="modalBtns"><button class="btn primary" data-close>${ready ? T.mLockReadyBtn : T.mLockNotBtn}</button></div>`);
  }
  function confirmAdBuy(id: string, price: number, via: boolean) {
    const w = W[id];
    modal(`<div class="sub">${via ? T.mAlloc : T.mBoutique}</div><h2>${wname(w)}</h2>
      <div class="mrow"><span>${T.mRetail}</span><span>${fmt(price)}</span></div>
      <div class="mrow"><span>${T.mCashAfter}</span><span>${fmt(S.cash - price)}</span></div>
      ${via ? `<div class="mrow"><span>${T.mResultRow}</span><span>${T.mClearRow}</span></div>` : `<div class="mrow"><span>${fill(T.mCreditRow, { d: VEST_DAYS })}</span><span>+${fmt(w.retail)}</span></div>`}
      <div id="modalBtns"><button class="btn ghost" data-close>${T.mThink}</button>
      <button class="btn primary" data-confirmad="${id}" data-price="${price}" data-via="${via ? 1 : ""}">${T.mConfirm}</button></div>`);
  }
  function levelIntroModal() {
    const L = lv();
    const hw = targetW();
    modal(`<div class="sub">${fill(T.liHead, { n: L.n, b: BONE_BRANDS[L.brand] })}</div><h2>${fill(T.liTarget, { w: wname(hw) })}</h2>
      <p class="dim">${T.levelIntro[S.level]}</p>
      <div class="stats">
        <div><div class="l">${T.liCash}</div><div class="v">${fmt(L.cash)}</div></div>
        <div><div class="l">${T.liDays}</div><div class="v">${fill(T.liDaysV, { d: L.days })}</div></div>
        <div><div class="l">${T.liReq}</div><div class="v">${fmt(hw.req)}</div></div>
        <div><div class="l">${T.liRetail}</div><div class="v">${fmt(hw.retail)}</div></div>
      </div>
      <div id="modalBtns"><button class="btn primary" data-close>${T.liGo}</button></div>`);
  }
  function introModal(hasSave: boolean) {
    modal(`<div class="sub">${T.inSub}</div><h2>${T.gameTitle}</h2>
      <p>${T.inP1}</p>
      <p class="dim">${fill(T.inP2, { d: VEST_DAYS })}</p>
      <p class="dim">${T.inDisclaimer}</p>
      <div id="modalBtns">
      ${hasSave
        ? `<button class="btn ghost" data-restart>${T.inRestart}</button><button class="btn primary" data-continue>${T.inContinue}</button>`
        : `<button class="btn primary" data-start>${T.inStart}</button>`}</div>`);
  }

  /* ---------- markup ---------- */
  root.innerHTML = `
  <div id="beApp">
    <div id="beTopbar">
      <div class="tb1"><button id="beBack" aria-label="Back">←</button><span class="logo">${T.gameTitle}</span></div>
      <div class="tb2"><span class="day" id="beDay"></span><div class="money"><b id="beCash"></b><span> · ${T.nwLabel} <span id="beNw"></span></span></div></div>
    </div>
    <div id="beTicker"><b>${T.newsLabel}</b><span id="beNews"></span></div>
    <div id="beGoal"><span class="gt" id="beGoalT"></span><div class="gbar"><i id="beGoalBar"></i></div><span class="gtxt" id="beGoalX"></span></div>
    <div id="bePanel"></div>
    <div id="beAction">
      <div id="beStakes"></div>
      <button id="beNext"></button>
      <div id="beNav">
        <button id="tabM"><span class="ic">◈</span><span class="lb">${T.tabMarket}</span><span id="bdgM"></span></button>
        <button id="tabA"><span class="ic">◆</span><span class="lb">${T.tabBoutique}</span><span id="bdgA"></span></button>
        <button id="tabC"><span class="ic">▣</span><span class="lb">${T.tabCollection}</span><span id="bdgC"></span></button>
      </div>
    </div>
  </div>
  <div id="beTv">
    <div id="tvImgWrap"><img id="tvImg" alt=""></div>
    <div id="beRing"></div>
    <div id="tvTop"><div class="k" id="tvK"></div><div class="n" id="tvN"></div><div class="s" id="tvS"></div></div>
    <div id="tvBottom"><button class="btn primary" id="tvBtn"></button></div>
  </div>
  <div id="beModalWrap"><div id="beModal"></div></div>
  <div id="beReveal"><div id="beRevealCard"></div><div id="beRevealHint">${T.tapContinue}</div></div>
  <div id="beToast"></div>`;

  /* ---------- events ---------- */
  const onClick = (e: Event) => {
    const t = (e.target as HTMLElement).closest(
      "[data-buylist],[data-auth],[data-source],[data-adbuy],[data-adlock],[data-confirmad],[data-confirmsource],[data-listit],[data-withdraw],[data-dealer],[data-accept],[data-decline],[data-nextlevel],[data-retry],[data-endgame],[data-close],[data-start],[data-continue],[data-restart],[data-trophy]"
    ) as HTMLElement | null;
    if (!t) return;
    const d = t.dataset;
    if (d.buylist) { doBuyListing(+d.buylist); return; }
    if (d.auth) { doAuth(+d.auth); return; }
    if (d.trophy) { openCeremony(d.trophy, BONE_BRANDS[W[d.trophy].brand] + " · L" + d.tlv, T.trophySub, false); return; }
    if (d.source) {
      const id = d.source;
      const price = Math.round(S.prices[id] * SOURCE_FEE);
      modal(`<div class="sub">${T.mSourceHead}</div><h2>${wname(W[id])}</h2>
        <div class="mrow"><span>${T.mSourceFee}</span><span>${fmt(price)}</span></div>
        <div class="mrow"><span>${T.mCashAfter}</span><span>${fmt(S.cash - price)}</span></div>
        <p class="dim">${T.mSourceNote}</p>
        <div id="modalBtns"><button class="btn ghost" data-close>${T.mThink}</button>
        <button class="btn primary" data-confirmsource="${id}">${T.mConfirm}</button></div>`);
      return;
    }
    if (d.confirmsource) { closeModal(); doSource(d.confirmsource); return; }
    if (d.adbuy) { confirmAdBuy(d.adbuy, +(d.price as string), !!d.via); return; }
    if (d.confirmad) {
      closeModal();
      const id = d.confirmad;
      const w = W[id];
      if (doBuyAD(id, +(d.price as string), !!d.via)) {
        if (!(w.tier === "grail" || w.tier === "hot")) {
          toast(w.tier === "bone" ? fill(T.tBone, { d: VEST_DAYS, x: fmt(w.retail) }) : fill(T.tEntry, { w: wname(w), d: VEST_DAYS, x: fmt(w.retail) }));
        }
      }
      return;
    }
    if (d.adlock) { adLockModal(d.adlock); return; }
    if (d.listit !== undefined && d.listit !== "") { doList(+d.listit); return; }
    if (d.withdraw !== undefined && d.withdraw !== "") { doWithdraw(+d.withdraw); return; }
    if (d.dealer !== undefined && d.dealer !== "") { doDealer(+d.dealer); return; }
    if (d.accept !== undefined && d.accept !== "") { doAccept(+d.accept); return; }
    if (d.decline !== undefined && d.decline !== "") { doDecline(+d.decline); return; }
    if (d.nextlevel !== undefined) { closeModal(); initLevel(S.level + 1); renderAll(); levelIntroModal(); return; }
    if (d.retry !== undefined) { closeModal(); initLevel(S.level); renderAll(); levelIntroModal(); return; }
    if (d.endgame !== undefined) { closeModal(); endGameModal(); return; }
    if (d.close !== undefined) { closeModal(); return; }
    if (d.start !== undefined) { closeModal(); save(); track("bone_start", {}); levelIntroModal(); return; }
    if (d.continue !== undefined) { closeModal(); return; }
    if (d.restart !== undefined) { newGame(); closeModal(); save(); renderAll(); levelIntroModal(); return; }
  };
  root.addEventListener("click", onClick);
  $("#tabM").onclick = () => { tab = "M"; setTab(); };
  $("#tabA").onclick = () => { tab = "A"; setTab(); };
  $("#tabC").onclick = () => { tab = "C"; setTab(); };
  function setTab() {
    $("#tabM").classList.toggle("on", tab === "M");
    $("#tabA").classList.toggle("on", tab === "A");
    $("#tabC").classList.toggle("on", tab === "C");
    renderPanel();
  }
  $("#beNext").onclick = () => { if (!S.done) runCloseDay(); };
  $("#tvBtn").onclick = closeCeremony;
  $("#beBack").onclick = onBack;
  $("#beReveal").addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("[data-openday]")) {
      if (revealTimer) clearTimeout(revealTimer);
      revealQueue = [];
      $("#beReveal").classList.remove("show");
      renderAll();
      return;
    }
    const cur = $("#beRevealCard");
    if (cur && !cur.querySelector("[data-openday]")) {
      if (revealTimer) clearTimeout(revealTimer);
      showReveal();
    }
  });

  /* ---------- boot ---------- */
  const prev = load();
  if (prev && !prev.done && prev.level !== undefined) S = prev;
  else newGame();
  tab = "A";
  setTab();
  renderAll();
  introModal(!!(prev && !prev.done && prev.level !== undefined));

  return () => {
    if (revealTimer) clearTimeout(revealTimer);
    if (toastT) clearTimeout(toastT);
    cancelAnimationFrame(cashAnim);
    root.removeEventListener("click", onClick);
    root.innerHTML = "";
  };
}

export default function BoneEater({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef(onBack);
  useEffect(() => {
    backRef.current = onBack;
  }, [onBack]);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return mountGame(el, lang, () => backRef.current());
  }, [lang]);
  return (
    <div style={{ position: "relative" }}>
      {/* Style lives OUTSIDE the engine's container — mountGame overwrites
          #be-root's innerHTML, which would delete an inline <style> child. */}
      <style dangerouslySetInnerHTML={{ __html: BE_CSS }} />
      <div id="be-root" ref={rootRef} />
    </div>
  );
}

// Scoped game styles. The game keeps its own dark-boutique world inside the
// light site — a deliberate single-theme space, entered like a shop after dark.
const BE_CSS = `
#be-root{
  --be-bg:#14120F; --be-surface:#1E1B16; --be-surface2:#26221B; --be-line:#3A342A;
  --be-ink:#EDE6D6; --be-dim:#9C9484; --be-brass:#C9A961; --be-brassd:#8A7440;
  --be-up:#6FBF8B; --be-down:#E06C5F;
  --be-serif:var(--font-display),Georgia,serif;
  background:var(--be-bg); color:var(--be-ink); font-size:15px; line-height:1.45;
}
#be-root *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
#beApp{display:flex;flex-direction:column;height:100dvh;max-width:560px;margin:0 auto;position:relative;overflow:hidden;overscroll-behavior:contain}
#beBack{flex:none;align-self:center;background:none;border:none;color:var(--be-dim);font-size:19px;padding:2px 8px 2px 0;cursor:pointer;border-radius:8px}
#beBack:hover{color:var(--be-brass)}
#beTopbar{padding:8px 14px 7px;border-bottom:1px solid var(--be-line);flex:none}
/* row 1 leaves the top-right corner to the site's fixed EN/繁 toggle pill */
#beTopbar .tb1{display:flex;align-items:center;gap:6px;padding-right:88px}
#beTopbar .tb2{display:flex;justify-content:space-between;align-items:baseline;margin-top:3px}
#beTopbar .logo{font-family:var(--be-serif);font-size:15px;letter-spacing:.08em;color:var(--be-brass);white-space:nowrap}
#beTopbar .day{font-size:11.5px;color:var(--be-dim);letter-spacing:.1em;white-space:nowrap}
#beTopbar .money{font-variant-numeric:tabular-nums;white-space:nowrap}
#beTopbar .money b{font-size:14px;font-weight:600}
#beTopbar .money span{font-size:11px;color:var(--be-dim)}
#beTicker{flex:none;padding:6px 14px;background:var(--be-surface);border-top:1px solid var(--be-line);
  font-size:12px;color:var(--be-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#beTicker b{color:var(--be-brass);font-weight:600;letter-spacing:.1em;margin-right:8px}
#beGoal{flex:none;display:flex;align-items:center;gap:10px;padding:7px 14px;background:var(--be-surface);
  border-top:1px solid var(--be-line);border-bottom:1px solid var(--be-line)}
#beGoal .gt{font-size:10.5px;letter-spacing:.2em;color:var(--be-brass);white-space:nowrap;font-weight:600}
#beGoal .gbar{flex:1;height:4px;background:var(--be-line);border-radius:2px;overflow:hidden}
#beGoal .gbar i{display:block;height:100%;background:var(--be-brass);border-radius:2px;transition:width .5s}
#beGoal .gtxt{font-size:11px;color:var(--be-dim);font-variant-numeric:tabular-nums;white-space:nowrap}
#bePanel{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 14px 150px;overscroll-behavior:contain}
#be-root .row{display:flex;align-items:center;gap:11px;padding:11px 0;border-bottom:1px solid var(--be-line)}
#be-root .row:last-child{border-bottom:none}
#be-root .dot{flex:none;width:30px;height:30px;border-radius:50%;border:2px solid var(--be-line)}
#be-root .thumbImg{flex:none;width:34px;height:46px;object-fit:contain}
#be-root .rmain{flex:1;min-width:0}
#be-root .rname{font-family:var(--be-serif);font-size:15px;display:flex;align-items:center;gap:7px;flex-wrap:wrap}
#be-root .rsub{font-size:11px;color:var(--be-dim);letter-spacing:.12em;text-transform:uppercase;margin-top:1px}
#be-root .chip{flex:none;font-size:10px;letter-spacing:.08em;padding:1.5px 6px;border-radius:3px;border:1px solid var(--be-brassd);color:var(--be-brass)}
#be-root .chip.bone{border-color:var(--be-line);color:var(--be-dim)}
#be-root .rside{text-align:right;font-variant-numeric:tabular-nums;flex:none}
#be-root .rprice{font-size:14.5px}
#be-root .rchg{font-size:12px;margin-top:1px}
#be-root .up{color:var(--be-up)} #be-root .down{color:var(--be-down)} #be-root .flat{color:var(--be-dim)}
#be-root .btn{flex:none;background:var(--be-surface2);border:1px solid var(--be-brassd);color:var(--be-brass);
  font-size:13px;letter-spacing:.08em;padding:7px 13px;border-radius:5px;cursor:pointer}
#be-root .btn:active{background:var(--be-brass);color:var(--be-bg)}
#be-root .btn.ghost{border-color:var(--be-line);color:var(--be-dim)}
#be-root .btn[disabled]{opacity:.35;pointer-events:none}
#be-root .btn.sell{border-color:var(--be-line);color:var(--be-ink)}
#brandSeg{position:sticky;top:0;z-index:5;display:flex;background:var(--be-bg);padding:6px 0 8px;gap:8px}
#brandSeg button{flex:1;position:relative;background:var(--be-surface);border:1px solid var(--be-line);border-radius:8px;
  padding:7px 0 5px;color:var(--be-dim);cursor:pointer}
#brandSeg button .mono{display:block;font-family:var(--be-serif);font-size:16px;letter-spacing:.1em}
#brandSeg button .bl{display:block;font-size:9.5px;letter-spacing:.12em;margin-top:2px;text-transform:uppercase}
#brandSeg button.on{border-color:var(--be-brass);color:var(--be-brass);background:var(--be-surface2)}
#brandSeg button.done{color:var(--be-up);opacity:.75}
#brandSeg button.locked{opacity:.4}
#brandSeg .ndot{position:absolute;top:6px;right:8px;width:7px;height:7px;border-radius:50%;background:var(--be-brass)}
#be-root .relHead{background:var(--be-surface);border:1px solid var(--be-line);border-radius:8px;padding:10px 12px;margin-bottom:6px}
#be-root .relHead .sa{display:flex;gap:8px;align-items:center;margin-top:8px;padding-top:8px;border-top:1px dashed var(--be-line);
  font-size:12.5px;font-style:italic;color:var(--be-ink)}
#be-root .relHead .saAva{flex:none;width:26px;height:26px;border-radius:50%;background:var(--be-surface2);border:1px solid var(--be-brassd);
  display:flex;align-items:center;justify-content:center;font-family:var(--be-serif);font-size:11px;font-style:normal;color:var(--be-brass)}
#be-root .relHead .rh1{display:flex;justify-content:space-between;align-items:baseline}
#be-root .relHead .bn{font-family:var(--be-serif);font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:var(--be-brass)}
#be-root .relHead .tier{font-size:11.5px}
#be-root .relHead .pts{font-size:11px;color:var(--be-dim);margin-top:4px;font-variant-numeric:tabular-nums}
#be-root .relHead .pend{color:var(--be-brass)}
#be-root .progress{height:3px;background:var(--be-line);border-radius:2px;margin-top:6px;overflow:hidden}
#be-root .progress i{display:block;height:100%;background:var(--be-brass);border-radius:2px;transition:width .4s}
#be-root .adNote{font-size:11.5px;color:var(--be-down);margin-top:2px}
#be-root .adNote.ok{color:var(--be-up)}
#be-root .lockline{font-size:11.5px;color:var(--be-dim);margin-top:2px}
#be-root .stockTag{font-size:10px;letter-spacing:.08em;padding:1.5px 6px;border-radius:3px;background:var(--be-brass);color:#14120F;font-weight:600}
#be-root .noStock{opacity:.5}
#be-root .secHead{font-size:11px;letter-spacing:.2em;color:var(--be-dim);text-transform:uppercase;margin:16px 0 4px;display:flex;align-items:baseline;gap:8px}
#be-root .secHead b{color:var(--be-brass);font-weight:600}
#be-root .secHead .cnt{margin-left:auto;font-variant-numeric:tabular-nums}
#be-root .listing{background:var(--be-surface);border:1px solid var(--be-line);border-radius:9px;padding:11px 12px;margin:9px 0}
#be-root .listing .lrow{display:flex;align-items:center;gap:11px}
#be-root .listing .flavor{font-size:12px;color:var(--be-dim);margin-top:7px;border-top:1px dashed var(--be-line);padding-top:7px}
#be-root .listing .flavor.sus{color:#D9A05B}
#be-root .listing .verdict{font-size:12px;margin-top:5px;font-weight:600}
#be-root .listing.gone{opacity:.45}
#be-root .listing.invite{border-color:var(--be-brass);background:linear-gradient(160deg,#2A2318,#1E1B16)}
#be-root .tag{font-size:10px;letter-spacing:.08em;padding:1.5px 6px;border-radius:3px}
#be-root .tag.exp{border:1px solid var(--be-line);color:var(--be-dim)}
#be-root .tag.fake{background:var(--be-down);color:#14120F;font-weight:600}
#be-root .tag.listed{border:1px solid var(--be-brassd);color:var(--be-brass)}
#be-root .tag.trophy{background:var(--be-brass);color:#14120F;font-weight:600}
#be-root .lbtns{display:flex;gap:8px;margin-top:9px}
#be-root .lbtns .btn{flex:1;text-align:center;padding:9px 0}
#be-root .offerBox{margin-top:9px;padding:9px 11px;background:var(--be-surface2);border:1px solid var(--be-brassd);border-radius:7px;font-variant-numeric:tabular-nums}
#be-root .offerBox .ot{font-size:11px;letter-spacing:.16em;color:var(--be-brass);text-transform:uppercase}
#be-root .offerBox .ov{font-size:16px;font-weight:600;margin-top:2px}
#be-root .offerBox .on2{font-size:11.5px;color:var(--be-dim);margin-top:1px}
#be-root .plline{font-size:12px;margin-top:1px;font-variant-numeric:tabular-nums}
#nwCard{display:flex;justify-content:space-between;background:var(--be-surface);border:1px solid var(--be-line);
  border-radius:8px;padding:12px 14px;margin:12px 0 4px;font-variant-numeric:tabular-nums}
#nwCard div{text-align:center}
#nwCard .l{font-size:10.5px;letter-spacing:.14em;color:var(--be-dim)}
#nwCard .v{font-size:15px;margin-top:3px;font-weight:600}
#be-root .empty{padding:30px 10px;text-align:center;color:var(--be-dim);font-size:13.5px}
#beAction{position:absolute;left:0;right:0;bottom:0;max-width:560px;margin:0 auto;
  background:linear-gradient(to top,var(--be-bg) 78%,transparent);
  padding:8px 14px calc(6px + env(safe-area-inset-bottom))}
#beStakes{font-size:11px;color:var(--be-dim);text-align:center;margin-bottom:6px;font-variant-numeric:tabular-nums;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#beNext{width:100%;padding:13px 0;background:var(--be-brass);border:none;border-radius:8px;
  font-size:15px;font-weight:600;letter-spacing:.14em;color:#14120F;cursor:pointer}
#beNext:active{filter:brightness(1.12)}
#beNav{display:flex;gap:8px;margin-top:8px}
#beNav button{flex:1;position:relative;background:none;border:1px solid transparent;border-radius:8px;
  padding:7px 0 5px;color:var(--be-dim);cursor:pointer}
#beNav button .ic{display:block;font-size:15px;line-height:1}
#beNav button .lb{display:block;font-size:10.5px;letter-spacing:.14em;margin-top:3px}
#beNav button.on{color:var(--be-brass);border-color:var(--be-line);background:var(--be-surface)}
#beNav .bdg{position:absolute;top:3px;right:calc(50% - 26px);min-width:15px;height:15px;border-radius:8px;
  background:var(--be-brass);color:#14120F;font-size:10px;font-weight:700;line-height:15px;padding:0 4px}
#beNav .bdot{position:absolute;top:5px;right:calc(50% - 22px);width:7px;height:7px;border-radius:50%;background:var(--be-brass)}
#beTv{position:fixed;inset:0;z-index:60;display:none;flex-direction:column;
  background:radial-gradient(120% 90% at 50% 20%,#322B1E 0%,#1A1712 55%,#0E0C09 100%)}
#beTv.show{display:flex}
#tvImgWrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:1;padding:100px 30px 110px}
#tvImgWrap img{max-width:100%;max-height:100%;object-fit:contain;
  filter:drop-shadow(0 18px 40px rgba(0,0,0,.65)) drop-shadow(0 0 60px rgba(201,169,97,.18));
  animation:beImgIn .55s cubic-bezier(.2,.8,.3,1)}
@keyframes beImgIn{from{opacity:0;transform:scale(.82) translateY(14px)}to{opacity:1;transform:none}}
#tvTop{position:relative;z-index:2;text-align:center;padding:calc(26px + env(safe-area-inset-top)) 20px 0;pointer-events:none;animation:beTvIn .5s ease-out}
#tvTop .k{font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--be-brass)}
#tvTop .n{font-family:var(--be-serif);font-size:26px;margin-top:6px;color:var(--be-ink)}
#tvTop .s{font-size:13px;color:var(--be-dim);margin-top:4px}
@keyframes beTvIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
#tvBottom{position:relative;z-index:2;margin-top:auto;padding:0 20px calc(22px + env(safe-area-inset-bottom))}
#tvBottom .btn.primary{display:block;width:100%;background:var(--be-brass);color:#14120F;border-color:var(--be-brass);
  font-weight:600;padding:13px 0;text-align:center;font-size:15px;border-radius:8px}
#beRing{position:absolute;left:50%;top:45%;width:10px;height:10px;border:2px solid var(--be-brass);border-radius:50%;
  transform:translate(-50%,-50%);opacity:0;pointer-events:none;z-index:3}
#beRing.go{animation:beRingGo 1.2s ease-out}
@keyframes beRingGo{0%{opacity:.9;width:10px;height:10px}100%{opacity:0;width:360px;height:360px}}
#beModalWrap{position:fixed;inset:0;background:rgba(10,9,6,.72);display:none;align-items:flex-end;justify-content:center;z-index:70}
#beModalWrap.show{display:flex}
#beModal{width:100%;max-width:560px;background:var(--be-surface);border-top:1px solid var(--be-brassd);color:var(--be-ink);
  border-radius:16px 16px 0 0;padding:22px 20px calc(24px + env(safe-area-inset-bottom));animation:beRise .22s ease-out}
@keyframes beRise{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
#beModal h2{font-family:var(--be-serif);font-size:20px;margin:0 0 4px;letter-spacing:.04em}
#beModal .sub{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--be-brass);margin-bottom:10px}
#beModal p{margin:8px 0;font-size:14.5px}
#beModal p.dim{color:var(--be-dim);font-size:13px}
#beModal .quote{font-family:var(--be-serif);font-style:italic;color:var(--be-brass);font-size:15.5px;
  border-left:2px solid var(--be-brassd);padding-left:12px;margin:14px 0}
#beModal .stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:14px 0;font-variant-numeric:tabular-nums}
#beModal .stats div{background:var(--be-surface2);border-radius:6px;padding:10px 12px}
#beModal .stats .l{font-size:10.5px;letter-spacing:.14em;color:var(--be-dim)}
#beModal .stats .v{font-size:16px;margin-top:3px;font-weight:600}
#beModal .mrow{display:flex;justify-content:space-between;font-variant-numeric:tabular-nums;font-size:14px;
  padding:7px 0;border-bottom:1px solid var(--be-line)}
#beModal .mrow span:first-child{color:var(--be-dim)}
#modalBtns{display:flex;gap:10px;margin-top:18px}
#modalBtns .btn{flex:1;padding:12px 0;text-align:center;font-size:14.5px;border-radius:7px}
#modalBtns .btn.primary{background:var(--be-brass);color:#14120F;border-color:var(--be-brass);font-weight:600}
#be-root button:focus-visible{outline:2px solid var(--be-brass);outline-offset:2px}
#beReveal{position:fixed;inset:0;background:rgba(8,7,4,.93);display:none;align-items:center;justify-content:center;z-index:80;flex-direction:column;padding:24px}
#beReveal.show{display:flex}
#beRevealCard{width:100%;max-width:400px;background:var(--be-surface);border:1px solid var(--be-brassd);border-radius:12px;
  padding:26px 22px;text-align:center;color:var(--be-ink);animation:beCardIn .3s ease-out}
@keyframes beCardIn{from{transform:translateY(16px) scale(.97);opacity:0}to{transform:none;opacity:1}}
#beRevealCard .rc-k{font-size:10.5px;letter-spacing:.26em;text-transform:uppercase;color:var(--be-brass);margin-bottom:10px}
#beRevealCard .rc-t{font-family:var(--be-serif);font-size:21px;line-height:1.3}
#beRevealCard .rc-b{font-size:14px;color:var(--be-dim);margin-top:10px;line-height:1.55}
#beRevealCard .rc-n{font-size:26px;font-weight:600;margin-top:8px;font-variant-numeric:tabular-nums}
#beRevealHint{margin-top:16px;font-size:11.5px;color:var(--be-dim);letter-spacing:.14em}
#beRevealCard .btn.primary{background:var(--be-brass);color:#14120F;border-color:var(--be-brass);font-weight:600;width:100%;margin-top:18px;padding:12px 0;font-size:14.5px}
#beToast{position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-8px);z-index:90;
  background:var(--be-surface2);border:1px solid var(--be-brassd);color:var(--be-ink);border-radius:7px;
  padding:9px 16px;font-size:13.5px;opacity:0;transition:.25s;pointer-events:none;max-width:88vw;text-align:center}
#beToast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media (prefers-reduced-motion: reduce){
  #tvImgWrap img,#tvTop,#beRing.go,#beModal,#beRevealCard{animation:none}
}
/* short phones (SE class): trade the news ticker for one more visible watch */
@media (max-height:700px){
  #beTicker{display:none}
  #be-root .row{padding:8px 0}
  #be-root .relHead{padding:8px 12px}
  #be-root .relHead .sa{margin-top:6px;padding-top:6px}
}
`;
