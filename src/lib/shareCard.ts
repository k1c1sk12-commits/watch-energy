import {
  captionFor,
  recipeText,
  signatureText,
  TIER_META,
  TIER_UI,
  TIERS,
  tierLabel,
  UI,
  type Lang,
  type Tier,
} from "./copy";
import { IMAGE_READY } from "./imageManifest";
import type { Reading } from "./types";
import { WATCHES } from "./watches";

export { captionFor } from "./copy";

const HANDLE = "@gptwatchcollector";
const W = 1080;
const H = 1920;
// Where the watch illustration sits on the card (shared by the SVG + PNG paths).
const WATCH_BOX = { x: 290, y: 430, w: 500, h: 500 };

// Card-only labels, per language. The "WATCH ENERGY" wordmark stays as-is.
const CARD: Record<Lang, {
  recipeHead: string;
  energyMatch: string;
  rarity: string;
  topRarity: (r: number) => string;
  footer: string;
}> = {
  en: {
    recipeHead: "YOUR DESTINY RECIPE",
    energyMatch: "ENERGY MATCH",
    rarity: "RARITY",
    topRarity: (r) => `TOP ${r}%`,
    footer: "MEET YOUR DESTINY WATCH",
  },
  zh: {
    recipeHead: "你的命定配方",
    energyMatch: "能量匹配",
    rarity: "稀有度",
    topRarity: (r) => `前 ${r}%`,
    footer: "認識你的命定之錶",
  },
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Greedy word-wrap by approximate character budget. Words longer than the
// budget (e.g. an unbroken run of Chinese, which has no spaces) are split by
// character so CJK text wraps instead of overflowing.
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const tokens: string[] = [];
  for (const w of text.split(/\s+/)) {
    if (w.length <= maxChars) {
      tokens.push(w);
    } else {
      for (let i = 0; i < w.length; i += maxChars) tokens.push(w.slice(i, i + maxChars));
    }
  }
  const lines: string[] = [];
  let cur = "";
  for (const w of tokens) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) break;
    } else {
      cur = next;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Arial, sans-serif";
// Light ivory editorial palette (matches the site)
const GOLD = "#9a7c34";
const GOLD_HI = "#b08832";
const HI = "#221d15";
const MID = "#574e40";
const LOW = "#978c79";

/** Build the full 9:16 share-card SVG as a string, embedding the watch markup. */
export function buildCardSvg(reading: Reading, lang: Lang, watchInnerSvg: string | null): string {
  const { watch } = reading;
  const c = CARD[lang];
  const zh = lang === "zh";
  const recipe = recipeText(watch, lang);
  // Recipe leads the card (the legible, shareable hook); the watch is the reveal.
  const recipeStr = `${recipe.caseText}  ·  ${recipe.dialText}  ·  ${recipe.strapText}`;
  const recipeLines = wrap(recipeStr, zh ? 14 : 26, 2);
  const modelText = reading.name ? UI[lang].ownPossessive(reading.name, watch.model) : watch.model;
  const modelLines = wrap(modelText, 22, 2);
  const sigLines = wrap(signatureText(watch, lang), zh ? 20 : 40, 2);

  const recipeSvg = recipeLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${324 + i * 56}" text-anchor="middle" font-family="${SERIF}" font-size="46" fill="${HI}">${escapeXml(
          l,
        )}</text>`,
    )
    .join("");

  const modelSvg = modelLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${1078 + i * 60}" text-anchor="middle" font-family="${SERIF}" font-size="52" fill="${HI}">${escapeXml(
          l,
        )}</text>`,
    )
    .join("");

  const sigStart = 1430 - (sigLines.length - 1) * 26;
  const sigSvg = sigLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${sigStart + i * 50}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="33" fill="${MID}">${escapeXml(
          l,
        )}</text>`,
    )
    .join("");

  // Embed the SVG watch into a fixed box (strip any existing width/height first
  // so the box size wins). When null, leave the box empty — a PNG is composited
  // onto the canvas at WATCH_BOX afterwards instead.
  const watchBox = watchInnerSvg
    ? watchInnerSvg
        .replace(/\s(?:width|height)="[^"]*"/g, "")
        .replace(
          /^<svg/,
          `<svg xmlns="http://www.w3.org/2000/svg" x="${WATCH_BOX.x}" y="${WATCH_BOX.y}" width="${WATCH_BOX.w}" height="${WATCH_BOX.h}"`,
        )
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="cardbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6f1e7"/>
      <stop offset="0.5" stop-color="#f1ebe0"/>
      <stop offset="1" stop-color="#ece3d3"/>
    </linearGradient>
    <radialGradient id="cardglow" cx="0.5" cy="0.30" r="0.5">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.08"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="platter" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#5a4828" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#5a4828" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#cardbg)"/>
  <rect width="${W}" height="${H}" fill="url(#cardglow)"/>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="28" fill="none" stroke="${GOLD}" stroke-opacity="0.34" stroke-width="1.5"/>

  <!-- soft platter so light/silver watches lift off the ivory -->
  <ellipse cx="${WATCH_BOX.x + WATCH_BOX.w / 2}" cy="${WATCH_BOX.y + WATCH_BOX.h / 2}" rx="250" ry="250" fill="url(#platter)"/>

  <!-- wordmark -->
  <text x="${W / 2}" y="168" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="10" fill="${GOLD}">WATCH ENERGY</text>
  <line x1="${W / 2 - 70}" y1="196" x2="${W / 2 + 70}" y2="196" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="1.5"/>

  <!-- recipe (the hook) -->
  <text x="${W / 2}" y="258" text-anchor="middle" font-family="${SANS}" font-size="22" letter-spacing="${zh ? 8 : 6}" fill="${GOLD}">${escapeXml(
    c.recipeHead,
  )}</text>
  ${recipeSvg}

  <!-- watch -->
  ${watchBox}

  <!-- brand + model -->
  <text x="${W / 2}" y="1000" text-anchor="middle" font-family="${SANS}" font-size="25" letter-spacing="6" fill="${GOLD}">${escapeXml(
    watch.brand.toUpperCase(),
  )}</text>
  ${modelSvg}

  <!-- match + rarity pills -->
  <g>
    <rect x="${W / 2 - 250}" y="1196" width="240" height="86" rx="43" fill="${GOLD}" fill-opacity="0.08" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>
    <text x="${W / 2 - 130}" y="1242" text-anchor="middle" font-family="${SERIF}" font-size="40" fill="${GOLD_HI}">${reading.matchPercent}%</text>
    <text x="${W / 2 - 130}" y="1268" text-anchor="middle" font-family="${SANS}" font-size="17" letter-spacing="3" fill="${MID}">${escapeXml(
      c.energyMatch,
    )}</text>

    <rect x="${W / 2 + 10}" y="1196" width="240" height="86" rx="43" fill="${GOLD}" fill-opacity="0.08" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>
    <text x="${W / 2 + 130}" y="1242" text-anchor="middle" font-family="${SERIF}" font-size="40" fill="${GOLD_HI}">${escapeXml(
      c.topRarity(reading.rarity),
    )}</text>
    <text x="${W / 2 + 130}" y="1268" text-anchor="middle" font-family="${SANS}" font-size="17" letter-spacing="3" fill="${MID}">${escapeXml(
      c.rarity,
    )}</text>
  </g>

  <!-- signature -->
  ${sigSvg}

  <!-- handle -->
  <text x="${W / 2}" y="1800" text-anchor="middle" font-family="${SERIF}" font-size="42" fill="${GOLD_HI}">${HANDLE}</text>
  <text x="${W / 2}" y="1844" text-anchor="middle" font-family="${SANS}" font-size="22" letter-spacing="${zh ? 6 : 4}" fill="${LOW}">${escapeXml(
    c.footer,
  )}</text>
</svg>`;
}

function loadImageEl(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Rasterise the card SVG, then composite the AI watch PNG on top (if provided).
async function renderCardBlob(svg: string, watchPng: HTMLImageElement | null): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const card = await loadImageEl(url);
    if (!card) throw new Error("svg load failed");
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(card, 0, 0, W, H);
    if (watchPng) {
      // contain the PNG within WATCH_BOX, centred
      const r = Math.min(WATCH_BOX.w / watchPng.width, WATCH_BOX.h / watchPng.height);
      const w = watchPng.width * r;
      const h = watchPng.height * r;
      ctx.drawImage(
        watchPng,
        WATCH_BOX.x + (WATCH_BOX.w - w) / 2,
        WATCH_BOX.y + (WATCH_BOX.h - h) / 2,
        w,
        h,
      );
    }
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 0.95),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type ShareOutcome = "shared" | "downloaded" | "error";

export async function shareReading(
  reading: Reading,
  watchSvgEl: SVGSVGElement,
  lang: Lang,
): Promise<ShareOutcome> {
  try {
    // Prefer the AI illustration when one exists; otherwise embed the SVG watch.
    const watchPng = IMAGE_READY.has(reading.watch.id)
      ? await loadImageEl(`/watches/${reading.watch.id}.png`)
      : null;
    const svg = buildCardSvg(reading, lang, watchPng ? null : watchSvgEl.outerHTML);
    const png = await renderCardBlob(svg, watchPng);
    const file = new File([png], `watch-energy-${reading.watch.id}.png`, { type: "image/png" });

    const nav = navigator as Navigator & {
      canShare?: (data: { files: File[] }) => boolean;
    };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({
        files: [file],
        title: "Watch Energy",
        text: captionFor(reading, lang),
      });
      return "shared";
    }

    // Desktop / unsupported: download the PNG.
    const url = URL.createObjectURL(png);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "downloaded";
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "shared"; // user dismissed sheet
    console.error(e);
    return "error";
  }
}

// ---------------------------------------------------------------------------
// Tier-list share card — canvas-rendered. Each tier that has at least one
// watch becomes a row: a coloured label box + the watch illustrations as
// tiles (AI PNG when present, a dial-colour disc as a fallback).
// ---------------------------------------------------------------------------
const T_PAD = 50;
const T_TILE = 116;
const T_GAP = 14;
const T_LABEL_W = 150;
const T_INNER_GAP = 18;
const T_TILES_X = T_PAD + T_LABEL_W + T_INNER_GAP;
const T_TILES_W = W - T_PAD - T_TILES_X;
const T_PER_ROW = Math.max(1, Math.floor((T_TILES_W + T_GAP) / (T_TILE + T_GAP)));
const T_ROW_VPAD = 18;
const T_ROW_GAP = 16;
const T_CONTENT_TOP = 188;
const T_FOOTER = 168;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

type Placement = Record<string, Tier>;

async function renderTierCardBlob(placement: Placement, lang: Lang): Promise<Blob> {
  const ui = TIER_UI[lang];
  // Tiers in fixed order, but only those the visitor actually used.
  const rows = TIERS.map((tier) => ({
    tier,
    watches: WATCHES.filter((w) => placement[w.id] === tier),
  })).filter((r) => r.watches.length > 0);

  // Preload every needed AI illustration in parallel (null -> dial fallback).
  const ids = rows.flatMap((r) => r.watches.map((w) => w.id));
  const imgEntries = await Promise.all(
    ids.map(async (id) => [id, IMAGE_READY.has(id) ? await loadImageEl(`/watches/${id}.png`) : null] as const),
  );
  const imgs = new Map(imgEntries);

  // Compute each row's height from how many tile-lines it needs.
  const rowH = rows.map((r) => {
    const lines = Math.ceil(r.watches.length / T_PER_ROW);
    return lines * T_TILE + (lines - 1) * T_GAP + T_ROW_VPAD * 2;
  });
  const bodyH = rowH.reduce((s, h) => s + h, 0) + Math.max(0, rows.length - 1) * T_ROW_GAP;
  const H_T = T_CONTENT_TOP + bodyH + T_FOOTER;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H_T;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no 2d context");

  // background (ivory, matches the energy card)
  const bg = ctx.createLinearGradient(0, 0, 0, H_T);
  bg.addColorStop(0, "#f6f1e7");
  bg.addColorStop(0.5, "#f1ebe0");
  bg.addColorStop(1, "#ece3d3");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H_T);
  ctx.strokeStyle = "rgba(154,124,52,0.34)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, 34, 34, W - 68, H_T - 68, 28);
  ctx.stroke();

  // header
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = `30px ${SANS}`;
  ctx.fillText("WATCH ENERGY", W / 2, 110);
  ctx.fillStyle = HI;
  ctx.font = `54px ${SERIF}`;
  ctx.fillText(ui.cardTitle, W / 2, 168);

  // rows
  let y = T_CONTENT_TOP;
  rows.forEach((r, i) => {
    const h = rowH[i];
    // label box
    ctx.fillStyle = TIER_META[r.tier].color;
    roundRect(ctx, T_PAD, y, T_LABEL_W, h, 16);
    ctx.fill();
    ctx.fillStyle = "#1a1305";
    ctx.font = `44px ${SERIF}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tierLabel(r.tier, lang), T_PAD + T_LABEL_W / 2, y + h / 2);
    ctx.textBaseline = "alphabetic";

    // tiles
    r.watches.forEach((w, idx) => {
      const col = idx % T_PER_ROW;
      const line = Math.floor(idx / T_PER_ROW);
      const tx = T_TILES_X + col * (T_TILE + T_GAP);
      const ty = y + T_ROW_VPAD + line * (T_TILE + T_GAP);
      // tile background
      ctx.fillStyle = "rgba(90,72,40,0.06)";
      roundRect(ctx, tx, ty, T_TILE, T_TILE, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(90,72,40,0.18)";
      ctx.lineWidth = 1;
      roundRect(ctx, tx, ty, T_TILE, T_TILE, 12);
      ctx.stroke();

      const img = imgs.get(w.id);
      const p = 8;
      if (img) {
        const avail = T_TILE - p * 2;
        const ratio = Math.min(avail / img.width, avail / img.height);
        const iw = img.width * ratio;
        const ih = img.height * ratio;
        ctx.drawImage(img, tx + (T_TILE - iw) / 2, ty + (T_TILE - ih) / 2, iw, ih);
      } else {
        // dial-colour disc fallback
        const cx = tx + T_TILE / 2;
        const cy = ty + T_TILE / 2;
        const rad = (T_TILE - p * 2) / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fillStyle = w.dialHex;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    y += h + T_ROW_GAP;
  });

  // footer
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD_HI;
  ctx.font = `42px ${SERIF}`;
  ctx.fillText(HANDLE, W / 2, H_T - 92);
  ctx.fillStyle = LOW;
  ctx.font = `24px ${SANS}`;
  ctx.fillText(lang === "zh" ? "你又會怎麼排？" : "How would you rank them?", W / 2, H_T - 52);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 0.95),
  );
}

export async function shareTierList(placement: Placement, lang: Lang): Promise<ShareOutcome> {
  try {
    const png = await renderTierCardBlob(placement, lang);
    const file = new File([png], "watch-energy-tier-list.png", { type: "image/png" });
    const caption = lang === "zh"
      ? `我的腕錶 tier list 👉 ${HANDLE}`
      : `My watch tier list 👉 ${HANDLE}`;

    const nav = navigator as Navigator & {
      canShare?: (data: { files: File[] }) => boolean;
    };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: "Watch Energy", text: caption });
      return "shared";
    }

    const url = URL.createObjectURL(png);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return "downloaded";
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "shared";
    console.error(e);
    return "error";
  }
}
