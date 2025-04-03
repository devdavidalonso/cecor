
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'students',
        loadChildren: () => import('./features/students/students.routes').then(m => m.STUDENTS_ROUTES)
      },
      {
        path: 'courses', loadChildren: () => import('./features/courses/courses.routes').then(m => m.COURSES_ROUTES) 
      },
      { path: 'enrollments', loadChildren: () => import('./features/enrollments/enrollments.routes').then(m => m.ENROLLMENTS_ROUTES) },
      {
        path: 'attendance',
        loadChildren: () => import('./features/attendance/attendance.routes').then(m => m.ATTENDANCE_ROUTES)
      },
      {
        path: 'reports',
        loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      },
      // {
      //   path: 'interviews',
      //   loadChildren: () => import('./features/interviews/interviews.routes').then(m => m.INTERVIEWS_ROUTES)
      // },
      // {
      //   path: 'volunteering',
      //   loadChildren: () => import('./features/volunteering/volunteering.routes').then(m => m.VOLUNTEERING_ROUTES)
      // },
      // {
      //   path: 'admin',
      //   loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
      // }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];