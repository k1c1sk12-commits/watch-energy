// Generates SOURCING_GUIDE.md: per-watch Google Images + Chrono24 search links
// so Kenson can quickly find frontal reference shots himself. We point to public
// search — we do not download or host any third-party images.
import { writeFileSync } from "node:fs";

// [id, "Full name", "reference", owned]
const WATCHES = [
  ["ap-ro-16202st", "Audemars Piguet Royal Oak Jumbo Extra-Thin", "16202ST", true],
  ["ap-ro-26240st", "Audemars Piguet Royal Oak Selfwinding Chronograph", "26240ST", true],
  ["ap-ro-77450st", "Audemars Piguet Royal Oak Selfwinding 34mm", "77450ST", true],
  ["ap-code-15210qt", "Audemars Piguet Code 11.59 Selfwinding", "15210QT", true],
  ["ap-code-15212nb", "Audemars Piguet Code 11.59 Starwheel", "15212NB", true],
  ["lange-1-moonphase", "A. Lange & Söhne Lange 1 Moonphase", "192.032", true],
  ["daniel-roth-447", "Daniel Roth Skeleton Chronograph", "447", true],
  ["chronoswiss-regulator", "Chronoswiss Regulator", "", true],
  ["cw-bel-canto", "Christopher Ward Bel Canto", "", true],
  ["breguet-3357ba", "Breguet Classique Tourbillon", "3357BA", true],
  ["rolex-sub-126610ln", "Rolex Submariner Date", "126610LN", false],
  ["patek-nautilus-5711", "Patek Philippe Nautilus", "5711/1A", false],
  ["omega-speedmaster", "Omega Speedmaster Professional Moonwatch", "310.30.42", false],
  ["cartier-tank-louis", "Cartier Tank Louis Cartier", "WGTA0067", false],
  ["vc-overseas-4500v", "Vacheron Constantin Overseas", "4500V", false],
  ["jlc-reverso-tribute", "Jaeger-LeCoultre Reverso Tribute", "Q3978480", false],
  ["gs-snowflake", "Grand Seiko Snowflake", "SBGA211", false],
  ["panerai-luminor", "Panerai Luminor Marina", "PAM01312", false],
  ["vc-patrimony-platinum", "Vacheron Constantin Patrimony platinum", "81180", false],
  ["lange-zeitwerk", "A. Lange & Söhne Zeitwerk", "140.029", false],
  ["iwc-big-pilot", "IWC Big Pilot's Watch", "IW501001", false],
  ["fpjourne-bleu", "F.P. Journe Chronomètre Bleu", "", false],
  ["fpjourne-octa-lune", "F.P. Journe Octa Automatique Lune", "", false],
  ["moser-endeavour-fume", "H. Moser & Cie Endeavour Concept blue fumé", "", false],
  ["laurent-ferrier-origin", "Laurent Ferrier Classic Origin green", "", false],
  ["debethune-db28", "De Bethune DB28 Steel Wheels", "", false],
  ["czapek-antarctique", "Czapek Antarctique salmon Passage de Drake", "", false],
  ["mbf-lm101", "MB&F Legacy Machine 101", "", false],
  ["voutilainen-vingt8", "Voutilainen Vingt-8", "", false],
  ["gronefeld-1941", "Grönefeld 1941 Principia salmon", "", false],
  ["akrivia-cc2", "Akrivia Rexhep Rexhepi Chronomètre Contemporain II", "", false],
  ["lange-datograph", "A. Lange & Söhne Datograph Up/Down", "405.035", false],
  ["breguet-tradition", "Breguet Tradition 7097", "7097BR", false],
  ["patek-calatrava-5226", "Patek Philippe Calatrava 5226G", "5226G", false],
  ["greubel-balancier", "Greubel Forsey Balancier Contemporain", "", false],
];

const gimg = (q) => `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(q)}`;
const c24 = (q) => `https://www.chrono24.com/search/index.htm?query=${encodeURIComponent(q)}`;

function row([id, name, ref, owned]) {
  const q = `${name} ${ref}`.trim();
  const tag = owned ? " · **(yours — use your own photo)**" : "";
  return `### ${name}${ref ? ` — ${ref}` : ""}${tag}\nFile name: \`${id}.png\`  ·  [Google Images](${gimg(q)})  ·  [Chrono24](${c24(q)})\n`;
}

const owned = WATCHES.filter((w) => w[3]);
const rest = WATCHES.filter((w) => !w[3]);

const md = `# Reference-image sourcing guide

Quick links to find **frontal** photos of each watch, so you can pick ~3 per
watch to cartoon-ify. These point to public image search — no images are
downloaded or hosted here.

> ⚠️ Copyright note: photos you find online are owned by their photographers /
> brands. Turning one into a cartoon makes a *derivative work* — fine for the
> watches **you own** (use your own photos), but a grey area for the ones you
> don't. See the chat discussion.

When you have an image, save it / its cartoon as \`<file name>\` into
\`public/watches/\` and it appears automatically (SVG fallback otherwise).

## Your collection (use your own photos where possible)

${owned.map(row).join("\n")}
## Reference pool

${rest.map(row).join("\n")}`;

writeFileSync("SOURCING_GUIDE.md", md);
console.log(`SOURCING_GUIDE.md written (${WATCHES.length} watches).`);
