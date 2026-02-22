// src/app/features/teacher-portal/components/course-students/course-students.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';

import { TeacherPortalService, CourseStudent } from '../../../../core/services/teacher-portal.service';

@Component({
  selector: 'app-course-students',
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
    MatTableModule
  ],
  template: `
    <div class="students-container">
      <div class="header">
        <button mat-icon-button [routerLink]="['/teacher/courses']">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>Alunos da Turma</h1>
          <p>Gerencie os alunos matriculados</p>
        </div>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando alunos...</p>
      </div>

      <div class="content" *ngIf="!isLoading">
        <!-- Stats Card -->
        <mat-card class="stats-card" *ngIf="students.length > 0">
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ students.length }}</span>
                <span class="stat-label">Total de Alunos</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getAverageAttendance() }}%</span>
                <span class="stat-label">Frequência Média</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getLowAttendanceCount() }}</span>
                <span class="stat-label">Baixa Frequência</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Students Table -->
        <mat-card *ngIf="students.length > 0; else noStudents">
          <mat-card-content>
            <table mat-table [dataSource]="students" class="students-table">
              
              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Aluno</th>
                <td mat-cell *matCellDef="let student">
                  <div class="student-info">
                    <div class="student-avatar">{{ getInitials(student.name) }}</div>
                    <div class="student-details">
                      <strong>{{ student.name }}</strong>
                      <span class="student-email">{{ student.email }}</span>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Attendance Column -->
              <ng-container matColumnDef="attendance">
                <th mat-header-cell *matHeaderCellDef>Frequência</th>
                <td mat-cell *matCellDef="let student">
                  <div class="attendance-indicator" [class]="getAttendanceClass(student.attendancePercentage)">
                    <mat-icon>{{ getAttendanceIcon(student.attendancePercentage) }}</mat-icon>
                    <span>{{ student.attendancePercentage }}%</span>
                  </div>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let student">
                  <mat-chip [class]="'status-' + student.status">
                    {{ student.status === 'active' ? 'Ativo' : 'Inativo' }}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Google Column -->
              <ng-container matColumnDef="google">
                <th mat-header-cell *matHeaderCellDef>Google Classroom</th>
                <td mat-cell *matCellDef="let student">
                  <mat-chip *ngIf="student.googleInvitationStatus === 'accepted'" class="google-accepted">
                    <mat-icon>check_circle</mat-icon>
                    Sincronizado
                  </mat-chip>
                  <mat-chip *ngIf="student.googleInvitationStatus === 'pending'" class="google-pending">
                    <mat-icon>schedule</mat-icon>
                    Pendente
                  </mat-chip>
                  <button 
                    mat-button 
                    *ngIf="student.googleInvitationStatus === 'not_sent'"
                    (click)="sendInvitation(student)"
                  >
                    <mat-icon>send</mat-icon>
                    Enviar Convite
                  </button>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Ações</th>
                <td mat-cell *matCellDef="let student">
                  <button mat-icon-button [routerLink]="['/teacher/students', student.id]">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="registerIncident(student)">
                    <mat-icon>report_problem</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <ng-template #noStudents>
          <mat-card class="empty-card">
            <mat-card-content>
              <mat-icon class="empty-icon">people_outline</mat-icon>
              <p>Nenhum aluno matriculado nesta turma.</p>
            </mat-card-content>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .students-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;

      .header-content {
        h1 {
          font-size: 24px;
          font-weight: 500;
          margin: 0;
          color: #333;
        }

        p {
          color: #666;
          margin: 4px 0 0 0;
        }
      }
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

    .stats-card {
      margin-bottom: 24px;

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 24px;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .stat-value {
          font-size: 32px;
          font-weight: 600;
          color: #006aac;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-top: 4px;
        }
      }
    }

    .students-table {
      width: 100%;

      .student-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .student-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #006aac, #0083c0);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }

        .student-details {
          display: flex;
          flex-direction: column;

          strong {
            color: #333;
          }

          .student-email {
            font-size: 12px;
            color: #666;
          }
        }
      }

      .attendance-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 16px;
        font-weight: 500;

        &.attendance-good {
          background-color: #e8f5e9;
          color: #2e7d32;
        }

        &.attendance-warning {
          background-color: #fff3e0;
          color: #ef6c00;
        }

        &.attendance-danger {
          background-color: #ffebee;
          color: #c62828;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .status-active {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .status-inactive {
        background-color: #eeeeee;
        color: #666;
      }

      .google-accepted {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .google-pending {
        background-color: #fff3e0;
        color: #ef6c00;
      }
    }

    .empty-card {
      text-align: center;
      padding: 48px;

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
        margin-bottom: 16px;
      }

      p {
        color: #666;
        font-size: 16px;
      }
    }
  `]
})
export class CourseStudentsComponent implements OnInit {
  private teacherService = inject(TeacherPortalService);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  students: CourseStudent[] = [];
  courseId: number = 0;
  isLoading = true;
  displayedColumns: string[] = ['name', 'attendance', 'status', 'google', 'actions'];

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    
    this.teacherService.getCourseStudents(this.courseId).subscribe({
      next: (data) => {
        this.students = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar alunos:', err);
        this.snackBar.open('Erro ao carregar alunos.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAttendanceClass(percentage: number): string {
    if (percentage >= 85) return 'attendance-good';
    if (percentage >= 75) return 'attendance-warning';
    return 'attendance-danger';
  }

  getAttendanceIcon(percentage: number): string {
    if (percentage >= 85) return 'check_circle';
    if (percentage >= 75) return 'warning';
    return 'error';
  }

  getAverageAttendance(): number {
    if (this.students.length === 0) return 0;
    const total = this.students.reduce((sum, s) => sum + s.attendancePercentage, 0);
    return Math.round(total / this.students.length);
  }

  getLowAttendanceCount(): number {
    return this.students.filter(s => s.attendancePercentage < 75).length;
  }

  sendInvitation(student: CourseStudent): void {
    this.teacherService.sendStudentInvitation(this.courseId, student.id).subscribe({
      next: () => {
        this.snackBar.open('Convite enviado com sucesso!', 'Fechar', { duration: 3000 });
        student.googleInvitationStatus = 'pending';
      },
      error: (err) => {
        console.error('Erro ao enviar convite:', err);
        this.snackBar.open('Erro ao enviar convite.', 'Fechar', { duration: 5000 });
      }
    });
  }

  registerIncident(student: CourseStudent): void {
    // TODO: Navigate to incident form with student pre-selected
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 3000 });
  }
}
