# 📅 DAILY TASKS - CECOR MVP

**Sistema de acompanhamento diário**  
**Dedicação:** 4 horas/dia  
**Início:** **_ / _** / 2026

---

## 📊 PROGRESSO SEMANAL

### SEMANA 1 - FUNDAÇÃO

```
[✅] Dia 1  [✅] Dia 2  [✅] Dia 3  [░] Dia 4  [░] Dia 5
```

### SEMANA 2 - CRUD BÁSICO

```
[✅] Dia 6  [░] Dia 7  [░] Dia 8  [░] Dia 9  [░] Dia 10
```

### SEMANA 3 - FREQUÊNCIA

```
[░] Dia 11  [░] Dia 12  [░] Dia 13  [░] Dia 14  [░] Dia 15
```

---

## 🎯 DIA ATUAL: \_\_\_

### 📋 TAREFA DO DIA

> **Copie a tarefa do MVP-ROADMAP.md aqui e marque conforme avança**

**Exemplo:**

- [ ] Subtarefa 1
- [ ] Subtarefa 2
- [ ] Subtarefa 3

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
-


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

**Data:** **_ / _** / 2026  
**Horário:** **_:_** - **_:_**  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Resumo:**

```
O que foi feito:



Dificuldades:



Aprendizados:


```

**Commits:**

- [ ] `git commit -m "feat: integra keycloak-angular no frontend"`
- [ ] `git commit -m "feat: cria AuthGuard para rotas protegidas"`

---

#### 📅 DIA 5 - Testes de Integração

**Data:** **_ / _** / 2026  
**Horário:** **_:_** - **_:_**  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Resumo:**

```
O que foi feito:



Dificuldades:



Aprendizados:


```

**Commits:**

- [ ] `git commit -m "test: valida fluxo completo de autenticação"`
- [ ] `git commit -m "docs: atualiza README com instruções de login"`

---

### SEMANA 2

#### 📅 DIA 6 - Modelo de Dados

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Commits:**

- [ ] `git commit -m "feat: cria migrations para alunos, cursos, matriculas"`

---

#### 📅 DIA 7 - CRUD Alunos Backend

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Commits:**

- [ ] `git commit -m "feat: implementa CRUD de alunos no backend"`

---

#### 📅 DIA 8 - CRUD Alunos Frontend

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Commits:**

- [ ] `git commit -m "feat: cria módulo de alunos no frontend"`
- [ ] `git commit -m "feat: implementa listagem de alunos"`
- [ ] `git commit -m "feat: implementa formulário de aluno"`

---

#### 📅 DIA 9 - CRUD Cursos

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Commits:**

- [ ] `git commit -m "feat: implementa CRUD completo de cursos"`

---

#### 📅 DIA 10 - Matrícula

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

**Commits:**

- [ ] `git commit -m "feat: implementa sistema de matrícula"`

---

### SEMANA 3

#### 📅 DIA 11 - Modelo Frequência

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

---

#### 📅 DIA 12 - Registro Backend

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

---

#### 📅 DIA 13 - Tela de Chamada

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

---

#### 📅 DIA 14 - Relatórios

**Data:** **_ / _** / 2026  
**Status:** [ ] Concluído [ ] Parcial [ ] Não iniciado

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
