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
        path: 'alunos',
        loadChildren: () => import('./features/alunos/alunos.routes').then(m => m.ALUNOS_ROUTES)
      },
      {
        path: 'cursos',
        loadChildren: () => import('./features/cursos/cursos.routes').then(m => m.CURSOS_ROUTES)
      },
      {
        path: 'matriculas',
        loadChildren: () => import('./features/matriculas/matriculas.routes').then(m => m.MATRICULAS_ROUTES)
      },
      {
        path: 'presencas',
        loadChildren: () => import('./features/presencas/presencas.routes').then(m => m.PRESENCAS_ROUTES)
      },
      {
        path: 'relatorios',
        loadChildren: () => import('./features/relatorios/relatorios.routes').then(m => m.RELATORIOS_ROUTES)
      },
      {
        path: 'entrevistas',
        loadChildren: () => import('./features/entrevistas/entrevistas.routes').then(m => m.ENTREVISTAS_ROUTES)
      },
      {
        path: 'voluntariado',
        loadChildren: () => import('./features/voluntariado/voluntariado.routes').then(m => m.VOLUNTARIADO_ROUTES)
      },
      {
        path: 'administracao',
        loadChildren: () => import('./features/administracao/administracao.routes').then(m => m.ADMINISTRACAO_ROUTES)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];