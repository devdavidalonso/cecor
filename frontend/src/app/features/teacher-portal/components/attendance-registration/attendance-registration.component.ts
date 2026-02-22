// src/app/features/teacher-portal/components/attendance-registration/attendance-registration.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { TeacherPortalService, CourseStudent } from '../../../../core/services/teacher-portal.service';

interface AttendanceRecord {
  studentId: number;
  enrollmentId: number;
  courseId: number;
  status: 'present' | 'absent' | 'justified';
  note: string;
}

@Component({
  selector: 'app-attendance-registration',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <div class="attendance-container">
      <!-- Header -->
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div class="header-content">
          <h1>Registrar Presença</h1>
          <p *ngIf="sessionInfo">{{ sessionInfo.courseName }} - {{ sessionInfo.date | date:'dd/MM/yyyy' }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando...</p>
      </div>

      <!-- Content -->
      <div class="content" *ngIf="!isLoading">
        <!-- Session Info Card -->
        <mat-card class="session-card" *ngIf="sessionInfo">
          <mat-card-content>
            <div class="session-details">
              <div class="detail-item">
                <mat-icon>schedule</mat-icon>
                <span>{{ sessionInfo.startTime }} - {{ sessionInfo.endTime }}</span>
              </div>
              <div class="detail-item" *ngIf="sessionInfo.locationName">
                <mat-icon>place</mat-icon>
                <span>{{ sessionInfo.locationName }}</span>
              </div>
              <div class="detail-item" *ngIf="sessionInfo.topic">
                <mat-icon>menu_book</mat-icon>
                <span>{{ sessionInfo.topic }}</span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <!-- Summary -->
            <div class="attendance-summary">
              <div class="summary-item">
                <span class="summary-value">{{ getPresentCount() }}</span>
                <span class="summary-label">Presentes</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ getAbsentCount() }}</span>
                <span class="summary-label">Ausentes</span>
              </div>
              <div class="summary-item">
                <span class="summary-value">{{ getJustifiedCount() }}</span>
                <span class="summary-label">Justificados</span>
              </div>
              <div class="summary-item total">
                <span class="summary-value">{{ students.length }}</span>
                <span class="summary-label">Total</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Bulk Actions -->
        <div class="bulk-actions">
          <button mat-stroked-button (click)="markAllPresent()">
            <mat-icon>done_all</mat-icon>
            Todos Presentes
          </button>
          <button mat-stroked-button (click)="markAllAbsent()">
            <mat-icon>clear_all</mat-icon>
            Todos Ausentes
          </button>
        </div>

        <!-- Students List -->
        <mat-card class="students-card">
          <mat-card-header>
            <mat-card-title>Lista de Alunos</mat-card-title>
            <mat-card-subtitle>Marque a presença de cada aluno</mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <div class="students-list">
              <div 
                *ngFor="let student of students; let i = index" 
                class="student-row"
                [class]="'status-' + getAttendanceStatus(student.id)"
              >
                <div class="student-info">
                  <div class="student-avatar">{{ getInitials(student.name) }}</div>
                  <div class="student-details">
                    <strong>{{ student.name }}</strong>
                    <div class="student-meta">
                      <span class="attendance-badge" [class]="'badge-' + getAttendanceClass(student.attendancePercentage)">
                        {{ student.attendancePercentage }}% freq
                      </span>
                    </div>
                  </div>
                </div>

                <div class="attendance-controls">
                  <!-- Status Buttons -->
                  <div class="status-buttons">
                    <button 
                      mat-icon-button 
                      class="status-btn present"
                      [class.active]="getAttendanceStatus(student.id) === 'present'"
                      (click)="setAttendanceStatus(student, 'present')"
                      matTooltip="Presente"
                    >
                      <mat-icon>check_circle</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      class="status-btn absent"
                      [class.active]="getAttendanceStatus(student.id) === 'absent'"
                      (click)="setAttendanceStatus(student, 'absent')"
                      matTooltip="Ausente"
                    >
                      <mat-icon>cancel</mat-icon>
                    </button>
                    <button 
                      mat-icon-button 
                      class="status-btn justified"
                      [class.active]="getAttendanceStatus(student.id) === 'justified'"
                      (click)="setAttendanceStatus(student, 'justified')"
                      matTooltip="Justificado"
                    >
                      <mat-icon>info</mat-icon>
                    </button>
                  </div>

                  <!-- Note Input -->
                  <mat-form-field class="note-field" appearance="outline" *ngIf="getAttendanceStatus(student.id) !== 'present'">
                    <input 
                      matInput 
                      placeholder="Observação (opcional)"
                      [(ngModel)]="attendanceRecords[student.id].note"
                    >
                  </mat-form-field>
                </div>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="saveAttendance()"
              [disabled]="isSaving || !isAllMarked()"
            >
              <mat-icon *ngIf="!isSaving">save</mat-icon>
              <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
              {{ isSaving ? 'Salvando...' : 'Salvar Chamada' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .attendance-container {
      padding: 24px;
      max-width: 900px;
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

    .session-card {
      margin-bottom: 24px;

      .session-details {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        margin-bottom: 16px;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;

          mat-icon {
            color: #006aac;
          }
        }
      }

      .attendance-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        padding-top: 16px;

        .summary-item {
          text-align: center;

          &.total {
            border-left: 2px solid #e0e0e0;
          }

          .summary-value {
            display: block;
            font-size: 28px;
            font-weight: 600;
            color: #006aac;
          }

          .summary-label {
            font-size: 12px;
            color: #666;
          }
        }
      }
    }

    .bulk-actions {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .students-card {
      .students-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .student-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        transition: all 0.2s;

        &.status-present {
          background-color: #e8f5e9;
          border-color: #4caf50;
        }

        &.status-absent {
          background-color: #ffebee;
          border-color: #f44336;
        }

        &.status-justified {
          background-color: #fff3e0;
          border-color: #ff9800;
        }

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

            .student-meta {
              margin-top: 4px;

              .attendance-badge {
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 12px;

                &.badge-good {
                  background-color: #e8f5e9;
                  color: #2e7d32;
                }

                &.badge-warning {
                  background-color: #fff3e0;
                  color: #ef6c00;
                }

                &.badge-danger {
                  background-color: #ffebee;
                  color: #c62828;
                }
              }
            }
          }
        }

        .attendance-controls {
          display: flex;
          align-items: center;
          gap: 16px;

          .status-buttons {
            display: flex;
            gap: 8px;

            .status-btn {
              transition: all 0.2s;

              &.present {
                color: #9e9e9e;

                &.active, &:hover {
                  color: #4caf50;
                  background-color: #e8f5e9;
                }
              }

              &.absent {
                color: #9e9e9e;

                &.active, &:hover {
                  color: #f44336;
                  background-color: #ffebee;
                }
              }

              &.justified {
                color: #9e9e9e;

                &.active, &:hover {
                  color: #ff9800;
                  background-color: #fff3e0;
                }
              }

              mat-icon {
                font-size: 28px;
                width: 28px;
                height: 28px;
              }
            }
          }

          .note-field {
            width: 200px;

            ::ng-deep .mat-mdc-form-field-subscript-wrapper {
              display: none;
            }
          }
        }
      }
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 16px;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 24px;
      }
    }

    @media (max-width: 768px) {
      .attendance-container {
        padding: 16px;
      }

      .student-row {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 16px;

        .attendance-controls {
          width: 100%;
          flex-direction: column;
          align-items: stretch;

          .note-field {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class AttendanceRegistrationComponent implements OnInit {
  private teacherService = inject(TeacherPortalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  sessionId: number = 0;
  courseId: number = 0;
  students: CourseStudent[] = [];
  sessionInfo: any = null;
  isLoading = true;
  isSaving = false;

  // Map of studentId -> attendance record
  attendanceRecords: { [studentId: number]: AttendanceRecord } = {};

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));
    this.loadSessionAndStudents();
  }

  loadSessionAndStudents(): void {
    this.isLoading = true;
    
    // TODO: Load session info and students from API
    // For now, using mock data
    setTimeout(() => {
      this.sessionInfo = {
        courseName: 'Excel Básico',
        date: new Date(),
        startTime: '09:00',
        endTime: '11:00',
        locationName: 'Sala 3',
        topic: 'Planilhas - Fórmulas Básicas'
      };

      this.students = [
        { id: 1, name: 'João da Silva', email: 'joao@email.com', attendancePercentage: 95, status: 'active', enrollmentId: 1, googleInvitationStatus: 'accepted' },
        { id: 2, name: 'Maria Santos', email: 'maria@email.com', attendancePercentage: 88, status: 'active', enrollmentId: 2, googleInvitationStatus: 'pending' },
        { id: 3, name: 'Carlos Pereira', email: 'carlos@email.com', attendancePercentage: 72, status: 'active', enrollmentId: 3, googleInvitationStatus: 'accepted' },
        { id: 4, name: 'Ana Lima', email: 'ana@email.com', attendancePercentage: 100, status: 'active', enrollmentId: 4, googleInvitationStatus: 'accepted' }
      ];

      // Initialize attendance records
      this.students.forEach(student => {
        this.attendanceRecords[student.id] = {
          studentId: student.id,
          enrollmentId: student.enrollmentId,
          courseId: this.courseId,
          status: 'present', // Default to present
          note: ''
        };
      });

      this.isLoading = false;
    }, 500);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getAttendanceStatus(studentId: number): string {
    return this.attendanceRecords[studentId]?.status || 'present';
  }

  setAttendanceStatus(student: CourseStudent, status: 'present' | 'absent' | 'justified'): void {
    this.attendanceRecords[student.id].status = status;
  }

  getAttendanceClass(percentage: number): string {
    if (percentage >= 85) return 'good';
    if (percentage >= 75) return 'warning';
    return 'danger';
  }

  markAllPresent(): void {
    this.students.forEach(student => {
      this.attendanceRecords[student.id].status = 'present';
    });
  }

  markAllAbsent(): void {
    this.students.forEach(student => {
      this.attendanceRecords[student.id].status = 'absent';
    });
  }

  getPresentCount(): number {
    return Object.values(this.attendanceRecords).filter(r => r.status === 'present').length;
  }

  getAbsentCount(): number {
    return Object.values(this.attendanceRecords).filter(r => r.status === 'absent').length;
  }

  getJustifiedCount(): number {
    return Object.values(this.attendanceRecords).filter(r => r.status === 'justified').length;
  }

  isAllMarked(): boolean {
    return this.students.every(student => 
      this.attendanceRecords[student.id]?.status !== undefined
    );
  }

  saveAttendance(): void {
    this.isSaving = true;
    
    const records = Object.values(this.attendanceRecords);
    
    // TODO: Implement actual API call
    // this.teacherService.recordAttendance(records).subscribe({
    //   next: () => {
    //     this.snackBar.open('Chamada salva com sucesso!', 'Fechar', { duration: 3000 });
    //     this.goBack();
    //   },
    //   error: (err) => {
    //     console.error('Erro ao salvar chamada:', err);
    //     this.snackBar.open('Erro ao salvar chamada.', 'Fechar', { duration: 5000 });
    //     this.isSaving = false;
    //   }
    // });

    // Mock success
    setTimeout(() => {
      this.snackBar.open('Chamada salva com sucesso!', 'Fechar', { duration: 3000 });
      this.isSaving = false;
      this.goBack();
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/teacher/dashboard']);
  }
}
