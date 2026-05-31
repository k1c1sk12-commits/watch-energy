// Cartoon-ifies real watch photos via the OpenAI Images *edits* endpoint
// (image-to-image, gpt-image-1). Put a source photo at
//   public/watches/_source/<id>.<jpg|jpeg|png|webp>
// and it writes a styled illustration to public/watches/<id>.png — following the
// real watch's shape/layout, so it actually looks like that model.
//
// Usage:
//   node scripts/cartoonify-sources.mjs            # all sources without an output yet
//   node scripts/cartoonify-sources.mjs --force    # redo all sources
//   QUALITY=high node scripts/cartoonify-sources.mjs
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = "public/watches/_source";
const OUT = "public/watches";
const QUALITY = process.env.QUALITY || "high"; // high renders dial logos/text cleanly
const FORCE = process.argv.includes("--force");

function loadKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY.trim();
  if (existsSync(".env.local")) {
    const m = /^OPENAI_API_KEY=(.+)$/m.exec(readFileSync(".env.local", "utf8"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const PROMPT = `Transform this watch photo into a clean flat 2D vector illustration.

STYLE LOCK V1
- Front-facing orthographic view
- Perfectly centered
- Flat vector illustration
- Luxury Swiss watch catalog style
- Thin black outlines
- Smooth solid colors
- Minimal shading
- No texture
- No watercolor
- No sketch effect
- No comic exaggeration
- Preserve all watch details accurately
- Preserve dial layout, hands, numerals, subdials and case geometry
- Preserve original colors faithfully
- Preserve the brand logo, brand name and any dial text exactly as in the photo
- Consistent line weight
- Consistent style across all images

BACKGROUND
- Remove background completely
- Transparent background
- No shadow
- No floor
- No reflections
- No environment
- No backdrop
- Isolated object only

OUTPUT
- Transparent PNG
- SVG-style vector artwork
- High resolution
- Premium luxury watch illustration`;

const MIME = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function editOne(key, id, file, attempt = 1) {
  const ext = file.split(".").pop().toLowerCase();
  const buf = readFileSync(`${SRC}/${file}`);
  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("prompt", PROMPT);
  form.append("size", "1024x1024");
  form.append("quality", QUALITY);
  form.append("background", "transparent");
  form.append("n", "1");
  form.append("image", new Blob([buf], { type: MIME[ext] || "image/png" }), file);

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) {
    const body = await res.text();
    if ((res.status === 429 || res.status >= 500) && attempt <= 3) {
      const wait = 4000 * attempt;
      console.log(`  ${id}: ${res.status}, retry in ${wait / 1000}s…`);
      await sleep(wait);
      return editOne(key, id, file, attempt + 1);
    }
    throw new Error(`${id}: HTTP ${res.status} — ${body.slice(0, 300)}`);
  }
  const json = await res.json();
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error(`${id}: no image in response`);
  writeFileSync(`${OUT}/${id}.png`, Buffer.from(b64, "base64"));
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error("No OpenAI key (set OPENAI_API_KEY or .env.local).");
    process.exit(1);
  }
  if (!existsSync(SRC)) mkdirSync(SRC, { recursive: true });

  let files = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files.length) {
    console.log(`No source images in ${SRC}/. Drop <id>.jpg files there first.`);
    return;
  }
  if (!FORCE) files = files.filter((f) => !existsSync(`${OUT}/${f.replace(/\.[^.]+$/, "")}.png`));

  console.log(`Cartoon-ifying ${files.length} source image(s) at quality=${QUALITY}…`);
  let ok = 0;
  for (const file of files) {
    const id = file.replace(/\.[^.]+$/, "");
    try {
      process.stdout.write(`• ${id} … `);
      await editOne(key, id, file);
      ok++;
      console.log("done");
    } catch (e) {
      console.log("FAILED");
      console.error(`  ${e.message}`);
    }
    await sleep(1200);
  }
  console.log(`\nFinished: ${ok}/${files.length} → ${OUT}/`);
}

main();
