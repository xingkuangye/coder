// More thorough broken detection: also catches stray ``` ANYWHERE, not just at line start
const { execSync } = require("child_process");
const { readFileSync } = require("fs");

const out = execSync('git diff --name-only site/src/', { encoding: "utf8" });
const files = out.trim().split("\n").filter(Boolean);
let truncated = 0, fenceAnywhere = 0, unclosedBracket = 0, samples = [];

for (const f of files) {
  try {
    const cur = readFileSync(f, "utf-8");
    const orig = execSync("git show HEAD:" + f, { encoding: "utf-8" });
    if (cur.length < orig.length * 0.6) {
      truncated++;
      samples.push([f, "size", `o=${orig.length}`, `c=${cur.length}`]);
      continue;
    }
    // ANY ``` in current when orig has none
    if (cur.includes("```") && !orig.includes("```")) {
      fenceAnywhere++;
      samples.push([f, "fence-anywhere"]);
      continue;
    }
    const o = (cur.match(/[\{\[\(]/g) || []).length;
    const c = (cur.match(/[\}\]\)]/g) || []).length;
    if (Math.abs(o - c) > 5) {
      unclosedBracket++;
      samples.push([f, "unbalanced", `o=${o}`, `c=${c}`]);
    }
  } catch (e) {}
}
console.log("total changed:", files.length);
console.log("truncated:", truncated);
console.log("fence-anywhere:", fenceAnywhere);
console.log("unbalanced:", unclosedBracket);
console.log("---samples---");
for (const s of samples) console.log(" ", s.join(" "));
