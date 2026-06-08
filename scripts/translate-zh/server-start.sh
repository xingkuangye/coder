#!/bin/bash
export CODER_ACCESS_URL=http://154.44.25.57:3000
export CODER_PG_CONNECTION_URL=postgresql://coder:coder@127.0.0.1:5432/coder?sslmode=disable
export CODER_HTTP_ADDRESS=0.0.0.0:3000
export CODER_DANGEROUS_ALLOW_CORS_REQUESTS=true
export CODER_DEV_ADMIN_PASSWORD=SomeSecurePassword!
export CODER_TELEMETRY_ENABLE=false
export CODER_VERBOSE=true
cd ~/coder
exec ./out/coder server --http-address 0.0.0.0:3000 --access-url http://154.44.25.57:3000 --swagger-enable --dangerous-allow-cors-requests=true --enable-terraform-debug-mode
