# Usar a versão Go correspondente
FROM golang:1.24.1-alpine AS builder

WORKDIR /app

# Instalar dependências necessárias para compilação
RUN apk add --no-cache git gcc musl-dev

# Copiar arquivos de módulos
COPY go.mod go.sum ./

# Baixar dependências
RUN go mod download

# Copiar o código fonte
COPY . .

# Listar diretórios para verificação
RUN ls -la
RUN find . -type d -name "cmd" -exec ls -la {} \;
RUN find . -type d -name "api" -exec ls -la {} \;

# Compilar o aplicativo com modo verboso
RUN CGO_ENABLED=0 GOOS=linux go build -v -o main ./cmd/api

# Segunda etapa: imagem mínima para execução
FROM alpine:latest

WORKDIR /app

# Instalar pacotes essenciais
RUN apk --no-cache add ca-certificates tzdata

# Copiar o executável compilado
COPY --from=builder /app/main .

# Configurar variáveis de ambiente
ENV GIN_MODE=release
ENV PORT=8080

# Expor a porta
EXPOSE 8080

# Comando para executar o aplicativo
CMD ["./main"]