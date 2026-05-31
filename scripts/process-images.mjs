// Normalises watch illustrations dropped into public/watches/:
//   1. lowercase the .PNG extension (Vercel is case-sensitive)
//   2. if the image has no real transparency, flood-fill the background away
//      from the four corners (keeps enclosed dials intact)
//   3. resize to max 768px and compress with pngquant
// Idempotent: already-small transparent .png files are left untouched.
//
// Needs: sips (macOS), ImageMagick (magick), pngquant.
import { execSync } from "node:child_process";
import { readdirSync, renameSync, statSync } from "node:fs";

const DIR = "public/watches";
const sh = (c) => execSync(c, { stdio: ["ignore", "pipe", "ignore"] }).toString();
const q = (p) => `'${p.replace(/'/g, "'\\''")}'`;

function hasAlpha(p) {
  try {
    return /hasAlpha:\s*yes/.test(sh(`sips -g hasAlpha ${q(p)}`));
  } catch {
    return false;
  }
}
function width(p) {
  try {
    return parseInt(/pixelWidth:\s*(\d+)/.exec(sh(`sips -g pixelWidth ${q(p)}`))?.[1] ?? "0", 10);
  } catch {
    return 0;
  }
}

let processed = 0;
for (const f of readdirSync(DIR)) {
  if (!/\.png$/i.test(f)) continue;
  let path = `${DIR}/${f}`;

  // 1. lowercase extension
  if (/\.PNG$/.test(f)) {
    const lower = `${DIR}/${f.replace(/\.PNG$/, ".png")}`;
    renameSync(path, `${path}.tmp`);
    renameSync(`${path}.tmp`, lower);
    path = lower;
    console.log(`• ${f} -> ${f.replace(/\.PNG$/, ".png")}`);
  }

  const kb = statSync(path).size / 1024;
  const alreadyClean = hasAlpha(path) && width(path) <= 800 && kb < 320;
  if (alreadyClean) continue;

  // 2. background removal if it isn't really transparent
  if (!hasAlpha(path)) {
    const corners = ["0,0", "%[fx:w-1],0", "0,%[fx:h-1]", "%[fx:w-1],%[fx:h-1]"];
    const draws = corners.map((c) => `-draw 'alpha ${c} floodfill'`).join(" ");
    sh(
      `magick ${q(path)} -alpha set -bordercolor white -border 1 -fuzz 22% -fill none ${draws} -shave 1x1 ${q(path)}`,
    );
    console.log(`  bg removed: ${path.split("/").pop()}`);
  }

  // 3. resize + compress
  if (width(path) > 768) sh(`sips -Z 768 ${q(path)}`);
  try {
    sh(`pngquant --force --quality 60-88 --output ${q(path)} ${q(path)}`);
  } catch {
    /* pngquant skips images it can't shrink further */
  }
  processed++;
  console.log(`  optimised: ${path.split("/").pop()} (${Math.round(statSync(path).size / 1024)}KB)`);
}
console.log(`\nProcessed ${processed} image(s).`);
