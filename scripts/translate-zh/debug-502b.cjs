const { execSync } = require("child_process");
function ssh(cmd) {
	return execSync(`ssh -o ConnectTimeout=20 xingkuangye@154.44.25.57 "${cmd.replace(/"/g, '\\"')}"`, { encoding: "utf-8" });
}
console.log("=== try /bin/sh -c with curl busybox (most nginx-proxy-manager images have it) ===");
try {
	const out = ssh("docker exec nginx-proxy-manager sh -c 'wget -qO- --timeout=5 http://172.17.0.1:3000/healthz 2>&1; echo exit=$?'");
	console.log("out:", out);
} catch (e) { console.log("err:", e.message.slice(0, 200)); }
console.log("=== which tools in the nginx image ===");
try {
	const out = ssh("docker exec nginx-proxy-manager sh -c 'which curl wget busybox 2>&1; ls /usr/bin/ 2>&1 | head -10'");
	console.log(out);
} catch (e) { console.log("err:", e.message.slice(0, 200)); }
