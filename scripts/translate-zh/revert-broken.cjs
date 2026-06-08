const { execSync } = require("child_process");
const files = [
	"site/src/components/FormField/FormField.tsx",
	"site/src/components/Timeline/TimelineEntry.tsx",
	"site/src/pages/CliAuthPage/CliAuthPage.tsx",
	"site/src/pages/WorkspacesPage/batchActions.ts",
	"site/src/pages/AgentsPage/components/ChatElements/tools/previewConstants.ts",
	"site/src/theme/darkProtanDeuter/mui.ts",
	"site/src/theme/darkTritan/mui.ts",
];
for (const f of files) {
	try {
		execSync(`git checkout HEAD -- "${f}"`, { stdio: "pipe" });
		console.log(`reverted: ${f}`);
	} catch (e) {
		console.log(`FAILED: ${f} - ${e.message}`);
	}
}
