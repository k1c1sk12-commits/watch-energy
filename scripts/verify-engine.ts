import { assertPoolBalance, distinctPickCount, getReading, parseDOB, type Answers } from "../src/lib/engine";
import { WATCHES } from "../src/lib/watches";
import { ENERGIES, VIBES, type Energy, type Vibe } from "../src/lib/types";

let failed = false;
function check(label: string, cond: boolean, detail = "") {
  console.log(`${cond ? "✓" : "✗"} ${label}${detail ? " — " + detail : ""}`);
  if (!cond) failed = true;
}

// Build an Answers object; bias defaults to the nature's energy, overridable.
function mk(
  dob: { y: number; m: number; d: number },
  nature: Vibe,
  e?: Energy,
): Answers {
  const b = e ?? "LUMEN";
  return { dob, nature, bias: { metal: b, mind: b, feel: b }, misread: b, name: "" };
}

// Pool balance (case + dial + strap coverage, strap-energy integrity)
const balErrors = assertPoolBalance(WATCHES);
check("pool covers all 5 energies on case/dial/strap + strap integrity", balErrors.length === 0, balErrors.join("; "));

// Distribution
const distinct = distinctPickCount(WATCHES);
check("variety across base×bias×nature combos", distinct >= 15, `${distinct} distinct picks`);

// Determinism
const a = getReading(mk({ y: 1990, m: 5, d: 12 }, "BOLD", "EMBER"));
const b = getReading(mk({ y: 1990, m: 5, d: 12 }, "BOLD", "EMBER"));
check("deterministic (same input -> same watch)", a.watch.id === b.watch.id, a.watch.id);
check("match% in 80-99", a.matchPercent >= 80 && a.matchPercent <= 99, String(a.matchPercent));
check("personal line present", a.personalLine.length > 0);

// Validation
check("rejects Feb 30", parseDOB("1990-02-30").ok === false);
check("rejects future date", parseDOB("2099-01-01").ok === false);
check("accepts valid date", parseDOB("1988-07-07").ok === true);

// Spread sample — sweep birth dates, natures and biases
const counts: Record<string, number> = {};
let ownedHits = 0;
let totalHits = 0;
for (let y = 1960; y <= 2005; y++) {
  for (const m of [2, 6, 10]) {
    for (const d of [7, 21]) {
      for (const v of VIBES) {
        for (const e of ENERGIES) {
          const r = getReading(mk({ y, m, d }, v, e));
          counts[r.watch.id] = (counts[r.watch.id] ?? 0) + 1;
          totalHits++;
          if (r.watch.owned) ownedHits++;
        }
      }
    }
  }
}
console.log(`\nOwned-collection share: ${((ownedHits / totalHits) * 100).toFixed(1)}%`);
const sorted = Object.entries(counts).sort((x, y) => y[1] - x[1]);
const total = sorted.reduce((s, [, c]) => s + c, 0);
console.log("\nDistribution across", total, "synthetic readings,", sorted.length, "distinct watches (top 12):");
for (const [id, c] of sorted.slice(0, 12)) {
  console.log(`  ${((c / total) * 100).toFixed(1).padStart(5)}%  ${id}`);
}
check("at least 20 distinct watches surface", sorted.length >= 20, `${sorted.length}`);
const topShare = sorted[0][1] / total;
check("no single watch dominates >25%", topShare <= 0.25, `${(topShare * 100).toFixed(1)}%`);
check("no Hublot in pool", !WATCHES.some((w) => /hublot/i.test(w.brand)));
check("pool size is 35", WATCHES.length === 35, `${WATCHES.length}`);

console.log("\nSample readings:");
for (const [dob, v, e] of [
  [{ y: 1992, m: 3, d: 21 }, "CALM", "TIDE"],
  [{ y: 1985, m: 11, d: 30 }, "MAGNETIC", "VERDANT"],
  [{ y: 2000, m: 1, d: 1 }, "FOCUSED", "LUMEN"],
] as const) {
  const r = getReading({ ...mk(dob, v, e), name: "Kenson" });
  console.log(`\n  [${v}/${e}] recipe: ${r.recipe.caseText} · ${r.recipe.dialText} · ${r.recipe.strapText}`);
  console.log(`  -> ${r.name}'s ${r.watch.model} — ${r.matchPercent}% · TOP ${r.rarity}%`);
  console.log(`  ${r.reason}`);
  console.log(`  ${r.personalLine}`);
}

console.log(failed ? "\n❌ SOME CHECKS FAILED" : "\n✅ ALL CHECKS PASSED");
process.exit(failed ? 1 : 0);
