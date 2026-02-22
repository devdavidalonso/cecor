// src/app/features/teacher-portal/teacher-portal.routes.ts
import { Routes } from '@angular/router';
import { TeacherGuard } from '../../core/guards/teacher.guard';

/**
 * Rotas do Portal do Professor
 * Todas as rotas são protegidas pelo TeacherGuard
 */
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
    path: 'incidents/:id',
    loadComponent: () => import('./components/incidents/incident-detail.component')
      .then(m => m.IncidentDetailComponent),
    canActivate: [TeacherGuard],
    title: 'Detalhes da Ocorrência'
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
