# 📦 GIT COMMIT CONVENTIONS - CECOR

**Objetivo:** Manter histórico de commits organizado e legível

---

## 🎯 FORMATO PADRÃO

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional - detalhes do que mudou]

[rodapé opcional - issues relacionadas]
```

---

## 📝 TIPOS DE COMMIT

### ✅ PRINCIPAIS (Use sempre)

**feat:** Nova funcionalidade
```bash
git commit -m "feat(alunos): adiciona endpoint de listagem"
git commit -m "feat(auth): integra Keycloak no frontend"
```

**fix:** Correção de bug
```bash
git commit -m "fix(matricula): corrige validação de duplicidade"
git commit -m "fix(auth): resolve erro de token expirado"
```

**docs:** Apenas documentação
```bash
git commit -m "docs: atualiza README com instruções de setup"
git commit -m "docs(api): adiciona exemplos de requisição"
```

**refactor:** Refatoração (sem mudar comportamento)
```bash
git commit -m "refactor(aluno-service): simplifica lógica de validação"
```

**test:** Adiciona ou corrige testes
```bash
git commit -m "test(alunos): adiciona testes unitários do repository"
```

**chore:** Tarefas de manutenção
```bash
git commit -m "chore: remove dependências não utilizadas"
git commit -m "chore: atualiza docker-compose para MVP"
```

---

## 🔍 ESCOPOS (Opcional mas recomendado)

Use para indicar qual parte do sistema foi afetada:

- `auth` - Autenticação/Autorização
- `alunos` - Módulo de Alunos
- `cursos` - Módulo de Cursos
- `matriculas` - Matrícula
- `presencas` - Controle de Frequência
- `relatorios` - Relatórios
- `config` - Configuração
- `db` - Database/Migrations

---

## ✍️ DESCRIÇÃO

### ✅ FAÇA:
- Use imperativo: "adiciona", "corrige", "remove"
- Seja objetivo: máximo 50 caracteres
- Sem ponto final

### ❌ NÃO FAÇA:
- Passado: ~~"adicionou"~~
- Vago: ~~"fiz umas mudanças"~~
- Muito longo: ~~"implementa toda a lógica de validação..."~~

---

## 🎯 EXEMPLOS PRÁTICOS DO MVP

### Semana 1 - Fundação

```bash
# Dia 1
git commit -m "chore: remove MongoDB e Redis do docker-compose"
git commit -m "refactor(config): ajusta backend para usar apenas PostgreSQL"
git commit -m "docs: atualiza README com stack simplificada"

# Dia 2
git commit -m "docs(keycloak): adiciona guia de configuração de realm"

# Dia 3
git commit -m "feat(auth): adiciona middleware de validação JWT"
git commit -m "feat(auth): cria endpoint /api/v1/auth/verify"

# Dia 4
git commit -m "feat(auth): integra keycloak-angular no frontend"
git commit -m "feat(auth): implementa AuthGuard para rotas protegidas"
git commit -m "feat(layout): adiciona header com logout"

# Dia 5
git commit -m "test(auth): valida fluxo completo de login/logout"
git commit -m "docs: adiciona instruções de teste de integração"
```

### Semana 2 - CRUD

```bash
# Dia 6
git commit -m "feat(db): cria migration para tabela alunos"
git commit -m "feat(db): cria migration para tabela cursos"
git commit -m "feat(db): cria migration para tabela matriculas"

# Dia 7
git commit -m "feat(alunos): adiciona models e repository"
git commit -m "feat(alunos): implementa service com validações"
git commit -m "feat(alunos): adiciona endpoints CRUD"

# Dia 8
git commit -m "feat(alunos): cria módulo lazy-loaded"
git commit -m "feat(alunos): implementa listagem com Angular Material"
git commit -m "feat(alunos): adiciona formulário reativo"
git commit -m "feat(alunos): implementa service HTTP"

# Dia 9
git commit -m "feat(cursos): implementa CRUD completo no backend"
git commit -m "feat(cursos): adiciona frontend com listagem e formulário"

# Dia 10
git commit -m "feat(matriculas): adiciona lógica de matrícula"
git commit -m "feat(matriculas): valida duplicidade de matrícula"
git commit -m "feat(matriculas): implementa tela de matrícula"
```

### Semana 3 - Frequência

```bash
# Dia 11
git commit -m "feat(db): cria migration para tabela presencas"
git commit -m "feat(presencas): adiciona models e repository"

# Dia 12
git commit -m "feat(presencas): implementa endpoint de registro em lote"
git commit -m "feat(presencas): adiciona cálculo de percentual de frequência"
git commit -m "feat(presencas): valida permissão do professor"

# Dia 13
git commit -m "feat(presencas): cria componente de chamada"
git commit -m "feat(presencas): implementa checkboxes de presença/falta"
git commit -m "feat(presencas): exibe percentual de frequência"

# Dia 14
git commit -m "feat(relatorios): implementa endpoint de frequência por aluno"
git commit -m "feat(relatorios): adiciona filtros de período"
git commit -m "feat(relatorios): integra exportação em PDF"

# Dia 15
git commit -m "test: valida fluxo completo do MVP"
git commit -m "docs: atualiza README com instruções finais"
git commit -m "chore: prepara versão 1.0.0 do MVP"
```

---

## 🚨 QUANDO COMMITAR?

### ✅ COMMITE:
- Quando uma subtarefa está funcionando
- Antes de fazer uma mudança arriscada
- Ao final de cada hora de trabalho
- Quando vai fazer um break

### ⏸️ NÃO COMMITE:
- Código que não compila
- Testes que estão falhando
- Código pela metade (use git stash)

---

## 🌿 BRANCHES (Para depois do MVP)

Por enquanto, trabalhe direto na `main` (ou `master`).

Depois do MVP, se quiser organizar:
```bash
# Feature nova
git checkout -b feature/nome-da-feature

# Bugfix
git checkout -b fix/nome-do-bug

# Quando terminar
git checkout main
git merge feature/nome-da-feature
```

---

## 🔄 WORKFLOW DIÁRIO

### Antes de começar:
```bash
git pull origin main
```

### Durante o trabalho:
```bash
# A cada subtarefa completa
git add .
git commit -m "feat(escopo): descrição"
```

### Ao final do dia:
```bash
# Envia tudo para o GitHub
git push origin main
```

### Se esqueceu de commitar algo:
```bash
# Adiciona ao commit anterior
git add arquivo-esquecido.ts
git commit --amend --no-edit
git push --force  # Use com cuidado!
```

---

## 🎯 CHECKLIST PRÉ-COMMIT

Antes de cada commit, pergunte:
- [ ] O código compila/roda?
- [ ] Testei localmente?
- [ ] A mensagem está clara?
- [ ] Removi console.logs?
- [ ] Não estou commitando senhas/secrets?

---

## 🔐 ARQUIVOS QUE NUNCA DEVEM IR NO GIT

Já está no `.gitignore`, mas atenção:

```
# Variáveis de ambiente
.env
.env.local

# Dependências
node_modules/
vendor/

# Build
dist/
build/

# IDE
.vscode/
.idea/

# Sistema
.DS_Store
```

---

## 🆘 COMANDOS DE EMERGÊNCIA

### Desfazer último commit (mantém alterações):
```bash
git reset --soft HEAD~1
```

### Desfazer alterações não commitadas:
```bash
git checkout -- arquivo.ts
# ou tudo:
git reset --hard
```

### Ver histórico bonito:
```bash
git log --oneline --graph --all
```

### Salvar trabalho sem commitar:
```bash
git stash
# Depois recuperar:
git stash pop
```

---

## 📊 EXEMPLO DE HISTÓRICO BEM ORGANIZADO

```
* feat(relatorios): adiciona exportação em PDF
* feat(presencas): exibe percentual de frequência
* feat(presencas): implementa registro de chamada
* feat(cursos): adiciona CRUD completo
* feat(alunos): implementa formulário reativo
* feat(auth): integra Keycloak no frontend
* chore: remove dependências não utilizadas
* docs: atualiza README com stack do MVP
```

---

## 💡 DICA FINAL

**Commit pequeno e frequente > Commit grande e raro**

Um commit deve representar UMA mudança lógica. Se você escreveu "e" na mensagem, provavelmente deveria ser 2 commits:

❌ `"adiciona listagem de alunos e formulário de edição"`  
✅ `"feat(alunos): adiciona listagem de alunos"`  
✅ `"feat(alunos): implementa formulário de edição"`

---

**Lembre-se:** Git é seu amigo! Ele te salva quando você quebra algo. 🚀

**Comando mais importante:** `git commit -m "mensagem clara"`
