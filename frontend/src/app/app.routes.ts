// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from '../app/core/guards/admin.guard';
import { ProfessorGuard } from '../app/core/guards/professor.guard';

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
      // Dashboard principal
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      
      // Módulo de alunos
      {
        path: 'alunos',
        loadChildren: () => import('./features/alunos/alunos.routes').then(m => m.ALUNOS_ROUTES)
      },
      
      // Módulo de cursos
      {
        path: 'cursos',
        loadChildren: () => import('./features/cursos/cursos.routes').then(m => m.CURSOS_ROUTES)
      },
      
      // Módulo de matrículas
      {
        path: 'matriculas',
        loadChildren: () => import('./features/matriculas/matriculas.routes').then(m => m.MATRICULAS_ROUTES)
      },
      
      // Módulo de presenças
      {
        path: 'presencas',
        canActivate: [ProfessorGuard],
        loadChildren: () => import('./features/presencas/presencas.routes').then(m => m.PRESENCAS_ROUTES)
      },
      
      // Módulo de relatórios
      {
        path: 'relatorios',
        loadChildren: () => import('./features/relatorios/relatorios.routes').then(m => m.RELATORIOS_ROUTES)
      },
      
      // Módulo de entrevistas
      {
        path: 'entrevistas',
        loadChildren: () => import('./features/entrevistas/entrevistas.routes').then(m => m.ENTREVISTAS_ROUTES)
      },
      
      // Módulo de voluntariado
      {
        path: 'voluntariado',
        loadChildren: () => import('./features/voluntariado/voluntariado.routes').then(m => m.VOLUNTARIADO_ROUTES)
      },
      
      // Módulo de administração (apenas para administradores)
      {
        path: 'administracao',
        canActivate: [AdminGuard],
        loadChildren: () => import('./features/administracao/administracao.routes').then(m => m.ADMINISTRACAO_ROUTES)
      },
      
      // Perfil do usuário
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent)
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];