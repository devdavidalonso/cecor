// src/app/features/student-portal/student-portal.routes.ts
import { Routes } from '@angular/router';
import { StudentGuard } from '../../core/guards/student.guard';

/**
 * Rotas do Portal do Aluno
 * Todas as rotas são protegidas pelo StudentGuard
 */
export const STUDENT_PORTAL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/student-dashboard/student-dashboard.component')
      .then(m => m.StudentDashboardComponent),
    canActivate: [StudentGuard],
    title: 'Dashboard do Aluno'
  },
  {
    path: 'courses',
    loadComponent: () => import('./components/my-courses/my-courses.component')
      .then(m => m.MyCoursesComponent),
    canActivate: [StudentGuard],
    title: 'Meus Cursos'
  },
  {
    path: 'courses/:id/attendance',
    loadComponent: () => import('./components/course-attendance/course-attendance.component')
      .then(m => m.CourseAttendanceComponent),
    canActivate: [StudentGuard],
    title: 'Minha Frequência'
  },
  {
    path: 'incidents',
    loadComponent: () => import('./components/my-incidents/my-incidents.component')
      .then(m => m.MyIncidentsComponent),
    canActivate: [StudentGuard],
    title: 'Minhas Ocorrências'
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/student-profile/student-profile.component')
      .then(m => m.StudentProfileComponent),
    canActivate: [StudentGuard],
    title: 'Meu Perfil'
  }
];
