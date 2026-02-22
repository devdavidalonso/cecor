// src/app/features/student-portal/components/student-dashboard/student-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

import { StudentPortalService, StudentDashboard } from '../../../../core/services/student-portal.service';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSnackBarModule,
    SkeletonComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="header">
        <div class="welcome">
          <h1>👋 Olá, {{ dashboard?.student?.name?.split(' ')?.[0] || 'Aluno' }}!</h1>
          <p>Bem-vindo ao seu portal do aluno CECOR</p>
        </div>
        <div class="date">
          {{ today | date:'fullDate' }}
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <app-skeleton type="dashboard"></app-skeleton>
      </div>

      <!-- Content -->
      <div class="content" *ngIf="!isLoading && dashboard">
        <!-- Alerts Section -->
        <div class="alerts-section" *ngIf="dashboard.alerts.length > 0">
          <mat-card *ngFor="let alert of dashboard.alerts" 
                    class="alert-card"
                    [class]="'severity-' + alert.severity">
            <mat-card-content>
              <div class="alert-content">
                <mat-icon>{{ getAlertIcon(alert.type) }}</mat-icon>
                <div class="alert-text">
                  <h3>{{ alert.title }}</h3>
                  <p>{{ alert.description }}</p>
                </div>
              </div>
              <button mat-button 
                      color="primary"
                      [routerLink]="alert.actionUrl">
                Ver Detalhes
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Today's Sessions -->
        <div class="section">
          <h2>📅 Aulas de Hoje</h2>
          <div class="sessions-list" *ngIf="dashboard.todaySessions.length > 0">
            <mat-card *ngFor="let session of dashboard.todaySessions" class="session-card">
              <mat-card-header>
                <mat-card-title>{{ session.courseName }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-icon>schedule</mat-icon>
                  {{ session.startTime }} - {{ session.endTime }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="session-info">
                  <span>
                    <mat-icon>place</mat-icon>
                    {{ session.location || 'Local não definido' }}
                  </span>
                  <span>
                    <mat-icon>person</mat-icon>
                    {{ session.teacherName || 'Professor não definido' }}
                  </span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button 
                        color="primary"
                        [disabled]="session.hasAttendance">
                  <mat-icon>check_circle</mat-icon>
                  {{ session.hasAttendance ? 'Presença Registrada' : 'Aguardando Chamada' }}
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
          <div class="empty-state" *ngIf="dashboard.todaySessions.length === 0">
            <mat-icon>event_available</mat-icon>
            <p>Não há aulas agendadas para hoje.</p>
            <p class="subtitle">Aproveite o descanso! 😊</p>
          </div>
        </div>

        <!-- My Courses -->
        <div class="section">
          <div class="section-header">
            <h2>📚 Meus Cursos</h2>
            <button mat-button color="primary" routerLink="/student/courses">
              Ver Todos
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
          <div class="courses-grid">
            <mat-card *ngFor="let course of dashboard.courses.slice(0, 3)" 
                      class="course-card"
                      [routerLink]="['/student/courses', course.id, 'attendance']">
              <mat-card-header>
                <mat-card-title>{{ course.name }}</mat-card-title>
                <mat-card-subtitle>Turma {{ course.classCode }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="attendance-section">
                  <div class="attendance-header">
                    <span>Frequência</span>
                    <span class="percentage" [style.color]="getAttendanceColor(course.attendancePercent)">
                      {{ course.attendancePercent | number:'1.0-0' }}%
                    </span>
                  </div>
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="course.attendancePercent"
                    [color]="course.attendancePercent >= 75 ? 'primary' : 'warn'">
                  </mat-progress-bar>
                  <p class="attendance-detail">
                    {{ course.attendedSessions }} de {{ course.totalSessions }} aulas
                  </p>
                </div>
                <div class="course-meta">
                  <mat-chip [color]="course.attendancePercent >= 75 ? 'accent' : 'warn'">
                    {{ getAttendanceLabel(course.attendancePercent) }}
                  </mat-chip>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-section">
          <mat-card class="stat-card">
            <mat-icon>school</mat-icon>
            <div class="stat-value">{{ dashboard.stats.totalCourses }}</div>
            <div class="stat-label">Cursos Matriculados</div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>trending_up</mat-icon>
            <div class="stat-value">{{ dashboard.stats.averageAttendance | number:'1.0-0' }}%</div>
            <div class="stat-label">Frequência Média</div>
          </mat-card>
          <mat-card class="stat-card">
            <mat-icon>notification_important</mat-icon>
            <div class="stat-value">{{ dashboard.stats.totalIncidents }}</div>
            <div class="stat-label">Ocorrências</div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .welcome h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 500;
      }

      .welcome p {
        margin: 4px 0 0 0;
        color: #666;
      }

      .date {
        color: #666;
        font-size: 14px;
      }
    }

    .loading-state {
      text-align: center;
      padding: 48px;
    }

    .loading-state p {
      margin-top: 16px;
      color: #666;
    }

    .alerts-section {
      margin-bottom: 24px;
    }

    .alert-card {
      margin-bottom: 12px;
    }

    .alert-card.severity-high {
      border-left: 4px solid #f44336;
      background-color: #ffebee;
    }

    .alert-card.severity-medium {
      border-left: 4px solid #ff9800;
      background-color: #fff3e0;
    }

    .alert-card.severity-low {
      border-left: 4px solid #2196f3;
      background-color: #e3f2fd;
    }

    .alert-card mat-card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .alert-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .alert-content mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .alert-text h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
    }

    .alert-text p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .section {
      margin-bottom: 32px;
    }

    .section h2 {
      font-size: 20px;
      font-weight: 500;
      margin: 0 0 16px 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h2 {
      margin: 0;
    }

    .sessions-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
    }

    .session-card mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .session-card mat-card-subtitle mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .session-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .session-info span {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .session-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .session-card mat-card-actions button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #4caf50;
      margin-bottom: 16px;
    }

    .empty-state p {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .empty-state .subtitle {
      margin-top: 8px;
      color: #666;
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .course-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .course-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .attendance-section {
      margin-bottom: 16px;
    }

    .attendance-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .attendance-header .percentage {
      font-weight: bold;
      font-size: 18px;
    }

    .attendance-detail {
      margin: 8px 0 0 0;
      font-size: 12px;
      color: #666;
    }

    .course-meta {
      display: flex;
      gap: 8px;
    }

    .stats-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      text-align: center;
    }

    .stat-card mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #006aac;
      margin-bottom: 12px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .header .welcome h1 {
        font-size: 22px;
      }

      .sessions-list,
      .courses-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  private studentService = inject(StudentPortalService);
  private snackBar = inject(MatSnackBar);

  dashboard: StudentDashboard | null = null;
  isLoading = true;
  today = new Date();

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    
    this.studentService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erro ao carregar dashboard:', err);

        // Ambiente sem dados iniciais do aluno: exibir tela vazia em vez de erro crítico.
        this.dashboard = {
          student: {
            id: 0,
            name: 'Aluno',
            email: '',
            phone: ''
          },
          todaySessions: [],
          courses: [],
          alerts: [],
          stats: {
            totalCourses: 0,
            averageAttendance: 0,
            totalIncidents: 0
          }
        };

        if (err.status === 404) {
          this.snackBar.open('Dashboard do aluno ainda sem dados para este usuário.', 'Fechar', {
            duration: 4000
          });
        } else {
          this.snackBar.open('Erro ao carregar dashboard. Tente novamente.', 'Fechar', {
            duration: 5000
          });
        }

        this.isLoading = false;
      }
    });
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'low_attendance': 'warning',
      'incident': 'notification_important',
      'info': 'info'
    };
    return icons[type] || 'info';
  }

  getAttendanceColor(percent: number): string {
    return this.studentService.getAttendanceColor(percent);
  }

  getAttendanceLabel(percent: number): string {
    return this.studentService.getAttendanceLabel(percent);
  }
}
