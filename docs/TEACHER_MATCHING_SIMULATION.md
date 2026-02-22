# 🎭 Simulação: Matching de Professores e Substituição - CECOR

**Cenário:** Operacionalização do sistema de skills e substituição  
**Data:** 21/02/2026  
**Objetivo:** Demonstrar fluxo completo desde criação do curso até substituição de professor

---

## 📚 CENÁRIO 1: Criando um Curso (Seleção de Professor)

### Contexto
**Admin:** Maria (Coordenadora CECOR)  
**Ação:** Criar curso "Inglês Básico - Turma A"

### Passo 1: Cadastro do Curso

```
┌─────────────────────────────────────────────────────────────┐
│  🎓 NOVO CURSO                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nome: [Inglês Básico.................................]   │
│  Descrição: [Curso introdutório de inglês...]              │
│  Carga Horária: [40] horas                                  │
│                                                             │
│  Categoria: [Idiomas ▼]  ← SELECIONA                      │
│  ├── Tecnologia                                             │
│  ├── Artes                                                  │
│  ├── Idiomas ✓  ← Selecionado                              │
│  └── Música                                                 │
│                                                             │
│  [Continuar ▶]                                              │
└─────────────────────────────────────────────────────────────┘
```

**Sistema:** Categoria "Idiomas" selecionada  
**Sistema:** Busca skills relacionadas a "Idiomas"

---

### Passo 2: Configuração da Turma

```
┌─────────────────────────────────────────────────────────────┐
│  🏫 CONFIGURAR TURMA - Inglês Básico                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Código da Turma: [2026A...........]  (ex: 2026A, 2026B)   │
│                                                             │
│  Horário:                                                   │
│  Dias: [☑ Seg] [☑ Qua] [ ] Sex                            │
│  Início: [19:00]  Término: [21:00]                         │
│                                                             │
│  Sala: [Sala 2 - Informática ▼]                            │
│                                                             │
│  Vagas: [20] alunos                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  👨‍🏫 PROFESSOR                                               │
│                                                             │
│  🔍 Buscar professor compatível com "Idiomas":             │
│                                                             │
│  ┌─ PROFessores Compatíveis (com skill "Idiomas") ──────┐  │
│  │                                                        │  │
│  │  🥇 Ana Silva                    ★★★★★ (5/5)         │  │
│  │     Skills: Inglês ★★★★★, Espanhol ★★★☆☆            │  │
│  │     Disponibilidade: ✅ Seg/Qua 19-21               │  │
│  │     [Selecionar]                                      │  │
│  │                                                        │  │
│  │  🥈 Carlos Pereira               ★★★★☆ (4/5)         │  │
│  │     Skills: Inglês ★★★★☆, Português ★★★★★           │  │
│  │     Disponibilidade: ✅ Seg/Qua 19-21               │  │
│  │     [Selecionar]                                      │  │
│  │                                                        │  │
│  │  🥉 Beatriz Santos               ★★★☆☆ (3/5)         │  │
│  │     Skills: Inglês ★★★☆☆, Francês ★★★★☆            │  │
│  │     Disponibilidade: ⚠️ Seg 19-21 (conflito Qua)    │  │
│  │     [Selecionar]                                      │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  [◀ Voltar]              [✓ Confirmar Turma]               │
└─────────────────────────────────────────────────────────────┘
```

**Ranking do Sistema:**
```go
// Lógica de Score para criação de turma
func CalculateTeacherScore(teacher Teacher, course Course, schedule Schedule) Score {
    score := 0
    
    // 1. Match de Categoria/Skill (0-50 pontos)
    categorySkills := getSkillsForCategory(course.Category) // ["Inglês", "Espanhol", "Idiomas"]
    for _, skill := range teacher.Skills {
        if contains(categorySkills, skill.Name) {
            score += 25 * skill.Level // 25 * (1-5) = 25-125, mas cap em 50
        }
    }
    if score > 50 { score = 50 }
    
    // 2. Disponibilidade de Horário (0-30 pontos)
    if isAvailable(teacher, schedule) {
        score += 30
    } else if hasPartialAvailability(teacher, schedule) {
        score += 15
    }
    
    // 3. Experiência/Carga Atual (0-20 pontos)
    currentClasses := countActiveClasses(teacher)
    if currentClasses < 2 {
        score += 20 // Pouca carga, disponível
    } else if currentClasses < 4 {
        score += 10 // Carga média
    } else {
        score += 5  // Carga alta, mas pode
    }
    
    return score
}

// Resultado:
// Ana Silva:    50 (skill) + 30 (disp) + 15 (carga) = 95 🥇
// Carlos:       40 (skill) + 30 (disp) + 10 (carga) = 80 🥈
// Beatriz:      30 (skill) + 15 (disp parcial) + 20 (carga) = 65 🥉
```

**Maria seleciona:** Ana Silva (score 95)

---

### Passo 3: Confirmação

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ TURMA CRIADA COM SUCESSO!                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📘 Inglês Básico - Turma 2026A                             │
│  ─────────────────────────────────────────────────────────  │
│  Horário: Segundas e Quartas, 19:00 - 21:00                │
│  Sala: Sala 2 - Informática                                 │
│  Professor: Ana Silva                                       │
│  Vagas: 20 alunos                                           │
│                                                             │
│  🎯 Match com Professor:                                    │
│  ├── Skill: Inglês (nível avançado)                        │
│  ├── Disponibilidade: 100% compatível                      │
│  └── Carga atual: 1 turma (leve)                           │
│                                                             │
│  [📧 Notificar Professor]  [👥 Ver Turma]  [🏠 Dashboard]   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 CENÁRIO 2: Professor Faltou (Substituição)

### Contexto
- **Turma:** Inglês Básico - 2026A (Seg/Qua 19-21)
- **Professor:** Ana Silva (faltou na segunda-feira)
- **Próxima aula:** Segunda, 24/02/2026, 19:00
- **Admin:** Maria precisa encontrar substituto

---

### Passo 1: Registro de Ausência

```
┌─────────────────────────────────────────────────────────────┐
│  🚨 REGISTRAR AUSÊNCIA DE PROFESSOR                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Professor: Ana Silva                                       │
│  Turmas afetadas:                                           │
│  ☑ Inglês Básico 2026A (Seg/Qua 19-21)                    │
│  ☐ Espanhol Iniciante 2026A (Ter/Qui 14-16)               │
│                                                             │
│  Período de ausência:                                       │
│  De: [24/02/2026]  Até: [26/02/2026]                       │
│                                                             │
│  Motivo: [Atestado médico..............................]   │
│                                                             │
│  📅 AULAS AFETADAS:                                         │
│  ├── Seg 24/02 - 19:00 - Inglês Básico (Turma A)          │
│  └── Qua 26/02 - 19:00 - Inglês Básico (Turma A)          │
│                                                             │
│  [Cancelar]  [✓ Registrar Ausência]                        │
└─────────────────────────────────────────────────────────────┘
```

**Sistema:** Ausência registrada, aulas 24/02 e 26/02 marcadas como "sem professor"

---

### Passo 2: Busca de Substituto (PRIORIDADE 1: MESMO PERFIL)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 BUSCAR SUBSTITUTO - Aula 24/02 (Seg) 19:00             │
├─────────────────────────────────────────────────────────────┤
│  Curso: Inglês Básico 2026A                                 │
│  Horário: Segunda, 24/02/2026, 19:00-21:00                 │
│  Professor original: Ana Silva (Inglês ★★★★★)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 RESULTADOS (ordenados por compatibilidade):            │
│                                                             │
│  ━━━ PERFIS IDÊNTICOS (mesma skill principal) ━━━          │
│                                                             │
│  🥇 Carlos Pereira                    SCORE: 92/100        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Skill Match: INGLÊS ★★★★☆ (alto)                   │  │
│  │  Disponibilidade: ✅ Segunda 19-21 (livre)          │  │
│  │  Conflitos: ❌ Nenhum                               │  │
│  │                                                      │  │
│  │  📝 Outras skills: Português, Espanhol (básico)     │  │
│  │  🎓 Experiência: 3 anos dando aula de Inglês        │  │
│  │  📊 Carga atual: 2 turmas (disponível)              │  │
│  │                                                      │  │
│  │  [👤 Ver Perfil]  [📞 Contatar]  [✓ Selecionar]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  🥈 Beatriz Santos                    SCORE: 78/100        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Skill Match: INGLÊS ★★★☆☆ (médio)                  │  │
│  │  Disponibilidade: ✅ Segunda 19-21 (livre)          │  │
│  │  Conflitos: ⚠️ Terça 19-21 (mas não afeta)          │  │
│  │                                                      │  │
│  │  📝 Outras skills: Francês ★★★★☆ (avançado)        │  │
│  │  🎓 Experiência: 1 ano dando aula de Inglês         │  │
│  │  📊 Carga atual: 1 turma (muito disponível)         │  │
│  │                                                      │  │
│  │  [👤 Ver Perfil]  [📞 Contatar]  [✓ Selecionar]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ━━━ PERFIS SIMILARES (mesma categoria: Idiomas) ━━━       │
│                                                             │
│  🥉 Roberto Lima                      SCORE: 65/100        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Skill Match: ESPANHOL ★★★★★ (não é Inglês!)        │  │
│  │  Disponibilidade: ✅ Segunda 19-21 (livre)          │  │
│  │                                                      │  │
│  │  📝 Outras skills: Inglês ★★☆☆☆ (básico)           │  │
│  │  ⚠️  Pode dar aula supervisionada/com apoio         │  │
│  │                                                      │  │
│  │  [👤 Ver Perfil]  [📞 Contatar]  [✓ Selecionar]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ━━━ OUTROS PERFIS (solução temporária) ━━━                │
│                                                             │
│  4. Joana Costa                       SCORE: 45/100        │
│     Pedagogia geral, disponível, pode supervisionar         │
│                                                             │
│  [📧 Enviar para todos]  [❌ Cancelar Aula]                │
└─────────────────────────────────────────────────────────────┘
```

**Lógica de Priorização:**
```go
func FindSubstituteTeachers(session ClassSession) SubstituteResults {
    results := SubstituteResults{
        SameProfile:   [], // Mesma skill principal
        Similar:       [], // Mesma categoria
        Others:        [], // Disponível mas outra área
    }
    
    originalSkill := getMainSkill(session.CourseClass.DefaultTeacher)
    // "Inglês"
    
    categorySkills := getSkillsForCategory(session.CourseClass.Course.Category)
    // ["Inglês", "Espanhol", "Francês"]
    
    for _, teacher := range getActiveTeachers() {
        if teacher.ID == session.CourseClass.DefaultTeacherID {
            continue // Pular professor original
        }
        
        score := calculateSubstituteScore(teacher, session)
        
        // CATEGORIZAR
        teacherSkills := getSkillNames(teacher)
        
        if contains(teacherSkills, originalSkill) {
            // PRIORIDADE 1: Mesma skill principal
            results.SameProfile = append(results.SameProfile, 
                Candidate{Teacher: teacher, Score: score})
        } else if hasAnySkill(teacherSkills, categorySkills) {
            // PRIORIDADE 2: Mesma categoria (outro idioma)
            results.Similar = append(results.Similar, 
                Candidate{Teacher: teacher, Score: score})
        } else if score.Availability > 0 {
            // PRIORIDADE 3: Disponível (solução temporária)
            results.Others = append(results.Others, 
                Candidate{Teacher: teacher, Score: score})
        }
    }
    
    // Ordenar cada grupo por score
    sortByScore(results.SameProfile)
    sortByScore(results.Similar)
    sortByScore(results.Others)
    
    return results
}

// Cálculo de score para substituição
func calculateSubstituteScore(teacher Teacher, session ClassSession) Score {
    score := Score{Total: 0}
    
    // 1. Skill Match (0-40 pontos)
    for _, skill := range teacher.Skills {
        if skill.Name == session.RequiredSkill { // Inglês
            score.SkillMatch = skill.Level * 8   // 8-40 pontos
            score.Total += score.SkillMatch
            break
        }
    }
    
    // 2. Disponibilidade (0-30 pontos)
    if isAvailable(teacher, session.Date, session.StartTime, session.EndTime) {
        score.Availability = 30
        score.Total += 30
    }
    
    // 3. Experiência com a turma/course (0-20 pontos)
    if hasTaughtCourseBefore(teacher, session.CourseID) {
        score.Experience = 20
        score.Total += 20
    } else if hasTaughtSimilarCourse(teacher, session.Category) {
        score.Experience = 10
        score.Total += 10
    }
    
    // 4. Proximidade/Relacionamento (0-10 pontos)
    if isSameVolunteerGroup(teacher, session.OriginalTeacher) {
        score.Relationship = 10
        score.Total += 10
    }
    
    return score
}
```

---

### Passo 3: Seleção e Confirmação

**Maria analisa:**
- Carlos tem melhor skill de Inglês (★★★★☆ vs ★★★☆☆)
- Beatriz tem mais disponibilidade (carga leve)

**Decisão:** Selecionar Carlos Pereira (melhor para manter qualidade)

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ SUBSTITUIÇÃO CONFIRMADA                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Aula: Segunda, 24/02/2026, 19:00-21:00                    │
│  Turma: Inglês Básico 2026A                                 │
│                                                             │
│  ❌ Professor Original: Ana Silva (ausente)                 │
│  ✅ Substituto: Carlos Pereira                              │
│                                                             │
│  📧 Notificações enviadas:                                  │
│  ├── ✓ Carlos Pereira (substituto)                        │
│  ├── ✓ Alunos da turma (aviso de mudança)                 │
│  └── ✓ Ana Silva (informada da cobertura)                 │
│                                                             │
│  📝 Observações para o substituto:                         │
│  [Essa turma está na aula 5 do módulo de saudações...]    │
│                                                             │
│  [📋 Ver Próxima Aula]  [🏠 Dashboard]                      │
└─────────────────────────────────────────────────────────────┘
```

---

### Passo 4: Visão do Professor Substituto

**Carlos acessa o portal:**

```
┌─────────────────────────────────────────────────────────────┐
│  👋 Bom dia, Carlos!                                        │
├─────────────────────────────────────────────────────────────┤
│  🔔 ALERTAS                                                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ⚠️ VOCÊ TEM UMA SUBSTITUIÇÃO                           │ │
│  │                                                       │ │
│  │  📘 Inglês Básico 2026A                               │ │
│  │  📅 Segunda, 24/02/2026 às 19:00                      │ │
│  │  📍 Sala 2 - Informática                              │ │
│  │                                                       │ │
│  │  👩‍🏫 Substituindo: Ana Silva                           │ │
│  │                                                       │ │
│  │  📝 Tema da aula: "Saudações e Apresentações"        │ │
│  │  📊 Progresso da turma: Aula 5 de 20                  │ │
│  │                                                       │ │
│  │  [📖 Ver Ementa]  [👥 Ver Alunos]  [✓ Registrar Chamada]│ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📅 MINHAS TURMAS (regulares)                               │
│  • Espanhol Intermediário - 2026A (Ter/Qui 14-16)         │
│  • Francês Básico - 2026B (Sáb 09-11)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 CENÁRIO 3: Não Há Professor Especializado (Solução Temporária)

### Contexto
- **Turma:** Inglês Avançado - 2026A
- **Professor:** Ana Silva (ausente por 2 semanas)
- **Problema:** Nenhum outro professor de Inglês disponível

### Busca de Substituto

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 BUSCAR SUBSTITUTO - Inglês Avançado                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚠️ ALERTA: Nenhum professor de INGLÊS disponível!         │
│                                                             │
│  ━━━ SOLUÇÕES ALTERNATIVAS ━━━                             │
│                                                             │
│  OPÇÃO 1: Professor de Outro Idioma (com apoio)            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Roberto Lima - ESPANHOL ★★★★★                         │  │
│  │                                                      │  │
│  │ ⚠️  Não é Inglês, mas pode:                         │  │
│  │    • Supervisionar atividades predefinidas          │  │
│  │    • Aplicar provas/exercícios já preparados        │  │
│  │    • Conduzir conversação em grupo                  │  │
│  │                                                      │  │
│  │ 📋 Recomendação: Enviar material pré-preparado      │  │
│  │ 👥 Sugestão: Aluno-monitor para apoio didático      │  │
│  │                                                      │  │
│  │ [✓ Selecionar com Apoio]                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  OPÇÃO 2: Pedagogo Geral                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Joana Costa - Pedagogia                               │  │
│  │                                                      │  │
│  │ ✅ Experiência em gestão de sala                      │  │
│  │ ⚠️  Não domina Inglês                                 │  │
│  │                                                      │  │
│  │ 📋 Recomendação: Aula de conversação/revisão        │  │
│  │ 🎥 Sugestão: Usar vídeos/áudios como base           │  │
│  │                                                      │  │
│  │ [✓ Selecionar para Atividades]                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  OPÇÃO 3: Cancelar/Remarcar Aula                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ❌ Cancelar aula do dia 24/02                         │  │
│  │ 📅 Tentar remarcar para outro horário               │  │
│  │                                                      │  │
│  │ [❌ Cancelar Aula]  [📅 Ver Outros Horários]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Decisão: Professor de Outro Idioma + Apoio

```
┌─────────────────────────────────────────────────────────────┐
│  📝 PLANO DE AULA PARA SUBSTITUTO                           │
├─────────────────────────────────────────────────────────────┤
│  Professor Substituto: Roberto Lima (Espanhol)              │
│  Apoio: Sistema + Material Pré-preparado                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📚 MATERIAL ENVIADO PARA ROBERTO:                          │
│  ├── 📄 Roteiro da aula (PDF)                              │
│  ├── 🎥 Vídeo "Conversação em Inglês" (15 min)            │
│  ├── 📋 Lista de exercícios (impressa)                     │
│  └── 📞 Contato da aluna-monitor (Maria)                   │
│                                                             │
│  👥 APOIO DOS ALUNOS:                                       │
│  ├── Maria Santos (aluna avançada) - Apoio didático        │
│  └── João Silva (representante) - Organização              │
│                                                             │
│  🎯 OBJETIVOS DA AULA (definidos por Ana):                 │
│  ├── Revisar vocabulário de viagens                        │
│  ├── Praticar diálogos em pares                            │
│  └── Aplicar quiz de compreensão                           │
│                                                             │
│  ✅ Confirmar Substituição com Apoio?                      │
│                                                             │
│  [✓ Confirmar]  [❌ Cancelar]                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 REGRAS DE NEGÓCIO IMPLEMENTADAS

### 1. Prioridade de Matching

```go
var SubstitutionRules = SubstitutionPriority{
    // PRIORIDADE 1: Mesma skill principal
    SameSkill: Priority{
        Weight: 100,
        RequiredSkillMatch: true,
        Description: "Mesma especialidade (Inglês → Inglês)",
    },
    
    // PRIORIDADE 2: Mesma categoria
    SameCategory: Priority{
        Weight: 70,
        RequiredCategoryMatch: true,
        Description: "Mesma área (Inglês → Espanhol)",
    },
    
    // PRIORIDADE 3: Disponível com apoio
    AvailableWithSupport: Priority{
        Weight: 40,
        RequiresSupport: true,
        Description: "Pedagogo geral + material pré-preparado",
    },
    
    // PRIORIDADE 4: Cancelar
    Cancel: Priority{
        Weight: 0,
        LastResort: true,
        Description: "Sem opções viáveis",
    },
}
```

### 2. Restrições de Substituição

```go
func CanSubstitute(teacher Teacher, session ClassSession) (bool, string) {
    // 1. Professor está ativo?
    if !teacher.Active {
        return false, "Professor inativo"
    }
    
    // 2. Termo de voluntariado vigente?
    if !hasValidVolunteerTerm(teacher) {
        return false, "Termo de voluntariado vencido"
    }
    
    // 3. Disponibilidade de horário?
    if !isTimeAvailable(teacher, session) {
        return false, "Horário indisponível"
    }
    
    // 4. Não está em outra aula no mesmo horário?
    if hasScheduleConflict(teacher, session) {
        return false, "Conflito de horário com outra turma"
    }
    
    // 5. Limite de substituições por mês?
    if getSubstitutionCount(teacher, ThisMonth) >= 5 {
        return false, "Limite de substituições mensais atingido"
    }
    
    return true, "OK"
}
```

### 3. Notificações Automáticas

```go
func SendSubstitutionNotifications(substitution Substitution) {
    // 1. Notificar substituto
    notifyTeacher(substitution.SubstituteTeacher, Notification{
        Title: "Você foi designado como substituto",
        Message: fmt.Sprintf("Substituirá %s na turma %s",
            substitution.OriginalTeacher.Name,
            substitution.CourseClass.Name),
        Actions: []Action{
            {Label: "Ver Detalhes", URL: "/teacher/substitutions/" + substitution.ID},
            {Label: "Confirmar", URL: "/teacher/substitutions/" + substitution.ID + "/confirm"},
            {Label: "Recusar", URL: "/teacher/substitutions/" + substitution.ID + "/decline"},
        },
    })
    
    // 2. Notificar alunos
    for _, student := range substitution.CourseClass.Enrollments {
        notifyStudent(student, Notification{
            Title: "Aviso de substituição de professor",
            Message: fmt.Sprintf("Na próxima aula (%s), %s substituirá %s",
                substitution.Session.Date.Format("02/01"),
                substitution.SubstituteTeacher.Name,
                substitution.OriginalTeacher.Name),
        })
    }
    
    // 3. Notificar professor ausente (informar)
    notifyTeacher(substitution.OriginalTeacher, Notification{
        Title: "Cobertura confirmada",
        Message: fmt.Sprintf("%s cobrirá sua aula do dia %s",
            substitution.SubstituteTeacher.Name,
            substitution.Session.Date.Format("02/01")),
    })
}
```

---

## ✅ CONCLUSÃO: É Operacionalizável?

### ✅ SIM, com as seguintes condições:

| Aspecto | Viabilidade | Observação |
|---------|-------------|------------|
| **Cadastro com matching** | ✅ Alta | Sistema de skills simples e efetivo |
| **Substituição priorizada** | ✅ Alta | 3 níveis de prioridade cobrem todos cenários |
| **Substituição temporária** | ✅ Média | Funciona com material pré-preparado + apoio |
| **Escalabilidade** | ✅ Alta | Mesma lógica serve para 10 ou 100 professores |

### 📋 Requisitos para Funcionar

1. **Cadastro de Skills** (obrigatório)
   - Cada professor deve ter pelo menos 1 skill cadastrada
   - Skills definidas por categoria (Idiomas: Inglês, Espanhol...)

2. **Disponibilidade de Horário** (obrigatório)
   - Professor informa dias/horários disponíveis
   - Sistema bloqueia substituição fora da disponibilidade

3. **Material de Apoio** (recomendado)
   - Para substituições temporárias, sistema sugere envio de:
     - Roteiro da aula
     - Exercícios pré-preparados
     - Vídeos/áudios
     - Contato de aluno-monitor

4. **Comunicação** (obrigatório)
   - Notificações automáticas para todos envolvidos
   - Confirmação do substituto (pode recusar)

---

## 🎯 PRÓXIMOS PASSOS

Para implementar esse sistema:

1. **Semana 1:** Tabelas (skills, availability, course_classes)
2. **Semana 2:** Backend (matching algorithm, substitution service)
3. **Semana 3:** Frontend (telas de seleção e substituição)
4. **Semana 4:** Testes com cenários reais

**Estimativa:** 4 semanas (~32 horas de desenvolvimento)

---

**Documento criado em:** 21/02/2026  
**Próxima ação:** Implementar tabelas de skills e disponibilidade
