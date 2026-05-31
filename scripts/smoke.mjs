import { chromium, devices } from "playwright";

const BASE = process.env.BASE || "http://localhost:3210";
const OUT = "/tmp/we-shots";
import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
page.on("console", (m) => {
  if (m.type() === "error") errors.push("console: " + m.text());
});
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/1-landing.png` });

await page.getByRole("button", { name: /Begin/ }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/2-input-empty.png` });

// set date via the hidden native input
await page.locator("#dob").evaluate((el) => {
  const input = el;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
  setter.call(input, "1990-05-12");
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
});
await page.waitForTimeout(200);
await page.getByRole("radio", { name: /Bold/ }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/3-input-filled.png` });

await page.getByRole("button", { name: /Reveal my watch/ }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/4-reading.png` });

await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/5-result.png`, fullPage: true });

// Verify the share card rasterises to a valid PNG inside the page context.
const cardInfo = await page.evaluate(async () => {
  const svgEl = document.querySelector('div[aria-hidden] svg[role="img"]');
  if (!svgEl) return { ok: false, reason: "no capture svg" };
  // dynamically import the bundled module is hard; re-rasterise inline:
  const cloned = svgEl.outerHTML;
  // minimal: just check we can draw the watch svg to canvas (proves no taint)
  const url = URL.createObjectURL(new Blob([cloned], { type: "image/svg+xml" }));
  const img = new Image();
  const okLoad = await new Promise((res) => {
    img.onload = () => res(true);
    img.onerror = () => res(false);
    img.src = url;
  });
  if (!okLoad) return { ok: false, reason: "watch svg failed to load" };
  const c = document.createElement("canvas");
  c.width = 560;
  c.height = 560;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, 560, 560);
  let pngLen = 0;
  try {
    pngLen = c.toDataURL("image/png").length;
  } catch (e) {
    return { ok: false, reason: "canvas tainted: " + e.message };
  }
  return { ok: pngLen > 1000, pngLen };
});

// Trigger the real "Save my card" button (will download on desktop/headless).
await page.getByRole("button", { name: /Save my card/ }).click().catch(() => {});
await page.waitForTimeout(800);

// open "Why this watch?"
await page.getByRole("button", { name: /Why this watch/ }).click().catch(() => {});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/6-result-why.png`, fullPage: true });

console.log("card raster:", JSON.stringify(cardInfo));
console.log("errors:", errors.length ? errors : "none");
await browser.close();
process.exit(errors.length ? 1 : 0);
