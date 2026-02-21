import { Routes } from '@angular/router';

export const CLASS_SESSIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/class-session-manager.component').then(m => m.ClassSessionManagerComponent),
    title: 'Class Sessions Manager'
  }
];
