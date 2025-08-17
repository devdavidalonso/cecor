#!/bin/sh
set -e

echo "Compilando a aplicação com flags de debug..."
# Verifique se estamos no diretório correto
if [ -f "go.mod" ]; then
  echo "Módulo Go encontrado"
else
  echo "Erro: go.mod não encontrado no diretório atual"
  echo "Conteúdo do diretório atual:"
  ls -la
  exit 1
fi

go build -gcflags="all=-N -l" -o myapp ./cmd/api

echo "Iniciando a aplicação diretamente..."
# A linha do dlv foi comentada para desabilitar o modo de espera do debugger
# dlv --listen=:2345 --headless=true --api-version=2 --accept-multiclient exec ./myapp
./myapp