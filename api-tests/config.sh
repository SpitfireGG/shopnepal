#!/usr/bin/env bash
BASE_URL="${BASE_URL:-http://localhost:4000}"
ADMIN_USER="admin"
ADMIN_PASS="shopnepal123"
ADMIN_BASIC=$(echo -n "$ADMIN_USER:$ADMIN_PASS" | base64)
AUTH_HEADER="Authorization: Basic $ADMIN_BASIC"
JSON_HDR="Content-Type: application/json"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; NC='\033[0m'
pass() { echo -e "${GREEN}✓ $*${NC}"; }
fail() { echo -e "${RED}✗ $*${NC}"; }
info() { echo -e "${CYAN}▶ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠ $*${NC}"; }
curl_opts=(-s -w "\n%{http_code}" --connect-timeout 5)
