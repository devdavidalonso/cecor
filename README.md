# Sistema de Gestão Educacional CECOR

Sistema avançado de gestão educacional para o CECOR, projetado para administrar alunos, cursos, matrículas, presenças, relatórios e entrevistas.

## Arquitetura

O sistema foi migrado para uma arquitetura de microsserviços, conforme a documentação técnica:

- **Frontend**: Angular 17 com Material Design
- **Backend**: Go com padrão arquitetural hexagonal (ports and adapters)
- **Banco de dados**: PostgreSQL para dados estruturados e MongoDB para dados flexíveis
- **Cache**: Redis
- **Mensageria**: RabbitMQ para comunicação assíncrona entre serviços

## Estrutura do Projeto

```
CECOR/
├── frontend/                  # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/          # Serviços singleton, guards, interceptors
│   │   │   ├── shared/        # Componentes, pipes, diretivas compartilhadas
│   │   │   ├── features/      # Módulos de funcionalidade (lazy-loaded)
│   │   │   └── layout/        # Componentes de layout
│   │   └── assets/            # Recursos estáticos
│   ├── Dockerfile
│   └── nginx.conf
│
├── backend/
│   ├── cmd/
│   │   └── api/               # Ponto de entrada da aplicação
│   ├── internal/
│   │   ├── auth/              # Autenticação e autorização
│   │   ├── config/            # Configuração da aplicação
│   │   ├── models/            # Modelos de dados
│   │   ├── repository/        # Camada de acesso a dados
│   │   ├── service/           # Lógica de negócios
│   │   └── api/               # Handlers HTTP e middlewares
│   ├── pkg/                   # Bibliotecas reutilizáveis
│   └── Dockerfile
│
└── docker-compose.yml         # Configuração de contêineres
```

## Requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento frontend)
- Go 1.22+ (para desenvolvimento backend)
- PostgreSQL 15+ (instalação local opcional)

## Configuração de Desenvolvimento

### Iniciar com Docker Compose

O modo mais fácil de executar todo o ambiente é usando Docker Compose:

```bash
# Construir as imagens
docker-compose build

# Iniciar os contêineres
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

Isso iniciará todos os serviços:
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432
- MongoDB: localhost:27017
- Redis: localhost:6379
- RabbitMQ: localhost:5672 (AMQP) e http://localhost:15672 (Management UI)

### Desenvolvimento Frontend (Angular)

Para desenvolvimento do frontend fora do Docker:

```bash
cd frontend
npm install
npm start
```

A aplicação estará disponível em http://localhost:4200 e as requisições API serão redirecionadas para o backend através do proxy configurado.

### Desenvolvimento Backend (Go)

Para desenvolvimento do backend fora do Docker:

```bash
cd backend
go mod download
go run cmd/api/main.go
```

## Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

- **Login**: POST /api/v1/auth/login
- **Refresh**: POST /api/v1/auth/refresh

O token deve ser incluído no cabeçalho Authorization de todas as requisições protegidas:
```
Authorization: Bearer <token>
```

## Rotas API Principais

- **Alunos**: /api/v1/alunos
- **Cursos**: /api/v1/cursos
- **Matrículas**: /api/v1/matriculas
- **Presenças**: /api/v1/presencas
- **Relatórios**: /api/v1/relatorios
- **Entrevistas**: /api/v1/entrevistas
- **Voluntariado**: /api/v1/voluntariado

## Perfis de Usuário

- **Administrador**: Acesso total
- **Gestor**: Gestão de cursos, matrículas, professores
- **Professor**: Registro de presenças, acompanhamento de alunos
- **Aluno**: Visualização de frequência, materiais, certificados
- **Responsável**: Acompanhamento do aluno vinculado

## Contribuição

1. Crie um branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
2. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
3. Push para o branch (`git push origin feature/nova-funcionalidade`)
4. Abra um Pull Request

## Licença

Este projeto é propriedade de CECOR e seu uso é restrito.