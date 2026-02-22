# 🛠️ Guia de Implementação - Portal do Professor

**Documento Técnico para Desenvolvimento**

---

## 📁 Estrutura de Arquivos

```
frontend/src/app/
├── core/
│   ├── guards/
│   │   └── teacher.guard.ts          # Proteção de rotas de professor
│   ├── models/
│   │   └── teacher-portal.model.ts   # Modelos específicos do portal
│   └── services/
│       └── teacher-portal.service.ts # Serviço de APIs do professor
│
├── features/
│   └── teacher-portal/               # Módulo do portal do professor
│       ├── teacher-portal.routes.ts
│       ├── components/
│       │   ├── teacher-dashboard/
│       │   │   └── teacher-dashboard.component.ts
│       │   ├── my-courses/
│       │   │   └── my-courses.component.ts
│       │   ├── course-students/
│       │   │   └── course-students.component.ts
│       │   ├── attendance-registration/
│       │   │   └── attendance-registration.component.ts
│       │   ├── teacher-calendar/
│       │   │   └── teacher-calendar.component.ts
│       │   ├── incidents/
│       │   │   ├── incidents-list.component.ts
│       │   │   └── incident-form.component.ts
│       │   ├── student-profile/
│       │   │   └── student-profile.component.ts
│       │   └── teacher-profile/
│       │       └── teacher-profile.component.ts
│       └── shared/
│           ├── course-card/
│           ├── student-attendance-row/
│           └── incident-badge/
│
backend/internal/
├── api/
│   └── handlers/
│       └── teacher_portal_handler.go  # Handler das APIs do professor
├── service/
│   └── teacherportal/
│       └── service.go                 # Lógica de negócio
└── repository/
    └── postgres/
        └── teacher_portal_repository.go # Queries específicas
```

---

## 🔐 Guard de Proteção

### `teacher.guard.ts`
```typescript
// src/app/core/guards/teacher.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const TeacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  if (!authService.checkAuth()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  const isTeacher = user?.roles?.includes('professor') || 
                    user?.roles?.includes('admin') || 
                    user?.roles?.includes('administrador');

  if (!isTeacher) {
    snackBar.open(
      'Acesso restrito a professores e administradores.', 
      'Fechar', 
      { duration: 5000 }
    );
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
```

---

## 📡 Serviço de API

### `teacher-portal.service.ts`
```typescript
// src/app/core/services/teacher-portal.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherPortalService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/teacher`;

  // Dashboard
  getDashboard(): Observable<TeacherDashboard> {
    return this.http.get<TeacherDashboard>(`${this.baseUrl}/dashboard`);
  }

  getTodaySessions(): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(`${this.baseUrl}/sessions/today`);
  }

  // Cursos
  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/courses`);
  }

  getCourseStudents(courseId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/courses/${courseId}/students`);
  }

  // Calendário
  getSessionsByPeriod(start: string, end: string): Observable<ClassSession[]> {
    return this.http.get<ClassSession[]>(
      `${this.baseUrl}/sessions?start=${start}&end=${end}`
    );
  }

  // Presença
  recordAttendance(attendances: AttendanceRecord[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/attendance/batch`, attendances);
  }

  getSessionAttendance(sessionId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(
      `${this.baseUrl}/attendance/session/${sessionId}`
    );
  }

  // Ocorrências
  getMyIncidents(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}/incidents`);
  }

  createIncident(incident: CreateIncidentRequest): Observable<Incident> {
    return this.http.post<Incident>(`${this.baseUrl}/incidents`, incident);
  }

  // Perfil do aluno (visão limitada)
  getStudentProfile(studentId: number): Observable<StudentPublicProfile> {
    return this.http.get<StudentPublicProfile>(
      `${this.baseUrl}/students/${studentId}/profile`
    );
  }

  getStudentAttendanceHistory(
    studentId: number, 
    courseId?: number
  ): Observable<AttendanceHistory[]> {
    let url = `${this.baseUrl}/students/${studentId}/attendance`;
    if (courseId) url += `?course_id=${courseId}`;
    return this.http.get<AttendanceHistory[]>(url);
  }
}

// Interfaces
export interface TeacherDashboard {
  teacher: {
    id: number;
    name: string;
    email: string;
  };
  todaySessions: ClassSession[];
  weeklyStats: {
    totalStudents: number;
    averageAttendance: number;
    classesGiven: number;
  };
  alerts: Alert[];
}

export interface Alert {
  type: 'low_attendance' | 'incident' | 'meeting';
  title: string;
  description: string;
  actionUrl?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface AttendanceRecord {
  studentId: number;
  sessionId: number;
  status: 'present' | 'absent';
  note?: string;
}

export interface StudentPublicProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  photoUrl?: string;
  courses: {
    courseId: number;
    courseName: string;
    attendancePercentage: number;
  }[];
}

export interface CreateIncidentRequest {
  type: 'disciplinary' | 'infrastructure' | 'health' | 'other';
  courseId?: number;
  studentId?: number;
  sessionId?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  actions?: string;
}

export interface Incident {
  id: number;
  type: string;
  severity: string;
  description: string;
  status: 'open' | 'in_analysis' | 'resolved';
  createdAt: string;
  course?: { id: number; name: string };
  student?: { id: number; name: string };
}
```

---

## 🛣️ Configuração de Rotas

### `teacher-portal.routes.ts`
```typescript
// src/app/features/teacher-portal/teacher-portal.routes.ts
import { Routes } from '@angular/router';
import { TeacherGuard } from '../../core/guards/teacher.guard';

export const TEACHER_PORTAL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/teacher-dashboard/teacher-dashboard.component')
      .then(m => m.TeacherDashboardComponent),
    canActivate: [TeacherGuard],
    title: 'Dashboard do Professor'
  },
  {
    path: 'courses',
    loadComponent: () => import('./components/my-courses/my-courses.component')
      .then(m => m.MyCoursesComponent),
    canActivate: [TeacherGuard],
    title: 'Minhas Turmas'
  },
  {
    path: 'courses/:id/students',
    loadComponent: () => import('./components/course-students/course-students.component')
      .then(m => m.CourseStudentsComponent),
    canActivate: [TeacherGuard],
    title: 'Alunos da Turma'
  },
  {
    path: 'attendance/:sessionId',
    loadComponent: () => import('./components/attendance-registration/attendance-registration.component')
      .then(m => m.AttendanceRegistrationComponent),
    canActivate: [TeacherGuard],
    title: 'Registrar Presença'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/teacher-calendar/teacher-calendar.component')
      .then(m => m.TeacherCalendarComponent),
    canActivate: [TeacherGuard],
    title: 'Calendário de Aulas'
  },
  {
    path: 'incidents',
    loadComponent: () => import('./components/incidents/incidents-list.component')
      .then(m => m.IncidentsListComponent),
    canActivate: [TeacherGuard],
    title: 'Ocorrências'
  },
  {
    path: 'incidents/new',
    loadComponent: () => import('./components/incidents/incident-form.component')
      .then(m => m.IncidentFormComponent),
    canActivate: [TeacherGuard],
    title: 'Registrar Ocorrência'
  },
  {
    path: 'students/:id',
    loadComponent: () => import('./components/student-profile/student-profile.component')
      .then(m => m.StudentProfileComponent),
    canActivate: [TeacherGuard],
    title: 'Perfil do Aluno'
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/teacher-profile/teacher-profile.component')
      .then(m => m.TeacherProfileComponent),
    canActivate: [TeacherGuard],
    title: 'Meu Perfil'
  }
];
```

---

## 🔧 Adicionar Rotas Principais

### Atualizar `app.routes.ts`
```typescript
// src/app/app.routes.ts
{
  path: 'teacher',
  loadChildren: () => import('./features/teacher-portal/teacher-portal.routes')
    .then(m => m.TEACHER_PORTAL_ROUTES),
  canActivate: [TeacherGuard]
}
```

### Atualizar Sidebar
```typescript
// src/app/layout/sidebar/sidebar.component.ts
readonly menuItems: MenuItem[] = [
  // ... itens existentes
  {
    text: 'NAV.TEACHER_PORTAL',
    icon: 'school',
    route: '/teacher',
    roles: ['professor', 'admin', 'administrador'],
    dividerBefore: true,
  },
  // ... restante
];
```

### Atualizar Traduções
```json
// src/assets/i18n/pt-BR.json
{
  "NAV": {
    "TEACHER_PORTAL": "Portal do Professor"
  }
}
```

---

## 🔌 Backend - APIs

### `teacher_portal_handler.go`
```go
package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/devdavidalonso/cecor/backend/internal/service/teacherportal"
)

type TeacherPortalHandler struct {
	service teacherportal.Service
}

func NewTeacherPortalHandler(service teacherportal.Service) *TeacherPortalHandler {
	return &TeacherPortalHandler{service: service}
}

// GetDashboard retorna dados agregados do professor
func (h *TeacherPortalHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	
	dashboard, err := h.service.GetDashboard(r.Context(), teacherID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	json.NewEncoder(w).Encode(dashboard)
}

// GetMyCourses retorna cursos do professor
func (h *TeacherPortalHandler) GetMyCourses(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	
	courses, err := h.service.GetTeacherCourses(r.Context(), teacherID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	json.NewEncoder(w).Encode(courses)
}

// GetCourseStudents retorna alunos de um curso específico
func (h *TeacherPortalHandler) GetCourseStudents(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	courseID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	
	// Validar se professor tem acesso ao curso
	if !h.service.IsTeacherOfCourse(r.Context(), teacherID, uint(courseID)) {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}
	
	students, err := h.service.GetCourseStudents(r.Context(), uint(courseID))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	json.NewEncoder(w).Encode(students)
}

// RecordAttendance registra presença em lote
func (h *TeacherPortalHandler) RecordAttendance(w http.ResponseWriter, r *http.Request) {
	teacherID := getUserIDFromContext(r)
	
	var req struct {
		Attendances []AttendanceRecord `json:"attendances"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	
	if err := h.service.RecordAttendance(r.Context(), teacherID, req.Attendances); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusCreated)
}

// RegisterRoutes registra as rotas do portal
func (h *TeacherPortalHandler) RegisterRoutes(r chi.Router) {
	r.Route("/teacher", func(r chi.Router) {
		r.Get("/dashboard", h.GetDashboard)
		r.Get("/courses", h.GetMyCourses)
		r.Get("/courses/{id}/students", h.GetCourseStudents)
		r.Get("/sessions/today", h.GetTodaySessions)
		r.Get("/sessions", h.GetSessionsByPeriod)
		r.Post("/attendance/batch", h.RecordAttendance)
		r.Get("/incidents", h.GetMyIncidents)
		r.Post("/incidents", h.CreateIncident)
		r.Get("/students/{id}/profile", h.GetStudentPublicProfile)
	})
}
```

---

## 🧪 Testes

### Teste do Guard
```typescript
// teacher.guard.spec.ts
describe('TeacherGuard', () => {
  it('should allow access for professor role', () => {
    // Test implementation
  });

  it('should deny access for student role', () => {
    // Test implementation
  });
});
```

### Teste do Serviço
```typescript
// teacher-portal.service.spec.ts
describe('TeacherPortalService', () => {
  it('should fetch dashboard data', () => {
    // Test implementation
  });
});
```

---

## 📋 Checklist de Implementação

### Fase 1: Estrutura Base (1 dia)
- [ ] Criar `TeacherGuard`
- [ ] Criar `TeacherPortalService`
- [ ] Configurar rotas no `app.routes.ts`
- [ ] Adicionar menu na sidebar
- [ ] Criar componente `TeacherDashboard` (esqueleto)

### Fase 2: Dashboard e Cursos (2 dias)
- [ ] Implementar APIs backend (dashboard, cursos)
- [ ] Componente `TeacherDashboard` completo
- [ ] Componente `MyCourses`
- [ ] Componente `CourseStudents`
- [ ] Testes manuais de fluxo

### Fase 3: Presença e Calendário (2 dias)
- [ ] APIs de presença (validar permissões)
- [ ] Componente `AttendanceRegistration`
- [ ] Componente `TeacherCalendar`
- [ ] Validação de 24h para edição

### Fase 4: Ocorrências e Perfil (2 dias)
- [ ] APIs de ocorrências
- [ ] Componente `IncidentsList`
- [ ] Componente `IncidentForm`
- [ ] Componente `StudentProfile`
- [ ] Componente `TeacherProfile`

### Fase 5: Testes e Ajustes (2 dias)
- [ ] Testes de integração
- [ ] Testes de responsividade
- [ ] Revisão de permissões
- [ ] Documentação
- [ ] Deploy em staging

---

**Total Estimado: 9 dias úteis**
