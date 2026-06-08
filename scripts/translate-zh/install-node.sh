#!/bin/bash
set -e
echo "=== install node 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash 2>&1 | tail -5
echo "=== apt install nodejs ==="
sudo apt-get install -y nodejs 2>&1 | tail -3
echo "=== versions ==="
node --version
echo "=== install pnpm ==="
sudo npm install -g pnpm@10 2>&1 | tail -3
pnpm --version
