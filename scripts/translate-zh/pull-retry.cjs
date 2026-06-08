// Retry pulling the image up to 10 times
const { execSync } = require("child_process");
const IMAGE = "codercom/oss-dogfood:latest";
const MAX = 10;
for (let i = 1; i <= MAX; i++) {
	console.log(`=== Attempt ${i}/${MAX} ===`);
	try {
		execSync(`docker pull ${IMAGE}`, { stdio: "inherit", timeout: 600_000 });
		console.log("SUCCESS");
		process.exit(0);
	} catch (e) {
		console.log(`FAILED: ${e.message.slice(0, 200)}`);
		if (i < MAX) {
			console.log("Waiting 10s...");
			execSync("timeout /t 10 /nobreak", { stdio: "ignore", shell: true });
		}
	}
}
console.log("All attempts failed");
process.exit(1);
