#!/bin/bash
# Pipe password to sudo via -S
export PASSWORD='Wyfabcd819320'
run_sudo() { echo "$PASSWORD" | sudo -S "$@"; }

echo "=== write .env ==="
cat > /home/xingkuangye/coder/.env <<'EOF'
CODER_ACCESS_URL=http://154.44.25.57:3000
CODER_PG_CONNECTION_URL=postgresql://coder:coder@127.0.0.1:5432/coder?sslmode=disable
CODER_HTTP_ADDRESS=0.0.0.0:3000
CODER_DANGEROUS_ALLOW_CORS_REQUESTS=true
CODER_DEV_ADMIN_PASSWORD=SomeSecurePassword!
CODER_TELEMETRY_ENABLE=false
CODER_VERBOSE=true
EOF

echo "=== write systemd unit (via tmp + sudo cp) ==="
cat > /tmp/coderd.service <<'EOF'
[Unit]
Description=Coder Server (Chinese)
After=docker.service
Requires=docker.service
Wants=coder-pg.service

[Service]
Type=simple
User=xingkuangye
WorkingDirectory=/home/xingkuangye/coder
EnvironmentFile=/home/xingkuangye/coder/.env
ExecStart=/home/xingkuangye/coder/out/coder server --http-address 0.0.0.0:3000 --access-url http://154.44.25.57:3000 --swagger-enable --dangerous-allow-cors-requests=true --enable-terraform-debug-mode
Restart=on-failure
RestartSec=5
StandardOutput=append:/home/xingkuangye/coder/coderd.log
StandardError=append:/home/xingkuangye/coder/coderd.log

[Install]
WantedBy=multi-user.target
EOF

run_sudo cp /tmp/coderd.service /etc/systemd/system/coderd.service
run_sudo chown root:root /etc/systemd/system/coderd.service
run_sudo chmod 644 /etc/systemd/system/coderd.service

echo "=== kill old + restart as systemd ==="
pkill -9 -f 'out/coder' 2>/dev/null
sleep 2
run_sudo systemctl daemon-reload
run_sudo systemctl enable coderd
run_sudo systemctl restart coderd
sleep 10

echo "=== status ==="
run_sudo systemctl status coderd --no-pager 2>&1 | head -15
echo "=== healthz ==="
curl -sf -m 5 http://localhost:3000/healthz
