// Find Record<...> with Chinese keys
const { execSync } = require("child_process");
const { readFileSync } = require("fs");

const out = execSync('git diff --name-only site/src/', { encoding: "utf8" });
const files = out.trim().split("\n").filter(Boolean);

for (const f of files) {
	try {
		const cur = readFileSync(f, "utf-8");
		// Find Record<...> and check if it has Chinese characters
		const re = /Record<([\s\S]{1,2000}?)>/g;
		let m;
		while ((m = re.exec(cur)) !== null) {
			const body = m[1];
			if (/[\u4e00-\u9fff]/.test(body)) {
				console.log(`${f}:`);
				// Print just the Record<...> line
				const startLine = cur.slice(0, m.index).split("\n").length;
				const recordLine = cur.slice(m.index, m.index + m[0].length);
				console.log(`  line ${startLine}: ${recordLine.slice(0, 200)}`);
				// Print original for comparison
				try {
					const orig = execSync("git show HEAD:" + f, { encoding: "utf-8" });
					const reOrig = /Record<([\s\S]{1,2000}?)>/g;
					let mOrig;
					while ((mOrig = reOrig.exec(orig)) !== null) {
						const bodyOrig = mOrig[1];
						if (/Record</.test(bodyOrig)) {
							const startLineOrig = orig.slice(0, mOrig.index).split("\n").length;
							console.log(`  orig line ${startLineOrig}: ${mOrig[0].slice(0, 200)}`);
							break;
						}
					}
				} catch (e) {}
				break;
			}
		}
	} catch (e) {}
}
