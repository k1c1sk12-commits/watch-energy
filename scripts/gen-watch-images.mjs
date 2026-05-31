// Generates a cartoon illustration for each watch via the OpenAI Images API
// (gpt-image-1), saving public/watches/<id>.png. Reads the key from the env var
// OPENAI_API_KEY or from a gitignored .env.local file. NEVER commits the key.
//
// Usage:
//   node scripts/gen-watch-images.mjs            # only missing images
//   node scripts/gen-watch-images.mjs --force    # regenerate all
//   node scripts/gen-watch-images.mjs <id> <id>  # only these ids
//   QUALITY=high node scripts/gen-watch-images.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DIR = "public/watches";
const QUALITY = process.env.QUALITY || "medium"; // low | medium | high
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const onlyIds = args.filter((a) => !a.startsWith("--"));

function loadKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();
  if (existsSync(".env.local")) {
    const m = /^OPENAI_API_KEY=(.+)$/m.exec(readFileSync(".env.local", "utf8"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const STYLE =
  "Polished vector illustration of a single luxury wristwatch, front view, " +
  "perfectly centred, smooth realistic metallic gradients with a bright polished " +
  "finish, a soft glossy sheen and gentle depth, a subtle light reflection on the " +
  "dial, accurate true-to-life metal colour (bright silver for steel, warm yellow " +
  "for yellow gold, soft pink for rose gold, light grey for titanium, dark grey for " +
  "black ceramic), refined elegant premium look, transparent background, NO text, " +
  "NO numbers, NO brand name, NO logo, NO markings — a generic unbranded watch. " +
  "Consistent high-end illustration style across a matching set. Watch: ";

const WATCHES = [
  ["ap-ro-16202st", "octagonal steel case with eight hexagonal screws on the bezel, deep blue grid-textured dial, integrated steel bracelet"],
  ["ap-ro-26240st", "octagonal steel case with bezel screws, green grid dial with two small chronograph sub-dials, integrated steel bracelet"],
  ["ap-ro-77450st", "slim octagonal steel case with bezel screws, clean white grid dial, integrated steel bracelet"],
  ["ap-code-15210qt", "round steel case with a black ceramic middle and curved arched lugs, smoked grey dial, black rubber strap"],
  ["ap-code-15212nb", "round white-gold case with arched lugs, deep blue starry aventurine dial with small rotating wandering-hour discs, blue leather strap"],
  ["lange-1-moonphase", "round rose-gold case, silver asymmetric dial with off-centre time, a large date window and a small moon-phase, brown leather strap"],
  ["daniel-roth-447", "oval double-ellipse yellow-gold case, salmon skeletonised dial showing the gears, brown leather strap"],
  ["chronoswiss-regulator", "round steel case with a big onion crown, white regulator dial with separate hour, minute and seconds sub-dials, black leather strap"],
  ["cw-bel-canto", "round titanium case, salmon dial with an exposed chiming hammer and a curved gong, green textile strap"],
  ["breguet-3357ba", "oval yellow-gold case with a finely fluted caseband, silver hand-engraved guilloche dial with a tourbillon opening, brown leather strap"],
  ["rolex-sub-126610ln", "round steel dive case with a black rotating bezel, glossy black dial with round luminous markers, steel bracelet"],
  ["patek-nautilus-5711", "rounded-octagon steel case with small side ears, blue horizontally-embossed dial, integrated steel bracelet"],
  ["omega-speedmaster", "round steel case with a black tachymeter bezel, black dial with three chronograph sub-dials, steel bracelet"],
  ["cartier-tank-louis", "rectangular yellow-gold tank case with vertical brancards, silver dial, brown leather strap"],
  ["vc-overseas-4500v", "round steel case with a six-sided bezel, blue sunburst dial, integrated steel bracelet"],
  ["jlc-reverso-tribute", "rectangular art-deco steel case with three horizontal gadroon lines, blue sunray dial, black leather strap"],
  ["gs-snowflake", "round titanium case, textured snowy-white dial with a small power-reserve arc, steel bracelet"],
  ["panerai-luminor", "cushion-shaped steel case with a hinged crown-protecting bridge, black dial, brown leather strap"],
  ["vc-patrimony-platinum", "ultra-thin round platinum case, minimalist silver dial with slim baton markers, black leather strap"],
  ["lange-zeitwerk", "round platinum case, black dial with bold jumping digital hour and minute windows across the centre, black leather strap"],
  ["iwc-big-pilot", "large round steel pilot case with a conical crown, black dial with a triangle at the top, brown leather strap"],
  ["fpjourne-bleu", "round blue-grey tantalum case, vivid electric-blue dial with an off-centre small-seconds sub-dial, black leather strap"],
  ["fpjourne-octa-lune", "round red-gold case, silver guilloche dial with a date arc, a power-reserve gauge and a small moon-phase, brown leather strap"],
  ["moser-endeavour-fume", "round steel case, smoky blue fume gradient dial with absolutely no markers and no text, black leather strap"],
  ["laurent-ferrier-origin", "round titanium case with gently curved lugs, green gradient opaline dial, brown leather strap"],
  ["debethune-db28", "round polished-titanium case with floating articulated lugs on the sides, mirror-polished blued steel dial, black leather strap"],
  ["czapek-antarctique", "round steel case with a fluted integrated bezel, salmon dial with subtle hobnail texture, integrated steel bracelet"],
  ["mbf-lm101", "round rose-gold case, white lacquer dial with a large balance wheel suspended and floating above the dial plus a small time sub-dial, brown leather strap"],
  ["voutilainen-vingt8", "round white-gold case with teardrop lugs, finely hand-engraved silver-grey guilloche dial, black leather strap"],
  ["gronefeld-1941", "round steel case with stepped lugs, warm salmon dial with a small seconds sub-dial, brown leather strap"],
  ["akrivia-cc2", "round platinum case with a stepped bezel, glossy white grand-feu enamel dial with a small seconds, black leather strap"],
  ["lange-datograph", "round platinum case, black dial with two chronograph sub-dials and a small power-reserve, black leather strap"],
  ["breguet-tradition", "round rose-gold case, an off-centre silver chapter ring with the bare symmetric movement bridges exposed across the dial, brown leather strap"],
  ["patek-calatrava-5226", "round white-gold case, charcoal-grey dial with a hobnail-guilloche centre and a smooth grained outer ring, black calf strap"],
  ["greubel-balancier", "round white-gold case, silver-grey dial with a large inclined balance wheel visible in an opening, black leather strap"],
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function genOne(key, id, config, attempt = 1) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: STYLE + config,
      size: "1024x1024",
      quality: QUALITY,
      background: "transparent",
      n: 1,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt <= 3) {
      const wait = 4000 * attempt;
      console.log(`  ${id}: ${res.status}, retry in ${wait / 1000}s…`);
      await sleep(wait);
      return genOne(key, id, config, attempt + 1);
    }
    throw new Error(`${id}: HTTP ${res.status} — ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${id}: no image in response`);
  writeFileSync(`${DIR}/${id}.png`, Buffer.from(b64, "base64"));
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error(
      "No OpenAI key. Set OPENAI_API_KEY, or create .env.local with:\n  OPENAI_API_KEY=sk-...",
    );
    process.exit(1);
  }
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });

  let list = WATCHES;
  if (onlyIds.length) list = WATCHES.filter(([id]) => onlyIds.includes(id));
  if (!FORCE) list = list.filter(([id]) => !existsSync(`${DIR}/${id}.png`));

  console.log(`Generating ${list.length} image(s) at quality=${QUALITY}…`);
  let ok = 0;
  for (const [id, config] of list) {
    try {
      process.stdout.write(`• ${id} … `);
      await genOne(key, id, config);
      ok++;
      console.log("done");
    } catch (e) {
      console.log("FAILED");
      console.error(`  ${e.message}`);
    }
    await sleep(1200);
  }
  console.log(`\nFinished: ${ok}/${list.length} generated into ${DIR}/`);
}

main();
