# SPEC Técnica MVP - Implementação Imediata CECOR

**Versão:** 1.0  
**Arquitetura Atual**: Monólito Modular (Modular Monolith)

## Atualizacao de implementacao - 22/02/2026

Estado atual validado em homologacao local:
1. Backend em monolito modular mantido como baseline da V1.
2. Keycloak como fonte de autenticacao e papeis em uso real.
3. Frontend com guards por papel e redirects por perfil apos login.
4. Ambiente hibrido oficial para desenvolvimento:
   - app local (`go run` + `npm start`)
   - infra em Docker (`postgres`, `mongo`, `redis`, `rabbitmq`)
5. Seed local idempotente disponivel via `make dev-seed` para popular `teachers` e `students`.
6. Compatibilidade de schema aplicada para bases legadas de `students`.

Referencia de progresso consolidado: `docs/STATUS_PROGRESSO_2026-02-22.md`.

---

## 1. Visão Arquitetural MVP

Para o MVP, priorizamos a velocidade de entrega e simplicidade operacional. Todos os módulos rodam em um único executável Go (ou containers levemente separados) compartilhando o mesmo banco de dados PostgreSQL, mas mantendo separação lógica de código (Pacotes).

### Diagrama Físico (Docker Compose)

```mermaid
graph TD
    Browser[Browser / App] --> Nginx[Reverse Proxy]
    Nginx --> Frontend[Container Angular]
    Nginx --> Backend[Container Go (Monólito)]

    Backend --> Postgres[(PostgreSQL Container)]
    Backend --> Keycloak[Keycloak Container]
```

## 2. Stack Tecnológico (MVP)

- **Frontend**: Angular 17+ (Hospedado no Nginx).
- **Backend**: Go 1.22+ (API REST monolítica com rotas `/students`, `/courses`, etc).
- **Banco de Dados**: PostgreSQL 15 (Schema único `public`, tabelas prefixadas ou organizadas).
- **Autenticação**: Keycloak (Local/Docker) com **Identity Provider do Google** configurado para permitir login com contas institucionais/pessoais (`@gmail.com`).
  - **Fonte única de token/roles**: Access token e papéis vêm do Keycloak (OIDC). O backend não emite JWT próprio para clientes.
- **Infraestrutura**: Docker Compose (Local) / VPS com Docker (Produção).

## 3. Detalhamento do Banco de Dados (PostgreSQL)

- **Schema**: Conforme `DATA_MODEL.md`.
- **Tabelas Chave**: `users`, `students`, `teachers`, `courses`, `class_sessions`, `attendances`, `incidents`, `locations`.
- **Migrações**: Golang-migrate ou scripts SQL nativos (`backend/scripts/migrations`).

## 4. Diferenças para o Geral

- **Sem MongoDB**: Formulários complexos ficam para depois; usamos JSONB no Postgres se necessário.
- **Sem RabbitMQ**: Notificações são disparadas de forma síncrona ou via Goroutines em background.
- **Sem Redis**: Cache em memória (in-memory) do Go para listas pequenas.

## 5. Estratégia de Deploy

1.  **Build**: Dockerfile Multi-stage para gerar binários leves.
2.  **Deploy**: `docker-compose up -d` no servidor.
3.  **Backup**: `pg_dump` diário via cronjob.
