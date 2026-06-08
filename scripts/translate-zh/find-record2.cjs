// Search for Record with Chinese keys using a more flexible pattern
const { execSync } = require("child_process");
const { readFileSync } = require("fs");

const out = execSync('git diff --name-only site/src/', { encoding: "utf8" });
const files = out.trim().split("\n").filter(Boolean);
const cn = /[\u4e00-\u9fff]/;

for (const f of files) {
	try {
		const cur = readFileSync(f, "utf-8");
		if (!cn.test(cur)) continue;
		const lines = cur.split("\n");
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].includes("Record<") && cn.test(lines[i])) {
				// Multiline Record<>
				let end = i;
				let depth = 0;
				let text = "";
				for (let j = i; j < Math.min(lines.length, i + 30); j++) {
					text += lines[j] + "\n";
					for (const ch of lines[j]) {
						if (ch === "<") depth++;
						if (ch === ">") depth--;
					}
					if (depth === 0 && j > i) {
						end = j;
						break;
					}
				}
				console.log(`${f}:${i + 1}`);
				console.log(text.slice(0, 400));
				console.log("---");
				break;
			}
		}
	} catch (e) {}
}
