# 📅 DAILY TASKS - CECOR MVP

**Sistema de acompanhamento diário**  
**Dedicação:** 4 horas/dia  
**Início:** **_ / _** / 2026

---

## 📊 PROGRESSO SEMANAL

### SEMANA 1 - FUNDAÇÃO

```
[✅] Dia 1  [✅] Dia 2  [✅] Dia 3  [✅] Dia 4  [✅] Dia 5
```

### SEMANA 2 - CRUD BÁSICO

```
[✅] Dia 6  [✅] Dia 7  [✅] Dia 8  [✅] Dia 9  [✅] Dia 10
```

### SEMANA 3 - FREQUÊNCIA

```
[✅] Dia 11  [✅] Dia 12  [✅] Dia 13  [✅] Dia 14  [░] Dia 15
```

---

## 🎯 DIA ATUAL: 13/02/2026 - DIA 13 - Tela de Chamada - Frontend

### 📋 TAREFA DO DIA

> **Copie a tarefa do MVP-ROADMAP.md aqui e marque conforme avança**

**Exemplo:**

- [✅] Frontend: Criar componente `chamada-list`
- [✅] Frontend: Exibir lista de alunos matriculados
- [✅] Frontend: Salvar chamada em lote via API

---

## ⏰ CRONÔMETRO DE 4 HORAS

### Hora 1 (0:00 - 1:00) - SETUP

**O que fazer:**

- [✅] Abrir IDE (AntiGravity)
- [✅] Ler a tarefa do dia no MVP-ROADMAP.md
- [✅ ] Preparar ambiente (subir docker, abrir arquivos)
- [✅ ] Começar primeira subtarefa

**Checkpoint 1h:**

```
O que consegui fazer:



O que está me travando (se algo):


```

---

### Hora 2 (1:00 - 2:00) - DESENVOLVIMENTO

**O que fazer:**

- [ ] Continuar implementação
- [ ] Testar localmente conforme avança
- [ ] Se travar mais de 30min → anota dúvida no final

**Checkpoint 2h:**

```
Progresso até aqui:



Bloqueios/Dúvidas:


```

---

### Hora 3 (2:00 - 3:00) - REFINAMENTO

**O que fazer:**

- [ ] Testar funcionalidade completa
- [ ] Corrigir bugs encontrados
- [ ] Melhorar código (se sobrar tempo)
- [ ] Preparar para commit

**Checkpoint 3h:**

```
Funcionalidade está pronta? [ ] Sim [ ] Não

Se não, o que falta:


```

---

### Hora 4 (3:00 - 4:00) - FINALIZAÇÃO

**O que fazer:**

- [ ] Último teste end-to-end
- [ ] Git add + commit com mensagem clara
- [ ] Git push
- [ ] Atualizar este arquivo (marcar ✅ no dia)
- [ ] Anotar aprendizados

**Checkpoint 4h - ENCERRAMENTO:**

```
✅ Tarefa concluída? [✅] Sim [ ] Parcial [ ] Não

Se parcial/não, motivo:


Commits realizados hoje:
- feat(frontend): implementa interface de registro de presença com dados reais
- feat(frontend): atualiza attendance service para integração com backend
- fix(frontend): resolve erros de tipo e lint no componente de presença


Próxima sessão vai começar em:


```

---

## 🚨 SITUAÇÕES ESPECIAIS

### 🔴 SE TRAVOU MAIS DE 30 MIN

1. **Para o que está fazendo**
2. **Respira fundo** (sério, respira)
3. **Anota o problema aqui:**

   ```
   Problema:


   O que já tentei:


   ```

4. **Vem no Claude Chat pedir ajuda**

### 🟡 SE TEVE UMA IDEIA NOVA

1. **Não implementa agora!**
2. **Anota no BACKLOG.md** (cria se não existir)
   ```
   ## [DATA] - Nova ideia
   - Descrição:
   - Por que é legal:
   - Pode esperar para depois do MVP? [ ] Sim [ ] Não
   ```
3. **Volta para a tarefa do dia**

### 🟢 SE TERMINOU ANTES DAS 4H

1. **Parabéns! 🎉**
2. **Revisa o código**
3. **Melhora a documentação**
4. **OU descansa** (não é obrigatório fazer 4h se terminou)

---

## 📝 HISTÓRICO DE SESSÕES

### SEMANA 1

#### 📅 DIA 1 - Setup e Limpeza

**Data:** **_ / _** / 2026  
**Horário:** **_:_** - **_:_**  
**Status:** [✅] Concluído [ ] Parcial [ ] Não iniciado

**Resumo:**

```
O que foi feito:



Dificuldades:



Aprendizados:


```

**Commits:**

- [✅] `git commit -m "feat: limpa docker-compose para MVP"`
- [✅] `git commit -m "chore: remove dependências desnecessárias"`

---

#### 📅 DIA 2 - Configuração Keycloak

**Data:** **_ / _** / 2026  
**Horário:** **_:_** - **_:_**  
**Status:** [✅ Concluído [ ] Parcial [ ] Não iniciado

**Resumo:**

```
O que foi feito:



Dificuldades:



Aprendizados:


```

**Commits:**

- [✅] `git commit -m "docs: adiciona configuração Keycloak no README"`

---

#### 📅 DIA 3 - Integração Backend

**Data:** **_ / _** / 2026  
**Horário:** **_:_** - **_:_**  
**Status:** [✅] Concluído [ ] Parcial [ ] Não iniciado

**Resumo:**

```
O que foi feito:
- Implementado middleware OIDC para validação de tokens JWT do Keycloak
- Criado endpoint de verificação de sessão (/api/v1/auth/verify)
- Configurado backend para usar JWKS do Keycloak de produção
- Testes manuais de endpoints protegidos e públicos

Dificuldades:
- Ajuste inicial de path no routes.go e rebuild do Docker (cache) mascarando as mudanças
- Correção de sintaxe no auth_handler.go

Aprendizados:
- Importância de forçar rebuild sem cache no docker-compose quando se muda estrutura de binários Go
- Uso de go-oidc facilita muito a validação de tokens RS256
```

**Commits:**

- [✅] `git commit -m "feat: adiciona middleware de autenticação JWT"`
- [✅] `git commit -m "feat: cria endpoint de validação de token"`

---

#### 📅 DIA 4 - Integração Frontend

**Data:** 08 / 02 / 2026  
**Horário:** 18:26 - 20:37  
**Status:** [✅] Concluído [ ] Parcial [ ] Não iniciado

**Resumo:**

```
O que foi feito:
- ✅ Configurado angular-oauth2-oidc no SsoService
- ✅ Atualizado AuthService para usar SsoService como single source of truth
- ✅ Registrado APP_INITIALIZER para SSO antes do bootstrap
- ✅ Build completo sem erros TypeScript
- ✅ Testado redirect para Keycloak - FUNCIONANDO
- ✅ Login no Keycloak com admin.cecor - FUNCIONANDO
- ✅ RESOLVIDO loop infinito de redirecionamento
- ✅ Token exchange funcionando (Authorization Code Flow + PKCE)
- ✅ Dashboard carregando com identidade do usuário: "Bem-vindo, Admin CECOR!"
- ✅ Logout flow testado e funcionando perfeitamente
- ✅ Proteção de rotas após logout funcionando

Dificuldades:
- ❌→✅ Loop de redirecionamento infinito após callback do Keycloak
  Causa: Angular router limpando URL antes do OAuth library processar
  Solução: Removido withEnabledBlockingInitialNavigation() + adicionado oidc: true

Aprendizados:
- angular-oauth2-oidc precisa oidc: true para Public Clients
- Router initialization pode interferir com OAuth callback processing
- APP_INITIALIZER deve executar ANTES do router para processar URLs com code/state
- PKCE é obrigatório para Public Clients no Keycloak
- Debug com browser subagent é extremamente eficaz para identificar problemas
```

**Commits:**

- [✅] `git commit -m "feat: integra angular-oauth2-oidc no frontend"` (próxima sessão)
- [✅] `git commit -m "fix: resolve loop infinito habilitando OIDC mode"` (próxima sessão)
- [✅] `git commit -m "fix: corrige router initialization para OAuth callback"` (próxima sessão)

---

#### 📅 DIA 5 - Testes de Integração

**Data:** 08 / 02 / 2026  
**Horário:** 20:52 - 21:25
**Status:** [✅] Concluído [ ] Parcial [ ] Não iniciado

**Resumo:**

```
O que foi feito:
- ✅ Verificação de usuários no Keycloak (prof.maria, aluno.pedro)
- ✅ Teste de login com perfil Professor (sucesso, dashboard ok)
- ✅ Teste de login com perfil Aluno (sucesso, dashboard ok)
- ✅ Validação de fluxo de logout para todos os perfis
- ✅ Verificação backend de roles e identidade (endpoint /verify)
- ✅ Confirmação de que roles são mapeadas corretamente (frontend & backend)

Dificuldades:
- Nenhuma. O sistema se comportou exatamente como esperado após as correções do Dia 4.

Aprendizados:
- A arquitetura de autenticação centralizada provou-se robusta.
- O uso de subagentes para testes E2E no navegador é muito eficiente.
```

**Commits:**

- [✅] `git commit -m "docs: atualiza roadmap e tarefas com conclusão do dia 5"`
- [ ] `git commit -m "docs: atualiza README com instruções de login"` (já feito no dia 4)

---

### SEMANA 2

#### 📅 DIA 6 - Modelo de Dados

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Commits:**

- [ ] `git commit -m "feat: cria migrations para alunos, cursos, matriculas"`

---

#### 📅 DIA 7 - CRUD Alunos Backend

**Data:** 08-09 / 02 / 2026  
**Status:** [✅] Concluído

**Resumo:**

```
O que foi feito:
- ✅ Implementado KeycloakService para provisionamento automático de usuários
- ✅ Implementado EmailService para envio de credenciais de acesso
- ✅ Integração completa: criação no DB + Keycloak + envio de email
- ✅ Correção de erro SQL na listagem de alunos (deleted_at ambíguo)
- ✅ Rollback automático em caso de falha
- [✅] Erro 400 na criação de aluno (resolvido dia 9)

Dificuldades:
- Erro 400 persistente ao criar aluno via frontend
- Erro de migração na tabela enrollments (não bloqueante)

Aprendizados:
- Integração Keycloak + Backend requer tratamento de erros robusto
- Importância de qualificar colunas em queries com JOINs
```

**Commits:**

- [✅] `git commit -m "feat: implementa integração Keycloak e Email no backend"`
- [✅] `git commit -m "fix: corrige query SQL ambígua em student_repository"`
- [✅] `git commit -m "fix: resolve erro 400/500 na criação de aluno"` (Dia 9)

---

#### 📅 DIA 9 - Correção de Bugs e Verificação (Backend & Frontend)

**Data:** 11 / 02 / 2026
**Status:** [✅] Concluído

**Resumo:**

```
O que foi feito:
- ✅ **Backend Student Service**: Adicionado `password` padrão ("temp123456") para usuários criados via API interna (antes falhava por NOT NULL).
- ✅ **Backend Model**: Ajustado `User.Password` para `omitempty` no JSON (antes ignorado em requests).
- ✅ **Backend Model**: Ajustado `Student.SocialMedia` para `*string` (antes enviava string vazia para coluna JSON causando erro 500).
- ✅ **Frontend**: Ajustado formato de data `birthDate` para ISO string no `StudentService`.
- ✅ **Verificação**:
  - Simulação de criação via Frontend (Browser Agent): Sucesso.
  - Verificação de login com novo aluno: Sucesso (Dashboard acessível).
  - Verificação no Keycloak Admin: Role "aluno" atribuída corretamente.
  - ✅ **Fix Crítico Keycloak**: Removido `Required Action: UPDATE_PASSWORD` na criação de usuário, permitindo login direto.
  - ✅ **Frontend Locale**: Configurado `pt-BR` (`LOCALE_ID`, `MAT_DATE_LOCALE`) para corrigir input de data (`DD/MM/YYYY`).
  - ✅ **Validação**: Cadastro de aluno via seletor de calendário verificado com sucesso.
- ✅ **Documentação**: Atualizado walkthrough com evidências.

Dificuldades:
- Erro silencioso 500 no `social_media`. Identificado via logs detalhados e corrigido com pointer type.
- Cache de build impedindo atualização do binário Go (resolvido com `go clean -cache`).

Aprendizados:
- Colunas JSON/JSONB no Postgres via GORM devem ser mapeadas como ponteiros ou tipos específicos (pgtype) se puderem ser nulas/vazias.
- Sempre limpar cache do Go se o comportamento não refletir o código.
```

**Commits:**

- [✅] `git commit -m "fix(backend): resolve erro 400/500 na criação de aluno (json tags, pointer types)"`
- [✅] `git commit -m "fix(frontend): ajusta formato de data no envio do formulário de aluno"`

#### 📅 DIA 8 - CRUD Alunos Frontend

**Data:** 09 / 02 / 2026  
**Status:** [✅] Concluído

**Resumo:**

```
O que foi feito:
- ✅ Modernizada lista de alunos com Material Design
- ✅ Implementado Material Table com sorting e paginação
- ✅ Criado dashboard com 4 cards de estatísticas
- ✅ Status em chips coloridos (Ativo, Inativo, Suspenso)
- ✅ Implementado formulário multi-etapas (4 steps) com Material Stepper
- ✅ Etapa 1: Dados Pessoais (com auto-formatação CPF/telefone)
- ✅ Etapa 2: Dados do Aluno
- ✅ Etapa 3: Responsáveis (FormArray dinâmico com permissões)
- ✅ Etapa 4: Revisão completa
- ✅ Design 100% consistente com módulo de cursos

Dificuldades:
- Ajustes de tipos TypeScript para FormArray
- Validações de CPF e telefone

Aprendizados:
- Material Stepper é excelente para formulários complexos
- FormArray permite gerenciamento dinâmico de responsáveis
- Consistência visual melhora muito a UX
```

**Commits:**

- [🔄] `git commit -m "feat: moderniza lista de alunos com Material Design"`
- [🔄] `git commit -m "feat: implementa formulário multi-etapas para alunos"`
- [🔄] `git commit -m "feat: adiciona gestão de responsáveis no formulário"`

---

#### 📅 DIA 9 - CRUD Cursos

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Commits:**

- [ ] `git commit -m "feat: implementa CRUD completo de cursos"`

---

#### 📅 DIA 10 - Matrículas

**Data:** 12 / 02 / 2026  
**Status:** [✅] Concluído

**Resumo:**

- ✅ Implementado Repositório, Serviço e Handler de matrículas (backend).
- ✅ Implementada lógica de prevenção de duplicidade (backend).
- ✅ Criado EnrollmentService com rota adaptada (`/matriculas`).
- ✅ Implementada lista de matrículas com Material Design.
- ✅ Implementado formulário de matrícula com seletores de aluno e curso.

**Commits:**

- [✅] `git commit -m "feat: implementa sistema de matrícula"`

---

#### 📅 DIA 11 - Modelo de Frequência

**Data:** 12 / 02 / 2026  
**Status:** [✅] Concluído

**Resumo:**

- ✅ Atualizado modelo `Attendance` para incluir `EnrollmentID`.
- ✅ Criado Repositório e Serviço de presenças (backend).
- ✅ Configurada injeção de dependência no `main.go`.
- ✅ Build verificado com sucesso.

---

#### 📅 DIA 12 - Registro de Frequência - Backend

**Data:** 12 / 02 / 2026  
**Status:** [✅] Concluído

**Resumo:**

- ✅ Implementado Handler de presenças com registro em lote.
- ✅ Criados endpoints para consulta de frequência por curso e portal do aluno.
- ✅ Implementada lógica de cálculo de percentual de presença.
- ✅ Build verificado com sucesso.

---

### SEMANA 3

#### 📅 DIA 11 - Modelo Frequência

**Data:** 12 / 02 / 2026  
**Status:** [✅] Concluído

---

#### 📅 DIA 12 - Registro Backend

**Data:** 12 / 02 / 2026  
**Status:** [✅] Concluído

---

#### 📅 DIA 13 - Tela de Chamada

**Data:** 12 / 02 / 2026  
**Status:** [✅] Concluído

**Resumo:**

- ✅ Refatorado `RegistroPresencaComponent` para integração completa com backend.
- ✅ Implementado `AttendanceService` com endpoints reais de registro em lote e consulta.
- ✅ Resolvido problema de dados mockados, agora carregando cursos, alunos e matrículas reais.
- ✅ Implementada lógica de salvamento em lote funcional.

---

#### 📅 DIA 14 - Relatórios

**Data:** 13 / 02 / 2026  
**Status:** [✅] Concluído

**Resumo:**

- ✅ Backend: Implementado `ReportService`, `ReportRepository` e Handlers.
- ✅ Backend: Endpoints para relatórios de frequência por aluno e por curso.
- ✅ Frontend: Criado `ReportService` e `ReportsListComponent`.
- ✅ Frontend: Implementado filtros por curso, aluno e período.
- ✅ Frontend: Exportação para PDF com `jspdf` e `jspdf-autotable`.

---

#### 📅 DIA 15 - Finalização MVP

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

---

## 🎯 MÉTRICAS DE PROGRESSO

### Commits por Semana

- **Semana 1:** \_\_\_ commits
- **Semana 2:** \_\_\_ commits
- **Semana 3:** \_\_\_ commits
- **TOTAL:** \_\_\_ commits

### Horas Efetivas

- **Semana 1:** \_\_\_ horas
- **Semana 2:** \_\_\_ horas
- **Semana 3:** \_\_\_ horas
- **TOTAL:** \_\_\_ horas

### Bloqueios Principais

```
1.

2.

3.
```

---

## 💡 APRENDIZADOS IMPORTANTES

### Técnicos

```
1.

2.

3.
```

### Pessoais (Gestão de TDAH/TEA)

```
1.

2.

3.
```

---

## 🎉 CELEBRAÇÕES

**Primeira semana completa:** **_/_**/2026  
**Segundo sprint completo:** **_/_**/2026  
**MVP FINALIZADO:** **_/_**/2026 🚀

---

## 🆘 TEMPLATE DE PEDIDO DE AJUDA (Copiar no Claude Chat)

```
# 🆘 PRECISO DE AJUDA

**Dia:**
**Tarefa:**
**Tempo travado:** ___ minutos

## O que estou tentando fazer:


## O que já tentei:
1.
2.
3.

## Mensagem de erro (se houver):


## Código relevante:


## O que preciso:
[ ] Explicação conceitual
[ ] Código de exemplo
[ ] Debugar comigo
[ ] Reorganizar a tarefa
```

---

**Lembre-se:**  
✅ Progresso > Perfeição  
✅ Pequenos passos diários > Grande salto único  
✅ Commit cedo, commit sempre  
✅ Pedir ajuda não é fraqueza, é estratégia

**Mantra do dia:**  
"Hoje vou fazer só o que está no plano. Ideias novas vão para o backlog."

🚀 **BORA PROGRAMAR!**
