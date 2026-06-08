// Use TypeScript compiler to get detailed parse errors
const ts = require("E:/coder/site/node_modules/typescript");
const { readFileSync } = require("fs");
const f = "site/src/pages/TasksPage/TasksPage.tsx";
const src = readFileSync(f, "utf-8");
const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true);
const diags = sf.parseDiagnostics || [];
console.log("parse diagnostics:", diags.length);
for (const d of diags) {
	const msg = ts.flattenDiagnosticMessageText(d.messageText, "\n");
	if (d.start !== undefined) {
		const { line, character } = sf.getLineAndCharacterOfPosition(d.start);
		console.log(`  line ${line + 1}, col ${character + 1}: ${msg}`);
		// Show context
		const lines = src.split("\n");
		const start = Math.max(0, line - 2);
		const end = Math.min(lines.length, line + 3);
		for (let i = start; i < end; i++) {
			const marker = i === line ? ">>>" : "   ";
			console.log(`${marker} ${i + 1}: ${lines[i]}`);
		}
	} else {
		console.log(`  ?: ${msg}`);
	}
}
