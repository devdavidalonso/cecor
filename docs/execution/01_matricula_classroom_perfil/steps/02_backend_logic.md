# Missão 2: Lógica de Negócio (Go Backend)

## Objetivo

Implementar validações críticas e expor novos dados via API.

## Ações Práticas

### 1. Atualizar Models (Go Structs)

Arquivo: `backend/internal/models`

- [ ] Atualizar `Course` com `GoogleClassroomURL string`.
- [ ] Atualizar `Student` para garantir consistência com `User`.

### 2. Serviço de Matrícula (`EnrollmentService`)

Arquivo: `backend/internal/service/enrollment`

- [ ] **Validar Idade**:
  ```go
  if age < 12 { return errors.New("idade mínima 12 anos") }
  ```
- [ ] **Validar Conflito**:
  ```go
  // Buscar enrollments ativos do aluno
  // Se novo curso colide horario -> return error
  ```

### 3. Expor Dados na API

Arquivo: `backend/internal/handler`

- [ ] Garantir que `Task GET /courses` retorne o campo `google_classroom_url`.
