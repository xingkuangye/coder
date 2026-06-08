// Probe server from outside via real curl
const { execSync } = require("child_process");
const url = "http://154.44.25.57:3000";
const tests = [
	{ path: "/healthz", expect: 200 },
	{ path: "/", expect: 200 },
	{ path: "/api/v2", expect: [200, 404] },
];
for (const t of tests) {
	try {
		const out = execSync(`curl -sI -m 10 -o NUL -w "%{http_code}" ${url}${t.path}`, { encoding: "utf-8" });
		const code = Number(out.trim());
		const exp = Array.isArray(t.expect) ? t.expect : [t.expect];
		const ok = exp.includes(code);
		console.log(`${t.path}: HTTP ${code} ${ok ? "OK" : "FAIL (expected " + exp.join("|") + ")"}`);
	} catch (e) {
		console.log(`${t.path}: ERR ${e.message.slice(0, 100)}`);
	}
}
