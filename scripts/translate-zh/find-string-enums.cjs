// Find as const arrays where every element is now Chinese
const { execSync } = require("child_process");
const { readFileSync } = require("fs");

const out = execSync('git diff --name-only site/src/', { encoding: "utf8" });
const files = out.trim().split("\n").filter(Boolean);
const cn = /[\u4e00-\u9fff]/;

for (const f of files) {
	try {
		const cur = readFileSync(f, "utf-8");
		// Find array literals starting with [
		// Simple heuristic: look for lines that are just "中文" in array context
		const lines = cur.split("\n");
		for (let i = 0; i < lines.length; i++) {
			// Look for things like: const foo = ["中文", "中文", ...]
			// Or pattern: "中文", followed by comma
			if (cn.test(lines[i]) && /["'][^"']*[\u4e00-\u9fff][^"']*["']/.test(lines[i])) {
				// Check if it looks like a string literal (not a comment)
				if (lines[i].trim().startsWith("//") || lines[i].trim().startsWith("*")) continue;
				// Look at surrounding context
				const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 1)).join("\n");
				if (/^const\s+\w+\s*=\s*\[/.test(context) || /as\s+const/.test(context)) {
					console.log(`${f}:${i + 1}: ${lines[i].trim()}`);
				}
			}
		}
	} catch (e) {}
}
