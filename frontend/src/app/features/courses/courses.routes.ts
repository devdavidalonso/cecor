// src/app/features/courses/courses.routes.ts
import { Routes } from '@angular/router';
import { CoursesListComponent } from './components/courses-list.component';
import { CourseFormComponent } from './components/course-form.component';
import { CourseDetailsComponent } from './components/course-details.component';

export const COURSES_ROUTES: Routes = [
  {
    path: '',
    component: CoursesListComponent,
    title: 'Courses'
  },
  {
    path: 'new',
    component: CourseFormComponent,
    title: 'New Course'
  },
  {
    path: ':id',
    component: CourseDetailsComponent,
    title: 'Course Details'
  }
];