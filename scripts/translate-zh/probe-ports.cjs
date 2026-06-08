const { execSync } = require("child_process");
for (const port of [80, 443, 3000]) {
	try {
		const code = execSync(`curl -s -o NUL -m 10 -w "%{http_code}" http://154.44.25.57:${port}/`, { encoding: "utf-8" }).trim();
		console.log(`port ${port}: HTTP ${code}`);
	} catch (e) {
		console.log(`port ${port}: ERR ${e.message.slice(0, 80)}`);
	}
}
