// Find files that define Record<Chinese, ...> types — these are broken
const { execSync } = require("child_process");
const { readFileSync } = require("fs");

const out = execSync('git diff --name-only site/src/', { encoding: "utf8" });
const files = out.trim().split("\n").filter(Boolean);
const issues = { recordWithChineseKeys: 0, statusEnums: 0 };
const samples = [];

// Look for Record<"中文字符", ...> or Record<... | "中文" | ..., ...>
const recordRe = /Record<[^>]*[\u4e00-\u9fff][^>]*>/g;
const statusEnumRe = /(type|enum)\s+\w+\s*=\s*[\s\S]{0,500}?[\u4e00-\u9fff]/g;

for (const f of files) {
	try {
		const cur = readFileSync(f, "utf-8");
		// Check if Record type contains Chinese keys
		const matches = cur.match(recordRe);
		if (matches) {
			// Compare to original - if original didn't have Chinese in Record, this is bad
			const orig = execSync("git show HEAD:" + f, { encoding: "utf-8" });
			if (!recordRe.test(orig)) {
				issues.recordWithChineseKeys++;
				samples.push([f, "record-cn", matches[0].slice(0, 100)]);
			}
		}
	} catch (e) {}
}
console.log("issues:", issues);
console.log("---samples---");
for (const s of samples) console.log(" ", s.join(" "));
