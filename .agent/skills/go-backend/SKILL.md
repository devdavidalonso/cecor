---
name: go-backend
description: Padrões técnicos e arquitetura do Backend (Go) no projeto CECOR
---

# Go Backend Skill - CECOR

Este guia define os padrões de desenvolvimento para o backend em Go, focado em manutenibilidade e resiliência.

## 1. Arquitetura Hexagonal

O projeto segue uma estrutura de camadas:

- `cmd/api`: Ponto de entrada da aplicação.
- `internal/models`: Definição de entidades e structs.
- `internal/repository`: Interface e implementação de acesso a dados (PostgreSQL/GORM).
- `internal/service`: Lógica de negócio e orquestração.
- `internal/api/handlers`: Manipulação de requisições HTTP.

## 2. Padrões de GORM e Modelos

- **Ponteiros para Opcionais**: Sempre use ponteiros (`*string`, `*int`) para campos que podem ser nulos no banco de dados. Isso evita que strings vazias causem violações de `NOT NULL`.
- **JSON Tags**: Use `json:"field_name,omitempty"` para campos que não devem ser enviados se estiverem vazios.
- **Soft Delete**: Utilize `gorm.DeletedAt` para permitir a recuperação de dados e manter a integridade referencial.

## 3. Integração e Serviços Externos

- **Keycloak**: O `KeycloakService` deve ser chamado pelos serviços de domínio (ex: `StudentService`). Trate falhas no Keycloak como alertas (`Warning`), não impedindo o salvamento no banco local (falha suave), a menos que seja um fluxo crítico de segurança.
- **Tratamento de Erros**: Erros de banco de dados (Unique Constraint, Foreign Key) devem ser mapeados para mensagens de erro HTTP amigáveis (409 Conflict, 400 Bad Request).

## 4. Banco de Dados

- Novas tabelas ou alterações de schema devem ser refletidas em `backend/scripts/postgres-init/`.
- Siga a convenção de nomes em snake_case para colunas e tabelas.
