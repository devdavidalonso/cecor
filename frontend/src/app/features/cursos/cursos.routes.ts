// src/app/features/cursos/cursos.routes.ts
import { Routes } from '@angular/router';
import { CursosListComponent } from './components/cursos-list.component';
import { CursoFormComponent } from './components/curso-form.component';
import { CursoDetalhesComponent } from './components/curso-detalhes.component';

export const CURSOS_ROUTES: Routes = [
  {
    path: '',
    component: CursosListComponent,
    title: 'Cursos'
  },
  {
    path: 'novo',
    component: CursoFormComponent,
    title: 'Novo Curso'
  },
  {
    path: ':id',
    component: CursoDetalhesComponent,
    title: 'Detalhes do Curso'
  }
];