# Missão 3: Perfil Socioeducacional (MongoDB)

## Objetivo

Implementar o motor de formulários dinâmicos.

## Ações Práticas

### 1. Configuração MongoDB

- [ ] Adicionar driver mongo ao `go.mod`.
- [ ] Criar singleto de conexão (`backend/internal/database/mongo.go`).

### 2. Definição do Formulário (Seed)

- [ ] Criar JSON representando o "Perfil Inicial 2026" (perguntas extraídas da análise do Google Form).
- [ ] Criar script ou endpoint para inserir esse JSON na coleção `form_definitions`.

### 3. Endpoints de Entrevista

- [ ] `GET /api/v1/interviews/pending`: Retorna se o aluno precisa responder.
- [ ] `POST /api/v1/interviews/response`: Recebe o JSON com as respostas e salva em `interview_responses`.

### 4. Integração Frontend (Posterior)

- [ ] Frontend consome o JSON do `form_definitions` para renderizar os inputs dinamicamente.
