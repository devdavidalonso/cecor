#!/usr/bin/env bash
# Quick preflight para cenário Keycloak-first

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SMOKE_ENV_FILE:-${SCRIPT_DIR}/smoke.env}"
if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

PROFILE="${SMOKE_PROFILE:-staging}"
if [[ "${PROFILE}" == "production" ]]; then
  DEFAULT_BASE_URL="${PRODUCTION_BASE_URL:-http://localhost:8082}"
  DEFAULT_KEYCLOAK_BASE="${PRODUCTION_KEYCLOAK_BASE:-http://localhost:8081}"
else
  DEFAULT_BASE_URL="${STAGING_BASE_URL:-http://localhost:8082}"
  DEFAULT_KEYCLOAK_BASE="${STAGING_KEYCLOAK_BASE:-http://localhost:8081}"
fi

BASE_URL="${BASE_URL:-${DEFAULT_BASE_URL}}"
API_BASE="${BASE_URL}/api/v1"
KEYCLOAK_BASE="${KEYCLOAK_BASE:-${DEFAULT_KEYCLOAK_BASE}}"
TOKEN_URL="${KEYCLOAK_TOKEN_URL:-${KEYCLOAK_BASE}/realms/cecor/protocol/openid-connect/token}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

print_header() {
  echo "======================================"
  echo "🧪 CECOR Quick API Preflight"
  echo "======================================"
  echo "Backend:  ${BASE_URL}"
  echo "API:      ${API_BASE}"
  echo "Keycloak: ${KEYCLOAK_BASE}"
  echo "Profile:  ${PROFILE}"
  echo ""
}

test_code() {
  local method="$1"
  local url="$2"
  local expected="$3"
  local label="$4"
  local code

  code="$(curl -s -o /dev/null -w "%{http_code}" -X "${method}" "${url}" 2>/dev/null || true)"
  if [[ "${code}" == "${expected}" ]]; then
    echo -e "${GREEN}✓${NC} ${label} (HTTP ${code})"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} ${label} (HTTP ${code}, esperado ${expected})"
    FAILED=$((FAILED + 1))
  fi
}

test_code_in() {
  local method="$1"
  local url="$2"
  local expected_csv="$3"
  local label="$4"
  local code

  code="$(curl -s -o /dev/null -w "%{http_code}" -X "${method}" "${url}" 2>/dev/null || true)"
  IFS=',' read -r -a allowed <<< "${expected_csv}"

  for value in "${allowed[@]}"; do
    if [[ "${code}" == "${value}" ]]; then
      echo -e "${GREEN}✓${NC} ${label} (HTTP ${code})"
      PASSED=$((PASSED + 1))
      return
    fi
  done

  echo -e "${RED}✗${NC} ${label} (HTTP ${code}, esperado um de ${expected_csv})"
  FAILED=$((FAILED + 1))
}

print_summary() {
  echo ""
  echo "======================================"
  echo "📊 RESULTADO QUICK PREFLIGHT"
  echo "======================================"
  echo -e "${GREEN}Passaram: ${PASSED}${NC}"
  echo -e "${RED}Falharam: ${FAILED}${NC}"
  echo ""

  if [[ "${FAILED}" -eq 0 ]]; then
    echo -e "${GREEN}Pré-checagem OK.${NC}"
    exit 0
  fi

  echo -e "${YELLOW}Há falhas no preflight. Corrija antes do smoke RBAC.${NC}"
  exit 1
}

print_header
test_code "GET" "${BASE_URL}/health" "200" "Health check backend"
test_code_in "POST" "${TOKEN_URL}" "400,401,405" "Endpoint de token Keycloak responde"
test_code "GET" "${API_BASE}/auth/verify" "401" "Rota protegida sem token deve negar"
test_code "GET" "${API_BASE}/courses" "401" "Courses sem token deve negar"

print_summary
