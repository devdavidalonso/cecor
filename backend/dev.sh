#!/bin/bash
# Script para desenvolvimento local do backend

# Verificar se Go está instalado
if ! command -v go &> /dev/null; then
    echo "Go não está instalado. Por favor, instale Go 1.22 ou superior."
    exit 1
fi

# Baixar dependências
echo "Baixando dependências..."
go mod tidy

# Compilar e executar
echo "Compilando e executando..."
go run cmd/api/main.go