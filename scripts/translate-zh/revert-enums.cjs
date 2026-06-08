const { execSync } = require("child_process");
const files = [
	"site/src/pages/AgentsPage/components/ChatConversation/chatError.ts",
	"site/src/pages/AgentsPage/components/ChatConversation/messageParsing.ts",
	"site/src/pages/AgentsPage/components/ChatConversation/streamState.ts",
	"site/src/pages/OrganizationSettingsPage/IdpSyncPage/IdpRoleSyncForm.tsx",
];
for (const f of files) {
	try {
		execSync(`git checkout HEAD -- "${f}"`, { stdio: "pipe" });
		console.log(`reverted: ${f}`);
	} catch (e) {
		console.log(`FAILED: ${f} - ${e.message}`);
	}
}
