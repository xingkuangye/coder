// Wait for build-slim to finish, with timeout
const { execSync } = require("child_process");
const TIMEOUT_MS = 30 * 60 * 1000; // 30 min
const POLL_MS = 30 * 1000; // 30s
const start = Date.now();

while (Date.now() - start < TIMEOUT_MS) {
	try {
		const out = execSync('docker ps -a --format "{{.Names}}|{{.Status}}"', { encoding: "utf8" });
		const line = out.split("\n").find((l) => l.startsWith("coder-build-slim-1"));
		console.log(`[${Math.round((Date.now() - start) / 1000)}s] ${line || "(not found)"}`);
		if (line && (line.includes("Exited") || line.includes("Error"))) {
			console.log("build-slim finished");
			break;
		}
	} catch (e) {
		console.log(`err: ${e.message}`);
		break;
	}
	execSync("node -e \"setTimeout(()=>{},30000)\"");
}
