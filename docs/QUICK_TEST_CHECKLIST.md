# ✅ Checklist Rápido de Testes - CECOR

**Use este durante os testes manuais para marcar progresso**

## Snapshot executado em 22/02/2026

Status desta rodada:
1. `students` carregando com `200` no admin.
2. `teachers` carregando com `200` no admin.
3. RBAC validado para bloqueio de `/students` para perfis nao-admin.
4. Login e redirecionamento por perfil validados.
5. Erro de icone `icon-144x144.png` corrigido.

---

## 🔐 LOGIN E ACESSO

| # | Teste | Status |
|---|-------|--------|
| 1 | Login como **Aluno** vai para /student/dashboard | ⬜ |
| 2 | Login como **Professor** vai para /teacher/dashboard | ⬜ |
| 3 | Login como **Admin** vai para /dashboard | ⬜ |
| 4 | Aluno tenta acessar /admin → redirecionado | ⬜ |
| 5 | Token expirado → redireciona para login | ⬜ |
| 6 | Professor tenta acessar /students → /acesso-negado | ⬜ |

---

## 👨‍🎓 PORTAL DO ALUNO

| # | Teste | Status |
|---|-------|--------|
| 7 | Dashboard carrega sem erros de console | ⬜ |
| 8 | Nome do aluno aparece no topo | ⬜ |
| 9 | **Skeleton loading** aparece durante carregamento | ⬜ |
| 10 | Cards de cursos mostram: Nome, Turma, Frequência % | ⬜ |
| 11 | Barra de frequência colorida (verde ≥75%, laranja <75%) | ⬜ |
| 12 | Alerta de **frequência baixa** aparece se < 75% | ⬜ |
| 13 | Seção "Aulas de Hoje" mostra aulas agendadas | ⬜ |
| 14 | Clique no curso → detalhe de frequência | ⬜ |
| 15 | Tabela de presenças com status coloridos | ⬜ |
| 16 | Contadores: Presenças, Faltas, Justificadas | ⬜ |
| 17 | Perfil: pode editar telefone | ⬜ |
| 18 | Perfil: nome/CPF estão bloqueados | ⬜ |
| 19 | Ocorrências: lista aparece (apenas visualização) | ⬜ |
| 20 | Toast aparece ao salvar perfil | ⬜ |

---

## 🎨 UI/UX

| # | Teste | Status |
|---|-------|--------|
| 20 | Cores consistentes (azul #006aac principal) | ⬜ |
| 21 | Hover nos cards eleva levemente | ⬜ |
| 22 | Hover nos botões muda cor/opacidade | ⬜ |
| 23 | Loading states em botões de ação | ⬜ |
| 24 | **Toast notifications** com animação suave | ⬜ |
| 25 | Sem overflow horizontal em telas pequenas | ⬜ |
| 26 | Texto legível em mobile (min 14px) | ⬜ |
| 27 | Botões grandes o suficiente para toque (44px) | ⬜ |

---

## 🔔 NOTIFICAÇÕES

| # | Teste | Status |
|---|-------|--------|
| 28 | Toast verde ao salvar com sucesso | ⬜ |
| 29 | Toast vermelho ao dar erro | ⬜ |
| 30 | Toast laranja para avisos | ⬜ |
| 31 | Toast fecha automaticamente em 3-5s | ⬜ |
| 32 | Botão "Fechar" no toast funciona | ⬜ |
| 33 | Notificações persistem até lidas (se aplicável) | ⬜ |

---

## 🏫 TURMAS (CourseClass)

| # | Teste | Status |
|---|-------|--------|
| 34 | Criar Turma A e Turma B para mesmo curso | ⬜ |
| 35 | Matrícula específica na Turma B | ⬜ |
| 36 | Aluno aparece apenas na turma correta | ⬜ |
| 37 | Listar turmas com filtro por curso | ⬜ |

---

## 👨‍🏫 SKILLS E SUBSTITUIÇÃO

| # | Teste | Status |
|---|-------|--------|
| 38 | Criar skills (Inglês, Excel, etc.) | ⬜ |
| 39 | Associar skills ao professor com nível | ⬜ |
| 40 | Buscar substitutos retorna lista ordenada por score | ⬜ |
| 41 | Professor com skill igual tem score maior | ⬜ |

---

## 📱 RESPONSIVIDADE

| # | Teste | Status |
|---|-------|--------|
| 42 | Desktop (1920x1080) → layout em grid | ⬜ |
| 43 | Tablet (768x1024) → layout adaptado | ⬜ |
| 44 | Mobile (375x667) → layout em coluna | ⬜ |
| 45 | Menu mobile (hamburger) funciona | ⬜ |
| 46 | Scroll suave em todas as telas | ⬜ |

---

## 🚀 PERFORMANCE

| # | Teste | Status |
|---|-------|--------|
| 47 | Dashboard carrega em < 3 segundos | ⬜ |
| 48 | Sem erros 500 nas APIs | ⬜ |
| 49 | Sem warnings críticos no console | ⬜ |
| 50 | Build de produção gera sem erros | ⬜ |

---

## 📊 RESULTADO

```
Total de Testes: 51
Passaram: ___ / 51
Falharam: ___ / 51
N/A: ___ / 51

% Concluído: ___%

Status Geral: ⬜ Não Iniciado / 🟡 Em Andamento / 🟢 Completo
```

---

## 🐛 BUGS ENCONTRADOS

| # | Bug | Severidade | Status |
|---|-----|------------|--------|
| 1 | | 🔴 / 🟡 / 🟢 | Aberto / Corrigido |
| 2 | | 🔴 / 🟡 / 🟢 | Aberto / Corrigido |
| 3 | | 🔴 / 🟡 / 🟢 | Aberto / Corrigido |

---

**Data dos Testes:** ___/___/______  
**Testador:** _________________  
**Versão Testada:** _________________
