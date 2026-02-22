// src/app/features/teacher-portal/components/teacher-dashboard/teacher-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { TeacherPortalService, TeacherDashboard, TodaySession } from '../../../../core/services/teacher-portal.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="welcome-title">
            👋 {{ getGreeting() }}, {{ getFirstName() }}!
          </h1>
          <p class="welcome-subtitle">
            {{ currentDate | date:'fullDate':'':'pt-BR' }}
          </p>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando dashboard...</p>
      </div>

      <!-- Content -->
      <div class="dashboard-content" *ngIf="!isLoading && dashboard">
        
        <!-- Aulas de Hoje -->
        <section class="section">
          <h2 class="section-title">
            <mat-icon>today</mat-icon>
            Suas Aulas Hoje
          </h2>
          
          <div class="sessions-grid" *ngIf="dashboard.todaySessions?.length; else noSessions">
            <mat-card 
              *ngFor="let session of dashboard.todaySessions" 
              class="session-card"
              [class.attendance-recorded]="session.attendanceRecorded"
            >
              <mat-card-header>
                <mat-card-title>{{ session.courseName }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-icon>schedule</mat-icon> {{ session.startTime }} - {{ session.endTime }}
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <div class="session-details">
                  <div class="detail-item">
                    <mat-icon>place</mat-icon>
                    <span>{{ session.locationName || 'Local não definido' }}</span>
                  </div>
                  <div class="detail-item">
                    <mat-icon>people</mat-icon>
                    <span>{{ session.enrolledCount }} alunos matriculados</span>
                  </div>
                  <div class="detail-item" *ngIf="session.topic">
                    <mat-icon>menu_book</mat-icon>
                    <span>{{ session.topic }}</span>
                  </div>
                </div>

                <!-- Google Classroom Status -->
                <div class="google-status" *ngIf="session.googleClassroomId">
                  <mat-chip class="synced-chip">
                    <mat-icon>check_circle</mat-icon>
                    Sincronizado com Google Classroom
                  </mat-chip>
                </div>
                <div class="google-status" *ngIf="!session.googleClassroomId">
                  <mat-chip class="not-synced-chip">
                    <mat-icon>warning</mat-icon>
                    Turma não sincronizada
                  </mat-chip>
                </div>
              </mat-card-content>
              
              <mat-card-actions>
                <button 
                  mat-raised-button 
                  color="primary"
                  [routerLink]="['/teacher/attendance', session.id]"
                  *ngIf="!session.attendanceRecorded"
                >
                  <mat-icon>fact_check</mat-icon>
                  Fazer Chamada
                </button>
                <button 
                  mat-stroked-button
                  [routerLink]="['/teacher/attendance', session.id]"
                  *ngIf="session.attendanceRecorded"
                >
                  <mat-icon>check</mat-icon>
                  Chamada Realizada
                </button>
                
                <button 
                  mat-stroked-button
                  *ngIf="session.googleClassroomUrl"
                  (click)="openGoogleClassroom(session.googleClassroomUrl)"
                >
                  <mat-icon>school</mat-icon>
                  Abrir Classroom
                </button>
                
                <button 
                  mat-stroked-button
                  [routerLink]="['/teacher/courses', session.courseId, 'students']"
                >
                  <mat-icon>people</mat-icon>
                  Alunos
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
          
          <ng-template #noSessions>
            <mat-card class="empty-card">
              <mat-card-content>
                <mat-icon class="empty-icon">event_available</mat-icon>
                <p>Nenhuma aula prevista para hoje.</p>
                <p class="empty-subtitle">Aproveite para descansar ou planejar suas próximas aulas!</p>
              </mat-card-content>
            </mat-card>
          </ng-template>
        </section>

        <!-- Resumo e Alertas -->
        <div class="stats-alerts-grid">
          <!-- Estatísticas -->
          <section class="section">
            <h2 class="section-title">
              <mat-icon>analytics</mat-icon>
              Resumo da Semana
            </h2>
            
            <mat-card class="stats-card">
              <mat-card-content>
                <div class="stat-item">
                  <div class="stat-icon-wrapper students">
                    <mat-icon>people</mat-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ dashboard.weeklyStats?.totalStudents || 0 }}</span>
                    <span class="stat-label">Alunos ativos</span>
                  </div>
                </div>
                
                <mat-divider></mat-divider>
                
                <div class="stat-item">
                  <div class="stat-icon-wrapper attendance">
                    <mat-icon> trending_up</mat-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ dashboard.weeklyStats?.averageAttendance || 0 }}%</span>
                    <span class="stat-label">Frequência média</span>
                  </div>
                </div>
                
                <mat-divider></mat-divider>
                
                <div class="stat-item">
                  <div class="stat-icon-wrapper classes">
                    <mat-icon>school</mat-icon>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ dashboard.weeklyStats?.classesGiven || 0 }}</span>
                    <span class="stat-label">Aulas ministradas</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </section>

          <!-- Alertas -->
          <section class="section">
            <h2 class="section-title">
              <mat-icon>notifications</mat-icon>
              Alertas
            </h2>
            
            <mat-card class="alerts-card" *ngIf="dashboard.alerts?.length; else noAlerts">
              <mat-card-content>
                <div 
                  *ngFor="let alert of dashboard.alerts" 
                  class="alert-item"
                  [class]="'severity-' + alert.severity"
                >
                  <mat-icon>{{ getAlertIcon(alert.type) }}</mat-icon>
                  <div class="alert-content">
                    <strong>{{ alert.title }}</strong>
                    <p>{{ alert.description }}</p>
                  </div>
                  <button 
                    mat-button 
                    color="primary"
                    *ngIf="alert.actionUrl"
                    [routerLink]="alert.actionUrl"
                  >
                    Ver
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
            
            <ng-template #noAlerts>
              <mat-card class="empty-card">
                <mat-card-content>
                  <mat-icon class="empty-icon">check_circle</mat-icon>
                  <p>Nenhum alerta no momento.</p>
                  <p class="empty-subtitle">Tudo está em ordem!</p>
                </mat-card-content>
              </mat-card>
            </ng-template>
          </section>
        </div>

        <!-- Acesso Rápido -->
        <section class="section">
          <h2 class="section-title">
            <mat-icon>apps</mat-icon>
            Acesso Rápido
          </h2>
          
          <div class="quick-actions">
            <button mat-stroked-button [routerLink]="['/teacher/courses']">
              <mat-icon>menu_book</mat-icon>
              Minhas Turmas
            </button>
            <button mat-stroked-button [routerLink]="['/teacher/calendar']">
              <mat-icon>calendar_today</mat-icon>
              Calendário
            </button>
            <button mat-stroked-button [routerLink]="['/teacher/incidents']">
              <mat-icon>report_problem</mat-icon>
              Ocorrências
            </button>
            <button mat-stroked-button [routerLink]="['/teacher/profile']">
              <mat-icon>person</mat-icon>
              Meu Perfil
            </button>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 24px;
    }

    .welcome-title {
      font-size: 28px;
      font-weight: 500;
      color: #333;
      margin: 0 0 8px 0;
    }

    .welcome-subtitle {
      font-size: 16px;
      color: #666;
      margin: 0;
      text-transform: capitalize;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;
      
      p {
        margin-top: 16px;
        color: #666;
      }
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
      color: #333;
      margin: 0 0 16px 0;
      
      mat-icon {
        color: #006aac;
      }
    }

    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 16px;
    }

    .session-card {
      border-left: 4px solid #ff9800;
      
      &.attendance-recorded {
        border-left-color: #4caf50;
      }
      
      mat-card-header {
        padding-bottom: 8px;
      }
      
      mat-card-subtitle {
        display: flex;
        align-items: center;
        gap: 4px;
        
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }
    }

    .session-details {
      margin: 16px 0;
      
      .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        color: #666;
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #006aac;
        }
      }
    }

    .google-status {
      margin-top: 12px;
      
      .synced-chip {
        background-color: #e8f5e9;
        color: #2e7d32;
        
        mat-icon {
          color: #4caf50;
        }
      }
      
      .not-synced-chip {
        background-color: #fff3e0;
        color: #ef6c00;
        
        mat-icon {
          color: #ff9800;
        }
      }
    }

    mat-card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 16px 16px;
    }

    .stats-alerts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .stats-card {
      mat-card-content {
        padding: 16px;
      }
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      
      .stat-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.students {
          background-color: #e3f2fd;
          mat-icon { color: #006aac; }
        }
        
        &.attendance {
          background-color: #e8f5e9;
          mat-icon { color: #4caf50; }
        }
        
        &.classes {
          background-color: #fff3e0;
          mat-icon { color: #ff9800; }
        }
        
        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
      
      .stat-info {
        display: flex;
        flex-direction: column;
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }
        
        .stat-label {
          font-size: 14px;
          color: #666;
        }
      }
    }

    .alerts-card {
      .alert-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        
        &.severity-high {
          background-color: #ffebee;
          mat-icon { color: #f44336; }
        }
        
        &.severity-medium {
          background-color: #fff3e0;
          mat-icon { color: #ff9800; }
        }
        
        &.severity-low {
          background-color: #e3f2fd;
          mat-icon { color: #006aac; }
        }
        
        mat-icon {
          margin-top: 2px;
        }
        
        .alert-content {
          flex: 1;
          
          strong {
            display: block;
            margin-bottom: 4px;
            color: #333;
          }
          
          p {
            margin: 0;
            font-size: 14px;
            color: #666;
          }
        }
      }
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      
      button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
      }
    }

    .empty-card {
      text-align: center;
      padding: 32px;
      
      .empty-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #006aac;
        margin-bottom: 16px;
      }
      
      p {
        margin: 0 0 8px;
        color: #333;
        font-size: 16px;
      }
      
      .empty-subtitle {
        color: #666;
        font-size: 14px;
      }
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }
      
      .welcome-title {
        font-size: 22px;
      }
      
      .sessions-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-alerts-grid {
        grid-template-columns: 1fr;
      }
      
      .quick-actions {
        flex-direction: column;
        
        button {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  private teacherService = inject(TeacherPortalService);
  private snackBar = inject(MatSnackBar);
  
  dashboard: TeacherDashboard | null = null;
  isLoading = true;
  currentDate = new Date();

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    
    this.teacherService.getDashboard().subscribe({
      next: (data) => {
        this.dashboard = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
        this.snackBar.open('Erro ao carregar dashboard. Tente novamente.', 'Fechar', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  getFirstName(): string {
    if (this.dashboard?.teacher?.name) {
      return this.dashboard.teacher.name.split(' ')[0];
    }
    return 'Professor';
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'low_attendance': 'trending_down',
      'incident': 'report_problem',
      'meeting': 'event',
      'sync': 'sync_problem'
    };
    return icons[type] || 'notifications';
  }

  openGoogleClassroom(url: string): void {
    window.open(url, '_blank');
  }
}
