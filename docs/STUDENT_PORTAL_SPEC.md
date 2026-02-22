# 📚 Especificação do Portal do Aluno - CECOR

**Versão:** 1.0  
**Data:** 21/02/2026  
**Status:** Planejamento  

---

## 🎯 Visão Geral

O Portal do Aluno é a interface centralizada para que os estudantes do CECOR possam acompanhar sua jornada educacional, desde a visualização de cursos matriculados até o acompanhamento de frequência e ocorrências.

### Objetivos

1. **Empoderar o aluno** com transparência sobre sua frequência e desempenho
2. **Centralizar informações** de cursos, horários e materiais
3. **Facilitar comunicação** com professores e coordenação
4. **Promover engajamento** através de visualização clara do progresso

---

## 👤 Perfil do Usuário: Aluno

### Características
- Idade variada (adolescentes a adultos)
- Diferentes níveis de familiaridade com tecnologia
- Acesso principalmente via mobile
- Interesse em acompanhar próprio progresso

### Permissões
| Funcionalidade | Acesso |
|:---------------|:-------|
| Visualizar próprios cursos | ✅ Sim |
| Visualizar própria frequência | ✅ Sim |
| Visualizar próprias ocorrências | ✅ Sim (read-only) |
| Visualizar perfil pessoal | ✅ Sim |
| Editar dados de contato | ✅ Sim (limitado) |
| Registrar presença | ❌ Não (apenas professor) |
| Ver dados de outros alunos | ❌ Não |
| Acessar Google Classroom | ✅ Sim (link direto) |

---

## 🖥️ Telas do Portal do Aluno

### 1. DASHBOARD DO ALUNO
**Rota:** `/student/dashboard`  
**Acesso:** Apenas alunos (role: aluno)

#### Funcionalidades
- **Visão geral do dia**: Aulas de hoje com horários e salas
- **Meus Cursos**: Cards com progresso de frequência
- **Alertas**: Notificações de frequência baixa, ocorrências
- **Acesso rápido**: Links para Google Classroom

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  👋 Olá, João!                                              │
├─────────────────────────────────────────────────────────────┤
│  📅 AULAS DE HOJE (20/02)                                    │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🕘 09:00 - Excel Básico                               │ │
│  │ 📍 Sala 3 | 👨‍🏫 Prof. Ana                             │ │
│  │ [🎓 Acessar Classroom]                                │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📚 MEUS CURSOS                    🔔 ALERTAS              │
│  ┌─────────────────────────┐        ┌─────────────────────┐│
│  │ 📘 Excel Básico         │        │ ⚠️ Atenção!         ││
│  │ Frequência: 85% 🟢      │        │ Sua frequência em   ││
│  │ [📊 Detalhes]           │        │ Informática está    ││
│  │                         │        │ em 72%              ││
│  │ 🎸 Violão Iniciante     │        │                     ││
│  │ Frequência: 92% 🟢      │        │                     ││
│  │ [📊 Detalhes]           │        │                     ││
│  └─────────────────────────┘        └─────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/student/dashboard` - Dados agregados do aluno logado
- `GET /api/v1/student/sessions/today` - Aulas do dia do aluno

---

### 2. MEUS CURSOS
**Rota:** `/student/courses`  
**Acesso:** Apenas alunos

#### Funcionalidades
- Lista de cursos em que está matriculado
- Para cada curso:
  - Nome, professor, horário
  - Frequência atual (%)
  - Status da matrícula
  - Link para Google Classroom
  - Estatísticas de presença/falta

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  MEUS CURSOS                                                │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📘 Excel Básico - Turma 2026A                         │ │
│  │                                                       │ │
│  │    🕘 Sábados 09:00-11:00 | Sala 3                   │ │
│  │    👨‍🏫 Prof. Ana Maria                               │ │
│  │                                                       │ │
│  │    📊 Frequência: 85% (17/20 aulas)                  │ │
│  │    ████████████████░░░░░                             │ │
│  │                                                       │ │
│  │    [📊 Ver Detalhes] [🎓 Classroom]                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🎸 Violão para Iniciantes                             │ │
│  │                                                       │ │
│  │    🕑 Ter/Qui 14:00-16:00 | Sala 2                   │ │
│  │    👨‍🏫 Prof. Carlos                                   │ │
│  │                                                       │ │
│  │    📊 Frequência: 92% (23/25 aulas)                  │ │
│  │    ███████████████████░░░                            │ │
│  │                                                       │ │
│  │    [📊 Ver Detalhes] [🎓 Classroom]                  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/student/courses` - Cursos do aluno logado

---

### 3. DETALHES DO CURSO (Frequência)
**Rota:** `/student/courses/:id/attendance`  
**Acesso:** Apenas aluno matriculado no curso

#### Funcionalidades
- Visualização detalhada da frequência no curso
- Lista de aulas (data, status: presente/falta)
- Estatísticas:
  - Total de aulas
  - Presenças
  - Faltas
  - Justificadas (se houver)
  - Percentual geral
- Gráfico de evolução da frequência

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  ← Excel Básico - Minha Frequência                          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 📊 RESUMO                                             │ │
│  │                                                       │ │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │ │
│  │   │  85%     │ │  17      │ │   2      │ │   1     │ │ │
│  │   │  Média   │ │Presenças │ │  Faltas  │ │Justif.  │ │ │
│  │   └──────────┘ └──────────┘ └──────────┘ └─────────┘ │ │
│  │                                                       │ │
│  │   ████████████████████████████████████████████░      │ │
│  │   Meta mínima: 75%                                    │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📅 HISTÓRICO DE AULAS                                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Data       | Dia       | Status        | Observação   │ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ 15/02/2026 | Sábado   | ✅ Presente   | -            │ │
│  │ 08/02/2026 | Sábado   | ✅ Presente   | -            │ │
│  │ 01/02/2026 | Sábado   | ❌ Falta      | -            │ │
│  │ 25/01/2026 | Sábado   | ✅ Presente   | -            │ │
│  │ 18/01/2026 | Sábado   | ⚠️ Justificada| Atestado médico│ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/student/courses/:id/attendance` - Histórico de frequência

---

### 4. MINHAS OCORRÊNCIAS
**Rota:** `/student/incidents`  
**Acesso:** Apenas alunos (próprias ocorrências)

#### Funcionalidades
- Lista de ocorrências em que o aluno está envolvido
- Visualização read-only (aluno não pode criar/editar)
- Filtros: tipo, status, data
- Detalhes da ocorrência (tipo, descrição, resolução)

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  MINHAS OCORRÊNCIAS                                         │
├─────────────────────────────────────────────────────────────┤
│  Filtros: [Todos os tipos ▼] [Todos os status ▼]           │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🟡 Disciplinar - 20/02/2026                          │ │
│  │    Curso: Excel Básico                                │ │
│  │    "Utilização de celular durante a aula..."         │ │
│  │    Status: Resolvida                                  │ │
│  │    [👁 Ver Detalhes]                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ 🔴 Infraestrutura - 15/01/2026                       │ │
│  │    Curso: -                                           │ │
│  │    "Danificação acidental do equipamento..."         │ │
│  │    Status: Resolvida                                  │ │
│  │    Resolução: "Custo dividido com a instituição"     │ │
│  │    [👁 Ver Detalhes]                                  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/student/incidents` - Ocorrências do aluno logado

---

### 5. MEU PERFIL
**Rota:** `/student/profile`  
**Acesso:** Apenas alunos

#### Funcionalidades
- Visualizar dados cadastrais
- Editar informações de contato (telefone, email)
- Visualizar foto (se houver)
- Alterar senha
- Termos de uso e política de privacidade

#### Componentes
```
┌─────────────────────────────────────────────────────────────┐
│  MEU PERFIL                                 [✏️ Editar]    │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │  👤                                                   │ │
│  │  João da Silva                                        │ │
│  │  📧 joao@email.com | 📱 (11) 99999-9999             │ │
│  │  📅 Nascimento: 15/03/2005 (19 anos)                │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  📋 DADOS DO RESPONSÁVEL (para menores de 18)              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Maria Silva (Mãe)                                    │ │
│  │  📱 (11) 98888-8888                                   │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  🔒 SEGURANÇA                                               │
│  • [🔑 Alterar Senha]                                      │
│  • [📄 Termos de Uso]                                      │
│  • [🔒 Política de Privacidade]                            │
└─────────────────────────────────────────────────────────────┘
```

#### APIs Necessárias
- `GET /api/v1/student/profile` - Dados do aluno logado
- `PUT /api/v1/student/profile` - Atualizar dados

---

## 🔌 APIs a Serem Implementadas

### Novas APIs Necessárias (Backend)

| Endpoint | Método | Descrição | Permissão |
|:---------|:-------|:----------|:----------|
| `/api/v1/student/dashboard` | GET | Dados agregados do aluno | Aluno |
| `/api/v1/student/courses` | GET | Lista cursos do aluno | Aluno |
| `/api/v1/student/courses/:id` | GET | Detalhes de um curso | Aluno do curso |
| `/api/v1/student/courses/:id/attendance` | GET | Frequência no curso | Aluno do curso |
| `/api/v1/student/sessions/today` | GET | Aulas do dia do aluno | Aluno |
| `/api/v1/student/incidents` | GET | Ocorrências do aluno | Aluno |
| `/api/v1/student/profile` | GET | Perfil do aluno | Aluno |
| `/api/v1/student/profile` | PUT | Atualizar perfil | Aluno (próprio) |

### APIs Existentes (Reutilizar)

| Endpoint | Status | Notas |
|:---------|:-------|:------|
| `/api/v1/attendance/student/:id` | ✅ Existe | Verificar se aluno pode ver própria frequência |
| `/api/v1/incidents` | ✅ Existe | Adicionar filtro por studentId |

---

## 🛡️ Regras de Segurança e Permissões

### Validações no Backend

1. **Aluno só acessa próprios dados**
   ```go
   func StudentDataAccessMiddleware(next http.Handler) http.Handler {
       return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
           userID := getUserFromContext(r)
           requestedStudentID := chi.URLParam(r, "studentId")
           
           // Verificar se o usuário é o próprio aluno ou admin
           if !isOwnData(userID, requestedStudentID) && !isAdmin(userID) {
               http.Error(w, "Forbidden", http.StatusForbidden)
               return
           }
           next.ServeHTTP(w, r)
       })
   }
   ```

2. **Aluno só vê cursos em que está matriculado**
3. **Aluno não pode criar/editar ocorrências (read-only)**
4. **Aluno só edita próprios dados de contato** (não CPF, data nascimento, etc.)

---

## 📱 Responsividade

### Breakpoints
- **Desktop**: > 1024px (layout completo)
- **Tablet**: 768px - 1024px (sidebar colapsada)
- **Mobile**: < 768px (menu hamburger, cards empilhados)

### Prioridades Mobile
1. Dashboard com frequência em destaque
2. Lista de aulas do dia
3. Alertas de frequência baixa

---

## 🗓️ Cronograma Sugerido

| Fase | Duração | Entregáveis |
|:-----|:--------|:------------|
| **Fase 1** | 2 dias | Setup do StudentPortal + Dashboard |
| **Fase 2** | 2 dias | Meus Cursos + Detalhes de Frequência |
| **Fase 3** | 1 dia | Minhas Ocorrências + Perfil |
| **Fase 4** | 1 dia | Testes + Ajustes + Documentação |

**Total: 6 dias úteis**

---

## 🔄 Integrações

### Google Classroom
- Link direto nas turmas do aluno
- (Futuro) Sincronização automática de convites

### Notificações
- Alerta de frequência baixa (push/email)
- Lembrete de aula
- Nova ocorrência registrada

---

## 📊 Métricas de Sucesso

| Métrica | Meta |
|:--------|:-----|
| Tempo para ver frequência | < 30 segundos |
| % de alunos usando o portal | > 70% |
| Satisfação do aluno (NPS) | > 40 |
| Tempo de carregamento | < 3 segundos |

---

## 📝 Notas de Implementação

### Componentes Reutilizáveis (do Teacher Portal)
- `StudentGuard` - Proteção de rotas de aluno (similar ao TeacherGuard)
- `CourseCard` - Card de curso (adaptar para visão aluno)
- `IncidentBadge` - Indicador de tipo/severidade
- `AttendanceChart` - Gráfico de frequência

### Estrutura de Pastas (Frontend)
```
src/app/features/student-portal/
├── components/
│   ├── student-dashboard/
│   │   └── student-dashboard.component.ts
│   ├── my-courses/
│   │   └── my-courses.component.ts
│   ├── course-attendance/
│   │   └── course-attendance.component.ts
│   ├── my-incidents/
│   │   └── my-incidents.component.ts
│   └── student-profile/
│       └── student-profile.component.ts
├── services/
│   └── student-portal.service.ts
├── guards/
│   └── student.guard.ts
└── student-portal.routes.ts
```

---

## ✅ Checklist de Validação

- [ ] Aluno vê apenas seus cursos
- [ ] Frequência exibida corretamente
- [ ] Aluno não pode editar ocorrências
- [ ] Aluno só edita dados de contato
- [ ] Integração com Google Classroom funciona
- [ ] Layout responsivo em mobile
- [ ] Performance < 3s em todas as telas

---

## 🔮 Melhorias Futuras (Roadmap v2)

1. **Gamificação**: Badge de frequência, conquistas
2. **Material de Aula**: Download de PDFs, ementas
3. **Comunicação**: Chat com professor, avisos da coordenação
4. **Certificados**: Download de certificados de conclusão
5. **Avaliações**: Ver notas/provas (se implementado)

---

**Documento criado em:** 21/02/2026  
**Próxima revisão:** Após implementação
