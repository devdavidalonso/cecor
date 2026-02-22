// src/app/features/student-portal/components/my-courses/my-courses.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { StudentPortalService, StudentCourse } from '../../../../core/services/student-portal.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="courses-container">
      <div class="header">
        <button mat-button routerLink="/student/dashboard">
          <mat-icon>arrow_back</mat-icon>
          Voltar
        </button>
        <h1>📚 Meus Cursos</h1>
      </div>

      <div class="courses-grid" *ngIf="courses.length > 0">
        <mat-card *ngFor="let course of courses" class="course-card">
          <mat-card-header>
            <mat-card-title>{{ course.name }}</mat-card-title>
            <mat-card-subtitle>
              Turma {{ course.classCode }} | {{ course.schedule }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="course-info">
              <p><mat-icon>person</mat-icon> {{ course.teacherName }}</p>
              <p><mat-icon>place</mat-icon> {{ course.location }}</p>
            </div>
            <div class="attendance-section">
              <div class="attendance-header">
                <span>Frequência</span>
                <span [style.color]="getAttendanceColor(course.attendancePercent)">
                  {{ course.attendancePercent | number:'1.0-0' }}%
                </span>
              </div>
              <mat-progress-bar 
                mode="determinate" 
                [value]="course.attendancePercent"
                [color]="course.attendancePercent >= 75 ? 'primary' : 'warn'">
              </mat-progress-bar>
              <p>{{ course.attendedSessions }} de {{ course.totalSessions }} aulas</p>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" [routerLink]="['/student/courses', course.id, 'attendance']">
              <mat-icon>visibility</mat-icon>
              Ver Frequência
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div class="empty-state" *ngIf="courses.length === 0">
        <mat-icon>school</mat-icon>
        <p>Você não está matriculado em nenhum curso.</p>
      </div>
    </div>
  `,
  styles: [`
    .courses-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
    .course-card { cursor: pointer; }
    .course-info p { display: flex; align-items: center; gap: 8px; color: #666; }
    .attendance-section { margin-top: 16px; }
    .attendance-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .empty-state { text-align: center; padding: 48px; }
  `]
})
export class MyCoursesComponent implements OnInit {
  private studentService = inject(StudentPortalService);
  courses: StudentCourse[] = [];

  ngOnInit(): void {
    this.studentService.getMyCourses().subscribe({
      next: (data) => this.courses = data,
      error: (err) => console.error('Erro ao carregar cursos:', err)
    });
  }

  getAttendanceColor(percent: number): string {
    return this.studentService.getAttendanceColor(percent);
  }
}
