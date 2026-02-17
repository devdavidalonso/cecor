// src/app/features/interviews/interviews.routes.ts
import { Routes } from '@angular/router';
import { InterviewsListComponent } from './components/interviews-list.component';
import { InterviewFormComponent } from './components/interview-form.component';
import { InterviewDetailComponent } from './components/interview-detail.component';

export const INTERVIEWS_ROUTES: Routes = [
  {
    path: '',
    component: InterviewsListComponent,
    title: 'Entrevistas'
  },
  {
    path: 'new',
    component: InterviewFormComponent,
    title: 'Nova Entrevista'
  },
  {
    path: ':id',
    component: InterviewDetailComponent,
    title: 'Detalhes da Entrevista'
  }
];
