// src/app/features/teacher-portal/components/my-courses/my-courses.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { TeacherPortalService, TeacherCourse } from '../../../../core/services/teacher-portal.service';

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  template: `
    <div class="courses-container">
      <div class="header">
        <h1>Minhas Turmas</h1>
        <p>Gerencie seus cursos e turmas</p>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando turmas...</p>
      </div>

      <div class="courses-grid" *ngIf="!isLoading">
        <mat-card *ngFor="let course of courses" class="course-card">
          <mat-card-header>
            <mat-card-title>{{ course.name }}</mat-card-title>
            <mat-card-subtitle>
              {{ course.workload }}h | {{ course.schedule || 'Horário não definido' }}
            </mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <div class="course-info">
              <div class="info-item">
                <mat-icon>people</mat-icon>
                <span>{{ course.enrolledCount || 0 }} alunos</span>
              </div>
              <div class="info-item">
                <mat-icon>trending_up</mat-icon>
                <span>{{ course.averageAttendance || 0 }}% frequência</span>
              </div>
            </div>

            <!-- Google Classroom Status -->
            <div class="google-status" [ngSwitch]="course.googleSyncStatus">
              <mat-chip *ngSwitchCase="'synced'" class="status-synced">
                <mat-icon>check_circle</mat-icon>
                Sincronizado com Google Classroom
              </mat-chip>
              <mat-chip *ngSwitchCase="'not_synced'" class="status-not-synced">
                <mat-icon>warning</mat-icon>
                Não sincronizado
              </mat-chip>
              <mat-chip *ngSwitchCase="'error'" class="status-error">
                <mat-icon>error</mat-icon>
                Erro na sincronização
              </mat-chip>
            </div>
          </mat-card-content>
          
          <mat-card-actions>
            <button mat-raised-button color="primary" [routerLink]="['/teacher/courses', course.id, 'students']">
              <mat-icon>people</mat-icon>
              Ver Alunos
            </button>
            <button 
              mat-stroked-button 
              *ngIf="course.googleClassroomUrl"
              (click)="openGoogleClassroom(course.googleClassroomUrl)"
            >
              <mat-icon>school</mat-icon>
              Classroom
            </button>
            <button 
              mat-stroked-button 
              *ngIf="!course.googleClassroomUrl && course.id"
              (click)="createClassroom(course.id)"
              [disabled]="creatingClassroom === course.id"
            >
              <mat-icon>add</mat-icon>
              Criar no Google
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Empty State -->
        <mat-card *ngIf="courses?.length === 0" class="empty-card">
          <mat-card-content>
            <mat-icon class="empty-icon">school</mat-icon>
            <p>Você ainda não tem turmas atribuídas.</p>
            <p class="empty-subtitle">Entre em contato com a coordenação.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .courses-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 24px;
      
      h1 {
        font-size: 28px;
        font-weight: 500;
        margin: 0 0 8px;
        color: #333;
      }
      
      p {
        color: #666;
        margin: 0;
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

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 16px;
    }

    .course-card {
      .course-info {
        margin: 16px 0;
        
        .info-item {
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
        
        .status-synced {
          background-color: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-not-synced {
          background-color: #fff3e0;
          color: #ef6c00;
        }
        
        .status-error {
          background-color: #ffebee;
          color: #c62828;
        }
      }
    }

    mat-card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px 16px 16px;
    }

    .empty-card {
      text-align: center;
      padding: 48px;
      grid-column: 1 / -1;
      
      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
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
      .courses-container {
        padding: 16px;
      }
      
      .courses-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyCoursesComponent implements OnInit {
  private teacherService = inject(TeacherPortalService);
  private snackBar = inject(MatSnackBar);
  
  courses: TeacherCourse[] = [];
  isLoading = true;
  creatingClassroom: number | null = null;

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    
    this.teacherService.getMyCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar cursos:', err);
        this.snackBar.open('Erro ao carregar turmas.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  openGoogleClassroom(url: string): void {
    window.open(url, '_blank');
  }

  createClassroom(courseId: number): void {
    this.creatingClassroom = courseId;
    
    this.teacherService.createGoogleClassroom(courseId).subscribe({
      next: (result) => {
        if (result.success) {
          this.snackBar.open('Turma criada no Google Classroom com sucesso!', 'Fechar', {
            duration: 5000
          });
          this.loadCourses(); // Recarregar para atualizar status
        } else {
          this.snackBar.open(result.error || 'Erro ao criar turma.', 'Fechar', {
            duration: 5000
          });
        }
        this.creatingClassroom = null;
      },
      error: (err) => {
        console.error('Erro ao criar classroom:', err);
        this.snackBar.open('Erro ao criar turma no Google Classroom.', 'Fechar', {
          duration: 5000
        });
        this.creatingClassroom = null;
      }
    });
  }
}
