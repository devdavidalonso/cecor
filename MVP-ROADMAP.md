# 🎯 MVP ROADMAP - CECOR

## Sistema de Controle de Frequência para Lar do Alvorecer

**Última atualização:** 08/02/2026  
**Dedicação diária:** 4 horas  
**Prazo estimado:** 3 semanas (15 dias úteis)

---

## 🎪 VISÃO GERAL DO MVP

### Objetivo Central

Sistema web para controlar frequência de alunos nos cursos do Lar do Alvorecer, integrado com autenticação centralizada (Keycloak).

### Arquitetura Simplificada

```
Frontend (Angular 17)
       ↓
Backend (Go - Hexagonal)
       ↓
PostgreSQL
       ↓
Keycloak (lar-sso) ← SSO
```

### Perfis de Usuário

- **Administrador**: Gestão completa do sistema
- **Professor**: Registro de frequência e visualização de turmas
- **Aluno**: Visualização da própria frequência

---

## 📊 PROGRESSO GERAL

```
[█████░░░░░░░░░░░░░░░] 26% - Autenticação Completa (Frontend + Backend)
```

---

## 🗓️ SEMANA 1 - FUNDAÇÃO (Dias 1-5)

### ✅ DIA 1 - Setup e Limpeza

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [✅] Limpar docker-compose.yml (remover MongoDB, Redis, RabbitMQ)
- [✅] Ajustar configuração do backend para usar apenas PostgreSQL
- [✅] Testar subida do ambiente: `docker-compose up -d`
- [✅] Verificar acesso ao Keycloak (http://localhost:8081)
- [✅] Verificar logs dos containers

**Arquivos afetados:**

- `docker-compose.yml`
- `backend/internal/config/config.go`

**Critério de sucesso:**
✅ Todos os containers sobem sem erro  
✅ Keycloak acessível  
✅ PostgreSQL conectado

---

### ✅ DIA 2 - Configuração Keycloak

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [✅] Criar Realm "cecor" no Keycloak
- [✅] Criar Client "cecor-frontend" (public, redirect URI: http://localhost:4200/\*)
- [✅] Criar Client "cecor-backend" (confidential)
- [✅] Criar 3 Roles: "administrador", "professor", "aluno"
- [✅] Criar usuários de teste (1 de cada role)

**Credenciais de acesso Keycloak:**

- URL: http://localhost:8081
- User: admin
- Pass: admin

**Critério de sucesso:**
✅ Realm "cecor" criado  
✅ 2 Clients configurados  
✅ 3 Roles criadas  
✅ 3 usuários de teste funcionando

---

### ✅ DIA 3 - Integração Backend com Keycloak

**Tempo estimado:** 4h  
**Status:** [✅] Concluído

#### Tarefas:

- [✅] Instalar biblioteca OIDC no Go: `go get github.com/coreos/go-oidc/v3/oidc`
- [✅] Configurar middleware de autenticação JWT
- [✅] Criar endpoint `/api/v1/auth/verify` para validar token
- [✅] Testar validação de token via Postman/Insomnia

**Arquivos a modificar:**

- `backend/internal/auth/middleware.go` (criar se não existir)
- `backend/cmd/api/main.go` (adicionar middleware)

**Critério de sucesso:**
✅ Backend valida tokens do Keycloak  
✅ Retorna 401 se token inválido  
✅ Extrai roles do token

---

### ✅ DIA 4 - Integração Frontend com Keycloak

**Tempo estimado:** 4h  
**Status:** [✅] **Concluído**

#### Tarefas:

- [✅] ~~Instalar biblioteca: `npm install keycloak-angular keycloak-js`~~ _Usamos angular-oauth2-oidc_
- [✅] Configurar SsoService no Angular com OIDC
- [✅] Criar AuthGuard para rotas protegidas
- [✅] Implementar APP_INITIALIZER para processamento de callbacks
- [✅] Testar fluxo completo de login
- [✅] **RESOLVIDO:** Loop infinito de redirecionamento (OIDC mode + router config)
- [✅] Testar logout flow

**Arquivos criados/modificados:**

- `frontend/src/app/core/services/sso.service.ts`
- `frontend/src/app/core/services/auth.service.ts`
- `frontend/src/app/core/guards/auth.guard.ts`
- `frontend/src/app/app.config.ts`

**Critério de sucesso:**
✅ Login redireciona para Keycloak  
✅ Após login, retorna para aplicação com tokens  
✅ Token armazenado no sessionStorage  
✅ Rotas protegidas funcionando  
✅ Logout limpa tokens e invalida sessão  
✅ Dashboard carrega com identidade do usuário

**Desafio resolvido:**

- Loop infinito causado por router limpando URL antes de OAuth processar código
- Solução: `oidc: true` + remover `withEnabledBlockingInitialNavigation()`

---

### ✅ DIA 5 - Teste de Integração Completa

**Tempo estimado:** 4h  
**Status:** [✅] **Concluído**

#### Tarefas:

- [ ] Testar login com os 3 perfis
- [ ] Verificar roles sendo enviadas ao backend
- [ ] Criar tela inicial simples com nome do usuário logado
- [ ] Implementar botão de logout
- [ ] Documentar configuração no README.md

**Critério de sucesso:**
✅ Login/Logout funcionando  
✅ Roles corretas para cada usuário  
✅ Backend reconhece o usuário  
✅ Documentação atualizada

---

## 🗓️ SEMANA 2 - CRUD BÁSICO (Dias 6-10)

### ✅ DIA 6 - Modelo de Dados e Migrations

**Tempo estimado:** 4h  
**Status:** [✅] Não iniciado

#### Tarefas:

- [✅] Criar migration para tabela `alunos`
- [✅] Criar migration para tabela `cursos`
- [✅] Criar migration para tabela `matriculas`
- [✅] Rodar migrations: `go run migrations/main.go up`

**Estrutura de tabelas:**

**alunos:**

- id (UUID)
- nome (VARCHAR 200)
- cpf (VARCHAR 11, unique)
- data_nascimento (DATE)
- telefone (VARCHAR 15)
- nome_responsavel (VARCHAR 200)
- telefone_responsavel (VARCHAR 15)
- created_at, updated_at

**cursos:**

- id (UUID)
- nome (VARCHAR 200)
- descricao (TEXT)
- carga_horaria (INT)
- professor_id (VARCHAR) - referência ao Keycloak
- ativo (BOOLEAN)
- created_at, updated_at

**matriculas:**

- id (UUID)
- aluno_id (UUID FK)
- curso_id (UUID FK)
- data_matricula (DATE)
- ativo (BOOLEAN)
- created_at, updated_at

**Critério de sucesso:**
✅ Migrations rodam sem erro  
✅ Tabelas criadas no PostgreSQL  
✅ Constraints funcionando

---

### ✅ DIA 7 - CRUD Alunos - Backend

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Criar struct `Aluno` em `internal/models/aluno.go`
- [ ] Implementar repository `internal/repository/aluno_repository.go`
- [ ] Implementar service `internal/service/aluno_service.go`
- [ ] Criar handlers HTTP em `internal/api/handlers/aluno_handler.go`
- [ ] Adicionar rotas em `cmd/api/main.go`

**Endpoints:**

- POST `/api/v1/alunos` - Criar aluno
- GET `/api/v1/alunos` - Listar alunos
- GET `/api/v1/alunos/:id` - Buscar aluno
- PUT `/api/v1/alunos/:id` - Atualizar aluno
- DELETE `/api/v1/alunos/:id` - Deletar aluno (soft delete)

**Critério de sucesso:**
✅ Endpoints retornam JSON correto  
✅ Validações implementadas  
✅ Apenas Administrador pode criar/editar

---

### ✅ DIA 8 - CRUD Alunos - Frontend

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Criar módulo `alunos` (lazy-loaded)
- [ ] Criar componente `aluno-list` (tabela com Angular Material)
- [ ] Criar componente `aluno-form` (formulário reativo)
- [ ] Implementar service `aluno.service.ts`
- [ ] Adicionar rotas no módulo

**Componentes:**

- `alunos/aluno-list` - Lista com busca e filtros
- `alunos/aluno-form` - Formulário criar/editar
- `alunos/aluno-detail` - Visualização detalhada

**Critério de sucesso:**
✅ Tabela exibe lista de alunos  
✅ Formulário valida campos  
✅ CRUD completo funcionando  
✅ Mensagens de sucesso/erro

---

### ✅ DIA 9 - CRUD Cursos

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Backend: Models, Repository, Service, Handlers (seguir padrão do dia 7)
- [ ] Frontend: Módulo, Componentes, Service (seguir padrão do dia 8)
- [ ] Implementar seleção de professor (buscar do Keycloak)

**Endpoints:**

- POST `/api/v1/cursos`
- GET `/api/v1/cursos`
- GET `/api/v1/cursos/:id`
- PUT `/api/v1/cursos/:id`
- DELETE `/api/v1/cursos/:id`

**Critério de sucesso:**
✅ CRUD de cursos completo  
✅ Vinculação com professor  
✅ Apenas Admin/Gestor gerencia

---

### ✅ DIA 10 - Matrícula Simples

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Backend: Implementar lógica de matrícula
- [ ] Validar se aluno já está matriculado no curso
- [ ] Frontend: Tela de matrícula (select de aluno + select de curso)
- [ ] Listar matrículas ativas

**Endpoint adicional:**

- POST `/api/v1/matriculas`
- GET `/api/v1/matriculas?curso_id=X`
- GET `/api/v1/matriculas?aluno_id=Y`

**Critério de sucesso:**
✅ Aluno pode ser matriculado em curso  
✅ Não permite matrícula duplicada  
✅ Lista de matriculados por curso

---

## 🗓️ SEMANA 3 - FREQUÊNCIA (Dias 11-15)

### ✅ DIA 11 - Modelo de Frequência

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Criar migration para tabela `presencas`
- [ ] Implementar models, repository, service

**Estrutura tabela presencas:**

- id (UUID)
- matricula_id (UUID FK)
- data_aula (DATE)
- presente (BOOLEAN)
- observacao (TEXT nullable)
- registrado_por (VARCHAR) - professor que registrou
- created_at, updated_at

**Critério de sucesso:**
✅ Migration criada  
✅ Estrutura pronta para registro

---

### ✅ DIA 12 - Registro de Frequência - Backend

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Endpoint para registrar presença em lote
- [ ] Validar se professor tem permissão no curso
- [ ] Calcular percentual de frequência

**Endpoints:**

- POST `/api/v1/presencas/registrar` - Registrar chamada do dia
- GET `/api/v1/presencas/curso/:id/data/:data` - Buscar chamada
- GET `/api/v1/presencas/aluno/:id` - Histórico do aluno

**Critério de sucesso:**
✅ Professor registra presença/falta  
✅ Não permite alterar após 24h  
✅ Calcula % de frequência

---

### ✅ DIA 13 - Tela de Chamada - Frontend

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Criar componente `chamada-list`
- [ ] Exibir lista de alunos matriculados no curso
- [ ] Checkboxes para marcar presença/falta
- [ ] Botão "Salvar Chamada"
- [ ] Exibir % de frequência de cada aluno

**Critério de sucesso:**
✅ Professor vê lista de alunos  
✅ Marca presença/falta facilmente  
✅ Vê percentual atualizado

---

### ✅ DIA 14 - Relatórios Básicos

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Backend: Endpoint de relatório de frequência
- [ ] Frontend: Tela de relatório com filtros
- [ ] Exportar para PDF usando biblioteca (ex: jsPDF)

**Relatórios:**

1. Frequência por aluno (período)
2. Frequência geral da turma

**Critério de sucesso:**
✅ Relatório exibe dados corretos  
✅ Filtros funcionando  
✅ Exportação em PDF

---

### ✅ DIA 15 - Testes Finais e Documentação

**Tempo estimado:** 4h  
**Status:** [ ] Não iniciado

#### Tarefas:

- [ ] Testar todos os fluxos do MVP
- [ ] Corrigir bugs encontrados
- [ ] Atualizar README.md com instruções completas
- [ ] Preparar apresentação para o Lar do Alvorecer
- [ ] GIT PUSH FINAL! 🚀

**Critério de sucesso:**
✅ MVP funcionando ponta a ponta  
✅ Documentação completa  
✅ Pronto para demonstração

---

## 🎯 CRITÉRIOS DE SUCESSO DO MVP

### Funcional

- ✅ Login via Keycloak
- ✅ Cadastro de alunos e cursos
- ✅ Matrícula de alunos em cursos
- ✅ Registro de frequência por professor
- ✅ Relatório de frequência simples

### Técnico

- ✅ Código no GitHub atualizado
- ✅ Docker Compose funcional
- ✅ README com instruções claras
- ✅ Sem dependências desnecessárias

### Negócio

- ✅ Resolve a dor do Lar do Alvorecer
- ✅ Pode ser testado com usuários reais
- ✅ Base para evoluções futuras

---

## 📌 REGRAS DE OURO

### ✅ PODE:

- Melhorar código existente
- Adicionar validações
- Melhorar UX/UI
- Corrigir bugs

### ❌ NÃO PODE:

- Adicionar novas funcionalidades não listadas
- Mudar arquitetura
- Adicionar novas tecnologias
- Fazer "só mais uma coisinha"

### 💡 TEVE UMA IDEIA NOVA?

1. Anote em `BACKLOG.md` (criar se não existir)
2. Esqueça por enquanto
3. Foca no MVP
4. Depois você decide se vale a pena

---

## 🎉 CELEBRAÇÕES

- ✅ Completou um dia? → Git commit + push
- ✅ Completou uma semana? → Mostre para alguém!
- ✅ Completou o MVP? → FESTA! 🎊

---

## 🆘 TRAVOU?

1. Respira fundo
2. Relê a tarefa do dia
3. Tenta por mais 30min
4. Ainda travado? → Vem no Claude Chat e pede ajuda!

---

**Lembre-se:** Progresso > Perfeição  
**Mantra:** "Feito é melhor que perfeito"

🚀 **BORA FAZER ACONTECER!**
