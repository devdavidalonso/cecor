.PHONY: build run dev clean deps test

# Variáveis
APP_NAME=cecor-backend
GO_FILES=$(shell find . -name "*.go" -not -path "./vendor/*")

# Tarefas
dev:
	go run cmd/api/main.go

build:
	CGO_ENABLED=0 go build -o $(APP_NAME) ./cmd/api

run: build
	./$(APP_NAME)

deps:
	go mod download
	go mod tidy

clean:
	rm -f $(APP_NAME)
	go clean -cache

test:
	go test -v ./...

help:
	@echo "Comandos disponíveis:"
	@echo "  make dev      - Executa o servidor em modo de desenvolvimento"
	@echo "  make build    - Compila o servidor"
	@echo "  make run      - Compila e executa o servidor"
	@echo "  make deps     - Baixa e atualiza dependências"
	@echo "  make clean    - Remove arquivos compilados e limpa cache"
	@echo "  make test     - Executa os testes"
	@echo "  make help     - Exibe esta ajuda"