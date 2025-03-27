// src/app/features/presencas/presencas.routes.ts
import { Routes } from '@angular/router';
import { RegistroPresencaComponent } from './components/registro-presenca.component';
import { RelatorioPresencaComponent } from './components/relatorio-presenca.component';

export const PRESENCAS_ROUTES: Routes = [
  {
    path: '',
    component: RegistroPresencaComponent,
    title: 'Registro de Presença'
  },
  {
    path: 'relatorio',
    component: RelatorioPresencaComponent,
    title: 'Relatório de Presenças'
  }
];