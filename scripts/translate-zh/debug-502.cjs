const { execSync } = require("child_process");
function ssh(cmd) {
	return execSync(`ssh -o ConnectTimeout=20 xingkuangye@154.44.25.57 "${cmd.replace(/"/g, '\\"')}"`, { encoding: "utf-8" });
}
console.log("=== nginx container: curl host:3000 ===");
try {
	const out = ssh("docker exec nginx-proxy-manager wget -qO- --timeout=5 http://172.17.0.1:3000/healthz 2>&1 || echo WGETFAIL");
	console.log("out:", out);
} catch (e) { console.log("err:", e.message.slice(0, 200)); }
console.log("=== nginx container: curl host.docker.internal:3000 ===");
try {
	const out = ssh("docker exec nginx-proxy-manager wget -qO- --timeout=5 http://host.docker.internal:3000/healthz 2>&1 || echo WGETFAIL");
	console.log("out:", out);
} catch (e) { console.log("err:", e.message.slice(0, 200)); }
console.log("=== host: ss -tlnp 3000 ===");
try { console.log(ssh("ss -tlnp 2>/dev/null | grep :3000")); } catch (e) { console.log("err"); }
console.log("=== coderd alive? ===");
try { console.log(ssh("pgrep -af 'out/coder' || echo none")); } catch (e) { console.log("err"); }
