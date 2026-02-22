// src/app/features/teacher-portal/components/incidents/incident-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';

import { IncidentService, Incident } from '../../../../core/services/incident.service';
import { TeacherPortalService, TeacherCourse, CourseStudent } from '../../../../core/services/teacher-portal.service';



@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatRadioModule,
    MatChipsModule
  ],
  template: `
    <div class="form-container">
      <!-- Header -->
      <div class="header">
        <button mat-button routerLink="/teacher/incidents">
          <mat-icon>arrow_back</mat-icon>
          Voltar
        </button>
        <h1>{{ isEditMode ? 'Editar Ocorrência' : 'Nova Ocorrência' }}</h1>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando dados...</p>
      </div>

      <!-- Form -->
      <mat-card *ngIf="!isLoading">
        <mat-card-content>
          <form [formGroup]="incidentForm" (ngSubmit)="onSubmit()">
            <!-- Basic Information -->
            <div class="form-section">
              <h3>Informações Básicas</h3>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Título da Ocorrência</mat-label>
                  <input matInput formControlName="title" placeholder="Ex: Aluno apresentou comportamento inadequado">
                  <mat-error *ngIf="incidentForm.get('title')?.hasError('required')">
                    Título é obrigatório
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row two-columns">
                <mat-form-field appearance="outline">
                  <mat-label>Tipo</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="disciplinary">Disciplinar</mat-option>
                    <mat-option value="infrastructure">Infraestrutura</mat-option>
                    <mat-option value="health">Saúde</mat-option>
                    <mat-option value="safety">Segurança</mat-option>
                    <mat-option value="other">Outros</mat-option>
                  </mat-select>
                  <mat-error *ngIf="incidentForm.get('type')?.hasError('required')">
                    Tipo é obrigatório
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Severidade</mat-label>
                  <mat-select formControlName="severity">
                    <mat-option value="low">Baixa</mat-option>
                    <mat-option value="medium">Média</mat-option>
                    <mat-option value="high">Alta</mat-option>
                    <mat-option value="critical">Crítica</mat-option>
                  </mat-select>
                  <mat-error *ngIf="incidentForm.get('severity')?.hasError('required')">
                    Severidade é obrigatória
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Descrição Detalhada</mat-label>
                  <textarea 
                    matInput 
                    formControlName="description" 
                    rows="5"
                    placeholder="Descreva detalhadamente o que aconteceu..."
                  ></textarea>
                  <mat-error *ngIf="incidentForm.get('description')?.hasError('required')">
                    Descrição é obrigatória
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Related Information -->
            <div class="form-section">
              <h3>Relacionamentos</h3>
              <p class="section-subtitle">Vincule a ocorrência a um curso e/ou aluno específico (opcional)</p>

              <div class="form-row two-columns">
                <mat-form-field appearance="outline">
                  <mat-label>Curso</mat-label>
                  <mat-select formControlName="courseId" (selectionChange)="onCourseChange($event.value)">
                    <mat-option value="">Nenhum curso</mat-option>
                    <mat-option *ngFor="let course of courses" [value]="course.id">
                      {{ course.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Aluno Envolvido</mat-label>
                  <mat-select formControlName="studentId" [disabled]="!selectedCourseId">
                    <mat-option value="">Nenhum aluno específico</mat-option>
                    <mat-option *ngFor="let student of students" [value]="student.id">
                      {{ student.name }}
                    </mat-option>
                  </mat-select>
                  <mat-hint *ngIf="!selectedCourseId">Selecione um curso primeiro</mat-hint>
                </mat-form-field>
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button mat-button type="button" routerLink="/teacher/incidents">
                Cancelar
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="incidentForm.invalid || isSubmitting"
              >
                <mat-spinner diameter="20" *ngIf="isSubmitting"></mat-spinner>
                <span *ngIf="!isSubmitting">
                  <mat-icon>save</mat-icon>
                  {{ isEditMode ? 'Atualizar' : 'Salvar' }} Ocorrência
                </span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .form-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;

      button {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      h1 {
        font-size: 24px;
        font-weight: 500;
        margin: 0;
        color: #333;
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

    mat-card {
      padding: 24px;
    }

    .form-section {
      margin-bottom: 32px;

      h3 {
        font-size: 18px;
        font-weight: 500;
        color: #333;
        margin: 0 0 8px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #006aac;
      }

      .section-subtitle {
        color: #666;
        font-size: 14px;
        margin: 0 0 16px 0;
      }
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      &.two-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      mat-form-field {
        flex: 1;

        &.full-width {
          width: 100%;
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;

      button {
        display: flex;
        align-items: center;
        gap: 8px;

        &[type="submit"] {
          min-width: 200px;
        }
      }
    }

    @media (max-width: 768px) {
      .form-container {
        padding: 16px;
      }

      .form-row.two-columns {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;

        button {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `]
})
export class IncidentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private incidentService = inject(IncidentService);
  private portalService = inject(TeacherPortalService);
  private snackBar = inject(MatSnackBar);

  incidentForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  incidentId: number | null = null;

  courses: TeacherCourse[] = [];
  students: CourseStudent[] = [];
  selectedCourseId: number | null = null;
  
  // Track form control disabled state manually since we can't use disabled attribute with reactive forms
  private studentIdControl = this.incidentForm?.get('studentId');

  ngOnInit(): void {
    this.initForm();
    this.loadCourses();

    // Check if editing
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.incidentId = parseInt(id, 10);
      this.loadIncident(this.incidentId);
    }
  }

  initForm(): void {
    this.incidentForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      type: ['disciplinary', Validators.required],
      severity: ['medium', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]],
      courseId: [''],
      studentId: ['']
    });

    // Disable student select initially
    this.incidentForm.get('studentId')?.disable();
  }

  loadCourses(): void {
    this.portalService.getMyCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: (err: Error) => {
        console.error('Erro ao carregar cursos:', err);
        this.snackBar.open('Erro ao carregar cursos.', 'Fechar', { duration: 5000 });
      }
    });
  }

  loadIncident(id: number): void {
    this.isLoading = true;
    
    this.incidentService.getIncident(id).subscribe({
      next: (incident) => {
        this.incidentForm.patchValue({
          title: incident.title,
          type: incident.type,
          severity: incident.severity,
          description: incident.description,
          courseId: incident.courseId || '',
          studentId: incident.studentId || ''
        });

        if (incident.courseId) {
          this.selectedCourseId = incident.courseId;
          this.loadStudents(incident.courseId);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar ocorrência:', err);
        this.snackBar.open('Erro ao carregar ocorrência.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/teacher/incidents']);
      }
    });
  }

  onCourseChange(courseId: number | string): void {
    this.selectedCourseId = courseId ? Number(courseId) : null;
    this.students = [];
    
    // Reset student selection
    this.incidentForm.get('studentId')?.setValue('');

    if (this.selectedCourseId) {
      this.incidentForm.get('studentId')?.enable();
      this.loadStudents(this.selectedCourseId);
    } else {
      this.incidentForm.get('studentId')?.disable();
    }
  }

  loadStudents(courseId: number): void {
    // Load students from the course using the portal service
    this.portalService.getCourseStudents(courseId).subscribe({
      next: (students) => {
        this.students = students;
      },
      error: (err: Error) => {
        console.error('Erro ao carregar alunos:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.incidentForm.invalid) return;

    this.isSubmitting = true;

    const formValue = this.incidentForm.value;
    const incidentData: Partial<Incident> = {
      title: formValue.title,
      type: formValue.type,
      severity: formValue.severity,
      description: formValue.description,
      courseId: formValue.courseId ? Number(formValue.courseId) : undefined,
      studentId: formValue.studentId ? Number(formValue.studentId) : undefined,
      status: 'open'
    };

    if (this.isEditMode && this.incidentId) {
      this.incidentService.updateIncident(this.incidentId, incidentData).subscribe({
        next: () => {
          this.snackBar.open('Ocorrência atualizada com sucesso!', 'Fechar', { duration: 3000 });
          this.isSubmitting = false;
          this.router.navigate(['/teacher/incidents']);
        },
        error: (err) => {
          console.error('Erro ao atualizar ocorrência:', err);
          this.snackBar.open('Erro ao atualizar ocorrência.', 'Fechar', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    } else {
      this.incidentService.createIncident(incidentData).subscribe({
        next: () => {
          this.snackBar.open('Ocorrência registrada com sucesso!', 'Fechar', { duration: 3000 });
          this.isSubmitting = false;
          this.router.navigate(['/teacher/incidents']);
        },
        error: (err) => {
          console.error('Erro ao criar ocorrência:', err);
          this.snackBar.open('Erro ao criar ocorrência.', 'Fechar', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    }
  }
}
