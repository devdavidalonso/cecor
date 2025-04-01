// src/app/features/enrollments/enrollments.routes.ts
import { Routes } from '@angular/router';
import { EnrollmentsListComponent } from './components/enrollments-list.component';
import { EnrollmentFormComponent } from './components/enrollment-form.component';
import { EnrollmentDetailsComponent } from './components/enrollment-details.component';

export const ENROLLMENTS_ROUTES: Routes = [
  {
    path: '',
    component: EnrollmentsListComponent,
    title: 'Enrollments'
  },
  {
    path: 'new',
    component: EnrollmentFormComponent,
    title: 'New Enrollment'
  },
  {
    path: ':id',
    component: EnrollmentDetailsComponent,
    title: 'Enrollment Details'
  }
];