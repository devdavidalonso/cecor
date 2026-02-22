// src/app/features/interviews/components/interview-form.component.ts
// Componente para responder entrevista (usado no wizard de matrícula)
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { InterviewService } from '../../../core/services/interview.service';
import { StudentService } from '../../../core/services/student.service';
import { FormDefinition, Question, InterviewResponse } from '../../../core/models/interview.model';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-interview-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDividerModule,
    MatTooltipModule
  ],
  template: `
    <div class="interview-form-container">
      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando formulário...</p>
      </div>

      <!-- No Interview State -->
      <mat-card *ngIf="!isLoading && !formDefinition" class="empty-card">
        <mat-card-content>
          <mat-icon>check_circle</mat-icon>
          <h2>Nenhuma entrevista pendente</h2>
          <p>Este aluno não possui entrevista socioeducacional pendente.</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Voltar
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Interview Form -->
      <mat-card *ngIf="!isLoading && formDefinition" class="interview-card">
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>assignment</mat-icon>
          </div>
          <mat-card-title>{{ formDefinition.title }}</mat-card-title>
          <mat-card-subtitle>{{ formDefinition.description }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Student Info -->
          <div class="student-info" *ngIf="student">
            <mat-icon>person</mat-icon>
            <div class="info">
              <strong>{{ student.user?.name }}</strong>
              <span *ngIf="student.registrationNumber">Matrícula: {{ student.registrationNumber }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Progress -->
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="progressPercent"></div>
            <span class="progress-text">{{ answeredCount }} de {{ questions.length }} perguntas respondidas</span>
          </div>

          <!-- Dynamic Questions Form -->
          <form [formGroup]="answersForm" class="questions-form">
            <div *ngFor="let question of questions; let i = index" class="question-item"
                 [class.answered]="isQuestionAnswered(question.id)">
              
              <!-- Question Header -->
              <div class="question-header">
                <span class="question-number">{{ i + 1 }}</span>
                <span class="question-label">{{ question.label }}</span>
                <span class="required-badge" *ngIf="question.required">Obrigatória</span>
              </div>

              <!-- TEXT Question -->
              <mat-form-field appearance="outline" class="full-width" *ngIf="question.type === 'text'">
                <mat-label>Resposta</mat-label>
                <textarea matInput [formControlName]="question.id" rows="3"
                  [placeholder]="question.placeholder || 'Digite sua resposta...'"></textarea>
                <mat-error *ngIf="answersForm.get(question.id)?.hasError('required') && question.required">
                  Esta pergunta é obrigatória
                </mat-error>
              </mat-form-field>

              <!-- BOOLEAN Question -->
              <div class="boolean-options" *ngIf="question.type === 'boolean'">
                <mat-radio-group [formControlName]="question.id">
                  <mat-radio-button [value]="true">Sim</mat-radio-button>
                  <mat-radio-button [value]="false">Não</mat-radio-button>
                </mat-radio-group>
                <mat-error *ngIf="answersForm.get(question.id)?.hasError('required') && question.required">
                  Selecione uma opção
                </mat-error>
              </div>

              <!-- SELECT Question -->
              <mat-form-field appearance="outline" class="full-width" *ngIf="question.type === 'select'">
                <mat-label>Selecione uma opção</mat-label>
                <mat-select [formControlName]="question.id">
                  <mat-option *ngFor="let option of question.options" [value]="option">
                    {{ option }}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="answersForm.get(question.id)?.hasError('required') && question.required">
                  Selecione uma opção
                </mat-error>
              </mat-form-field>

              <!-- MULTIPLE_CHOICE Question -->
              <div class="multiple-options" *ngIf="question.type === 'multiple_choice'">
                <div class="checkbox-list">
                  <mat-checkbox *ngFor="let option of question.options"
                    [checked]="isOptionSelected(question.id, option)"
                    (change)="toggleOption(question.id, option, $event.checked)">
                    {{ option }}
                  </mat-checkbox>
                </div>
                <mat-error *ngIf="answersForm.get(question.id)?.hasError('required') && question.required">
                  Selecione pelo menos uma opção
                </mat-error>
              </div>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button (click)="goBack()">Cancelar</button>
          <button mat-stroked-button color="accent" (click)="saveAsDraft()" [disabled]="isSaving">
            <mat-icon>save</mat-icon>
            Salvar Rascunho
          </button>
          <button mat-raised-button color="primary" 
                  (click)="submit()" 
                  [disabled]="isSaving || !canSubmit()">
            <mat-icon *ngIf="!isSaving">check_circle</mat-icon>
            <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
            {{ isSaving ? 'Enviando...' : 'Finalizar Entrevista' }}
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .interview-form-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
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

    .empty-card {
      text-align: center;
      padding: 48px;

      mat-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #4caf50;
        margin-bottom: 16px;
      }

      h2 {
        margin: 0 0 8px;
        color: #333;
      }

      p {
        color: #666;
        margin-bottom: 24px;
      }
    }

    .interview-card {
      .header-icon {
        background-color: #e3f2fd;
        display: flex;
        align-items: center;
        justify-content: center;

        mat-icon {
          color: #006aac;
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }
    }

    .student-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-bottom: 24px;

      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #006aac;
      }

      .info {
        display: flex;
        flex-direction: column;

        strong {
          font-size: 16px;
          color: #333;
        }

        span {
          font-size: 13px;
          color: #666;
        }
      }
    }

    .progress-bar {
      position: relative;
      height: 24px;
      background-color: #e0e0e0;
      border-radius: 12px;
      margin-bottom: 32px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background-color: #006aac;
        transition: width 0.3s ease;
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        font-weight: 500;
        color: #333;
      }
    }

    .questions-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .question-item {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
      transition: all 0.2s ease;

      &:hover {
        border-color: #006aac;
        box-shadow: 0 2px 8px rgba(0, 106, 172, 0.1);
      }

      &.answered {
        border-left: 4px solid #4caf50;
      }

      .question-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .question-number {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background-color: #006aac;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          flex-shrink: 0;
        }

        .question-label {
          flex: 1;
          font-size: 15px;
          font-weight: 500;
          color: #333;
        }

        .required-badge {
          font-size: 11px;
          color: #f44336;
          background-color: #ffebee;
          padding: 2px 8px;
          border-radius: 12px;
        }
      }

      .full-width {
        width: 100%;
      }

      .boolean-options {
        mat-radio-group {
          display: flex;
          gap: 24px;
        }
      }

      .multiple-options {
        .checkbox-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      }
    }

    mat-card-actions {
      padding: 16px 24px;
      gap: 12px;
    }
  `]
})
export class InterviewFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private interviewService = inject(InterviewService);
  private studentService = inject(StudentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  formDefinition: FormDefinition | null = null;
  student: Student | null = null;
  studentId: number = 0;
  
  answersForm: FormGroup = this.fb.group({});
  isLoading = true;
  isSaving = false;

  ngOnInit(): void {
    this.studentId = Number(this.route.snapshot.paramMap.get('studentId'));
    
    if (!this.studentId) {
      this.snackBar.open('ID do aluno não informado', 'Fechar', { duration: 3000 });
      this.goBack();
      return;
    }

    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    // Load student info
    this.studentService.getStudent(this.studentId).subscribe(student => {
      this.student = student;
    });

    // Load pending interview
    this.interviewService.getPendingInterview(this.studentId).subscribe(form => {
      this.isLoading = false;
      
      if (form) {
        this.formDefinition = form;
        this.buildForm(form);
      } else {
        // No pending interview
        this.formDefinition = null;
      }
    });
  }

  private buildForm(form: FormDefinition): void {
    const group: { [key: string]: any } = {};

    form.questions.forEach(question => {
      const validators = question.required ? [Validators.required] : [];
      
      if (question.type === 'multiple_choice') {
        group[question.id] = [[], validators];
      } else {
        group[question.id] = ['', validators];
      }
    });

    this.answersForm = this.fb.group(group);
  }

  get questions(): Question[] {
    return this.formDefinition?.questions || [];
  }

  get progressPercent(): number {
    if (this.questions.length === 0) return 0;
    return (this.answeredCount / this.questions.length) * 100;
  }

  get answeredCount(): number {
    return this.questions.filter(q => this.isQuestionAnswered(q.id)).length;
  }

  isQuestionAnswered(questionId: string): boolean {
    const value = this.answersForm.get(questionId)?.value;
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '' && value !== null && value !== undefined;
  }

  isOptionSelected(questionId: string, option: string): boolean {
    const value = this.answersForm.get(questionId)?.value || [];
    return value.includes(option);
  }

  toggleOption(questionId: string, option: string, checked: boolean): void {
    const control = this.answersForm.get(questionId);
    const currentValue: string[] = control?.value || [];
    
    if (checked) {
      control?.setValue([...currentValue, option]);
    } else {
      control?.setValue(currentValue.filter(o => o !== option));
    }
  }

  canSubmit(): boolean {
    // Check if all required questions are answered
    const requiredQuestions = this.questions.filter(q => q.required);
    return requiredQuestions.every(q => this.isQuestionAnswered(q.id));
  }

  saveAsDraft(): void {
    this.snackBar.open('Rascunho salvo (funcionalidade em desenvolvimento)', 'Fechar', { duration: 2000 });
  }

  submit(): void {
    if (!this.formDefinition || !this.canSubmit()) {
      this.snackBar.open('Responda todas as perguntas obrigatórias', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;

    const response: InterviewResponse = {
      studentId: this.studentId,
      formVersion: this.formDefinition.version,
      status: 'completed',
      answers: this.answersForm.value,
      interviewerId: undefined // TODO: Get from auth context
    };

    this.interviewService.submitResponse(response).subscribe(success => {
      this.isSaving = false;
      
      if (success) {
        this.snackBar.open('Entrevista enviada com sucesso! Matrícula completa.', 'Fechar', { duration: 3000 });
        
        // Verificar se há URL de retorno nos query params
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        const enrollmentId = this.route.snapshot.queryParams['enrollmentId'];
        
        if (returnUrl) {
          // Se tem enrollmentId, redirecionar para a página de sucesso da matrícula
          if (enrollmentId) {
            this.router.navigate(['/enrollments'], { 
              queryParams: { 
                success: true, 
                studentId: this.studentId,
                interviewCompleted: true 
              }
            });
          } else {
            this.router.navigateByUrl(returnUrl);
          }
        } else {
          // Navegar para o perfil do aluno
          this.router.navigate(['/students', this.studentId]);
        }
      } else {
        this.snackBar.open('Erro ao enviar entrevista', 'Fechar', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'];
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/enrollments']);
    }
  }
}
