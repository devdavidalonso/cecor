# 🎨 Guia de Testes Visuais - Frontend CECOR

Dicas práticas para testar a interface de forma eficiente.

---

## 🚀 COMO COMEÇAR

### 1. Preparar o Ambiente

```bash
# Terminal 1 - Backend
cd /home/david-alonso/Projetos/cecor
docker-compose up

# Terminal 2 - Frontend
cd /home/david-alonso/Projetos/cecor/frontend
ng serve --port 4201

# Testar APIs rapidamente (opcional)
bash scripts/quick_api_test.sh
```

### 2. Abrir Ferramentas do Desenvolvedor

```
Chrome/Edge: F12 ou Ctrl+Shift+I
Firefox: F12 ou Ctrl+Shift+K
Safari: Cmd+Option+I (habilitar menu Dev primeiro)
```

---

## 📱 TESTE DE RESPONSIVIDADE

### Simular Dispositivos

1. **Abra DevTools** (F12)
2. **Ative Device Toolbar** (Ctrl+Shift+M)
3. **Escolha um device:**
   - iPhone SE (375x667) - Teste mobile pequeno
   - iPad (768x1024) - Teste tablet
   - Desktop (1920x1080) - Teste desktop

### Devices para Testar

| Device | Resolução | O que verificar |
|--------|-----------|-----------------|
| iPhone SE | 375x667 | Menu, scroll, botões |
| iPhone 12 Pro | 390x844 | Layout mobile moderno |
| iPad Air | 820x1180 | Layout tablet |
| Desktop HD | 1920x1080 | Layout completo |

---

## 🎨 CHECKLIST VISUAL RÁPIDO

### Cores e Estilos

```
□ Paleta principal: #006aac (azul CECOR)
□ Fundo: #f5f5f5 (cinza claro)
□ Cards: branco com sombra suave
□ Texto principal: #333333 (cinza escuro)
□ Texto secundário: #666666 (cinza médio)
□ Sucesso: #4caf50 (verde)
□ Erro: #f44336 (vermelho)
□ Aviso: #ff9800 (laranja)
```

### Animações

```
□ Skeleton loading: shimmer de cinza claro para cinza médio
□ Toast: entrada suave de cima/baixo
□ Hover em cards: elevação 2-4px
□ Hover em botões: mudança de cor 200ms
□ Transições de página: suaves (300ms)
```

---

## 🧪 TESTES ESPECÍFICOS

### Teste de Loading (Skeleton)

```
1. Acesse o dashboard do aluno
2. Observe a tela antes de carregar os dados
3. Verifique:
   ✓ Aparecem retângulos cinzas piscando
   ✓ Formato similar aos cards reais
   ✓ Animação suave (não trava)
   ✓ Transição suave para dados reais
```

### Teste de Toast Notifications

```
1. Execute uma ação que salva dados (ex: editar perfil)
2. Observe o canto superior direito
3. Verifique:
   ✓ Toast aparece imediatamente
   ✓ Cor correta (verde=sucesso, vermelho=erro)
   ✓ Animação de entrada suave
   ✓ Fecha automaticamente em 3-5s
   ✓ Botão "Fechar" funciona

⚠️ Para testar erro: desconecte internet e tente salvar
```

### Teste de Frequência

```
Pré-requisito: Aluno com frequência calculada

1. Dashboard → Cards de cursos
2. Verifique:
   ✓ Barra de progresso colorida
   ✓ Porcentagem exibida
   ✓ Texto "X de Y aulas"
   
3. Frequência < 75%:
   ✓ Banner de alerta aparece no topo
   ✓ Cor vermelha/laranja destacada
   ✓ Botão "Ver Detalhes" funcional
```

---

## 🔍 DEBUGGING VISUAL

### Console do Navegador

```javascript
// Verificar se componentes carregaram
console.log('Dashboard loaded');

// Inspecionar estado
angular.component('app-student-dashboard').state

// Ver variáveis do escopo (Angular)
ng.getComponent($0) // selecione elemento primeiro
```

### Network Tab

```
1. Abra Network tab (F12 → Network)
2. Filtre por "XHR" para ver APIs
3. Verifique:
   ✓ Status 200 nas chamadas
   ✓ Tempo de resposta < 1s (ideal)
   ✓ Sem erros 500/404
```

### Performance Tab

```
1. Performance → Record
2. Interaja com a página
3. Stop recording
4. Verifique:
   ✓ FPS consistente (60fps ideal)
   ✓ Sem longas tarefas JS
   ✓ Tempo de paint rápido
```

---

## 🐛 COMO REPORTAR BUGS VISUAIS

### Template de Bug Visual

```markdown
**Tela:** Student Dashboard
**Device:** iPhone SE (375x667)
**Navegador:** Chrome 120

**Problema:**
[Descreva o que está errado visualmente]

**Evidência:**
[Screenshot anexada]

**Esperado:**
[Descreva como deveria ser]

**Prioridade:** 🔴 Alta / 🟡 Média / 🟢 Baixa
```

### Capturar Screenshot

```
Windows: Win+Shift+S (seleção) ou Win+Print (tela toda)
Mac: Cmd+Shift+4 (seleção) ou Cmd+Shift+3 (tela toda)
Chrome DevTools: Ctrl+Shift+P → "Capture full size screenshot"
```

---

## ✅ ROTEIRO SUGERIDO DE TESTE

### Sessão 1: Funcional (30 min)

```
□ Login com cada tipo de usuário (Aluno, Prof, Admin)
□ Navegar por todas as telas do Portal do Aluno
□ Testar CRUD de perfil
□ Verificar dados de frequência
```

### Sessão 2: Visual (20 min)

```
□ Verificar loading states
□ Testar toast notifications
□ Validar cores e tipografia
□ Checar hover effects
```

### Sessão 3: Responsivo (20 min)

```
□ Testar em iPhone SE
□ Testar em iPad
□ Testar em Desktop
□ Verificar scroll e navegação
```

### Sessão 4: Performance (10 min)

```
□ Tempo de carregamento < 3s
□ Sem erros no console
□ Network tab sem falhas
□ Scroll suave
```

---

## 🎯 DICAS RÁPIDAS

### Atalhos Úteis

```
F12                  → DevTools
Ctrl+Shift+M         → Toggle device toolbar
Ctrl+Shift+R         → Hard refresh (limpa cache)
Ctrl+0               → Reset zoom
Ctrl++/Ctrl+-        → Zoom in/out
```

### Limpar Cache

```
Chrome: Ctrl+Shift+R ou F12 → Network → Disable cache
Angular: ng serve --port 4201 (reinicia servidor)
```

---

**Bons testes! 🧪🎨**
