import { Routes } from '@angular/router';
import { StudentListComponent } from './student-list/student-list.component';
import { StudentFormComponent } from './student-form/student-form.component';
import { StudentDetailComponent } from './student-detail/student-detail.component';

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    component: StudentListComponent
  },
  {
    path: 'new',
    component: StudentFormComponent
  },
  {
    path: ':id',
    component: StudentDetailComponent
  },
  {
    path: ':id/edit',
    component: StudentFormComponent
  }
];