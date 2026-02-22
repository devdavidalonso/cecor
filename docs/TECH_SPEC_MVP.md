# SPEC Técnica MVP - Implementação Imediata CECOR

**Versão:** 1.0  
**Arquitetura Atual**: Monólito Modular (Modular Monolith)

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
