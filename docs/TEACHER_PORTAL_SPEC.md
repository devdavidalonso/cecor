# 📚 Especificação do Portal do Professor - CECOR

**Versão:** 1.0  
**Data:** 20/02/2026  
**Status:** Planejamento  

---

## 🎯 Visão Geral

O Portal do Professor é a interface centralizada para que os voluntários/professores do CECOR possam gerenciar suas atividades diárias, desde o registro de presença até o acompanhamento do desempenho dos alunos.

### Objetivos

1. **Simplificar o dia a dia** do professor com acesso rápido às suas aulas
2. **Centralizar informações** de alunos, frequência e ocorrências
3. **Integrar com Google Classroom** para acesso direto às turmas virtuais
4. **Facilitar comunicação** com a coordenação via registros estruturados

---

## 👤 Perfil do Usuário: Professor

### Características
- Voluntário (sujeito à Lei 9.608/98)
- Pode ministrar um ou mais cursos
- Precisa de acesso rápido (frequentemente entre aulas)
- Pode usar dispositivos móveis (tablet/celular)

### Permissões
| Funcionalidade | Acesso |
|:---------------|:-------|
| Visualizar seus cursos | ✅ Sim |
| Registrar presença | ✅ Sim (apenas em seus cursos) |
| Visualizar perfil de alunos | ✅ Sim (apenas matriculados em seus cursos) |
| Registrar ocorrências | ✅ Sim |
| Acessar Google Classroom | ✅ Sim |
| Cadastrar/editar alunos | ❌ Não |
| Cadastrar/editar cursos | ❌ Não |
| Ver relatórios administrativos | ❌ Não (apenas seus dados) |

---

## 🖥️ Telas do Portal do Professor

### 1. DASHBOARD DO PROFESSOR
**Rota:** `/teacher/dashboard`  
**Acesso:** Apenas professores (role: professor)

#### Funcionalidades
- **Visão geral do dia**: Aulas de hoje com horários e salas
- **Acesso rápido**: Botões diretos para "Registrar Presença" e "Ver Turma"
- **Alertas**: Notificações de alunos com baixa frequência, ocorrências pendentes
- **Estatísticas rápidas**: 
  - Total de alunos em seus cursos
  - Taxa média de frequência da semana
  - Ocorrências registradas no mês

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  👋 Bom dia, Prof. Ana!                                      │
├─────────────────────────────────────────────────────────────┤
│  📅 AULAS DE HOJE (20/02)                                    │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ 🕘 09:00     │  │ 🕑 14:00     │                         │
│  │ Excel Básico │  │ Informática  │                         │
│  │ Sala 3       │  │ Sala 2       │                         │
│  │ [Chamada]    │  │ [Chamada]    │                         │
│  └──────────────┘  └──────────────┘                         │
├─────────────────────────────────────────────────────────────┤
│  📊 RESUMO DA SEMANA         🔔 ALERTAS                    │
│  • 45 alunos ativos          • 3 alunos < 75% freq         │
│  • 87% freq. média           • 1 ocorrência aberta         │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/teacher/dashboard` - Dados agregados do professor logado
- `GET /api/v1/teacher/sessions/today` - Aulas do dia

---

### 2. MINHAS TURMAS (Meus Cursos)
**Rota:** `/teacher/courses`  
**Acesso:** Apenas professores

#### Funcionalidades
- Lista de cursos que o professor ministra
- Para cada curso:
  - Nome do curso, período, carga horária
  - Quantidade de alunos matriculados
  - Próxima aula agendada
  - Link direto para Google Classroom
  - Status (ativo/inativo)

#### Ações por Curso
- **Ver Turma**: Acessar lista de alunos matriculados
- **Ver Calendário**: Visualizar todas as aulas do curso
- **Registrar Presença**: Ir direto para a chamada da próxima aula
- **Google Classroom**: Botão de acesso direto (abre em nova aba)

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  MINHAS TURMAS                              [📅 Calendário] │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📘 Excel Básico - Turma 2026A                         │ │
│  │    🕘 Sábados 09:00-11:00 | Sala 3                   │ │
│  │    👥 18 alunos | 📊 92% frequência média            │ │
│  │    [👥 Ver Turma] [✓ Chamada] [🎓 Classroom]         │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 💻 Informática Fundamental                            │ │
│  │    🕑 Quartas 14:00-16:00 | Sala 2                   │ │
│  │    👥 22 alunos | 📊 85% frequência média            │ │
│  │    [👥 Ver Turma] [✓ Chamada] [🎓 Classroom]         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/teacher/courses` - Cursos do professor logado

---

### 3. DETALHE DA TURMA (Alunos Matriculados)
**Rota:** `/teacher/courses/:id/students`  
**Acesso:** Apenas professor do curso específico

#### Funcionalidades
- Lista de alunos matriculados no curso
- Busca/filtro por nome
- Informações por aluno:
  - Nome, foto (se houver)
  - % de frequência no curso
  - Status (ativo/inativo)
  - Alertas (frequência baixa, ocorrências)
- Acesso ao perfil completo do aluno

#### Ações
- **Ver Perfil**: Detalhes completos do aluno
- **Registrar Ocorrência**: Criar ocorrência vinculada ao aluno
- **Enviar Mensagem**: (Futuro - integração WhatsApp/Email)

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  ← Excel Básico - Alunos Matriculados                       │
│  🔍 _________________  [Filtros ▼]                          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 👤 João Silva                    🟢 95% freq          │ │
│  │    📧 joao@email.com | 📱 (11) 99999-9999            │ │
│  │    [👁 Ver] [! Ocorrência]                            │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 👤 Maria Santos                  🟡 68% freq ⚠️      │ │
│  │    📧 maria@email.com | 📱 (11) 98888-8888           │ │
│  │    [👁 Ver] [! Ocorrência]                            │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/courses/:id/students` - Alunos matriculados
- `GET /api/v1/attendance/student/:id/percentage?course_id=X` - % frequência

---

### 4. REGISTRO DE PRESENÇA (Chamada)
**Rota:** `/teacher/attendance/:sessionId`  
**Acesso:** Professor da aula específica

#### Funcionalidades
- Lista de alunos matriculados
- Toggle Presente/Ausente para cada aluno
- Campo de observação por aluno (atraso, justificativa)
- Indicador visual de frequência acumulada do aluno
- Salvamento em lote (uma vez por aula)

#### Validações
- Não permite alteração após 24h (regra de negócio)
- Bloqueia se aula já foi realizada há mais de 1 dia
- Alerta se tentar salvar sem marcar todos

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  ← Registrar Presença                                        │
│  📘 Excel Básico | 🕘 09:00 | 📅 20/02/2026                 │
│  Tema: Planilhas - Fórmulas Básicas                         │
├─────────────────────────────────────────────────────────────┤
│  Aluno                          Presença  Observação        │
│  ─────────────────────────────────────────────────────────  │
│  👤 João Silva                   [●────]  [________]        │
│     Frequência: 95%                                         │
│  👤 Maria Santos                 [───○]  [Atraso 15min]     │
│     Frequência: 68% ⚠️                                       │
│  👤 Carlos Pereira               [●────]  [________]        │
│     Frequência: 100%                                        │
├─────────────────────────────────────────────────────────────┤
│                           [💾 Salvar Chamada]               │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `POST /api/v1/attendance/batch` - Registrar presenças em lote
- `GET /api/v1/attendance/course/:id/date/:date` - Verificar já registrado

---

### 5. CALENDÁRIO DE AULAS
**Rota:** `/teacher/calendar` ou `/teacher/courses/:id/calendar`  
**Acesso:** Apenas professores

#### Funcionalidades
- Visualização em calendário (mensal/semanal)
- Aulas coloridas por curso
- Clique na aula abre detalhes
- Indicadores:
  - ✅ Presença já registrada
  - ⏳ Aula futura
  - ⚠️ Chamada pendente (aula passada sem registro)

#### Ações
- **Clicar em aula**: Abrir modal com opções (registrar presença, ver ementa)
- **Arrastar**: (Futuro) Reagendar aula

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  CALENDÁRIO DE AULAS                        [Mês] [Semana] │
├─────────────────────────────────────────────────────────────┤
│     Dom    Seg    Ter    Qua    Qui    Sex    Sáb          │
│                                                             │
│  16                                                     22 │
│  17                                                     23 │
│  18                                                     24 │
│  19                                                     25 │
│  20    🟦 Excel      🟩 Info                              26 │
│        09:00         14:00                                 │
│        [✓]           [⏳]                                  │
│  21                                                     27 │
│                                                             │
│  Legenda: 🟦 Excel Básico | 🟩 Informática                 │
│           ✓ Registrado | ⏳ Pendente | ⚠️ Atrasado         │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/teacher/sessions?start=...&end=...` - Aulas no período

---

### 6. REGISTRO DE OCORRÊNCIAS
**Rota:** `/teacher/incidents` (list) e `/teacher/incidents/new` (form)  
**Acesso:** Apenas professores

#### Funcionalidades
- Lista de ocorrências registradas pelo professor
- Filtros: por curso, por aluno, por tipo, por data
- Status: Aberta, Em análise, Resolvida

#### Formulário de Nova Ocorrência
- **Tipo**: Disciplinar, Infraestrutura, Saúde, Outros
- **Vinculação**: Curso (opcional), Aluno (opcional), Aula específica
- **Descrição**: Texto livre detalhado
- **Severidade**: Baixa, Média, Alta, Crítica
- **Anexos**: Fotos/documentos (opcional)

#### Componentes - Lista
```
┌─────────────────────────────────────────────────────────────┐
│  OCORRÊNCIAS                                [+ Nova]       │
│  Filtros: [Todos os cursos ▼] [Todos os tipos ▼]          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🟡 Disciplinar - 20/02/2026                          │ │
│  │    Curso: Excel Básico | Aluno: Maria Santos         │ │
│  │    "Aluno utilizando celular durante a aula..."      │ │
│  │    Status: Aberta | [👁 Ver] [✏️ Editar]              │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🔴 Infraestrutura - 18/02/2026                       │ │
│  │    Curso: - | Aluno: -                               │ │
│  │    "Projetor da Sala 3 não está funcionando..."      │ │
│  │    Status: Em análise | [👁 Ver]                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/incidents` - Listar ocorrências
- `POST /api/v1/incidents` - Criar ocorrência
- `PUT /api/v1/incidents/:id` - Atualizar

---

### 7. PERFIL DO ALUNO (Visão Professor)
**Rota:** `/teacher/students/:id`  
**Acesso:** Apenas se aluno matriculado em curso do professor

#### Funcionalidades
- Dados básicos do aluno (nome, contato, foto)
- Histórico de frequência (gráfico/tabela)
- Cursos em que está matriculado (apaqueles que o professor ministra)
- Ocorrências registradas
- Contatos de emergência

#### Restrições
- Não mostra dados sensíveis (CPF, endereço completo)
- Não mostra notas/avaliações (se houver no futuro)
- Apenas informações necessárias para o acompanhamento pedagógico

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  ← Perfil do Aluno                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │  👤                                                   │ │
│  │  João Silva                                           │ │
│  │  📧 joao@email.com | 📱 (11) 99999-9999              │ │
│  │  [✉️ Enviar Email] [💬 WhatsApp]                     │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📊 FREQUÊNCIA                                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │   ┌─────┐       │  │ Excel Básico: 95% 🟢            │  │
│  │  /  95%  \      │  │ Informática:  88% 🟢            │  │
│  │ │   ⭐   │      │  │                                 │  │
│  │  \______/       │  │ Média Geral:  91%               │  │
│  │  Presença       │  └─────────────────────────────────┘  │
│  └─────────────────┘                                        │
├─────────────────────────────────────────────────────────────┤
│  📋 CURSOS MATRICULADOS                                     │
│  • Excel Básico (Sábados 09:00) - Prof. Ana               │
│  • Informática (Quartas 14:00) - Prof. Carlos             │
├─────────────────────────────────────────────────────────────┤
│  🔔 OCORRÊNCIAS RECENTES                                    │
│  Nenhuma ocorrência registrada                              │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/students/:id/public-profile` - Dados públicos do aluno
- `GET /api/v1/attendance/student/:id` - Histórico de frequência

---

### 8. MEU PERFIL (Professor)
**Rota:** `/teacher/profile`  
**Acesso:** Apenas professores

#### Funcionalidades
- Visualizar dados cadastrais
- Editar informações de contato
- Visualizar termo de voluntariado (status, validade)
- Alterar senha

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  MEU PERFIL                                 [✏️ Editar]    │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │  👤                                                   │ │
│  │  Prof. Ana Maria Santos                               │ │
│  │  📧 ana.santos@cecor.org | 📱 (11) 97777-7777        │ │
│  │  🎓 Formação: Pedagogia - USP                        │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📋 TERMOS DE VOLUNTARIADO                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Termo CECOR 2026                                      │ │
│  │ Status: ✅ Ativo                                      │ │
│  │ Assinado: 15/01/2026                                  │ │
│  │ Válido até: 31/12/2026                                │ │
│  │ [📄 Ver Documento]                                    │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📚 CURSOS QUE MINISTRO                                     │
│  • Excel Básico (18 alunos)                                 │
│  • Excel Avançado (12 alunos)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 APIs a Serem Implementadas/Verificadas

### Novas APIs Necessárias

| Endpoint | Método | Descrição |
|:---------|:-------|:----------|
| `/api/v1/teacher/dashboard` | GET | Dados agregados do professor logado |
| `/api/v1/teacher/courses` | GET | Lista cursos do professor |
| `/api/v1/teacher/sessions/today` | GET | Aulas do dia do professor |
| `/api/v1/teacher/sessions` | GET | Aulas em um período (calendário) |
| `/api/v1/teacher/incidents` | GET | Ocorrências registradas pelo professor |
| `/api/v1/students/:id/public-profile` | GET | Perfil público do aluno (limitado) |

### APIs Existentes (Verificar Permissões)

| Endpoint | Status | Notas |
|:---------|:-------|:------|
| `/api/v1/attendance/batch` | ✅ Existe | Verificar se valida professor |
| `/api/v1/attendance/course/:id/date/:date` | ✅ Existe | Verificar permissão |
| `/api/v1/incidents` | ⚠️ Verificar | Implementar se não existir |
| `/api/v1/courses/:id/students` | ⚠️ Verificar | Implementar se não existir |

---

## 🛡️ Regras de Segurança e Permissões

### Validações no Backend

1. **Professor só acessa seus cursos**
   ```go
   // Middleware example
   func TeacherCourseAccessMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           teacherID := getUserFromContext(r)
           courseID := chi.URLParam(r, "id")
           
           if !isTeacherOfCourse(teacherID, courseID) {
               http.Error(w, "Forbidden", http.StatusForbidden)
               return
           }
           next.ServeHTTP(w, r)
       })
   }
   ```

2. **Presença só pode ser registrada pelo professor da aula**
3. **Ocorrências só podem ser editadas pelo autor (até 24h)**
4. **Dados de alunos limitados aos cursos do professor**

---

## 📱 Responsividade

### Breakpoints
- **Desktop**: > 1024px (layout completo)
- **Tablet**: 768px - 1024px (sidebar colapsada)
- **Mobile**: < 768px (menu hamburger, cards empilhados)

### Prioridades Mobile
1. Dashboard com aulas do dia em destaque
2. Registro de presença em tela cheia
3. Lista de alunos simplificada

---

## 🔄 Integrações

### Google Classroom
- Link direto nas turmas
- (Futuro) Sincronização automática de alunos

### Notificações
- Alerta de frequência baixa (push/email)
- Lembrete de registro de presença
- Resposta a ocorrências

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|:--------|:-----|
| Tempo médio para registrar presença | < 2 minutos |
| % de chamadas registradas no dia | > 95% |
| Satisfação do professor (NPS) | > 50 |
| Tempo de carregamento das telas | < 3 segundos |

---

## 🗓️ Cronograma Sugerido

| Fase | Duração | Entregáveis |
|:-----|:--------|:------------|
| **Fase 1** | 3 dias | Dashboard + Minhas Turmas |
| **Fase 2** | 3 dias | Registro de Presença + Calendário |
| **Fase 3** | 2 dias | Ocorrências + Perfil do Aluno |
| **Fase 4** | 2 dias | Testes + Ajustes + Documentação |

**Total: 10 dias úteis**

---

## 📝 Notas de Implementação

### Componentes Reutilizáveis
- `TeacherGuard` - Proteção de rotas de professor
- `CourseCard` - Card de curso (usado em dashboard e lista)
- `StudentAttendanceRow` - Linha de aluno na chamada
- `IncidentBadge` - Indicador de tipo/severidade de ocorrência

### Bibliotecas Adicionais (se necessário)
- Calendário: `@fullcalendar/angular` ou componente próprio
- Gráficos: `ng2-charts` para estatísticas de frequência

---

## ✅ Checklist de Validação

- [ ] Professor vê apenas suas turmas
- [ ] Registro de presença salva corretamente
- [ ] Não é possível editar chamada após 24h
- [ ] Ocorrências são registradas e visíveis
- [ ] Integração com Google Classroom funciona
- [ ] Layout responsivo em tablets
- [ ] Performance < 3s em todas as telas

---

**Documento criado em:** 20/02/2026  
**Próxima revisão:** Após implementação da Fase 1
