# PRD MVP - Sistema de Gestão Educacional CECOR

**Versão:** 1.0  
**Data:** 17/02/2026  
**Foco**: Operação Básica e Eliminação de Papel

---

## 1. Objetivo do MVP

O MVP (Minimum Viable Product) visa resolver as três dores latentes imediatas:

1.  **Impressão de Listas de Presença**: Saber quem deve estar na sala.
2.  **Organização de Aulas/Salas**: Saber onde e quando a aula ocorre.
3.  **Registro de Ocorrências**: Formalizar problemas do dia a dia.

## 2. Funcionalidades Prioritárias (Escopo Fechado)

### 2.1. Cadastros Básicos (Backoffice)

- [x] Cadastro de Alunos (Dados Pessoais + Responsáveis).
- [x] Cadastro de Professores (Dados Pessoais + _Proficiências_ + _Termo Voluntário Básico_).
- [x] Cadastro de Cursos (Nome, Carga Horária).
- [x] Cadastro de Salas/Locais (`Locations`).

### 2.2. Gestão de Turmas e Aulas

- [x] Matrícula de Alunos em Cursos (`Enrollments`).
- [x] Geração de Grade de Aulas (`ClassSessions`): Criar sessões automaticamente para o período do curso.
- [x] Geração de Grade de Aulas (`ClassSessions`): Criar sessões automaticamente para o período do curso.
- [x] Alocação de Professor e Sala por Sessão.
- [ ] **Integração Google Classroom**: Campo para link da turma no Classroom.

### 2.3. Operação Diária (Professor/Monitor)

- [x] **Lista de Presença Digital**: Professor acessa a aula do dia e marca Presente/Ausente.
- [x] **Visualização de Ementa**: Professor vê o tema (`topic`) do dia.
- [x] **Registro de Ocorrências**:
  - Vinculada à aula (ex: briga).
  - Avulsa (ex: infraestrutura).

### 2.4. Relatórios Essenciais (Administrativo)

- [x] Lista de Presença (PDF para impressão/backup).
- [x] Alunos Faltantes (Relatório simples de quem faltou X vezes).
- [x] Histórico de Ocorrências.

## 3. O que fica de fora do MVP (Roadmap Futuro)

- Formulários Dinâmicos (MongoDB).
- Integração com WhatsApp/Telegram (Notificações serão apenas por E-mail ou in-app no MVP).
- **Automação de Criação de Turmas no Google**: Para o MVP, o professor cria a turma manualmente no Google e apenas cola o link no sistema. A integração via API (criação automática de agenda/turma) é complexa e será feita na Fase 2.
- Portal do Aluno (Self-service).
- Analytics avançado (BI).

## 4. Métricas de Sucesso do MVP

- 100% das chamadas realizadas pelo sistema (fim do papel).
- Redução de conflitos de sala de aula (duplas alocações).
- Centralização dos dados de contato de emergência.

## 5. Regras de Negócio (Business Rules)

### 5.1. Restrições de Matrícula

- **Idade Mínima**: O sistema deve bloquear matrículas de alunos com **menos de 12 anos** (calculado via Data de Nascimento).
- **Conflito de Horário (Sábado)**: O sistema não deve permitir que um aluno se matricule em dois cursos que ocorrem no mesmo horário.

### 5.2. Integração Google Classroom (Sincronia)

- **Fluxo de Acesso**:
  1.  Professor/Aluno loga no CECOR (SSO google Keycloak).
  2.  Confirma presença na aula do dia.
  3.  Clica no botão "Ir para Sala de Aula" -> Redireciona para o link do Classroom específico daquele curso.
