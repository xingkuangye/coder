// Get original content of broken files
const { execSync } = require("child_process");
const files = [
	"site/src/pages/AgentsPage/components/ChatConversation/chatError.ts",
	"site/src/pages/AgentsPage/components/ChatConversation/messageParsing.ts",
	"site/src/pages/AgentsPage/components/ChatConversation/streamState.ts",
	"site/src/pages/OrganizationSettingsPage/IdpSyncPage/IdpRoleSyncForm.tsx",
];
for (const f of files) {
	try {
		const orig = execSync("git show HEAD:" + f, { encoding: "utf-8" });
		const lines = orig.split("\n");
		const cur = require("fs").readFileSync(f, "utf-8").split("\n");
		console.log(`=== ${f} (line numbers may differ) ===`);
		// Find lines that have the same shape as the broken ones
		for (let i = 0; i < lines.length; i++) {
			if (/error|running|completed|Group|Role|kind|state/.test(lines[i]) && /\?\?|===|=/.test(lines[i])) {
				if (i < cur.length && lines[i] !== cur[i]) {
					console.log(`  HEAD L${i + 1}: ${lines[i].trim()}`);
					console.log(`  cur  L${i + 1}: ${(cur[i] || "").trim()}`);
				}
			}
		}
	} catch (e) {
		console.log(`  err: ${e.message}`);
	}
}
