// src/app/features/attendance/attendance.routes.ts
import { Routes } from '@angular/router';
import { AttendanceRegistrationComponent } from './components/attendance-registration.component';
import { AttendanceReportComponent } from './components/attendance-report.component';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    component: AttendanceRegistrationComponent,
    title: 'Attendance Registration'
  },
  {
    path: 'report',
    component: AttendanceReportComponent,
    title: 'Attendance Report'
  }
];