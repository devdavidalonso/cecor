# Missão 4: Frontend Implementation Plan (Angular)

## Contexto e Arquitetura

Baseado na `ARCHITECTURE_PERFORMANCE_ANALYSIS.md`, o frontend deve focar em performance, UX fluida e componentização inteligente (Smart/Dumb).

### Objetivos

1.  **Wizard de Matrícula**: Substituir o formulário único gigante por um passo-a-passo (Stepper).
2.  **Entrevista Dinâmica**: Interface que renderiza perguntas baseadas no JSON do MongoDB.
3.  **Feedback Imediato**: Validação de idade e conflitos em tempo real.

---

## 🎨 UI/UX Design (Sketch)

### Tela 1: Matrícula (Stepper)

**Rota**: `/enrollment/new`

#### Passo 1: Seleção de Cursos (Smart Component)

- **Layout**: Cards de cursos com filtro de busca (Server-Side Search).
- **Interação**: Ao selecionar um curso, o card destaca.
- **Regra**: Se aluno já selecionou um curso no mesmo horário, desabilitar conflitantes (feedback visual).

#### Passo 2: Dados do Aluno (Se novo)

- **Reuso**: Usar componente existente de `StudentForm`, mas otimizado.
- **Validação**: Data de Nascimento -> Check Idade >= 12.

#### Passo 3: Revisão e Contrato

- **Resumo**: Lista cursos selecionados.
- **Ação**: Botão "Confirmar Matrícula".

### Tela 2: Entrevista Socioeducacional (Dynamic Form)

**Rota**: `/interviews/pending` (Redirecionamento automático pós-matrícula)

- **Header**: "Conhecendo Você - Perfil 2026".
- **Body**: Renderizador recursivo de perguntas.
  - _Text_: Input simples.
  - _Select_: Dropdown.
  - _Boolean_: Toggle ou Radio Button.
- **Footer**: Botão "Enviar Respostas".

---

## 🛠️ Implementação Técnica

### 1. Componentes (Estrutura de Pastas)

```
src/app/features/
├── enrollment/
│   ├── components/
│   │   ├── enrollment-wizard/ (Smart - Orchestrator)
│   │   ├── course-selection/ (Dumb - Display Courses)
│   │   └── contract-review/ (Dumb - Readonly)
│   └── services/
│       └── enrollment-facade.service.ts
├── interview/
│   ├── components/
│   │   ├── dynamic-form/ (Smart - Loads JSON)
│   │   └── question-control/ (Dumb - Renders Input)
│   └── services/
│       └── interview.service.ts (Mongo API)
```

### 2. Gerenciamento de Estado (Performance)

- **Enrollment State**: Usar `BehaviorSubject` no Service para manter o estado do wizard entre os passos, evitando recarregamentos.
- **Lazy Loading**: O módulo `Interview` só carrega se necessário.

### 3. Integração com Backend

- `EnrollmentService.create()`: Envia matrícula.
- `InterviewService.getPending()`: Checa no `ngOnInit` do dashboard do aluno.
- `InterviewService.submit()`: Envia JSON para mongo.

---

## 📋 Steps de Execução

Este plano será executado em etapas detalhadas no arquivo `04_frontend_implementation.md`.
