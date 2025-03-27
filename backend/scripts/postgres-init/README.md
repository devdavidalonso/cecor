# Backend do Sistema de Gestão Educacional CECOR

Este é o backend do sistema de gestão educacional para o CECOR, desenvolvido com Go e seguindo uma arquitetura de microsserviços.

## Pré-requisitos

- Go 1.22 ou superior
- PostgreSQL 15 ou superior
- Redis (opcional para cache)
- RabbitMQ (opcional para mensageria)

## Desenvolvimento Local

### Opção 1: Usando Make

Para desenvolvimento local, você pode usar os comandos Make:

```bash
# Baixar dependências
make deps

# Executar em modo de desenvolvimento
make dev

# Compilar o servidor
make build

# Compilar e executar o servidor
make run

# Executar testes
make test

# Ver todos os comandos disponíveis
make help
```

### Opção 2: Usando Go diretamente

```bash
# Baixar dependências
go mod download
go mod tidy

# Executar em modo de desenvolvimento
go run cmd/api/main.go

# Compilar o servidor
go build -o cecor-backend ./cmd/api

# Executar testes
go test ./...
```

### Opção 3: Usando Docker

Se você preferir usar Docker para desenvolvimento, pode iniciar os serviços de infraestrutura com o Docker Compose e rodar o backend localmente:

```bash
# Iniciar apenas os serviços de infraestrutura (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d postgres redis rabbitmq mongodb

# Executar o backend localmente
make dev
```

## Estrutura do Projeto

```
backend/
├── cmd/
│   └── api/               # Ponto de entrada da aplicação
│       └── main.go
├── internal/
│   ├── auth/              # Autenticação e autorização
│   ├── config/            # Configuração da aplicação
│   ├── models/            # Modelos de dados
│   ├── repository/        # Camada de acesso a dados
│   │   ├── postgres/      # Implementações para PostgreSQL
│   │   └── mongodb/       # Implementações para MongoDB
│   ├── service/           # Lógica de negócios
│   │   ├── alunos/        # Serviço de alunos
│   │   ├── cursos/        # Serviço de cursos
│   │   ├── matriculas/    # Serviço de matrículas
│   │   └── ...
│   └── api/               # Handlers HTTP e middlewares
│       ├── handlers/      # Handlers por recurso
│       ├── middleware/    # Middlewares
│       └── routes/        # Definição de rotas
├── pkg/                   # Bibliotecas reutilizáveis
│   ├── logger/            # Logging
│   ├── validator/         # Validação
│   └── errors/            # Tratamento de erros
├── scripts/               # Scripts de build e deploy
├── .env                   # Variáveis de ambiente locais
├── Dockerfile             # Configuração Docker
├── go.mod                 # Definição de módulo Go
└── go.sum                 # Checksums das dependências
```

## Configuração do Ambiente

Para configurar o ambiente local, copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário:

```bash
cp .env.example .env
```

## Endpoints da API

A API está disponível em `/api/v1` e inclui os seguintes endpoints principais:

- `/api/v1/auth/login` - Autenticação
- `/api/v1/alunos` - Gestão de alunos
- `/api/v1/cursos` - Gestão de cursos
- `/api/v1/matriculas` - Gestão de matrículas
- `/api/v1/presencas` - Controle de presença
- `/api/v1/relatorios` - Relatórios

## Perguntas Frequentes

**Q: Como adicionar uma nova funcionalidade?**

A: Para adicionar uma nova funcionalidade, siga estes passos:

1. Adicione os modelos necessários em `internal/models`
2. Crie ou atualize o repositório em `internal/repository/postgres`
3. Implemente a lógica de negócios em `internal/service`
4. Adicione os handlers HTTP em `internal/api/handlers`
5. Registre as rotas em `internal/api/routes`
6. Adicione testes unitários para cada componente

**Q: Como executar apenas uma parte dos testes?**

A: Você pode executar testes específicos usando:

```bash
go test ./internal/service/alunos/... -v
```