// src/app/features/entrevistas/entrevistas.routes.ts
import { Routes } from '@angular/router';
import { EntrevistasListComponent } from './components/entrevistas-list.component';
import { EntrevistaFormComponent } from './components/entrevista-form.component';
import { EntrevistaDetalhesComponent } from './components/entrevista-detalhes.component';

export const ENTREVISTAS_ROUTES: Routes = [
  {
    path: '',
    component: EntrevistasListComponent,
    title: 'Entrevistas'
  },
  {
    path: 'nova',
    component: EntrevistaFormComponent,
    title: 'Nova Entrevista'
  },
  {
    path: ':id',
    component: EntrevistaDetalhesComponent,
    title: 'Detalhes da Entrevista'
  }
];