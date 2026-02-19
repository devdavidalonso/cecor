# 🌐 Plano Final: Modelo de Dados e Implementação (Versão Final)

> **Objetivo:** Sincronizar o Banco de Dados (PostgreSQL) e o Backend (Go) com os novos Wizards de Cadastro (Professor e Curso), evitando redundâncias e aproveitando a estrutura existente.

---

## 🏗️ Fase 1: Mapeamento do Legado (Structs Go)

_Objetivo: Ensinar o Backend a "enxergar" as tabelas que já existem no Banco de Dados, mas não têm modelos no código._

### 1.1. Model `UserContact` (Novo)

- **Arquivo:** `internal/models/user_contact.go`
- **Tabela:** `user_contacts` (Já existe ✅)
- **Campos:** `Name`, `Phone`, `Relationship`, `CanPickup`, etc.
- **Relação:** Pertence a `Student` (e talvez `User` futuramente, ver FK).

### 1.2. Model `ClassSession` (Novo)

- **Arquivo:** `internal/models/class_session.go`
- **Tabela:** `class_sessions` (Já existe ✅)
- **Campos:** `CourseID`, `LocationID`, `Date`, `Topic`.

### 1.3. Model `Location` (Novo/Opcional)

- **Arquivo:** `internal/models/location.go`
- **Tabela:** `locations` (Já existe ✅)
- **Campos:** `Name`, `Capacity`.
- **Uso:** Dropdown de salas no Wizard de Curso.

---

## 🛠️ Fase 2: Expansão do Schema (Database Migrations)

_Objetivo: Criar apenas o que FALTA para suportar os novos campos dos formulários._

### 2.1. Migration: Ajustar Tabela `courses`

- **Arquivo SQL:** `migrations/YYYYMMDD_alter_courses_add_fields.sql`
- **Ações:**

  ```sql
  ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS category text,      -- Para filtro de cursos (Tecnologia, Artes...)
  ADD COLUMN IF NOT EXISTS location_id integer; -- Sala padrão do curso

  -- Nota: google_classroom_url JÁ EXISTE. Não criar.
  ```

### 2.2. Migration: Ajustar Tabela `teachers`

- **Arquivo SQL:** `migrations/YYYYMMDD_alter_teachers_setup.sql`
- **Ações:**

  ```sql
  ALTER TABLE teachers
  ADD COLUMN IF NOT EXISTS linkedin_url text;

  -- Se 'academic_background' já existe, usaremos ele como 'Education'.
  -- Se não existir, criar 'education text'.
  ```

### 2.3. Migration: Ajustar Tabela `addresses` (Opcional)

- **Objetivo:** Permitir múltiplos endereços por usuário.
- **Ação:** Verificar se existe `UNIQUE(user_id)` e remover.

---

## ⚙️ Fase 3: Lógica de Negócio (Services & Controllers)

_Objetivo: Conectar o Frontend (Angular) ao Banco através das novas Structs._

### 3.1. Teacher Service (`CreateTeacher`)

- **Entrada:** Receber JSON com `contacts` (array) e `education`.
- **Processamento:**
  - Salvar `User` (com `Address` múltiplo?).
  - Salvar `Teacher` (com `LinkedinURL`, `Education`).
  - Salvar `UserContacts` na tabela `user_contacts`.

### 3.2. Course Service (`CreateCourse`)

- **Entrada:** Receber JSON com `category`, `locationId`.
- **Processamento:**
  - Salvar `Course` preenchendo as novas colunas.
  - (Futuro) Gerar `ClassSessions` baseado nos dias da semana (`WeekDays`).

---

## ✅ Fase 4: Validação e Testes

_Objetivo: Garantir que tudo funciona ponta a ponta._

1.  [ ] **Rodar Migrations**: Verificar se colunas foram criadas no pgAdmin.
2.  [ ] **Teste de API (Curl/Postman)**:
    - Criar Professor com contato de emergência. Confirmar que salvou em `user_contacts`.
    - Criar Curso com Categoria. Confirmar que salvou.
3.  [ ] **Teste de UI (Angular)**:
    - Preencher Wizards completos e submeter.
    - Verificar se não há erros de console ou 400 Bad Request.

---

## 📌 Status Atual (Início)

- [ ] Fase 1: Pendente
- [ ] Fase 2: Pendente
- [ ] Fase 3: Pendente
- [ ] Fase 4: Pendente
