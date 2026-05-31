import { IMAGE_READY } from "./imageManifest";
import type { Reading } from "./types";

const HANDLE = "@gptwatchcollector";
const W = 1080;
const H = 1920;
// Where the watch illustration sits on the card (shared by the SVG + PNG paths).
const WATCH_BOX = { x: 290, y: 430, w: 500, h: 500 };

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Greedy word-wrap by approximate character budget.
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
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
const GOLD = "#c9a86a";
const GOLD_HI = "#e6c98f";
const HI = "#f5f3ee";
const MID = "#b5b2ab";
const LOW = "#7d7a73";

/** Build the full 9:16 share-card SVG as a string, embedding the watch markup. */
export function buildCardSvg(reading: Reading, watchInnerSvg: string | null): string {
  const { watch, recipe } = reading;
  // Recipe leads the card (the legible, shareable hook); the watch is the reveal.
  const recipeStr = `${recipe.caseText}  ·  ${recipe.dialText}  ·  ${recipe.strapText}`;
  const recipeLines = wrap(recipeStr, 26, 2);
  const modelText = reading.name ? `${reading.name}'s ${watch.model}` : watch.model;
  const modelLines = wrap(modelText, 22, 2);
  const sigLines = wrap(watch.signature, 40, 2);

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
      <stop offset="0" stop-color="#101015"/>
      <stop offset="0.5" stop-color="#0a0a0b"/>
      <stop offset="1" stop-color="#08080a"/>
    </linearGradient>
    <radialGradient id="cardglow" cx="0.5" cy="0.32" r="0.5">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#cardbg)"/>
  <rect width="${W}" height="${H}" fill="url(#cardglow)"/>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="28" fill="none" stroke="${GOLD}" stroke-opacity="0.22" stroke-width="1.5"/>

  <!-- wordmark -->
  <text x="${W / 2}" y="168" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="10" fill="${GOLD}">WATCH ENERGY</text>
  <line x1="${W / 2 - 70}" y1="196" x2="${W / 2 + 70}" y2="196" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="1.5"/>

  <!-- recipe (the hook) -->
  <text x="${W / 2}" y="258" text-anchor="middle" font-family="${SANS}" font-size="22" letter-spacing="6" fill="${GOLD}">YOUR DESTINY RECIPE</text>
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
    <text x="${W / 2 - 130}" y="1268" text-anchor="middle" font-family="${SANS}" font-size="17" letter-spacing="3" fill="${MID}">ENERGY MATCH</text>

    <rect x="${W / 2 + 10}" y="1196" width="240" height="86" rx="43" fill="${GOLD}" fill-opacity="0.08" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>
    <text x="${W / 2 + 130}" y="1242" text-anchor="middle" font-family="${SERIF}" font-size="40" fill="${GOLD_HI}">TOP ${reading.rarity}%</text>
    <text x="${W / 2 + 130}" y="1268" text-anchor="middle" font-family="${SANS}" font-size="17" letter-spacing="3" fill="${MID}">RARITY</text>
  </g>

  <!-- signature -->
  ${sigSvg}

  <!-- handle -->
  <text x="${W / 2}" y="1800" text-anchor="middle" font-family="${SERIF}" font-size="42" fill="${GOLD_HI}">${HANDLE}</text>
  <text x="${W / 2}" y="1844" text-anchor="middle" font-family="${SANS}" font-size="22" letter-spacing="4" fill="${LOW}">MEET YOUR DESTINY WATCH</text>
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

export function captionFor(reading: Reading): string {
  return `My destiny watch: ${reading.watch.brand} ${reading.watch.model} — ${reading.matchPercent}% match, top ${reading.rarity}%. Meet yours 👉 ${HANDLE}`;
}

export async function shareReading(reading: Reading, watchSvgEl: SVGSVGElement): Promise<ShareOutcome> {
  try {
    // Prefer the AI illustration when one exists; otherwise embed the SVG watch.
    const watchPng = IMAGE_READY.has(reading.watch.id)
      ? await loadImageEl(`/watches/${reading.watch.id}.png`)
      : null;
    const svg = buildCardSvg(reading, watchPng ? null : watchSvgEl.outerHTML);
    const png = await renderCardBlob(svg, watchPng);
    const file = new File([png], `watch-energy-${reading.watch.id}.png`, { type: "image/png" });

    const nav = navigator as Navigator & {
      canShare?: (data: { files: File[] }) => boolean;
    };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({
        files: [file],
        title: "Watch Energy",
        text: captionFor(reading),
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
