const { readFileSync, statSync } = require("fs");
const files = [
	"site/src/api/queries/chats.ts",
	"site/src/api/api.ts",
	"site/src/modules/resources/AgentLogs/mocks.tsx",
	"site/src/pages/AgentsPage/components/AgentChatInput.tsx",
	"site/src/pages/CoderCupPage/LunarLander.tsx",
	"site/src/testHelpers/entities.ts",
];
for (const f of files) {
	const st = statSync(f);
	const cur = readFileSync(f, "utf-8");
	console.log(`${f.padEnd(70)} ${st.size}B  hasEnText=${/[A-Za-z]{4,}/.test(cur)&&cur.length>=200}`);
}
