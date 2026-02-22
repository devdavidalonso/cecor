// src/app/features/student-portal/components/course-attendance/course-attendance.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { StudentPortalService, CourseAttendance } from '../../../../core/services/student-portal.service';

@Component({
  selector: 'app-course-attendance',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="attendance-container">
      <div class="header">
        <button mat-button [routerLink]="['/student/courses']">
          <mat-icon>arrow_back</mat-icon>
          Voltar
        </button>
        <h1>📊 Minha Frequência</h1>
      </div>

      <mat-card class="summary-card" *ngIf="attendance">
        <mat-card-content>
          <h2>{{ attendance.courseName }}</h2>
          <div class="stats">
            <div class="stat">
              <span class="value" [style.color]="getAttendanceColor(attendance.attendancePercent)">
                {{ attendance.attendancePercent | number:'1.0-0' }}%
              </span>
              <span class="label">Frequência</span>
            </div>
            <div class="stat">
              <span class="value">{{ attendance.presentCount }}</span>
              <span class="label">Presenças</span>
            </div>
            <div class="stat">
              <span class="value">{{ attendance.absentCount }}</span>
              <span class="label">Faltas</span>
            </div>
            <div class="stat">
              <span class="value">{{ attendance.justifiedCount }}</span>
              <span class="label">Justificadas</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <table mat-table [dataSource]="attendance?.records || []" class="attendance-table" *ngIf="attendance">
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Data</th>
          <td mat-cell *matCellDef="let record">{{ record.date }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Status</th>
          <td mat-cell *matCellDef="let record">
            <mat-chip [color]="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="topic">
          <th mat-header-cell *matHeaderCellDef>Tema</th>
          <td mat-cell *matCellDef="let record">{{ record.topic || '-' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="['date', 'status', 'topic']"></tr>
        <tr mat-row *matRowDef="let row; columns: ['date', 'status', 'topic'];"></tr>
      </table>
    </div>
  `,
  styles: [`
    .attendance-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .summary-card { margin-bottom: 24px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 16px; }
    .stat { text-align: center; }
    .stat .value { font-size: 32px; font-weight: bold; display: block; }
    .stat .label { color: #666; font-size: 14px; }
    .attendance-table { width: 100%; }
  `]
})
export class CourseAttendanceComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentPortalService);
  
  attendance: CourseAttendance | null = null;
  courseId = 0;

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadAttendance();
  }

  loadAttendance(): void {
    this.studentService.getCourseAttendance(this.courseId).subscribe({
      next: (data) => this.attendance = data,
      error: (err) => console.error('Erro ao carregar frequência:', err)
    });
  }

  getAttendanceColor(percent: number): string {
    return this.studentService.getAttendanceColor(percent);
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'present': 'primary',
      'absent': 'warn',
      'justified': 'accent'
    };
    return colors[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'present': 'Presente',
      'absent': 'Ausente',
      'justified': 'Justificada',
      'not_recorded': 'Não Registrada'
    };
    return labels[status] || status;
  }
}
