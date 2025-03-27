// src/app/features/voluntariado/voluntariado.routes.ts
import { Routes } from '@angular/router';
import { VoluntariosListComponent } from './components/voluntarios-list.component';
import { VoluntarioFormComponent } from './components/voluntario-form.component';
import { VoluntarioDetalhesComponent } from './components/voluntario-detalhes.component';

export const VOLUNTARIADO_ROUTES: Routes = [
  {
    path: '',
    component: VoluntariosListComponent,
    title: 'Voluntários'
  },
  {
    path: 'novo',
    component: VoluntarioFormComponent,
    title: 'Novo Voluntário'
  },
  {
    path: ':id',
    component: VoluntarioDetalhesComponent,
    title: 'Detalhes do Voluntário'
  }
];