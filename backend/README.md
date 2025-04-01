# Backend do Sistema de Gestão Educacional CECOR

## Visão Geral

Este é o backend do Sistema de Gestão Educacional CECOR, uma solução completa para administração de alunos, cursos, matrículas, presenças, relatórios e entrevistas. O sistema foi desenvolvido com uma arquitetura de microsserviços, utilizando Go como linguagem principal, oferecendo alta performance, escalabilidade e manutenibilidade.

## Tecnologias Utilizadas

* **Linguagem**: Go 1.22+
* **Framework Web**: Chi Router
* **ORM**: GORM com PostgreSQL
* **Autenticação**: JWT (JSON Web Tokens)
* **Cache**: Redis
* **Mensageria**: RabbitMQ
* **Armazenamento NoSQL**: MongoDB (para dados flexíveis)
* **Logging**: Zap Logger
* **Containerização**: Docker e Kubernetes

## Arquitetura

O sistema segue uma arquitetura de microsserviços com design hexagonal (ports and adapters), organizando o código da seguinte forma:

```
backend/
├── cmd/
│   └── api/               # Ponto de entrada da aplicação
│       └── main.go
├── internal/
│   ├── api/
│   │   ├── handlers/      # Handlers HTTP
│   │   ├── middleware/    # Middlewares (auth, logging, etc.)
│   │   └── routes/        # Definição de rotas
│   ├── auth/              # Autenticação e autorização
│   ├── config/            # Configuração da aplicação
│   ├── models/            # Modelos de dados
│   ├── repository/        # Interfaces de repositório
│   │   └── postgres/      # Implementações PostgreSQL
│   └── service/           # Lógica de negócios
│       ├── alunos/
│       ├── cursos/
│       ├── matriculas/
│       └── usuarios/
├── pkg/                   # Bibliotecas reutilizáveis
│   ├── errors/            # Tratamento de erros padronizado
│   └── logger/            # Sistema de logging
├── scripts/               # Scripts de inicialização e manutenção
├── .env                   # Variáveis de ambiente
├── Dockerfile             # Configuração para Docker
├── docker-compose.yml     # Configuração de serviços Docker
├── go.mod                 # Dependências do Go
└── go.sum                 # Checksums das dependências
```

## Configuração do Ambiente

### Requisitos

* Go 1.22 ou superior
* Docker e Docker Compose
* PostgreSQL 15+
* Redis (para cache)
* RabbitMQ (para mensageria)
* MongoDB (para documentos flexíveis)

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis de acordo com seu ambiente:

```bash
cp .env.example .env
```

Principais variáveis:

```
# Configurações do servidor
SERVER_PORT=8080

# Configurações do PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=educational_management
POSTGRES_SSLMODE=disable

# Configurações do Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Configurações do RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_VHOST=/

# Configurações de JWT
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_EXPIRY_HOURS=24
REFRESH_SECRET=outra_chave_secreta_muito_segura
REFRESH_EXPIRY_HOURS=168

# Configurações da aplicação
APP_ENV=development
LOG_LEVEL=debug
```

## Executando a Aplicação

### Usando Docker Compose

A forma mais fácil de iniciar todo o ambiente é usando Docker Compose:

```bash
# Construir os contêineres
docker-compose build

# Iniciar todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

Isso iniciará todos os serviços necessários:
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379
- RabbitMQ: localhost:5672 (AMQP) e http://localhost:15672 (UI de gerenciamento)

### Desenvolvimento Local

Para desenvolver localmente sem Docker:

```bash
# Instalar dependências
go mod download

# Executar o servidor
go run cmd/api/main.go

# Ou usar o script de desenvolvimento
./dev.sh

# Ou usar make se disponível
make dev
```

## Endpoints da API

A API está disponível em `/api/v1` e oferece os seguintes endpoints principais:

### Autenticação

- `POST /api/v1/auth/login` - Login de usuário
- `POST /api/v1/auth/refresh` - Renovação de token JWT

### Alunos

- `GET /api/v1/alunos` - Listar alunos (com paginação e filtros)
- `POST /api/v1/alunos` - Criar novo aluno
- `GET /api/v1/alunos/{id}` - Obter detalhes de um aluno
- `PUT /api/v1/alunos/{id}` - Atualizar aluno
- `DELETE /api/v1/alunos/{id}` - Excluir aluno

### Cursos

- `GET /api/v1/cursos` - Listar cursos
- `POST /api/v1/cursos` - Criar novo curso
- `GET /api/v1/cursos/{id}` - Obter detalhes de um curso
- `PUT /api/v1/cursos/{id}` - Atualizar curso
- `DELETE /api/v1/cursos/{id}` - Excluir curso

### Matrículas

- `GET /api/v1/matriculas` - Listar matrículas
- `POST /api/v1/matriculas` - Criar New Enrollment
- `GET /api/v1/matriculas/{id}` - Obter detalhes de matrícula
- `PUT /api/v1/matriculas/{id}` - Atualizar matrícula
- `DELETE /api/v1/matriculas/{id}` - Cancelar matrícula

### Presenças

- `GET /api/v1/presencas` - Listar registros de presença
- `POST /api/v1/presencas` - Register Attendance
- `GET /api/v1/presencas/curso/{cursoId}/data/{data}` - Obter presenças por curso e data

### Outros Endpoints

- **Notificações**: `/api/v1/notificacoes`
- **Relatórios**: `/api/v1/relatorios`
- **Entrevistas**: `/api/v1/entrevistas`
- **Voluntariado**: `/api/v1/voluntariado`
- **Usuários**: `/api/v1/usuarios` (apenas admin)

## Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Tokens). Para acessar endpoints protegidos:

1. Obtenha um token através do endpoint `/api/v1/auth/login`
2. Inclua o token no cabeçalho de suas requisições:
   ```
   Authorization: Bearer {seu_token_aqui}
   ```
3. O token expira após o tempo configurado nas variáveis de ambiente
4. Use `/api/v1/auth/refresh` para renovar o token expirado

## Níveis de Acesso

O sistema implementa RBAC (Role-Based Access Control) com os seguintes perfis:

- **Administrador**: Acesso total ao sistema
- **Gestor**: Gerenciamento de cursos, matrículas e relatórios
- **Professor**: Controle de presenças e acompanhamento de alunos
- **Aluno**: Visualização de dados próprios
- **Responsável**: Visualização de dados de alunos sob responsabilidade

## Banco de Dados

### Migrations

As migrações do banco de dados são executadas automaticamente ao iniciar a aplicação. Os scripts estão localizados em:

```
backend/scripts/postgres-init/
```

### Modelagem

O sistema utiliza uma abordagem mista:
- **PostgreSQL**: Dados relacionais estruturados (alunos, cursos, matrículas)
- **MongoDB**: Dados flexíveis (entrevistas, formulários, documentos digitalizados)
- **Redis**: Cache e sessões

## Testes

```bash
# Executar todos os testes
go test ./...

# Executar testes de um módulo específico
go test ./internal/service/alunos

# Executar testes com cobertura
go test -cover ./...
```

## Desenvolvimento

### Convenções de Código

- Seguimos as convenções padrão de Go
- Utilizamos interfaces para desacoplamento
- Aplicamos o padrão de repositório para acesso a dados
- Implementamos tratamento centralizado de erros
- Usamos context para propagação de cancelamento e valores

### Adicionando Novos Recursos

1. Defina novos modelos em `internal/models/`
2. Crie interfaces de repositório em `internal/repository/`
3. Implemente repositórios em `internal/repository/postgres/`
4. Desenvolva a lógica de negócios em `internal/service/`
5. Adicione handlers HTTP em `internal/api/handlers/`
6. Registre rotas em `internal/api/routes/`

## Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco de dados**:
   - Verifique as variáveis de ambiente para conexão
   - Confirme se o PostgreSQL está em execução
   - Verifique permissões de acesso

2. **Erro de compilação "package conflict"**:
   - Todos os arquivos em um mesmo diretório devem pertencer ao mesmo package
   - Interfaces devem estar em `repository/` (package repository)
   - Implementações devem estar em `repository/postgres/` (package postgres)

3. **Erro de autenticação**:
   - Verifique as chaves JWT nas variáveis de ambiente
   - Confirme se o token está sendo enviado corretamente no header

## Contato e Suporte

Para questões técnicas ou suporte, entre em contato:
- **Desenvolvedor**: David Alonso
- **GitHub**: https://github.com/devdavidalonso/cecor

## Licença

Este projeto é de propriedade do CECOR e seu uso é restrito às finalidades da instituição.