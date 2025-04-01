// src/app/features/students/students.routes.ts

import { Routes } from '@angular/router';
import { StudentsListComponent } from './components/students-list.component';
import { StudentFormComponent } from './components/student-form.component';
import { StudentDetailsComponent } from './components/student-details.component';

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    component: StudentsListComponent,
    title: 'Students'
  },
  {
    path: 'new',
    component: StudentFormComponent,
    title: 'New Student'
  },
  {
    path: 'edit/:id',
    component: StudentFormComponent,
    title: 'Edit Student'
  },
  {
    path: ':id',
    component: StudentDetailsComponent,
    title: 'Student Details'
  }
];