const { execSync } = require("child_process");
const { readFileSync, statSync } = require("fs");
const files = [
	"site/src/api/queries/chats.ts",
	"site/src/api/api.ts",
	"site/src/modules/resources/AgentLogs/mocks.tsx",
	"site/src/pages/AgentsPage/components/AgentChatInput.tsx",
	"site/src/pages/CoderCupPage/LunarLander.tsx",
	"site/src/testHelpers/entities.ts",
];
console.log("=== 6 large files status ===");
for (const f of files) {
	const orig = execSync("git show HEAD:" + f, { encoding: "utf-8" });
	const cur = readFileSync(f, "utf-8");
	const enCount = (cur.match(/[A-Za-z]{4,}/g) || []).length;
	const cnCount = (cur.match(/[一-鿿]/g) || []).length;
	const truncated = cur.length < orig.length * 0.6;
	const noFenceInOrig = !orig.includes("```");
	const hasFenceInCur = /```/.test(cur);
	console.log(`${f.padEnd(70)} orig=${orig.length}B cur=${cur.length}B en=${enCount} cn=${cnCount} truncated=${truncated} strayFence=${noFenceInOrig && hasFenceInCur}`);
}
