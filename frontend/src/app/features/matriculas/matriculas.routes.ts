// src/app/features/matriculas/matriculas.routes.ts
import { Routes } from '@angular/router';
import { MatriculasListComponent } from './components/matriculas-list.component';
import { MatriculaFormComponent } from './components/matricula-form.component';
import { MatriculaDetalhesComponent } from './components/matricula-detalhes.component';

export const MATRICULAS_ROUTES: Routes = [
  {
    path: '',
    component: MatriculasListComponent,
    title: 'Matrículas'
  },
  {
    path: 'nova',
    component: MatriculaFormComponent,
    title: 'New Enrollment'
  },
  {
    path: ':id',
    component: MatriculaDetalhesComponent,
    title: 'Detalhes da Matrícula'
  }
];