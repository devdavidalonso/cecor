import { Routes } from '@angular/router';

export const LOCATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/location-form.component').then(m => m.LocationFormComponent),
    title: 'Locations Management'
  },
  {
    path: 'new',
    loadComponent: () => import('./components/location-form.component').then(m => m.LocationFormComponent),
    title: 'New Location'
  }
];
