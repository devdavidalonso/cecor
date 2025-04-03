// src/app/features/relatorios/relatorios.routes.ts
import { Routes } from '@angular/router';
import { RelatoriosDashboardComponent } from './components/relatorios-dashboard.component';
import { RelatorioFrequenciaComponent } from './components/relatorio-frequencia.component';
import { RelatorioDesempenhoComponent } from './components/relatorio-desempenho.component';

export const RELATORIOS_ROUTES: Routes = [
  {
    path: '',
    component: RelatoriosDashboardComponent,
    title: 'Dashboard de Reports'
  },
  {
    path: 'frequencia',
    component: RelatorioFrequenciaComponent,
    title: 'Relatório de Frequência'
  },
  {
    path: 'desempenho',
    component: RelatorioDesempenhoComponent,
    title: 'Relatório de Desempenho'
  }
];