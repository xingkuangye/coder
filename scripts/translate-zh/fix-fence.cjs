// Remove stray ``` from end of file
const { readFileSync, writeFileSync } = require("fs");
const files = [
	"site/src/components/Search/Search.tsx",
	"site/src/utils/reconnectingWebSocket.ts",
];
for (const f of files) {
	let c = readFileSync(f, "utf-8");
	const before = c;
	// Strip trailing ``` line (with optional whitespace/newline after)
	c = c.replace(/\r?\n```[ \t]*\r?\n?$/, "\n");
	c = c.replace(/```[ \t]*\r?\n?$/, "\n");
	writeFileSync(f, c, "utf-8");
	const fenceAfter = (c.match(/```/g) || []).length;
	console.log(`${f}: changed=${before !== c}  fence count now ${fenceAfter}`);
	console.log(`  last 80: ${JSON.stringify(c.slice(-80))}`);
}
