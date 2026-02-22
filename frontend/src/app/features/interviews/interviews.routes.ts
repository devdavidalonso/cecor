// src/app/features/interviews/interviews.routes.ts
import { Routes } from '@angular/router';
import { AdminGuard } from '../../core/guards/admin.guard';
import { InterviewsListComponent } from './components/interviews-list.component';
import { FormBuilderComponent } from './components/form-builder.component';
import { InterviewFormComponent } from './components/interview-form.component';
import { InterviewDetailComponent } from './components/interview-detail.component';
import { InterviewDashboardComponent } from './components/interview-dashboard.component';
import { InterviewReportsComponent } from './components/interview-reports.component';

export const INTERVIEWS_ROUTES: Routes = [
  {
    path: '',
    component: InterviewsListComponent,
    title: 'Formulários de Entrevista',
    canActivate: [AdminGuard]
  },
  {
    path: 'dashboard',
    component: InterviewDashboardComponent,
    title: 'Dashboard de Entrevistas',
    canActivate: [AdminGuard]
  },
  {
    path: 'new',
    component: FormBuilderComponent,
    title: 'Novo Formulário',
    canActivate: [AdminGuard]
  },
  {
    path: 'edit/:id',
    component: FormBuilderComponent,
    title: 'Editar Formulário',
    canActivate: [AdminGuard]
  },
  {
    // Rota para responder entrevista (usada no wizard de matrícula) - acessível por qualquer usuário autenticado
    path: 'respond/:studentId',
    component: InterviewFormComponent,
    title: 'Entrevista Socioeducacional'
  },
  {
    // Rota para visualizar resposta - acessível por admin e professores
    path: 'response/:id',
    component: InterviewDetailComponent,
    title: 'Resposta da Entrevista'
  },
  {
    path: 'reports',
    component: InterviewReportsComponent,
    title: 'Relatórios de Entrevistas',
    canActivate: [AdminGuard]
  }
];
