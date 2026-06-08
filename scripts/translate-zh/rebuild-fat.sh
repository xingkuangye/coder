#!/bin/bash
set -e
cd ~/coder
export GOPROXY=https://goproxy.cn,https://proxy.golang.org,direct
export GOCACHE=/tmp/gocache
export GOMODCACHE=/tmp/gomodcache

echo "=== killing old coderd ==="
pkill -9 -f 'out/coder' 2>/dev/null || true
sleep 2

echo "=== rebuilding fat (with embed) ==="
go build -tags 'embed,ts_omit_aws,ts_omit_bird,ts_omit_tap,ts_omit_kube' -o out/coder ./enterprise/cmd/coder 2>&1 | tail -5

ls -lh out/coder

echo "=== launching ==="
nohup /tmp/start-coderd.sh > /tmp/coderd-logs/stdout3.log 2>&1 &
echo "pid=$!"
sleep 12

echo "=== alive ==="
pgrep -af 'out/coder' || echo none

echo "=== last 15 log ==="
tail -15 /tmp/coderd-logs/stdout3.log

echo "=== /  (should be HTML now) ==="
curl -sf -m 8 http://localhost:3000/ | head -c 300
echo
echo "=== /healthz ==="
curl -sf -m 8 http://localhost:3000/healthz
