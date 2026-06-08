const { execSync } = require("child_process");
const out = execSync(`ssh -o ConnectTimeout=20 xingkuangye@154.44.25.57 "docker exec nginx-proxy-manager cat /data/nginx/proxy_host/4.conf"`, { encoding: "utf-8" });
console.log(out);
