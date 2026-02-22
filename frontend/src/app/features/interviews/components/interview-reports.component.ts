// src/app/features/interviews/components/interview-reports.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';

import { InterviewService } from '../../../core/services/interview.service';
import { FormDefinition, Question } from '../../../core/models/interview.model';

interface AnalyticsData {
  totalResponses: number;
  completedCount: number;
  pendingCount: number;
  byFormVersion: { [version: string]: number };
  recentActivity: { date: string; count: number }[];
}

interface QuestionAnalytics {
  questionId: string;
  questionLabel: string;
  type: string;
  totalResponses: number;
  breakdown: { [key: string]: { count: number; percentage: number } };
}

@Component({
  selector: 'app-interview-reports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="reports-container">
      <mat-card class="header-card">
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>assessment</mat-icon>
          </div>
          <mat-card-title>Relatórios de Entrevistas</mat-card-title>
          <mat-card-subtitle>Análise detalhada das respostas</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando relatórios...</p>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card" *ngIf="!isLoading">
        <mat-card-content>
          <mat-form-field appearance="outline">
            <mat-label>Formulário</mat-label>
            <mat-select [(ngModel)]="selectedFormId" (selectionChange)="onFormChange()">
              <mat-option *ngFor="let form of forms" [value]="form.id">
                {{ form.title }} ({{ form.version }})
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" *ngIf="selectedForm">
            <mat-label>Pergunta Específica</mat-label>
            <mat-select [(ngModel)]="selectedQuestionId" (selectionChange)="onQuestionChange()">
              <mat-option value="">Todas as perguntas</mat-option>
              <mat-option *ngFor="let question of selectedForm.questions" [value]="question.id">
                {{ question.label }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Summary Stats -->
      <div class="stats-grid" *ngIf="!isLoading && analyticsData">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon">assignment_turned_in</mat-icon>
          <div class="stat-value">{{ analyticsData.totalResponses }}</div>
          <div class="stat-label">Total de Entrevistas</div>
        </mat-card>

        <mat-card class="stat-card success">
          <mat-icon class="stat-icon">check_circle</mat-icon>
          <div class="stat-value">{{ analyticsData.completedCount }}</div>
          <div class="stat-label">Concluídas</div>
          <div class="stat-percent">{{ getPercentage(analyticsData.completedCount, analyticsData.totalResponses) }}%</div>
        </mat-card>

        <mat-card class="stat-card warning">
          <mat-icon class="stat-icon">pending</mat-icon>
          <div class="stat-value">{{ analyticsData.pendingCount }}</div>
          <div class="stat-label">Pendentes</div>
          <div class="stat-percent">{{ getPercentage(analyticsData.pendingCount, analyticsData.totalResponses) }}%</div>
        </mat-card>
      </div>

      <!-- Question Analytics -->
      <mat-card class="question-analytics-card" *ngIf="!isLoading && selectedQuestionAnalytics">
        <mat-card-header>
          <mat-card-title>{{ selectedQuestionAnalytics.questionLabel }}</mat-card-title>
          <mat-card-subtitle>Análise da pergunta</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="breakdown-list">
            <div class="breakdown-item" *ngFor="let item of getBreakdownItems()">
              <div class="breakdown-header">
                <span class="breakdown-label">{{ item.label }}</span>
                <span class="breakdown-value">{{ item.count }} ({{ item.percentage }}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="item.percentage"></div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- All Questions Summary -->
      <mat-card class="table-card" *ngIf="!isLoading && selectedForm && !selectedQuestionId">
        <mat-card-header>
          <mat-card-title>Resumo por Pergunta</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="selectedForm.questions" class="questions-table">
            
            <ng-container matColumnDef="question">
              <th mat-header-cell *matHeaderCellDef>Pergunta</th>
              <td mat-cell *matCellDef="let question">{{ question.label }}</td>
            </ng-container>

            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let question">
                <mat-chip>{{ getTypeLabel(question.type) }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="required">
              <th mat-header-cell *matHeaderCellDef>Obrigatória</th>
              <td mat-cell *matCellDef="let question">
                <mat-icon *ngIf="question.required" color="warn">check_circle</mat-icon>
                <mat-icon *ngIf="!question.required" color="disabled">remove_circle</mat-icon>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Ações</th>
              <td mat-cell *matCellDef="let question">
                <button mat-icon-button (click)="selectQuestion(question.id)" matTooltip="Ver análise">
                  <mat-icon>analytics</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="['question', 'type', 'required', 'actions']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['question', 'type', 'required', 'actions'];"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Export Actions -->
      <mat-card class="actions-card" *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title>Exportar Dados</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="export-actions">
            <button mat-raised-button color="primary" (click)="exportCSV()">
              <mat-icon>download</mat-icon>
              Exportar CSV
            </button>
            <button mat-raised-button color="accent" (click)="exportJSON()">
              <mat-icon>code</mat-icon>
              Exportar JSON
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-card {
      margin-bottom: 24px;
      
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

    .filters-card {
      margin-bottom: 24px;

      mat-card-content {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      text-align: center;

      .stat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #006aac;
        margin-bottom: 12px;
      }

      .stat-value {
        font-size: 36px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
      }

      .stat-percent {
        font-size: 12px;
        color: #006aac;
        margin-top: 4px;
      }

      &.success .stat-icon {
        color: #4caf50;
      }

      &.warning .stat-icon {
        color: #ff9800;
      }
    }

    .question-analytics-card {
      margin-bottom: 24px;

      .breakdown-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .breakdown-item {
        .breakdown-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .breakdown-label {
            font-weight: 500;
          }

          .breakdown-value {
            color: #666;
          }
        }

        .progress-bar {
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background-color: #006aac;
            transition: width 0.3s ease;
          }
        }
      }
    }

    .table-card {
      margin-bottom: 24px;

      .questions-table {
        width: 100%;
      }
    }

    .actions-card {
      .export-actions {
        display: flex;
        gap: 16px;
      }
    }
  `]
})
export class InterviewReportsComponent implements OnInit {
  private interviewService = inject(InterviewService);
  private snackBar = inject(MatSnackBar);

  forms: FormDefinition[] = [];
  selectedFormId: string = '';
  selectedForm: FormDefinition | null = null;
  selectedQuestionId: string = '';
  
  analyticsData: AnalyticsData | null = null;
  selectedQuestionAnalytics: QuestionAnalytics | null = null;
  
  isLoading = true;

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading = true;
    this.interviewService.listForms().subscribe(forms => {
      this.forms = forms;
      if (forms.length > 0) {
        this.selectedFormId = forms[0].id || '';
        this.onFormChange();
      } else {
        this.isLoading = false;
      }
    });
  }

  onFormChange(): void {
    this.selectedForm = this.forms.find(f => f.id === this.selectedFormId) || null;
    this.selectedQuestionId = '';
    this.selectedQuestionAnalytics = null;
    
    if (this.selectedForm) {
      this.loadAnalytics();
    }
  }

  onQuestionChange(): void {
    if (this.selectedQuestionId) {
      this.loadQuestionAnalytics();
    } else {
      this.selectedQuestionAnalytics = null;
    }
  }

  selectQuestion(questionId: string): void {
    this.selectedQuestionId = questionId;
    this.loadQuestionAnalytics();
  }

  loadAnalytics(): void {
    // Simular dados de analytics
    // Em produção, isso viria de uma API
    this.analyticsData = {
      totalResponses: 150,
      completedCount: 145,
      pendingCount: 5,
      byFormVersion: {
        [this.selectedForm?.version || 'v1']: 150
      },
      recentActivity: [
        { date: '2026-02-20', count: 12 },
        { date: '2026-02-19', count: 8 },
        { date: '2026-02-18', count: 15 },
        { date: '2026-02-17', count: 10 },
        { date: '2026-02-16', count: 20 }
      ]
    };
    
    this.isLoading = false;
  }

  loadQuestionAnalytics(): void {
    if (!this.selectedQuestionId || !this.selectedForm) return;

    const question = this.selectedForm.questions.find(q => q.id === this.selectedQuestionId);
    if (!question) return;

    // Simular analytics por pergunta
    this.selectedQuestionAnalytics = {
      questionId: question.id,
      questionLabel: question.label,
      type: question.type,
      totalResponses: 150,
      breakdown: this.generateMockBreakdown(question)
    };
  }

  generateMockBreakdown(question: any): { [key: string]: { count: number; percentage: number } } {
    if (question.type === 'boolean') {
      return {
        'true': { count: 45, percentage: 30 },
        'false': { count: 105, percentage: 70 }
      };
    }
    
    if (question.options) {
      const breakdown: { [key: string]: { count: number; percentage: number } } = {};
      question.options.forEach((opt: string, index: number) => {
        breakdown[opt] = {
          count: Math.floor(Math.random() * 50) + 10,
          percentage: Math.floor(Math.random() * 30) + 5
        };
      });
      return breakdown;
    }
    
    return {};
  }

  getBreakdownItems(): { label: string; count: number; percentage: number }[] {
    if (!this.selectedQuestionAnalytics) return [];
    
    return Object.entries(this.selectedQuestionAnalytics.breakdown).map(([key, value]) => ({
      label: key === 'true' ? 'Sim' : key === 'false' ? 'Não' : key,
      count: value.count,
      percentage: value.percentage
    }));
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      text: 'Texto',
      select: 'Seleção',
      boolean: 'Sim/Não',
      multiple_choice: 'Múltipla Escolha'
    };
    return labels[type] || type;
  }

  exportCSV(): void {
    this.snackBar.open('Exportação CSV em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  exportJSON(): void {
    this.snackBar.open('Exportação JSON em desenvolvimento', 'Fechar', { duration: 2000 });
  }
}
