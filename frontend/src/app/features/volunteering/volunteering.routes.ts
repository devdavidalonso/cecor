// src/app/features/volunteering/volunteering.routes.ts
import { Routes } from '@angular/router';
import { VolunteersListComponent } from './components/volunteers-list.component';
import { VolunteerFormComponent } from './components/volunteer-form.component';
import { VolunteerDetailComponent } from './components/volunteer-detail.component';

export const VOLUNTEERING_ROUTES: Routes = [
  {
    path: '',
    component: VolunteersListComponent,
    title: 'Voluntariado'
  },
  {
    path: 'new',
    component: VolunteerFormComponent,
    title: 'Novo Voluntário'
  },
  {
    path: ':id',
    component: VolunteerDetailComponent,
    title: 'Detalhes do Voluntário'
  }
];
