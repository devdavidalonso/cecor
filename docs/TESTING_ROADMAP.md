# 🧪 Roteiro de Testes Manuais - CECOR

**Versão:** 1.0  
**Data:** 21/02/2026  
**Objetivo:** Validar funcionalidades e UI/UX do sistema

## Atualizacao de progresso - 22/02/2026

Concluido nesta rodada:
1. Preflight API aprovado (`quick_api_test.sh`).
2. Smoke RBAC aprovado (`smoke_rbac_keycloak.sh`).
3. Validacao manual de perfis:
   - `admin` com acesso a listas de alunos e professores.
   - `professor` sem acesso administrativo indevido.
   - `aluno` com portal proprio.
4. Correcao de erros que bloqueavam teste:
   - Proxy frontend para backend local.
   - Schema legado (`students.special_needs`).
   - Navegacao/guards por papel.
   - Asset `icon-144x144.png`.

Proximo ciclo recomendado:
1. Expandir massa de dados de seed (matriculas, cursos, presencas).
2. Rodar regressao manual com checklist completo por perfil.
3. Converter os cenarios mais criticos em testes automatizados de regressao.

---

## 📊 RESUMO DOS TESTES

| Módulo | Testes | Prioridade | Tempo Est. |
|--------|--------|------------|------------|
| Portal do Aluno | 15 | 🔴 Alta | 45 min |
| Turmas (CourseClass) | 10 | 🔴 Alta | 30 min |
| Skills/Substituição | 8 | 🟡 Média | 25 min |
| Notificações | 6 | 🟡 Média | 20 min |
| UX/UI | 8 | 🟢 Baixa | 20 min |
| **TOTAL** | **47** | | **~2h 20min** |

---

## 🎓 PARTE 1: PORTAL DO ALUNO (Fase 1)

### Teste 1.1: Acesso ao Portal do Aluno
**Cenário:** Login como aluno e acesso ao dashboard

```
PASSOS:
1. Acesse: http://localhost:4200/login
2. Faça login com credenciais de ALUNO
3. Verifique se foi redirecionado para /student/dashboard

✅ ESPERADO:
- Dashboard carrega sem erros
- Mensagem "Olá, [Nome]!" aparece no topo
- Data atual exibida corretamente

❌ ERRO COMUM:
- Redirecionamento para /teacher/dashboard (guard falhando)
- Tela em branco (erro de API)
```

---

### Teste 1.2: Visualização de Cursos no Dashboard
**Cenário:** Aluno matriculado em múltiplos cursos

```
PRÉ-CONDIÇÃO: Aluno matriculado em pelo menos 2 cursos

PASSOS:
1. No dashboard, localize a seção "📚 Meus Cursos"
2. Verifique se todos os cursos aparecem como cards
3. Observe a barra de frequência em cada card

✅ ESPERADO:
- Cards com: Nome do curso, Turma, % frequência
- Barra de progresso colorida (verde ≥75%, laranja <75%)
- Texto "X de Y aulas"

🎨 CHECKLIST VISUAL:
[ ] Cards têm sombra suave
[ ] Hover no card eleva levemente
[ ] Cores de frequência intuitivas
[ ] Layout responsivo (teste redimensionar tela)
```

---

### Teste 1.3: Frequência Baixa (Alerta)
**Cenário:** Aluno com frequência < 75%

```
PRÉ-CONDIÇÃO: Aluno com frequência abaixo de 75% em algum curso

PASSOS:
1. Observe o topo do dashboard
2. Localize o banner de alerta

✅ ESPERADO:
- Banner vermelho/laranja destacado
- Ícone de aviso (⚠️)
- Texto: "Frequência Baixa"
- Botão "Ver Detalhes" funcional

🎨 CHECKLIST VISUAL:
[ ] Banner chama atenção mas não é agressivo
[ ] Contraste adequado para leitura
[ ] Ícone alinhado com texto
```

---

### Teste 1.4: Aulas de Hoje
**Cenário:** Verificar aulas do dia atual

```
PRÉ-CONDIÇÃO: Existem aulas agendadas para hoje no banco

PASSOS:
1. Na seção "📅 Aulas de Hoje"
2. Verifique se as aulas aparecem
3. Observe: Horário, Local, Professor

✅ ESPERADO:
- Lista de aulas ou mensagem "Não há aulas agendadas"
- Status "Aguardando Chamada" ou "Presença Registrada"

🎨 CHECKLIST VISUAL:
[ ] Cards de aula bem estruturados
[ ] Ícones de relógio/local alinhados
[ ] Status visualmente diferenciado
```

---

### Teste 1.5: Detalhe de Frequência
**Cenário:** Ver histórico completo de presenças

```
PASSOS:
1. No dashboard, clique em um card de curso
2. Ou vá direto para: /student/courses/:id/attendance

✅ ESPERADO:
- Tabela com: Data, Status (Presente/Ausente/Justificado), Tema
- Resumo no topo: Total de aulas, % frequência
- Contadores: Presenças, Faltas, Justificadas

🎨 CHECKLIST VISUAL:
[ ] Chips de status com cores diferentes
[ ] Tabela legível (zebrada ou linhas claras)
[ ] Resumo em cards destacados no topo
```

---

### Teste 1.6: Estado de Loading (Skeleton)
**Cenário:** Verificar loading states

```
PASSOS:
1. Acesse o dashboard
2. Observe o estado inicial enquanto carrega
3. Alterne entre páginas rapidamente

✅ ESPERADO:
- Skeleton loading aparece imediatamente
- Animação suave (shimmer effect)
- Layout similar ao conteúdo real
- Sem "flash" de conteúdo vazio

🎨 CHECKLIST VISUAL:
[ ] Skeleton tem animação suave
[ ] Cores cinza claras (#f0f0f0)
[ ] Formato similar ao conteúdo real
[ ] Transição suave para conteúdo carregado
```

---

### Teste 1.7: Minhas Ocorrências
**Cenário:** Visualizar ocorrências do aluno

```
PASSOS:
1. Acesse: /student/incidents
2. Verifique lista de ocorrências (se houver)

✅ ESPERADO:
- Lista de ocorrências com tipo, data, status
- Mensagem amigável se vazio: "Nenhuma ocorrência"

✅ CHECK SEGURANÇA:
- Aluno NÃO pode criar/editar ocorrências
- Apenas visualização (read-only)
```

---

### Teste 1.8: Editar Perfil
**Cenário:** Atualizar dados de contato

```
PASSOS:
1. Acesse: /student/profile
2. Altere o telefone
3. Clique "Salvar Alterações"

✅ ESPERADO:
- Toast "Perfil atualizado com sucesso!" (verde)
- Dados persistem após refresh
- Campos de nome/CPF estão desabilitados (não editáveis)

✅ CHECK SEGURANÇA:
- Aluno só edita próprios dados
- Campos sensíveis bloqueados
```

---

### Teste 1.9: Responsividade Mobile
**Cenário:** Testar em tela pequena

```
PASSOS:
1. Abra DevTools (F12)
2. Ative modo mobile (iPhone SE ou similar)
3. Navegue por todas as telas

✅ ESPERADO:
- Layout adapta para coluna única
- Cards empilham verticalmente
- Texto legível (tamanho mínimo 14px)
- Botões grandes o suficiente para toque

🎨 CHECKLIST RESPONSIVO:
[ ] Menu hamburger (se houver) funciona
[ ] Scroll suave
[ ] Sem overflow horizontal
[ ] Botões acessíveis para dedo (min 44px)
```

---

## 🏫 PARTE 2: TURMAS (Fase 2 - Gaps)

### Teste 2.1: Criar Turma A/B
**Cenário:** Criar múltiplas turmas para mesmo curso

```
PRÉ-CONDIÇÃO: Curso existente (ex: Inglês Básico)

PASSOS (via API ou interface admin):
1. POST /api/v1/course-classes
   {
     "courseId": 1,
     "code": "2026A",
     "name": "Inglês Básico - Turma A",
     "weekDays": "1,3,5",
     "startTime": "09:00",
     "endTime": "11:00"
   }

2. Crie segunda turma:
   {
     "courseId": 1,
     "code": "2026B",
     "name": "Inglês Básico - Turma B",
     "weekDays": "2,4",
     "startTime": "19:00",
     "endTime": "21:00"
   }

✅ ESPERADO:
- Ambas as turmas criadas com sucesso
- Código único por curso (não pode duplicar "2026A")
```

---

### Teste 2.2: Matrícula em Turma Específica
**Cenário:** Aluno se matricula na Turma B

```
PASSOS:
1. Matricule aluno especificando courseClassId
2. Verifique se matrícula aparece na turma correta

✅ ESPERADO:
- Aluno aparece na lista de alunos da Turma B
- Aluno NÃO aparece na Turma A
- Frequência calculada apenas para aulas da Turma B
```

---

### Teste 2.3: Listar Turmas com Filtros
**Cenário:** Buscar turmas de um curso específico

```
PASSOS:
1. GET /api/v1/course-classes?courseId=1

✅ ESPERADO:
- Lista apenas turmas do curso 1
- Dados completos: professor padrão, sala, horário
```

---

## 👨‍🏫 PARTE 3: SKILLS E SUBSTITUIÇÃO

### Teste 3.1: Cadastrar Skills do Professor
**Cenário:** Professor com múltiplas skills

```
PASSOS:
1. POST /api/v1/skills (criar skills)
   - "Inglês" (Idiomas)
   - "Espanhol" (Idiomas)
   - "Excel" (Tecnologia)

2. POST /api/v1/teachers/1/skills
   {
     "skillId": 1,
     "level": "advanced",
     "notes": "10 anos de experiência"
   }

✅ ESPERADO:
- Skills associadas ao professor
- Nível (beginner/intermediate/advanced/expert)
```

---

### Teste 3.2: Buscar Substitutos
**Cenário:** Professor falta, sistema sugere substitutos

```
PRÉ-CONDIÇÃO:
- Curso "Inglês Básico" com professor Ana
- Professor Carlos com skill "Inglês"
- Professor Maria com skill "Espanhol"

PASSOS:
1. GET /api/v1/course-classes/1/substitutes

✅ ESPERADO:
- Carlos aparece com score alto (mesma skill)
- Maria aparece com score médio (skill similar)
- Professores sem skill aparecem com score baixo
- Professor original (Ana) não aparece na lista

🎯 CHECK LÓGICA:
[ ] Score calculado corretamente
[ ] Skills ponderam no resultado
[ ] Disponibilidade verificada
```

---

## 🔔 PARTE 4: NOTIFICAÇÕES (Fase 3)

### Teste 4.1: Toast Notifications
**Cenário:** Feedback visual para ações

```
PASSOS:
1. Em qualquer tela, execute uma ação que dispare toast:
   - Salvar formulário → Toast verde
   - Erro de validação → Toast vermelho
   - Aviso → Toast laranja

✅ ESPERADO:
- Toast aparece no canto superior direito
- Animação suave de entrada/saída
- Fecha automaticamente após 3-5s
- Botão "Fechar" funciona

🎨 CHECKLIST VISUAL:
[ ] Cores consistentes (verde=success, vermelho=error)
[ ] Texto legível (contraste adequado)
[ ] Ícone implícito na cor
[ ] Não bloqueia interação com página
```

---

### Teste 4.2: Notificação In-APP Persistente
**Cenário:** Alerta que fica até ser visto

```
PASSOS (simulação):
1. No dashboard, verifique se há alertas no topo
2. Clique "Ver Detalhes"
3. Volte ao dashboard

✅ ESPERADO:
- Alerta persiste até ser resolvido/descartado
- Badge/contador de notificações
```

---

## 🎨 PARTE 5: CHECKLIST VISUAL GERAL

### Design System
```
[ ] Paleta de cores consistente (primary: #006aac)
[ ] Tipografia legível (Roboto/Material)
[ ] Espaçamento consistente (8px grid)
[ ] Bordas arredondadas padronizadas
[ ] Sombras sutis em cards
```

### Interatividade
```
[ ] Hover effects em botões
[ ] Hover effects em cards
[ ] Loading states em todos os botões de ação
[ ] Disabled states visíveis
[ ] Focus states para acessibilidade
```

### Performance Visual
```
[ ] Transições suaves (300ms ease)
[ ] Sem "flash" de conteúdo
[ ] Imagens lazy loaded (se houver)
[ ] Scroll suave
```

---

## 🐛 REGISTRO DE BUGS

Use este formato para registrar problemas:

```markdown
### Bug #001: [Título curto]
**Módulo:** Portal do Aluno / Dashboard  
**Severidade:** 🔴 Alta / 🟡 Média / 🟢 Baixa

**Passos para Reproduzir:**
1. Acesse...
2. Clique em...
3. Observe...

**Comportamento Atual:**
[Descreva o erro]

**Comportamento Esperado:**
[Descreva o correto]

**Evidência:**
[Screenshot ou descrição detalhada]

**Ambiente:**
- Navegador: Chrome 120
- Tela: 1920x1080
- Usuário: Aluno Teste
```

---

## ✅ CHECKLIST FINAL

Antes de liberar para produção:

```
□ Todos os testes de Portal do Aluno passaram
□ Migração de dados executada sem erros
□ Telas responsivas testadas (mobile, tablet, desktop)
□ Notificações aparecem corretamente
□ Sem erros no console do navegador
□ Tempo de carregamento < 3s
□ Build de produção gera sem erros
```

---

## 🚀 PRÓXIMOS PASSOS APÓS TESTES

1. **Corrigir bugs encontrados**
2. **Ajustes visuais finos**
3. **Teste de carga (vários usuários simultâneos)**
4. **Deploy para staging**
5. **Teste com usuários reais (beta)**
6. **Deploy para produção!** 🎉

---

**Boa sorte nos testes!** 🍀🧪
