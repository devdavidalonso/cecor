FROM golang:1.19

WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro
COPY go.mod go.sum ./

# Garantir que todas as dependências são baixadas
RUN go mod download

# Copiar todo o código fonte
COPY . .

# Verificar que o código-fonte principal existe
RUN if [ ! -f cmd/api/main.go ]; then echo "Arquivo main.go não encontrado!" && ls -la cmd/api && exit 1; fi

# Expor a porta
EXPOSE 8080

# Executar o aplicativo
CMD ["go", "run", "cmd/api/main.go"]
