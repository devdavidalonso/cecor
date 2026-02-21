import { Routes } from '@angular/router';
import { TeachersListComponent } from './components/teachers-list.component';
import { TeacherFormComponent } from './components/teacher-form.component';

export const TEACHERS_ROUTES: Routes = [
  {
    path: '',
    component: TeachersListComponent
  },
  {
    path: 'new',
    component: TeacherFormComponent
  },
  {
    path: ':id',
    component: TeacherFormComponent
  }
];
