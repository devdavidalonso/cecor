#!/bin/bash
# Script: check_migration.sh
# Descrição: Verifica se a migração de português para inglês está completa
# Uso: ./scripts/check_migration.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "CECOR - Verificação de Migração"
echo "Português → Inglês"
echo "=========================================="
echo ""

# Lista de patterns em português para verificar
PATTERNS="internal/service/matriculas|internal/service/presencas|internal/service/relatorios|internal/service/usuarios|internal/service/cursos|internal/service/entrevistas|internal/service/notificacoes"

echo -e "${YELLOW}Verificando imports em português...${NC}"
echo ""

# Verificar imports em português
IMPORTS=$(grep -rn "$PATTERNS" --include="*.go" . 2>/dev/null | grep -v "_test.go" || true)

if [ -n "$IMPORTS" ]; then
    echo -e "${RED}❌ ENCONTRADOS imports em português:${NC}"
    echo "$IMPORTS"
    echo ""
    EXIT_CODE=1
else
    echo -e "${GREEN}✓ Nenhum import em português encontrado${NC}"
    echo ""
    EXIT_CODE=0
fi

# Verificar compilação
echo -e "${YELLOW}Verificando build...${NC}"
if go build ./... 2>&1; then
    echo -e "${GREEN}✓ Build bem-sucedido${NC}"
else
    echo -e "${RED}❌ Erro no build${NC}"
    EXIT_CODE=1
fi

echo ""
echo "=========================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Verificação concluída com sucesso!${NC}"
else
    echo -e "${RED}❌ Verificação encontrou problemas${NC}"
fi
echo "=========================================="

exit $EXIT_CODE
