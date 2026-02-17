# Missão 1: Fundação de Dados (SQL)

## Objetivo

Aplicar as mudanças de banco de dados definidas no `DATA_MODEL.md` para suportar novas funcionalidades de matrícula, calendário e links.

## Ações Práticas

### 1. Aplicar Migrações

Execute os seguintes scripts SQL na ordem:

```bash
# 10. Atualizar Professores e Contatos
psql -h localhost -U cecor -d cecor -f backend/scripts/migrations/10-update-teachers-contacts.sql

# 11. Criar Calendário e Locais
psql -h localhost -U cecor -d cecor -f backend/scripts/migrations/11-create-calendar-locations.sql

# 12. Criar Incidentes (se não aplicado)
psql -h localhost -U cecor -d cecor -f backend/scripts/migrations/12-create-incidents.sql

# 13. Adicionar URL do Classroom
psql -h localhost -U cecor -d cecor -f backend/scripts/migrations/13-add-classroom-url.sql
```

### 2. Validar Schema

Verifique se as tabelas foram criadas corretamente:

- `user_contacts` existe?
- `class_sessions` existe?
- `courses` tem a coluna `google_classroom_url`?
