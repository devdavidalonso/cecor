// src/app/features/reports/reports.routes.ts
import { Routes } from '@angular/router';
import { ReportsDashboardComponent } from './components/reports-dashboard.component';
import { AttendanceReportComponent } from './components/attendance-report.component';
import { PerformanceReportComponent } from './components/performance-report.component';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    component: ReportsDashboardComponent,
    title: 'Reports Dashboard'
  },
  {
    path: 'attendance',
    component: AttendanceReportComponent,
    title: 'Attendance Report'
  },
  {
    path: 'performance',
    component: PerformanceReportComponent,
    title: 'Performance Report'
  }
];