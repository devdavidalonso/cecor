// src/app/features/alunos/alunos.routes.ts
import { Routes } from '@angular/router';
import { AlunosListComponent } from './components/alunos-list.component';
import { AlunoFormComponent } from './components/aluno-form.component';
import { AlunoDetalhesComponent } from './components/aluno-detalhes.component';

export const ALUNOS_ROUTES: Routes = [
  {
    path: '',
    component: AlunosListComponent,
    title: 'Alunos'
  },
  {
    path: 'novo',
    component: AlunoFormComponent,
    title: 'Novo Aluno'
  },
  {
    path: ':id',
    component: AlunoDetalhesComponent,
    title: 'Detalhes do Aluno'
  }
];