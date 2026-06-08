const { readFileSync } = require("fs");
const cur = readFileSync("site/src/pages/TasksPage/TasksPage.tsx", "utf-8");
const lines = cur.split("\n");
for (let i = 268; i < 286; i++) {
	const line = lines[i] || "";
	const codes = [];
	for (let j = 0; j < line.length; j++) {
		const c = line.charCodeAt(j);
		codes.push(c < 32 || c > 126 ? `[${c}]` : line[j]);
	}
	console.log(`${i + 1}: |${codes.join("")}|`);
}
