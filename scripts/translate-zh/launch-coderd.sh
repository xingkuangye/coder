#!/bin/bash
echo "=== killing ==="
pkill -9 -f 'out/coder' 2>/dev/null || true
sleep 2

echo "=== start script head ==="
head -3 /tmp/start-coderd.sh

echo "=== launching ==="
nohup /tmp/start-coderd.sh > /tmp/coderd-logs/stdout2.log 2>&1 &
echo "pid=$!"
sleep 15

echo "=== alive ==="
pgrep -af 'out/coder' || echo none

echo "=== last 25 ==="
tail -25 /tmp/coderd-logs/stdout2.log

echo "=== healthz ==="
curl -sf -m 5 http://localhost:3000/healthz && echo OK
echo ""
echo "=== port 3000 ==="
ss -tlnp 2>/dev/null | grep 3000 || echo no
