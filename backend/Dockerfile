FROM golang:1.22-alpine

WORKDIR /app

# Copiar código-fonte
COPY . .

# Compilar o binário
RUN go build -o myapp ./cmd/api

# Verificar se o binário foi criado
RUN ls -la /app/myapp

# Expor a porta
EXPOSE 8080

# Executar o binário
CMD ["/app/myapp"]