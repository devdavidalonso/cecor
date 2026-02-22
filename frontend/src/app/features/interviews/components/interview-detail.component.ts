// src/app/features/interviews/components/interview-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { InterviewService } from '../../../core/services/interview.service';
import { StudentService } from '../../../core/services/student.service';
import { PdfExportService } from '../../../core/services/pdf-export.service';
import { InterviewResponse, FormDefinition } from '../../../core/models/interview.model';
import { Student } from '../../../core/models/student.model';

@Component({
  selector: 'app-interview-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="interview-detail-container">
      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando entrevista...</p>
      </div>

      <!-- Not Found -->
      <mat-card *ngIf="!isLoading && !interviewResponse" class="empty-card">
        <mat-card-content>
          <mat-icon>error_outline</mat-icon>
          <h2>Entrevista não encontrada</h2>
          <p>A entrevista solicitada não foi encontrada.</p>
          <button mat-raised-button color="primary" routerLink="/interviews">
            <mat-icon>arrow_back</mat-icon>
            Voltar para Lista
          </button>
        </mat-card-content>
      </mat-card>

      <!-- Interview Detail -->
      <mat-card *ngIf="!isLoading && interviewResponse" class="detail-card">
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>assignment_turned_in</mat-icon>
          </div>
          <mat-card-title>Resposta da Entrevista</mat-card-title>
          <mat-card-subtitle>Versão: {{ interviewResponse.formVersion }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Student Info -->
          <div class="info-section" *ngIf="student">
            <h3>
              <mat-icon>person</mat-icon>
              Informações do Aluno
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nome:</span>
                <span class="value">{{ student.user?.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Matrícula:</span>
                <span class="value">{{ student.registrationNumber || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Data da Entrevista:</span>
                <span class="value">{{ interviewResponse.completionDate | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span>
                <mat-chip [color]="interviewResponse.status === 'completed' ? 'primary' : 'warn'" 
                         [highlighted]="interviewResponse.status === 'completed'">
                  {{ interviewResponse.status === 'completed' ? 'Concluída' : 'Pendente' }}
                </mat-chip>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Answers -->
          <div class="answers-section">
            <h3>
              <mat-icon>quiz</mat-icon>
              Respostas ({{ questionLabels.length }})
            </h3>
            
            <mat-list>
              <mat-list-item *ngFor="let item of questionLabels; let i = index" class="answer-item">
                <div class="answer-content">
                  <div class="question-text">
                    <span class="question-number">{{ i + 1 }}.</span>
                    {{ item.label }}
                  </div>
                  <div class="answer-value" [ngSwitch]="getAnswerType(item.key)">
                    <!-- Boolean Answer -->
                    <mat-chip *ngSwitchCase="'boolean'" 
                             [color]="interviewResponse.answers[item.key] ? 'primary' : 'default'">
                      {{ interviewResponse.answers[item.key] ? 'Sim' : 'Não' }}
                    </mat-chip>
                    
                    <!-- Array Answer (Multiple Choice) -->
                    <div *ngSwitchCase="'array'" class="chip-list">
                      <mat-chip *ngFor="let option of interviewResponse.answers[item.key]">
                        {{ option }}
                      </mat-chip>
                    </div>
                    
                    <!-- Text Answer -->
                    <span *ngSwitchDefault class="text-answer">
                      {{ interviewResponse.answers[item.key] || 'Não informado' }}
                    </span>
                  </div>
                </div>
              </mat-list-item>
            </mat-list>
          </div>
        </mat-card-content>

        <mat-card-actions align="end">
          <button mat-button routerLink="/interviews">
            <mat-icon>arrow_back</mat-icon>
            Voltar
          </button>
          <button mat-stroked-button color="primary" (click)="exportPDF()">
            <mat-icon>picture_as_pdf</mat-icon>
            Exportar PDF
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .interview-detail-container {
      padding: 24px;
      max-width: 900px;
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
        color: #f44336;
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

    .detail-card {
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

    .info-section {
      margin-bottom: 24px;

      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #333;
        margin-bottom: 16px;

        mat-icon {
          color: #006aac;
        }
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        background-color: #f5f5f5;
        padding: 16px;
        border-radius: 8px;

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;

          .label {
            font-size: 12px;
            color: #666;
          }

          .value {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
        }
      }
    }

    mat-divider {
      margin: 24px 0;
    }

    .answers-section {
      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #333;
        margin-bottom: 16px;

        mat-icon {
          color: #006aac;
        }
      }

      .answer-item {
        height: auto;
        margin-bottom: 8px;

        .answer-content {
          width: 100%;
          padding: 12px 0;

          .question-text {
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;

            .question-number {
              font-weight: bold;
              color: #006aac;
              margin-right: 4px;
            }
          }

          .answer-value {
            .chip-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }

            .text-answer {
              font-size: 15px;
              color: #333;
              font-weight: 500;
            }
          }
        }
      }
    }

    mat-card-actions {
      padding: 16px 24px;
      gap: 12px;
    }
  `]
})
export class InterviewDetailComponent implements OnInit {
  private interviewService = inject(InterviewService);
  private studentService = inject(StudentService);
  private pdfExportService = inject(PdfExportService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  interviewResponse: InterviewResponse | null = null;
  student: Student | null = null;
  questionLabels: { key: string; label: string }[] = [];
  formTitle: string = 'Entrevista Socioeducacional';
  isLoading = true;

  ngOnInit(): void {
    const responseId = this.route.snapshot.paramMap.get('id');
    const studentId = this.route.snapshot.queryParamMap.get('studentId');

    if (responseId) {
      // Load by response ID
      this.loadResponseById(responseId);
    } else if (studentId) {
      // Load by student ID
      this.loadResponseByStudent(Number(studentId));
    } else {
      this.snackBar.open('ID não informado', 'Fechar', { duration: 3000 });
      this.router.navigate(['/interviews']);
    }
  }

  private loadResponseById(id: string): void {
    // TODO: Implement getResponseById in service
    this.isLoading = false;
  }

  private loadResponseByStudent(studentId: number): void {
    this.isLoading = true;

    // Load student info
    this.studentService.getStudent(studentId).subscribe(student => {
      this.student = student;
    });

    // Load interview response
    this.interviewService.getStudentInterview(studentId).subscribe(response => {
      this.isLoading = false;
      this.interviewResponse = response;
      
      if (response) {
        this.buildQuestionLabels(response);
      }
    });
  }

  private buildQuestionLabels(response: InterviewResponse): void {
    // Build question labels from answers keys
    // In a real scenario, you'd fetch the form definition to get the labels
    this.questionLabels = Object.keys(response.answers).map(key => ({
      key,
      label: this.formatQuestionLabel(key)
    }));
  }

  private formatQuestionLabel(key: string): string {
    // Convert snake_case to Title Case
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getAnswerType(key: string): string {
    const value = this.interviewResponse?.answers[key];
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'array';
    return 'text';
  }

  exportPDF(): void {
    if (!this.interviewResponse) {
      this.snackBar.open('Nenhuma entrevista para exportar', 'Fechar', { duration: 3000 });
      return;
    }

    this.snackBar.open('Gerando PDF...', 'Fechar', { duration: 2000 });
    
    try {
      this.pdfExportService.exportInterviewResponse(
        this.interviewResponse,
        this.student,
        this.questionLabels,
        this.formTitle
      );
      this.snackBar.open('PDF exportado com sucesso!', 'Fechar', { duration: 3000 });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      this.snackBar.open('Erro ao exportar PDF', 'Fechar', { duration: 3000 });
    }
  }
}
