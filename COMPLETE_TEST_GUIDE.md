# 🧪 GUIA DE TESTE COMPLETO - CECOR MVP

**Objetivo:** Validar todas as funcionalidades do sistema com cada perfil de usuário

---

## 📋 PRÉ-REQUISITOS

### Ambiente Preparado

```bash
# 1. Verificar serviços rodando
docker ps

# Deve mostrar:
# - cecor-postgres (porta 5433)
# - cecor-backend (porta 8081)
# - cecor-frontend (porta 4201)

# 2. Se não estiver rodando:
docker-compose up -d

# 3. Verificar logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Credenciais de Teste

| Perfil        | Usuário       | Senha      | Email             |
|---------------|---------------|------------|-------------------|
| Administrador | `admin.cecor` | `admin123` | admin@cecor.test  |
| Professor     | `prof.maria`  | `prof123`  | maria@cecor.test  |
| Aluno         | `aluno.pedro` | `aluno123` | pedro@cecor.test  |

---

## 👨‍💼 TESTE 1 - PERFIL ADMINISTRADOR

**Tempo estimado:** 30 minutos

### ✅ 1.1 - Login e Dashboard

- [ ] Acessar http://localhost:4201
- [ ] Fazer login com `admin.cecor` / `admin123`
- [ ] Verificar redirecionamento para dashboard
- [ ] Confirmar que o nome do usuário aparece no header
- [ ] Verificar menu lateral visível com todas as opções:
  - [ ] Dashboard / Início
  - [ ] Alunos
  - [ ] Professores
  - [ ] Cursos
  - [ ] Matrículas
  - [ ] Frequência (se visível para admin)
  - [ ] Relatórios

### ✅ 1.2 - CRUD de Alunos

#### Criar Novo Aluno

- [ ] Clicar em "Alunos" no menu
- [ ] Clicar no botão floating "+" (canto inferior direito)
- [ ] **Etapa 1 - Dados Pessoais:**
  - Nome: `João Silva Santos`
  - CPF: `98765432100`
  - Data de Nascimento: `2005-03-15`
  - Email: `joao.silva@teste.com`
  - Telefone: `(11) 98888-7777`
  - Endereço: `Rua das Palmeiras, 456 - São Paulo, SP`
- [ ] Clicar "Próximo"
- [ ] **Etapa 2 - Dados do Aluno:**
  - Número de Matrícula: `2024100`
  - Status: `Ativo`
  - Contato de Emergência: `Maria Silva - (11) 97777-6666`
  - Informações Médicas: `Nenhuma restrição`
  - Observações: `Teste completo de integração`
- [ ] Clicar "Próximo"
- [ ] **Etapa 3 - Responsáveis:**
  - Nome: `Maria Silva Santos`
  - CPF: `12312312300`
  - Telefone: `(11) 97777-6666`
  - Email: `maria.responsavel@teste.com`
  - Parentesco: `Mãe`
  - Permissões: Marcar "Autorizado a buscar"
- [ ] Clicar "Próximo"
- [ ] **Etapa 4 - Revisão:**
  - Verificar todos os dados
  - Clicar "Criar Aluno"
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que aluno aparece na lista

#### Visualizar Aluno

- [ ] Na lista de alunos, clicar no ícone 👁️ (olho) do João
- [ ] Verificar que todas as informações estão corretas
- [ ] Navegar pelas tabs (Dados Pessoais, Responsáveis, Documentos)

#### Editar Aluno

- [ ] Na lista, clicar no ícone ✏️ (lápis) do João
- [ ] Alterar telefone para: `(11) 96666-5555`
- [ ] Adicionar observação: `Telefone atualizado`
- [ ] Salvar
- [ ] Verificar atualização na lista

#### Filtrar Alunos

- [ ] Usar campo de busca: digitar "João"
- [ ] Verificar que apenas João aparece
- [ ] Limpar filtro
- [ ] Filtrar por status: "Ativo"
- [ ] Verificar que todos ativos aparecem

### ✅ 1.3 - CRUD de Professores

#### Criar Professor

- [ ] Clicar em "Professores" no menu
- [ ] Clicar no botão "+"
- [ ] Preencher:
  - Nome: `Carlos Alberto Souza`
  - Email: `carlos.souza@cecor.test`
  - CPF: `11122233344`
  - Telefone: `(11) 95555-4444`
- [ ] Clicar "Criar Professor"
- [ ] Verificar mensagem de sucesso
- [ ] **IMPORTANTE:** Verificar nos logs do backend:
  - [ ] Usuário criado no Keycloak
  - [ ] Role "professor" atribuída
  - [ ] Senha temporária `prof123` definida

#### Listar Professores

- [ ] Verificar que Carlos aparece na lista
- [ ] Verificar que prof.maria também está listada

### ✅ 1.4 - CRUD de Cursos

#### Criar Curso

- [ ] Clicar em "Cursos" no menu
- [ ] Clicar no botão "+"
- [ ] Preencher:
  - Nome: `Matemática Básica`
  - Descrição: `Curso de matemática para iniciantes`
  - Carga Horária: `60` horas
  - Professor Responsável: Selecionar `Carlos Alberto Souza`
- [ ] Clicar "Criar Curso"
- [ ] Verificar mensagem de sucesso
- [ ] Verificar que curso aparece na lista

#### Criar Segundo Curso

- [ ] Repetir processo:
  - Nome: `Português`
  - Descrição: `Gramática e redação`
  - Carga Horária: `80`
  - Professor: `prof.maria`
- [ ] Salvar e verificar

#### Editar Curso

- [ ] Editar "Matemática Básica"
- [ ] Alterar carga horária para `65`
- [ ] Salvar
- [ ] Verificar atualização

### ✅ 1.5 - Matrículas

#### Matricular Aluno em Curso

- [ ] Clicar em "Matrículas" no menu
- [ ] Clicar "Nova Matrícula"
- [ ] Selecionar:
  - Aluno: `João Silva Santos`
  - Curso: `Matemática Básica`
- [ ] Clicar "Matricular"
- [ ] Verificar mensagem de sucesso

#### Matricular em Segundo Curso

- [ ] Repetir:
  - Aluno: `João Silva Santos`
  - Curso: `Português`
- [ ] Matricular

#### Tentar Matrícula Duplicada

- [ ] Tentar matricular João em "Matemática Básica" novamente
- [ ] **DEVE MOSTRAR ERRO:** "Aluno já matriculado neste curso"

#### Visualizar Matrículas

- [ ] Filtrar matrículas por aluno: João
- [ ] Verificar que aparecem 2 matrículas (Matemática e Português)
- [ ] Filtrar por curso: Matemática Básica
- [ ] Verificar que aparece a matrícula do João

### ✅ 1.6 - Logout

- [ ] Clicar em "Sair" ou ícone de logout
- [ ] Verificar redirecionamento para tela de login
- [ ] Verificar que sessão foi encerrada (não pode acessar rotas protegidas)

---

## 👩‍🏫 TESTE 2 - PERFIL PROFESSOR

**Tempo estimado:** 20 minutos

### ✅ 2.1 - Login

- [ ] Fazer login com `prof.maria` / `prof123`
- [ ] Verificar que dashboard mostra informações do professor

### ✅ 2.2 - Visualização do Menu

**O professor NÃO deve ver:**
- [ ] ❌ Menu "Alunos" (ou deve estar desabilitado/oculto)
- [ ] ❌ Menu "Professores"
- [ ] ❌ Menu "Cursos" (criação/edição)
- [ ] ❌ Menu "Matrículas"

**O professor DEVE ver:**
- [ ] ✅ Dashboard / Minhas Turmas
- [ ] ✅ Frequência / Chamada
- [ ] ✅ Relatórios (apenas das suas turmas)

### ✅ 2.3 - Visualizar Turmas

- [ ] Acessar "Minhas Turmas" ou Dashboard
- [ ] Verificar que aparecem apenas os cursos onde é responsável:
  - [ ] "Português" deve aparecer (prof.maria é responsável)
  - [ ] "Matemática Básica" NÃO deve aparecer (Carlos é responsável)

### ✅ 2.4 - Registro de Frequência

#### Acessar Chamada

- [ ] Clicar em "Frequência" ou "Realizar Chamada"
- [ ] Selecionar curso: `Português`
- [ ] Verificar que data padrão é hoje
- [ ] Verificar lista de alunos matriculados:
  - [ ] João Silva Santos deve aparecer
  - [ ] Checkbox de presença marcado por padrão

#### Registrar Presença

- [ ] Manter João como "Presente" (checkbox marcado)
- [ ] Clicar "Salvar Presença"
- [ ] Verificar mensagem de sucesso

#### Registrar Falta

- [ ] Mudar data para amanhã (ou outro dia)
- [ ] Desmarcar checkbox de João (Falta)
- [ ] Adicionar observação: `Faltou sem justificativa`
- [ ] Salvar
- [ ] Verificar mensagem de sucesso

#### Tentar Editar Chamada Antiga

- [ ] Tentar editar chamada de mais de 24h atrás
- [ ] **DEVE BLOQUEAR ou AVISAR:** "Não é possível alterar após 24h"

### ✅ 2.5 - Visualizar Histórico de Frequência

- [ ] Acessar "Histórico" ou "Chamadas Anteriores"
- [ ] Verificar que aparecem as chamadas registradas
- [ ] Verificar percentual de frequência do João

### ✅ 2.6 - Relatórios (Apenas suas turmas)

- [ ] Acessar "Relatórios"
- [ ] Selecionar "Relatório por Curso"
- [ ] Selecionar: `Português`
- [ ] Verificar dados:
  - [ ] Total de aulas dadas
  - [ ] Taxa de presença geral
  - [ ] Lista de alunos com percentuais

#### Exportar PDF

- [ ] Clicar "Exportar PDF"
- [ ] Verificar que PDF é gerado
- [ ] Baixar e abrir PDF
- [ ] Verificar que contém:
  - [ ] Nome do curso
  - [ ] Período
  - [ ] Lista de alunos com frequências
  - [ ] Assinatura do professor (ou campo)

### ✅ 2.7 - Tentar Acessar Áreas Restritas

**Professor NÃO deve conseguir:**
- [ ] ❌ Criar/editar alunos
- [ ] ❌ Criar/editar outros cursos
- [ ] ❌ Ver frequência de cursos de outros professores
- [ ] ❌ Acessar configurações do sistema

### ✅ 2.8 - Logout

- [ ] Fazer logout
- [ ] Verificar sessão encerrada

---

## 🧑‍🎓 TESTE 3 - PERFIL ALUNO

**Tempo estimado:** 10 minutos

### ✅ 3.1 - Login

- [ ] Fazer login com `aluno.pedro` / `aluno123`
- [ ] Verificar dashboard do aluno

### ✅ 3.2 - Visualização do Menu

**O aluno NÃO deve ver:**
- [ ] ❌ Menu "Alunos"
- [ ] ❌ Menu "Professores"
- [ ] ❌ Menu "Cursos" (gestão)
- [ ] ❌ Menu "Matrículas"
- [ ] ❌ Menu "Frequência" (registro)

**O aluno DEVE ver:**
- [ ] ✅ Dashboard / Meus Cursos
- [ ] ✅ Minha Frequência

### ✅ 3.3 - Visualizar Meus Cursos

- [ ] Verificar que aparecem cards dos cursos matriculados
- [ ] Para cada curso, verificar:
  - [ ] Nome do curso
  - [ ] Professor responsável
  - [ ] Barra de progresso de frequência (ex: 85%)
  - [ ] Botão "Detalhes"

### ✅ 3.4 - Visualizar Minha Frequência

- [ ] Clicar em "Detalhes" de um curso
- [ ] Verificar lista de aulas:
  - [ ] Data da aula
  - [ ] Status: Presente ✅ ou Falta ❌
  - [ ] Observações (se houver)
- [ ] Verificar resumo:
  - [ ] Total de aulas
  - [ ] Presenças
  - [ ] Faltas
  - [ ] Percentual

### ✅ 3.5 - Tentar Acessar Áreas Restritas

**Aluno NÃO deve conseguir:**
- [ ] ❌ Ver dados de outros alunos
- [ ] ❌ Registrar frequência
- [ ] ❌ Editar cursos
- [ ] ❌ Criar matrículas

### ✅ 3.6 - Logout

- [ ] Fazer logout

---

## 🐛 REGISTRO DE BUGS ENCONTRADOS

Use esta seção para anotar problemas durante os testes:

### Bugs Críticos (Impedem uso)

1. **[Descrever bug]**
   - Perfil afetado:
   - Como reproduzir:
   - Erro exibido:

### Bugs Médios (Funciona mas tem problema)

1. **[Descrever bug]**
   - Perfil afetado:
   - Como reproduzir:
   - Comportamento esperado vs atual:

### Melhorias (Não são bugs)

1. **[Sugestão]**
   - Onde:
   - O que melhorar:

---

## ✅ CHECKLIST FINAL

Após completar todos os testes:

### Funcionalidades Testadas

- [ ] Login/Logout funciona para todos os perfis
- [ ] Permissões de cada perfil estão corretas
- [ ] CRUD de Alunos completo (Admin)
- [ ] CRUD de Professores completo (Admin)
- [ ] CRUD de Cursos completo (Admin)
- [ ] Sistema de Matrículas funciona
- [ ] Registro de Frequência funciona (Professor)
- [ ] Visualização de Frequência funciona (Aluno)
- [ ] Relatórios funcionam
- [ ] Exportação PDF funciona
- [ ] Validações estão ativas

### Navegação e UX

- [ ] Menu adapta conforme perfil
- [ ] Rotas protegidas por AuthGuard
- [ ] Mensagens de erro/sucesso aparecem
- [ ] Loading states funcionam
- [ ] Formulários validam campos
- [ ] Máscaras de CPF/telefone funcionam

### Integração

- [ ] Frontend se comunica com Backend
- [ ] Backend valida tokens do Keycloak
- [ ] PostgreSQL persiste dados
- [ ] Emails são enviados (ou logados)

---

## 🎯 RESULTADO ESPERADO

Após completar este guia:
- ✅ Todos os checkboxes marcados
- ✅ Bugs documentados (se houver)
- ✅ Sistema validado e pronto para uso
- ✅ Confiança para apresentar ao Lar do Alvorecer

**Se encontrou bugs:** Anote na seção de bugs e vamos corrigir juntos!
**Se tudo funcionou:** Parabéns! MVP COMPLETO! 🎉

---

## 📝 PRÓXIMOS PASSOS

1. Corrigir bugs encontrados
2. Melhorar navegação (se necessário)
3. Atualizar documentação
4. Preparar apresentação
5. **GIT COMMIT FINAL** 🚀
