const { execSync } = require("child_process");
const sshCmd = (cmd) => execSync(`ssh xingkuangye@154.44.25.57 "${cmd.replace(/"/g, '\\"')}"`, { encoding: "utf-8" });
for (const n of [1, 2, 4, 5, 7]) {
	console.log(`=== ${n}.conf ===`);
	try {
		const out = sshCmd(`docker exec nginx-proxy-manager cat /data/nginx/proxy_host/${n}.conf`);
		console.log(out);
	} catch (e) {
		console.log(`err: ${e.message.slice(0, 100)}`);
	}
}
