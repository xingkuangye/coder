#!/bin/bash
set -e
cd ~/coder

echo "=== pnpm install (root) ==="
pnpm install --frozen-lockfile 2>&1 | tail -3

echo "=== pnpm install (site) ==="
cd site
pnpm install --frozen-lockfile 2>&1 | tail -3
cd ..

echo "=== build site (frontend) ==="
cd site
pnpm build 2>&1 | tail -10
cd ..

echo "=== build coderd (Go) ==="
export GOPROXY=https://goproxy.cn,https://proxy.golang.org,direct
export GOCACHE=/tmp/gocache
export GOMODCACHE=/tmp/gomodcache
mkdir -p out
go build -o out/coder ./enterprise/cmd/coder 2>&1 | tail -10

echo "=== build results ==="
ls -lh out/coder site/out/index.html
echo "=== done ==="
