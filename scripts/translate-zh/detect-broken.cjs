// Detect broken translated files
const { execSync } = require("child_process");
const { readFileSync } = require("fs");

const out = execSync('git diff --name-only site/src/', { encoding: "utf8" });
const files = out.trim().split("\n").filter(Boolean);
let truncated = 0, fenceArtifact = 0, unclosedBracket = 0, samples = [];

for (const f of files) {
  try {
    const cur = readFileSync(f, "utf-8");
    const orig = execSync("git show HEAD:" + f, { encoding: "utf-8" });
    if (cur.length < orig.length * 0.6) {
      truncated++;
      samples.push([f, "size", `orig=${orig.length}`, `cur=${cur.length}`]);
      continue;
    }
    if (/^```/m.test(cur) && !orig.includes("```")) {
      fenceArtifact++;
      samples.push([f, "fence"]);
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
console.log("stray fences:", fenceArtifact);
console.log("unbalanced brackets:", unclosedBracket);
console.log("---samples (up to 20)---");
for (const s of samples.slice(0, 20)) console.log(" ", s.join(" "));
