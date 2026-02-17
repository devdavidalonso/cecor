// src/app/features/administration/administration.routes.ts
import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { UsersListComponent } from './components/users-list.component';
import { SettingsComponent } from './components/settings.component';

export const ADMINISTRATION_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    title: 'Painel Administrativo'
  },
  {
    path: 'users',
    component: UsersListComponent,
    title: 'Usuários'
  },
  {
    path: 'settings',
    component: SettingsComponent,
    title: 'Configurações'
  }
];
