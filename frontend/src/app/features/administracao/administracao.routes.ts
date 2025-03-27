// src/app/features/administracao/administracao.routes.ts
import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { UsuariosListComponent } from './components/usuarios-list.component';
import { ConfiguracoesComponent } from './components/configuracoes.component';

export const ADMINISTRACAO_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    title: 'Painel Administrativo'
  },
  {
    path: 'usuarios',
    component: UsuariosListComponent,
    title: 'Usuários'
  },
  {
    path: 'configuracoes',
    component: ConfiguracoesComponent,
    title: 'Configurações'
  }
];