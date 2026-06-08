const { execSync } = require("child_process");
const tests = [
	"http://154.44.25.57:3000/healthz",
	"http://154.44.25.57:3000/",
	"http://154.44.25.57:3000/api/v2",
	"http://154.44.25.57:3000/api/v2/users",
];
for (const url of tests) {
	try {
		const code = execSync(`curl -s -o NUL -m 10 -w "%{http_code}" ${url}`, { encoding: "utf-8" }).trim();
		const body = execSync(`curl -s -m 10 ${url}`, { encoding: "utf-8", maxBuffer: 1024 * 1024 });
		console.log(`${url}`);
		console.log(`  HTTP ${code}, body: ${body.slice(0, 150).replace(/\n/g, " ")}${body.length > 150 ? "..." : ""}`);
	} catch (e) {
		console.log(`${url}: ERR ${e.message.slice(0, 100)}`);
	}
}
