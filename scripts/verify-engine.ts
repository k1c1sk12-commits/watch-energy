import { assertPoolBalance, distinctPickCount, getReading, parseDOB } from "../src/lib/engine";
import { WATCHES } from "../src/lib/watches";
import { VIBES } from "../src/lib/types";

let failed = false;
function check(label: string, cond: boolean, detail = "") {
  console.log(`${cond ? "✓" : "✗"} ${label}${detail ? " — " + detail : ""}`);
  if (!cond) failed = true;
}

// Pool balance (case + dial + strap coverage, strap-energy integrity)
const balErrors = assertPoolBalance(WATCHES);
check("pool covers all 5 energies on case/dial/strap + strap integrity", balErrors.length === 0, balErrors.join("; "));

// Distribution
const distinct = distinctPickCount(WATCHES);
check("variety across 25 combos", distinct >= 5, `${distinct} distinct picks`);

// Determinism
const a = getReading({ y: 1990, m: 5, d: 12 }, "BOLD");
const b = getReading({ y: 1990, m: 5, d: 12 }, "BOLD");
check("deterministic (same input -> same watch)", a.watch.id === b.watch.id, a.watch.id);
check("match% in 80-99", a.matchPercent >= 80 && a.matchPercent <= 99, String(a.matchPercent));

// Validation
check("rejects Feb 30", parseDOB("1990-02-30").ok === false);
check("rejects future date", parseDOB("2099-01-01").ok === false);
check("accepts valid date", parseDOB("1988-07-07").ok === true);

// Spread sample — show watch distribution across many synthetic users
const counts: Record<string, number> = {};
let ownedHits = 0;
let totalHits = 0;
for (let y = 1960; y <= 2005; y++) {
  for (let m = 1; m <= 12; m++) {
    for (const d of [3, 9, 15, 21, 27]) {
      for (const v of VIBES) {
        const r = getReading({ y, m, d }, v);
        counts[r.watch.id] = (counts[r.watch.id] ?? 0) + 1;
        totalHits++;
        if (r.watch.owned) ownedHits++;
      }
    }
  }
}
console.log(`\nOwned-collection share: ${((ownedHits / totalHits) * 100).toFixed(1)}%`);
const sorted = Object.entries(counts).sort((x, y) => y[1] - x[1]);
const total = sorted.reduce((s, [, c]) => s + c, 0);
console.log("\nDistribution across", total, "synthetic readings,", sorted.length, "distinct watches:");
for (const [id, c] of sorted) {
  const pct = ((c / total) * 100).toFixed(1);
  console.log(`  ${pct.padStart(5)}%  ${id}`);
}
check("at least 15 distinct watches surface", sorted.length >= 15, `${sorted.length}`);
const topShare = sorted[0][1] / total;
check("no single watch dominates >30%", topShare <= 0.3, `${(topShare * 100).toFixed(1)}%`);
check("no Hublot in pool", !WATCHES.some((w) => /hublot/i.test(w.brand)));
check("pool size is 35", WATCHES.length === 35, `${WATCHES.length}`);

console.log("\nSample readings (recipe -> watch):");
for (const [dob, v] of [
  [{ y: 1992, m: 3, d: 21 }, "CALM"],
  [{ y: 1985, m: 11, d: 30 }, "MAGNETIC"],
  [{ y: 2000, m: 1, d: 1 }, "FOCUSED"],
] as const) {
  const r = getReading(dob, v);
  console.log(`\n  [${v}] recipe: ${r.recipe.caseText} · ${r.recipe.dialText} dial · ${r.recipe.strapText}`);
  console.log(`  -> ${r.watch.brand} ${r.watch.model} — ${r.matchPercent}% · TOP ${r.rarity}%`);
  console.log(`  ${r.reason}`);
}

console.log(failed ? "\n❌ SOME CHECKS FAILED" : "\n✅ ALL CHECKS PASSED");
process.exit(failed ? 1 : 0);
