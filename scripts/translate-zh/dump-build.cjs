const { execSync } = require("child_process");
const out = execSync('docker logs coder-build-slim-1 2>&1', { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
const lines = out.split("\n");
console.log("total lines:", lines.length);
console.log("=== last 50 ===");
for (const l of lines.slice(-50)) console.log(l);
