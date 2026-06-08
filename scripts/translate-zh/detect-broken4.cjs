// Find files with JSON-wrapped or other major corruption
const { execSync } = require("child_process");
const { readFileSync } = require("fs");

const out = execSync('git diff --name-only site/src/', { encoding: "utf8" });
const files = out.trim().split("\n").filter(Boolean);
const issues = { jsonWrapped: 0, parseTest: 0, fenceAdded: 0, truncated: 0, unbalanced: 0 };
const samples = [];

for (const f of files) {
	try {
		const cur = readFileSync(f, "utf-8");
		const orig = execSync("git show HEAD:" + f, { encoding: "utf-8" });

		// Try to parse as TypeScript/JavaScript - use a quick syntax heuristic
		// Count braces
		const o = (cur.match(/[\{\[\(]/g) || []).length;
		const c = (cur.match(/[\}\]\)]/g) || []).length;
		if (Math.abs(o - c) > 5) {
			issues.unbalanced++;
			samples.push([f, "unbalanced", `o=${o}`, `c=${c}`]);
			continue;
		}
		if (cur.length < orig.length * 0.6) {
			issues.truncated++;
			samples.push([f, "truncated", `o=${orig.length}`, `c=${cur.length}`]);
			continue;
		}
		// Backtick count increase
		const curFence = (cur.match(/```/g) || []).length;
		const origFence = (orig.match(/```/g) || []).length;
		if (curFence > origFence) {
			issues.fenceAdded++;
			samples.push([f, "fence++", `o=${origFence}`, `c=${curFence}`]);
			continue;
		}
		// JSON-wrapped: starts with { followed by space/quote and "translatedContent" or similar
		if (/^\s*\{\s*"(translatedContent|content|translation|code|result|output|response)":/m.test(cur) && !/^\s*\{\s*"/m.test(orig)) {
			issues.jsonWrapped++;
			samples.push([f, "json-wrapped"]);
			continue;
		}
		// Try to run vite:oxc via simple check: does it have obvious syntax issues?
		// Skip - too complex. Just do a quick parse attempt with node.
		try {
			// For .ts/.tsx files, try basic syntax check
			if (f.endsWith(".ts") || f.endsWith(".tsx")) {
				// Use a Function constructor for plain JS check (won't work for TS but catches obvious errors)
				// Or use the TS compiler
				const ts = require("typescript");
				const sf = ts.createSourceFile(f, cur, ts.ScriptTarget.Latest, true);
				// Get parse errors
				const parseErrors = sf.parseDiagnostics || [];
				if (parseErrors.length > 0) {
					issues.parseTest++;
					const first = parseErrors[0];
					const msg = ts.flattenDiagnosticMessageText(first.messageText, "\n");
					samples.push([f, "parse-error", msg.slice(0, 80)]);
				}
			}
		} catch (e) {}
	} catch (e) {}
}
console.log("issues:", issues);
console.log("---samples---");
for (const s of samples) console.log(" ", s.join(" "));
