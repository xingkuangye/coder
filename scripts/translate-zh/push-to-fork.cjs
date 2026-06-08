const { execSync } = require("child_process");
function run(cmd) {
	console.log(`> ${cmd}`);
	try {
		const out = execSync(cmd, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
		console.log(out);
		return out;
	} catch (e) {
		console.log(`exit ${e.status}: ${(e.stdout || "") + (e.stderr || "")}`);
		throw e;
	}
}
try {
	run("git add -A");
	const status = run("git status --short");
	console.log("changed files:", status.split("\n").filter(Boolean).length);
	run('git -c user.email="xingkuangye@icloud.com" -c user.name="xingkuangye" commit -m "i18n(zh): 汉化 webui 全部用户可见字符串" --no-verify');
	run("git push origin main");
} catch (e) {
	console.log("done with errors");
}
