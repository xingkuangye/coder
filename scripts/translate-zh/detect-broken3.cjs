// Detect: backtick count increase, plus other issues
const { execSync } = require("child_process");
const { readFileSync } = require("fs");

const out = execSync('git diff --name-only site/src/', { encoding: "utf8" });
const files = out.trim().split("\n").filter(Boolean);
const issues = { strayFenceAdded: 0, truncated: 0, unbalanced: 0 };
const samples = [];

for (const f of files) {
  try {
    const cur = readFileSync(f, "utf-8");
    const orig = execSync("git show HEAD:" + f, { encoding: "utf-8" });
    if (cur.length < orig.length * 0.6) {
      issues.truncated++;
      samples.push([f, "truncated", `o=${orig.length}`, `c=${cur.length}`]);
      continue;
    }
    // Count backtick triplets (```) - if file has ``` lines that don't pair up, it's stray
    const curFence = (cur.match(/```/g) || []).length;
    const origFence = (orig.match(/```/g) || []).length;
    if (curFence > origFence) {
      issues.strayFenceAdded++;
      samples.push([f, "fence++", `o=${origFence}`, `c=${curFence}`]);
      continue;
    }
    const o = (cur.match(/[\{\[\(]/g) || []).length;
    const c = (cur.match(/[\}\]\)]/g) || []).length;
    if (Math.abs(o - c) > 5) {
      issues.unbalanced++;
      samples.push([f, "unbalanced", `o=${o}`, `c=${c}`]);
    }
  } catch (e) {}
}
console.log("issues:", issues);
console.log("---samples---");
for (const s of samples) console.log(" ", s.join(" "));
