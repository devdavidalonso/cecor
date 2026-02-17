# 🚀 Plano de Execução: Matrícula, Classroom e Perfil

**Objetivo**: Implementar o fluxo completo de matrícula com validação de regras, integração com Google Classroom e Perfil Socioeducacional no MongoDB.

**Estratégia**: Dividir em 3 "Missões" independentes para execução controlada.

---

## 📂 Estrutura de Arquivos

Este plano foi quebrado em passos atômicos na pasta: `docs/execution/01_matricula_classroom_perfil/steps/`

- `01_database_migration.md`: Atualizar Schema SQL.
- `02_backend_logic.md`: Regras de Negócio e Integração Classroom.
- `03_mongo_engine.md`: Motor de Formulários (Perfil Socioeducacional).

---

## 🛠️ Missão 1: Fundação de Dados (SQL)

**Foco**: Garantir que o PostgreSQL tenha todas as colunas e tabelas necessárias.

1.  [ ] Executar `10-update-teachers-contacts.sql` (Contatos unificados).
2.  [ ] Executar `11-create-calendar-locations.sql` (Sessões e Locais).
3.  [ ] Executar `13-add-classroom-url.sql` (Link do Classroom).
4.  [ ] Validar schema final.

## 🛠️ Missão 2: Lógica de Negócio (Go Backend)

**Foco**: Impedir dados inválidos e integrar links.

1.  [ ] **Model Update**: Atualizar structs Go (`Course`, `Student`) com novos campos.
2.  [ ] **Validação de Idade**: No serviço de matrícula, rejeitar se `age < 12`.
3.  [ ] **Validação de Horário**: No serviço de matrícula, checar sobreposição de horário no mesmo dia.
4.  [ ] **Endpoint GET /courses**: Retornar `google_classroom_url` para o frontend.

## 🛠️ Missão 3: Perfil Socioeducacional (MongoDB)

**Foco**: Flexibilidade para perguntas sociais.

1.  [ ] **Driver Setup**: Configurar conexão MongoDB no backend Go.
2.  [ ] **Collection `form_definitions`**: Criar seeds com o questionário padrão (extraído do Google Form).
3.  [ ] **Endpoint GET /forms/pending**: Verificar se aluno tem pendências.
4.  [ ] **Endpoint POST /forms/response**: Salvar respostas no Mongo.

---

## 📢 Como Executar?

Para iniciar, peça ao Agente:

> _"Execute a Missão 1 do plano de Matrícula na pasta de execução."_
