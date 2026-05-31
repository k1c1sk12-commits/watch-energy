import type { Reading } from "./types";

const HANDLE = "@gptwatchcollector";
const W = 1080;
const H = 1920;

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
export function buildCardSvg(reading: Reading, watchInnerSvg: string): string {
  const { watch } = reading;
  const modelLines = wrap(`${watch.model}`, 20, 2);
  // The card carries one punchy line (the watch's signature), never the full
  // multi-sentence reason — so it always fits and never truncates mid-thought.
  const lineLines = wrap(watch.signature, 38, 3);

  const modelSvg = modelLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${1030 + i * 66}" text-anchor="middle" font-family="${SERIF}" font-size="56" fill="${HI}">${escapeXml(
          l,
        )}</text>`,
    )
    .join("");

  // vertically centre the 1–3 signature lines around y≈1430
  const lineStart = 1430 - (lineLines.length - 1) * 24;
  const reasonSvg = lineLines
    .map(
      (l, i) =>
        `<text x="${W / 2}" y="${lineStart + i * 48}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="34" fill="${MID}">${escapeXml(
          l,
        )}</text>`,
    )
    .join("");

  // Re-namespace the watch svg and place it in a fixed box at the top. Strip
  // any existing width/height first, then set the box — order matters so the
  // intended size always wins regardless of the source render size.
  const watchBox = watchInnerSvg
    .replace(/\s(?:width|height)="[^"]*"/g, "")
    .replace(/^<svg/, `<svg xmlns="http://www.w3.org/2000/svg" x="260" y="300" width="560" height="560"`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="cardbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#101015"/>
      <stop offset="0.5" stop-color="#0a0a0b"/>
      <stop offset="1" stop-color="#08080a"/>
    </linearGradient>
    <radialGradient id="cardglow" cx="0.5" cy="0.26" r="0.5">
      <stop offset="0" stop-color="${GOLD}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#cardbg)"/>
  <rect width="${W}" height="${H}" fill="url(#cardglow)"/>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="28" fill="none" stroke="${GOLD}" stroke-opacity="0.22" stroke-width="1.5"/>

  <!-- wordmark -->
  <text x="${W / 2}" y="172" text-anchor="middle" font-family="${SANS}" font-size="30" letter-spacing="10" fill="${GOLD}">WATCH ENERGY</text>
  <line x1="${W / 2 - 70}" y1="200" x2="${W / 2 + 70}" y2="200" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="1.5"/>

  <!-- watch -->
  ${watchBox}

  <!-- brand + model -->
  <text x="${W / 2}" y="950" text-anchor="middle" font-family="${SANS}" font-size="26" letter-spacing="6" fill="${GOLD}">${escapeXml(
    watch.brand.toUpperCase(),
  )}</text>
  ${modelSvg}

  <!-- match + rarity pills -->
  <g>
    <rect x="${W / 2 - 250}" y="1120" width="240" height="86" rx="43" fill="${GOLD}" fill-opacity="0.08" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>
    <text x="${W / 2 - 130}" y="1166" text-anchor="middle" font-family="${SERIF}" font-size="40" fill="${GOLD_HI}">${reading.matchPercent}%</text>
    <text x="${W / 2 - 130}" y="1192" text-anchor="middle" font-family="${SANS}" font-size="17" letter-spacing="3" fill="${MID}">ENERGY MATCH</text>

    <rect x="${W / 2 + 10}" y="1120" width="240" height="86" rx="43" fill="${GOLD}" fill-opacity="0.08" stroke="${GOLD}" stroke-opacity="0.55" stroke-width="1.5"/>
    <text x="${W / 2 + 130}" y="1166" text-anchor="middle" font-family="${SERIF}" font-size="40" fill="${GOLD_HI}">TOP ${reading.rarity}%</text>
    <text x="${W / 2 + 130}" y="1192" text-anchor="middle" font-family="${SANS}" font-size="17" letter-spacing="3" fill="${MID}">RARITY</text>
  </g>

  <!-- reasoning -->
  ${reasonSvg}

  <!-- spec chips -->
  <g font-family="${SANS}">
    <rect x="${W / 2 - 330}" y="1610" width="320" height="74" rx="14" fill="#16161a" stroke="${GOLD}" stroke-opacity="0.25"/>
    <text x="${W / 2 - 170}" y="1645" text-anchor="middle" font-size="18" letter-spacing="3" fill="${LOW}">CASE</text>
    <text x="${W / 2 - 170}" y="1672" text-anchor="middle" font-size="24" fill="${HI}">${escapeXml(watch.caseMaterial)}</text>

    <rect x="${W / 2 + 10}" y="1610" width="320" height="74" rx="14" fill="#16161a" stroke="${GOLD}" stroke-opacity="0.25"/>
    <text x="${W / 2 + 170}" y="1645" text-anchor="middle" font-size="18" letter-spacing="3" fill="${LOW}">DIAL</text>
    <text x="${W / 2 + 170}" y="1672" text-anchor="middle" font-size="24" fill="${HI}">${escapeXml(watch.dialColor)}</text>
  </g>

  <!-- handle -->
  <text x="${W / 2}" y="1810" text-anchor="middle" font-family="${SERIF}" font-size="42" fill="${GOLD_HI}">${HANDLE}</text>
  <text x="${W / 2}" y="1852" text-anchor="middle" font-family="${SANS}" font-size="22" letter-spacing="4" fill="${LOW}">FIND YOUR WATCH ENERGY</text>
</svg>`;
}

async function svgToPngBlob(svg: string): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("svg load failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(img, 0, 0, W, H);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 0.95),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type ShareOutcome = "shared" | "downloaded" | "error";

export function captionFor(reading: Reading): string {
  return `My watch energy today: ${reading.watch.brand} ${reading.watch.model} — ${reading.matchPercent}% match, top ${reading.rarity}%. Find yours 👉 ${HANDLE}`;
}

export async function shareReading(reading: Reading, watchSvgEl: SVGSVGElement): Promise<ShareOutcome> {
  try {
    const svg = buildCardSvg(reading, watchSvgEl.outerHTML);
    const png = await svgToPngBlob(svg);
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
