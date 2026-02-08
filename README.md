# Sistema de Gestão Educacional CECOR

Sistema de gestão educacional para o CECOR (Lar do Alvorecer), projetado para administrar alunos, cursos, matrículas e frequências.

## Arquitetura (MVP)

O sistema MVP utiliza uma arquitetura simplificada focada em entregar valor rapidamente:

- **Frontend**: Angular 17 com Material Design
- **Backend**: Go com padrão arquitetural hexagonal (Clean Architecture)
- **Banco de dados**: PostgreSQL 15
- **Autenticação**: Keycloak (SSO remoto)

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
│   │   ├── auth/              # Autenticação e autorização (OIDC)
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
- Acesso à Internet (conecta ao Keycloak remoto)

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

Isso iniciará os serviços:

- **Frontend**: http://localhost:4201
- **Backend API**: http://localhost:8081
- **PostgreSQL**: localhost:5433

### Desenvolvimento Frontend (Angular)

Para desenvolvimento do frontend fora do Docker:

```bash
cd frontend
npm install
npm start
```

A aplicação estará disponível em http://localhost:4200.

### Desenvolvimento Backend (Go)

Para desenvolvimento do backend fora do Docker:

```bash
cd backend
go mod download
go run cmd/api/main.go
```

## Autenticação

O sistema utiliza **Keycloak** para autenticação centralizada (OIDC):

- **Keycloak URL**: https://lar-sso-keycloak.hrbsys.tech
- **Realm**: `cecor`
- **Clients**:
  - `cecor-frontend` (Public) - para o Angular
  - `cecor-backend` (Confidential) - para validação de tokens

### Fluxo de Login

1. Usuário acessa rota protegida no frontend
2. Redireciona para Keycloak (se não autenticado)
3. Após login, retorna com Authorization Code
4. Frontend troca código por token JWT (PKCE)
5. Token é enviado automaticamente nas requisições ao backend
6. Backend valida o token via OIDC

**Status de Implementação:**

- ✅ **Frontend:** `angular-oauth2-oidc` configurado com OIDC mode
- ✅ **Backend:** Middleware JWT com validação JWKS
- ✅ **Logout:** Fluxo completo funcionando
- ✅ **Proteção de rotas:** AuthGuard no frontend + middleware no backend

## Rotas API Principais

- **Health**: GET /health
- **Auth Verification**: GET /api/v1/auth/verify (protegido)
- **Alunos**: /api/v1/alunos (a implementar)
- **Cursos**: /api/v1/cursos (a implementar)
- **Matrículas**: /api/v1/matriculas (a implementar)
- **Presenças**: /api/v1/presencas (a implementar)

## Perfis de Usuário

- **Administrador**: Acesso total ao sistema
- **Professor**: Registro de frequências e acompanhamento de alunos
- **Aluno**: Visualização da própria frequência

## Usuários de Teste

| Perfil        | Usuário       | Senha      |
| ------------- | ------------- | ---------- |
| Administrador | `admin.cecor` | `admin123` |
| Professor     | `prof.maria`  | `prof123`  |
| Aluno         | `aluno.pedro` | `aluno123` |

## Documentação Adicional

- [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md) - Guia de integração com Keycloak
- [KEYCLOAK-CONFIG.md](./KEYCLOAK-CONFIG.md) - Configuração do Keycloak
- [MVP-ROADMAP.md](./MVP-ROADMAP.md) - Roadmap de desenvolvimento
- [DAILY-TASKS.md](./DAILY-TASKS.md) - Tarefas diárias
- [GIT-CONVENTIONS.md](./GIT-CONVENTIONS.md) - Convenções de commits

## Contribuição

1. Crie um branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
2. Commit suas mudanças seguindo [GIT-CONVENTIONS.md](./GIT-CONVENTIONS.md)
3. Push para o branch (`git push origin feature/nova-funcionalidade`)
4. Abra um Pull Request

## Licença

Este projeto é propriedade de CECOR e seu uso é restrito.
