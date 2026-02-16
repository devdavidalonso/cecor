# 📋 CHECKLIST DE TESTE - CECOR MVP (Por Perfil de Usuário)

> **Objetivo:** Documentar todos os problemas e melhorias necessárias no sistema CECOR durante testes de usabilidade, testando CADA PERFIL DE USUÁRIO separadamente.
>
> **Data de Início:** 14/02/2026
>
> **Testador:** David Alonso
>
> **Ambiente:** Desenvolvimento Local

---

## 📊 RESUMO EXECUTIVO POR PERFIL

| Perfil           | Login Testado        | ✅ Funcionalidades OK | ⚠️ Problemas | 🐛 Bugs Críticos |
| ---------------- | -------------------- | --------------------- | ------------ | ---------------- |
| **👤 Admin**     | admin.cecor          | -                     | -            | -                |
| **👨‍🏫 Professor** | \***\*\_\_\_\_\*\*** | -                     | -            | -                |
| **🎓 Aluno**     | \***\*\_\_\_\_\*\*** | -                     | -            | -                |

---

## 🔐 CREDENCIAIS DE TESTE

### Usuários Disponíveis para Teste

**Administrador:**

```
Usuário: admin.cecor
Senha: admin123
Email: dev.david.garcia.alonso@gmail.com
```

**Professor:**

```
Usuário: _______________
Senha: _______________
Email: _______________
```

**Aluno:**

```
Usuário: _______________
Senha: _______________
Email: _______________
```

---

# 👤 PARTE 1: TESTE COM PERFIL ADMINISTRADOR

> **Login:** admin.cecor
>
> **Permissões Esperadas:** ACESSO TOTAL a todas as funcionalidades

---

## 🔐 1. AUTENTICAÇÃO - ADMIN

### Login

- [✅] Consegue fazer login com admin.cecor
- [✅] Token JWT é gerado corretamente
- [✅] Redirecionamento após login está correto
- [✅] Para onde redireciona? [\***\*\*\*\*\*\*\***\_\_\_\***\*\*\*\*\*\*\***](http://localhost:4201/dashboard?iss=https:%2F%2Flar-sso-keycloak.hrbsys.tech%2Frealms%2Fcecor)

### Dashboard Inicial

- [✅] Dashboard do Admin carrega
- [✅] Quais widgets/cards aparecem?

**Widgets visíveis:**

```
1. Alunos
2. Cursos
3. Professores
4. Matrículas
```

### Menu de Navegação

- [✅] Menu lateral/superior está visível
- [✅] Quais itens de menu aparecem?

**Itens de Menu Visíveis:**

```
[✅] Dashboard
[✅] Alunos (Students)
[✅] Cursos (Courses)
[✅] Matrículas (Enrollments)
[✅] Professores (Teachers/Volunteers)
[✅] Relatórios (Reports)
[ ] Configurações (Settings)
[✅] Outros: Admimistração
```

**✍️ Problemas - Autenticação Admin:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 👥 2. GESTÃO DE ALUNOS - ADMIN

### 2.1 Lista de Alunos

- [✅] Admin consegue ver a lista de alunos
- [✅] Quantos alunos aparecem? \***\*\10 de 25\_\*\***
- [✅] Paginação funciona? **SIM** / **NÃO**
- [❌] Filtros/busca disponíveis? **SIM** / **NÃO**

**Colunas visíveis na tabela:**

```
1. ____________________
2. ____________________
3. ____________________
4. ____________________
5. ____________________
```

**Ações disponíveis por aluno:**

```
[✅] Visualizar
[❌] Editar
[❌] Excluir
[❌] Outras: _______________
```

**✍️ Problemas:**

```
O layout não está responsivo, não consigo ver todas as colunas na tabela.
Para editar Não estão sendo carregados os dados do aluno.
Para excluir não retorna uma mensagem amigavel dizendo que teve sucesso e não recarrega a lista novamente. E indica que o aluno foi excluído mas ele continua aparecendo na lista.
_______________________________________________________________________________
```

---

### 2.2 Cadastro de Aluno - ADMIN

- [✅] Botão "Novo Aluno" está visível
- [✅] Consegue acessar o formulário
- [✅] Formulário carrega corretamente

**Campos que aparecem no formulário:**

**Dados Pessoais:**

```
[✅] Nome Completo
[✅ ] Data de Nascimento
[❌] Idade (calculada?)
[✅] CPF
[✅] Email
[✅] Telefone
[❌] Foto
```

**🚨 Campos que NÃO deveriam aparecer:**

```
[ ] ❌ Número de Matrícula (enrollment_number)
[ ] ❌ Status
```

**Endereço:**

```
[❌] CEP
[❌] Rua
[❌] Número
[❌] Complemento
[❌] Bairro
[❌] Cidade
[❌] Estado
```

**Responsáveis:**

```
[❌] Consegue adicionar responsável
[❌] Quantos permite? _________
[❌] Todos os campos necessários aparecem?
```

**Ações de Salvamento:**

- [❌] Botão "Salvar" funciona
- [❌] Validações funcionam
- [❌] Aluno é cadastrado com sucesso
- [❌] Mensagem de sucesso aparece
- [❌] Redirecionamento correto

**✍️ Problemas - Cadastro Admin:**

```
Para cadastro do mesmo existente não ha mensagens amigaveis informando que o mesmo ja existe.
Não há modelos tabela de endereços para colcoar na pagina mais de um endereço
Precimos elimar da base dados a coluna adress da tabele user e criar uma tabela de endereços separada.
Precisamos eleminar as colunas da tabela student chamada emergency_contact, emergency_contact_phone1 e emergency_contact_phone2, pois não serão utilizadas.
_______________________________________________________________________________

_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 2.3 Edição de Aluno - ADMIN

- [❌] Admin consegue editar qualquer aluno
- [❌] Formulário carrega com dados
- [❌] Alterações podem ser salvas
- [❌] Edição de responsáveis funciona

**✍️ Problemas - Edição Admin:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 2.4 Exclusão de Aluno - ADMIN

- [❌] Botão de exclusão está disponível
- [❌] Pede confirmação antes de excluir?
- [❌] Exclusão funciona (soft delete ou física?)
- [❌] Aluno some da lista após exclusão

**✍️ Problemas - Exclusão Admin:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 📚 3. GESTÃO DE CURSOS - ADMIN

### 3.1 Lista de Cursos

- [ ] Admin vê lista completa de cursos
- [ ] Paginação? **SIM** / **NÃO**
- [ ] Filtros? **SIM** / **NÃO**

**Informações exibidas por curso:**

```
1. ____________________
2. ____________________
3. ____________________
4. ____________________
```

**Ações disponíveis:**

```
[ ] Visualizar
[ ] Editar
[ ] Excluir
[ ] Outras: _______________
```

**✍️ Problemas:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 3.2 Cadastro de Curso - ADMIN

- [ ] Botão "Novo Curso" visível
- [ ] Formulário funciona
- [ ] Consegue adicionar múltiplos professores (até 5)
- [ ] Dias da semana selecionáveis
- [ ] Horários configuráveis
- [ ] Salvar funciona

**✍️ Problemas - Cadastro Curso:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 3.3 Edição/Exclusão de Curso - ADMIN

- [ ] Admin pode editar qualquer curso
- [ ] Admin pode excluir curso
- [ ] Alterações são salvas

**✍️ Problemas:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 🎓 4. GESTÃO DE MATRÍCULAS - ADMIN

### 4.1 Lista de Matrículas

- [ ] Admin vê todas as matrículas
- [ ] Filtros funcionam
- [ ] Informações relevantes aparecem

**Filtros disponíveis:**

```
[ ] Por Aluno
[ ] Por Curso
[ ] Por Status
[ ] Por Data
```

**✍️ Problemas:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 4.2 Nova Matrícula - ADMIN (⚠️ CRÍTICO)

**Seleção de Aluno:**

- [ ] Como seleciona o aluno?
- [ ] É fácil encontrar?
- [ ] Busca funciona?

**Método de seleção:**

```
( ) Dropdown com todos os alunos
( ) Busca/autocomplete
( ) Lista paginada
( ) Outro: _______________
```

**Seleção de Curso:**

- [ ] Como seleciona o curso?
- [ ] Mostra vagas disponíveis?
- [ ] Informações do curso aparecem?

**Campos da Matrícula:**

```
[ ] Data de matrícula
[ ] Data de início
[ ] Data de término
```

**🚨 Campos que NÃO devem aparecer:**

```
[ ] ❌ Número de Matrícula
[ ] ❌ Status
```

**Salvamento:**

- [ ] Consegue salvar
- [ ] Número de matrícula gerado automaticamente
- [ ] Status definido como 'ativa'
- [ ] Mensagem de sucesso

**✍️ PROBLEMAS CRÍTICOS - Matrícula Admin:**

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 4.3 Edição/Cancelamento de Matrícula - ADMIN

- [ ] Admin pode editar matrícula
- [ ] Admin pode cancelar matrícula
- [ ] Consegue trocar aluno de curso

**✍️ Problemas:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 👨‍🏫 5. GESTÃO DE PROFESSORES/VOLUNTÁRIOS - ADMIN

- [ ] Menu de professores existe?
- [ ] Admin vê lista de professores
- [ ] Admin pode cadastrar professor
- [ ] Admin pode editar professor
- [ ] Admin pode excluir/desativar professor

**✍️ Problemas - Professores:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 📊 6. RELATÓRIOS E DASHBOARDS - ADMIN

- [ ] Admin tem acesso a relatórios
- [ ] Quais relatórios estão disponíveis?

**Relatórios disponíveis:**

```
[ ] Alunos cadastrados
[ ] Matrículas ativas
[ ] Frequência geral
[ ] Outros: _______________
```

**✍️ Problemas - Relatórios:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## ⚙️ 7. CONFIGURAÇÕES E ADMINISTRAÇÃO - ADMIN

- [ ] Admin tem acesso a configurações
- [ ] Pode gerenciar usuários
- [ ] Pode alterar configurações do sistema
- [ ] Auditoria de logs disponível

**✍️ Problemas - Configurações:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 🔒 8. PERMISSÕES GERAIS - ADMIN

**Admin DEVE ter acesso a:**

```
[ ] Criar alunos
[ ] Editar qualquer aluno
[ ] Excluir alunos
[ ] Criar cursos
[ ] Editar qualquer curso
[ ] Excluir cursos
[ ] Criar matrículas
[ ] Editar qualquer matrícula
[ ] Cancelar matrículas
[ ] Ver todos os relatórios
[ ] Gerenciar professores
[ ] Gerenciar usuários
[ ] Acessar configurações
```

**Admin NÃO deve ter restrições em:**

```
_______________________________________________________________________________
```

**✍️ Problemas de Permissões - Admin:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

# 👨‍🏫 PARTE 2: TESTE COM PERFIL PROFESSOR

> **Login:** **\*\***\_\_\_**\*\***
>
> **Permissões Esperadas:** Acesso LIMITADO - apenas aos seus cursos e alunos

---

## 🔐 1. AUTENTICAÇÃO - PROFESSOR

### Login

- [ ] Consegue fazer login
- [ ] Token JWT funciona
- [ ] Redirecionamento correto

### Dashboard Inicial

- [ ] Dashboard do Professor carrega
- [ ] Quais informações aparecem?

**Widgets visíveis:**

```
1. ____________________
2. ____________________
3. ____________________
```

### Menu de Navegação - PROFESSOR

**Itens que DEVEM aparecer:**

```
[ ] Dashboard
[ ] Meus Cursos
[ ] Meus Alunos
[ ] Registro de Presença
[ ] Relatórios (limitados)
```

**Itens que NÃO devem aparecer:**

```
[ ] ❌ Configurações do Sistema
[ ] ❌ Gestão de Usuários
[ ] ❌ Todos os Cursos (apenas os dele)
[ ] ❌ Todos os Alunos (apenas os matriculados nos cursos dele)
```

**Menu atual do Professor:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

**✍️ Problemas - Autenticação Professor:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 📚 2. MEUS CURSOS - PROFESSOR

### 2.1 Lista de Cursos do Professor

- [ ] Professor vê APENAS seus cursos
- [ ] Lista está correta (só cursos onde ele leciona)
- [ ] Consegue ver detalhes dos seus cursos

**Cursos listados:**

```
Curso: ____________________  Está correto? ( ) Sim ( ) Não
Curso: ____________________  Está correto? ( ) Sim ( ) Não
Curso: ____________________  Está correto? ( ) Sim ( ) Não
```

**Ações disponíveis:**

```
[ ] Visualizar curso
[ ] Ver lista de alunos matriculados
[ ] Registrar presença
```

**Ações que NÃO deve ter:**

```
[ ] ❌ Editar curso
[ ] ❌ Excluir curso
[ ] ❌ Adicionar outros professores
```

**✍️ Problemas - Meus Cursos:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 👥 3. MEUS ALUNOS - PROFESSOR

### 3.1 Lista de Alunos do Professor

- [ ] Professor vê APENAS alunos matriculados nos seus cursos
- [ ] Lista está correta

**Alunos listados:**

```
Total de alunos: _________
Estão corretos (apenas dos meus cursos)? ( ) Sim ( ) Não
```

**Informações visíveis por aluno:**

```
[ ] Nome
[ ] CPF
[ ] Email
[ ] Telefone
[ ] Curso em que está matriculado
[ ] Frequência
```

**Ações disponíveis:**

```
[ ] Visualizar detalhes
[ ] Ver frequência
[ ] Adicionar observações
```

**Ações que NÃO deve ter:**

```
[ ] ❌ Editar dados pessoais do aluno
[ ] ❌ Excluir aluno
[ ] ❌ Cancelar matrícula
```

**✍️ Problemas - Meus Alunos:**

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 3.2 Visualização de Detalhes do Aluno - PROFESSOR

- [ ] Professor consegue ver detalhes dos alunos
- [ ] Quais informações aparecem?

**Informações visíveis:**

```
[ ] Nome completo
[ ] Data de nascimento
[ ] Idade
[ ] CPF
[ ] Email
[ ] Telefone
[ ] Endereço
[ ] Responsáveis
[ ] Histórico de frequência
```

**Informações que NÃO deve ver:**

```
[ ] ❌ Dados sensíveis de outros cursos?
[ ] ❌ Informações financeiras?
```

**Professor pode editar:**

```
[ ] Observações sobre o aluno
[ ] Notas de acompanhamento
```

**Professor NÃO pode editar:**

```
[ ] ❌ Dados pessoais (nome, CPF, etc.)
[ ] ❌ Dados de responsáveis
[ ] ❌ Status de matrícula
```

**✍️ Problemas - Detalhes Aluno:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## ✅ 4. REGISTRO DE PRESENÇA - PROFESSOR

### 4.1 Acesso ao Registro de Presença

- [ ] Professor tem menu/botão para registrar presença
- [ ] Consegue acessar a funcionalidade
- [ ] Interface é clara e fácil de usar

### 4.2 Seleção de Curso e Data

**Seleção de Curso:**

- [ ] Professor seleciona APENAS entre seus cursos
- [ ] Cursos de outros professores NÃO aparecem

**Seleção de Data:**

- [ ] Consegue selecionar data da aula
- [ ] Data padrão é hoje?
- [ ] Consegue selecionar datas passadas?

**✍️ Problemas - Seleção:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 4.3 Lista de Alunos para Chamada

- [ ] Lista mostra APENAS alunos matriculados no curso selecionado
- [ ] Lista está completa e correta

**Informações visíveis por aluno na chamada:**

```
[ ] Nome
[ ] Idade
[ ] Data de nascimento
[ ] Foto (se houver)
[ ] Data de matrícula
[ ] Número de faltas anteriores
```

**Interface de marcação:**

```
( ) Checkbox simples (Presente/Ausente)
( ) Botões (Presente/Ausente/Justificado)
( ) Outro: _______________
```

**Funcionalidades:**

- [ ] Marcar presença
- [ ] Marcar ausência
- [ ] Marcar ausência justificada
- [ ] Adicionar observação da aula

**✍️ Problemas - Lista de Chamada:**

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 4.4 Salvamento de Presença

- [ ] Consegue salvar a chamada
- [ ] Validação funciona (não permite salvar incompleta?)
- [ ] Mensagem de sucesso aparece
- [ ] Presença é registrada no sistema

**Comportamento após salvar:**

```
( ) Retorna para lista de cursos
( ) Permanece na tela de presença
( ) Outro: _______________
```

**✍️ Problemas - Salvamento Presença:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 4.5 Edição de Presença

- [ ] Professor pode editar presença já registrada
- [ ] Consegue acessar presença de datas anteriores
- [ ] Alterações são salvas

**✍️ Problemas - Edição Presença:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 📊 5. RELATÓRIOS - PROFESSOR

### 5.1 Relatórios Disponíveis

**Relatórios que o Professor DEVE ter acesso:**

```
[ ] Frequência dos alunos dos seus cursos
[ ] Lista de alunos por curso
[ ] Relatório de faltas
[ ] Alunos em risco de suspensão
```

**Relatórios que NÃO deve ter acesso:**

```
[ ] ❌ Relatórios gerais de toda a instituição
[ ] ❌ Dados financeiros
[ ] ❌ Relatórios de outros professores
```

**Relatórios atualmente disponíveis:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

**✍️ Problemas - Relatórios Professor:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 🔒 6. RESTRIÇÕES E PERMISSÕES - PROFESSOR

### O que Professor DEVE poder fazer:

```
[ ] Ver APENAS seus cursos
[ ] Ver APENAS alunos dos seus cursos
[ ] Registrar presença nos seus cursos
[ ] Adicionar observações sobre alunos
[ ] Ver relatórios limitados aos seus cursos
[ ] Ver detalhes dos alunos matriculados nos seus cursos
```

### O que Professor NÃO deve poder fazer:

```
[ ] ❌ Ver/editar cursos de outros professores
[ ] ❌ Ver alunos de outros cursos
[ ] ❌ Cadastrar novos alunos
[ ] ❌ Editar dados pessoais de alunos
[ ] ❌ Criar/editar/excluir cursos
[ ] ❌ Matricular/desmatricular alunos
[ ] ❌ Acessar configurações do sistema
[ ] ❌ Gerenciar usuários
[ ] ❌ Ver relatórios gerais da instituição
```

**Teste de Violação de Permissões:**

Tente fazer ações que o professor NÃO deveria conseguir:

```
Tentativa 1: Acessar curso de outro professor
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌

Tentativa 2: Editar dados de aluno
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌

Tentativa 3: Cadastrar novo aluno
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌

Tentativa 4: Criar nova matrícula
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌

Tentativa 5: Acessar configurações
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌
```

**✍️ Problemas de Permissões - Professor:**

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

---

# 🎓 PARTE 3: TESTE COM PERFIL ALUNO

> **Login:** **\*\***\_\_\_**\*\***
>
> **Permissões Esperadas:** Acesso MUITO LIMITADO - apenas dados próprios

---

## 🔐 1. AUTENTICAÇÃO - ALUNO

### Login

- [ ] Aluno consegue fazer login
- [ ] Token JWT funciona
- [ ] Redirecionamento correto

### Dashboard Inicial

- [ ] Dashboard do Aluno carrega
- [ ] Informações personalizadas aparecem

**Widgets visíveis:**

```
1. ____________________
2. ____________________
3. ____________________
```

### Menu de Navegação - ALUNO

**Itens que DEVEM aparecer:**

```
[ ] Dashboard / Início
[ ] Meu Perfil
[ ] Meus Cursos
[ ] Minha Frequência
[ ] Meus Certificados (se houver)
```

**Itens que NÃO devem aparecer:**

```
[ ] ❌ Gestão de Alunos
[ ] ❌ Gestão de Cursos
[ ] ❌ Gestão de Matrículas
[ ] ❌ Cadastro de qualquer coisa
[ ] ❌ Relatórios gerais
[ ] ❌ Configurações
```

**Menu atual do Aluno:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

**✍️ Problemas - Autenticação Aluno:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 👤 2. MEU PERFIL - ALUNO

### 2.1 Visualização de Dados Pessoais

- [ ] Aluno vê seus dados pessoais
- [ ] Informações estão corretas

**Dados visíveis:**

```
[ ] Nome
[ ] Data de nascimento
[ ] Idade
[ ] CPF
[ ] Email
[ ] Telefone
[ ] Endereço
[ ] Foto (se houver)
```

**Dados de responsáveis:**

- [ ] Aluno vê dados dos responsáveis?
- [ ] Quais informações aparecem?

**✍️ Problemas - Meu Perfil:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 2.2 Edição de Dados - ALUNO

**O que o aluno PODE editar:**

```
[ ] Email (se permitido)
[ ] Telefone (se permitido)
[ ] Foto
[ ] Senha
```

**O que o aluno NÃO deve poder editar:**

```
[ ] ❌ Nome
[ ] ❌ CPF
[ ] ❌ Data de nascimento
[ ] ❌ Dados de responsáveis
[ ] ❌ Status de matrícula
```

**Teste de edição:**

- [ ] Consegue alterar email?
- [ ] Consegue alterar telefone?
- [ ] Consegue alterar foto?
- [ ] Consegue alterar senha?
- [ ] Alterações são salvas?

**✍️ Problemas - Edição Perfil:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 📚 3. MEUS CURSOS - ALUNO

### 3.1 Lista de Cursos do Aluno

- [ ] Aluno vê APENAS cursos em que está matriculado
- [ ] Lista está correta

**Cursos listados:**

```
Curso 1: ____________________
Curso 2: ____________________
Curso 3: ____________________
```

**Informações por curso:**

```
[ ] Nome do curso
[ ] Professor(es)
[ ] Dias da semana
[ ] Horários
[ ] Data de início da matrícula
[ ] Status da matrícula
```

**✍️ Problemas - Meus Cursos:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 3.2 Detalhes do Curso - ALUNO

- [ ] Aluno consegue ver detalhes do curso
- [ ] Informações são relevantes

**Informações visíveis:**

```
[ ] Descrição do curso
[ ] Carga horária
[ ] Professor(es)
[ ] Calendário de aulas
[ ] Materiais do curso (se houver)
```

**O aluno NÃO deve poder:**

```
[ ] ❌ Editar informações do curso
[ ] ❌ Cancelar matrícula sozinho
[ ] ❌ Ver cursos em que não está matriculado
```

**✍️ Problemas - Detalhes Curso:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## ✅ 4. MINHA FREQUÊNCIA - ALUNO

### 4.1 Visualização de Frequência

- [ ] Aluno vê sua frequência
- [ ] Informações estão atualizadas
- [ ] Pode filtrar por curso?
- [ ] Pode filtrar por período?

**Informações visíveis:**

```
[ ] Total de aulas (por curso ou geral)
[ ] Presenças
[ ] Ausências
[ ] Ausências justificadas
[ ] Percentual de frequência
```

**Formato de visualização:**

```
( ) Tabela com datas
( ) Calendário visual
( ) Gráfico de barras/pizza
( ) Lista simples
( ) Outro: _______________
```

**✍️ Problemas - Frequência:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

### 4.2 Detalhes de Ausências

- [ ] Aluno vê quais aulas faltou
- [ ] Datas das ausências aparecem
- [ ] Consegue ver se há justificativa

**Funcionalidades:**

- [ ] Justificar ausência (enviar justificativa)?
- [ ] Fazer upload de atestado?
- [ ] Ver alertas de risco de suspensão?

**✍️ Problemas - Ausências:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 🏆 5. MEUS CERTIFICADOS - ALUNO

- [ ] Menu/seção de certificados existe
- [ ] Aluno vê certificados obtidos
- [ ] Consegue fazer download?

**Certificados disponíveis:**

```
Certificado 1: ____________________ (Curso: ______________)
Certificado 2: ____________________ (Curso: ______________)
```

**Funcionalidades:**

```
[ ] Visualizar certificado
[ ] Baixar certificado em PDF
[ ] Compartilhar certificado
[ ] Verificar autenticidade (QR Code?)
```

**✍️ Problemas - Certificados:**

```
_______________________________________________________________________________
_______________________________________________________________________________
```

---

## 🔒 6. RESTRIÇÕES E PERMISSÕES - ALUNO

### O que Aluno DEVE poder fazer:

```
[ ] Ver seus próprios dados
[ ] Editar email/telefone/foto (se permitido)
[ ] Ver cursos em que está matriculado
[ ] Ver sua frequência
[ ] Ver certificados obtidos
[ ] Justificar ausências (se implementado)
```

### O que Aluno NÃO deve poder fazer:

```
[ ] ❌ Ver dados de outros alunos
[ ] ❌ Ver cursos em que NÃO está matriculado
[ ] ❌ Alterar dados pessoais críticos (nome, CPF, data nascimento)
[ ] ❌ Matricular-se sozinho em cursos
[ ] ❌ Cancelar matrícula
[ ] ❌ Registrar presença
[ ] ❌ Ver relatórios gerais
[ ] ❌ Acessar qualquer funcionalidade administrativa
```

**Teste de Violação de Permissões:**

```
Tentativa 1: Acessar lista de outros alunos
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌

Tentativa 2: Acessar cursos de outros alunos
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌

Tentativa 3: Editar CPF
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌

Tentativa 4: Se matricular em novo curso
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌

Tentativa 5: Alterar própria frequência
Resultado: ( ) Bloqueado ✅  ( ) Permitido ❌
```

**✍️ Problemas de Permissões - Aluno:**

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

---

# 🔄 PARTE 4: COMPARAÇÃO ENTRE PERFIS

## Tabela Comparativa de Permissões

| Funcionalidade           | Admin      | Professor               | Aluno                            |
| ------------------------ | ---------- | ----------------------- | -------------------------------- |
| **Ver todos os alunos**  | ✅         | ❌ (só dos cursos dele) | ❌                               |
| **Cadastrar alunos**     | ✅         | ❌                      | ❌                               |
| **Editar alunos**        | ✅         | ❌                      | ❌ (só dados próprios limitados) |
| **Excluir alunos**       | ✅         | ❌                      | ❌                               |
| **Ver todos os cursos**  | ✅         | ❌ (só os dele)         | ❌ (só matriculado)              |
| **Criar cursos**         | ✅         | ❌                      | ❌                               |
| **Editar cursos**        | ✅         | ❌                      | ❌                               |
| **Excluir cursos**       | ✅         | ❌                      | ❌                               |
| **Ver todas matrículas** | ✅         | ❌ (só dos cursos dele) | ❌ (só próprias)                 |
| **Criar matrículas**     | ✅         | ❌                      | ❌                               |
| **Cancelar matrículas**  | ✅         | ❌                      | ❌                               |
| **Registrar presença**   | ✅         | ✅ (nos cursos dele)    | ❌                               |
| **Ver frequência**       | ✅ (todos) | ✅ (dos cursos dele)    | ✅ (só própria)                  |
| **Relatórios gerais**    | ✅         | ❌                      | ❌                               |
| **Configurações**        | ✅         | ❌                      | ❌                               |

**Divergências encontradas:**

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

---

# 🐛 BUGS CRÍTICOS POR PERFIL

## Bugs Encontrados - ADMIN

### BUG ADMIN #1

**Título:** **\*\***\*\***\*\***\*\*\*\***\*\***\*\***\*\***\_**\*\***\*\***\*\***\*\*\*\***\*\***\*\***\*\***
**Severidade:** ( ) Crítico ( ) Alto ( ) Médio ( ) Baixo
**Descrição:**

```
_______________________________________________________________________________
```

**Como Reproduzir:**

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
```

---

## Bugs Encontrados - PROFESSOR

### BUG PROFESSOR #1

**Título:** **\*\***\*\***\*\***\*\*\*\***\*\***\*\***\*\***\_**\*\***\*\***\*\***\*\*\*\***\*\***\*\***\*\***
**Severidade:** ( ) Crítico ( ) Alto ( ) Médio ( ) Baixo
**Descrição:**

```
_______________________________________________________________________________
```

**Como Reproduzir:**

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
```

---

## Bugs Encontrados - ALUNO

### BUG ALUNO #1

**Título:** **\*\***\*\***\*\***\*\*\*\***\*\***\*\***\*\***\_**\*\***\*\***\*\***\*\*\*\***\*\***\*\***\*\***
**Severidade:** ( ) Crítico ( ) Alto ( ) Médio ( ) Baixo
**Descrição:**

```
_______________________________________________________________________________
```

**Como Reproduzir:**

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
```

---

# ⚠️ PROBLEMAS DE SEGURANÇA E PERMISSÕES

## Violações de Segurança Encontradas

### CRÍTICO: Acessos indevidos

```
Professor conseguiu acessar: _______________________________________________
Aluno conseguiu acessar: ___________________________________________________
Admin foi bloqueado de: ____________________________________________________
```

### Falhas de Autorização

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

---

# 📊 CONCLUSÕES FINAIS

## Resumo por Perfil

### ✅ ADMIN - O que está funcionando:

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

### ⚠️ ADMIN - Problemas encontrados:

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

---

### ✅ PROFESSOR - O que está funcionando:

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

### ⚠️ PROFESSOR - Problemas encontrados:

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

---

### ✅ ALUNO - O que está funcionando:

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

### ⚠️ ALUNO - Problemas encontrados:

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

---

## Prioridades de Correção

### 🔴 URGENTE (Impede uso básico)

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

### 🟡 IMPORTANTE (Prejudica experiência)

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

### 🟢 MELHORIAS (Pode esperar)

```
1. _____________________________________________________________________________
2. _____________________________________________________________________________
3. _____________________________________________________________________________
```

---

**📅 Data de Conclusão:** **_/_**/**\_\_**

**🎯 Próxima Ação:** \***\*\*\*\*\*\*\***\*\*\*\*\***\*\*\*\*\*\*\***\_\_\_\_\***\*\*\*\*\*\*\***\*\*\*\*\***\*\*\*\*\*\*\***

---

> **Checklist completo por:** David Alonso
>
> **Versão:** 2.0 - Teste por Perfil de Usuário
