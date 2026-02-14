#!/bin/bash

# Configuration
API_URL="http://localhost:8081/api/v1/professores"
AUTH_TOKEN="simulation-admin"

echo "🚀 Iniciando simulação de cadastro de professor..."
echo "👤 Admin: admin.cecor (Simulado)"
echo "--------------------------------------------------"

# Professor Data
PROFESSOR_NAME="Carlos Alberto Souza"
PROFESSOR_EMAIL="carlos.souza@cecor.test"
PROFESSOR_CPF="11122233344"
PROFESSOR_PHONE="(11) 95555-4444"

# JSON Payload
PAYLOAD=$(cat <<EOF
{
  "name": "$PROFESSOR_NAME",
  "email": "$PROFESSOR_EMAIL",
  "cpf": "$PROFESSOR_CPF",
  "phone": "$PROFESSOR_PHONE"
}
EOF
)

echo "📤 Enviando requisição para $API_URL..."

# Execute CURL
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

HTTP_STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "--------------------------------------------------"

if [ "$HTTP_STATUS" -eq 201 ]; then
  echo "✅ Sucesso! Professor cadastrado."
  echo "📝 Resposta do Servidor:"
  echo "$BODY" | python3 -m json.tool || echo "$BODY"
else
  echo "❌ Falha no cadastro. Status HTTP: $HTTP_STATUS"
  echo "📝 Erro:"
  echo "$BODY"
fi

echo "--------------------------------------------------"
echo "🏁 Simulação concluída."
