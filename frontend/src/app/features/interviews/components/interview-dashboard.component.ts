// src/app/features/interviews/components/interview-dashboard.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

import { InterviewService } from '../../../core/services/interview.service';
import { InterviewResponse, FormDefinition } from '../../../core/models/interview.model';

interface InterviewStats {
  totalResponses: number;
  completedCount: number;
  pendingCount: number;
  byFormVersion: { [version: string]: number };
}

interface AnswerStats {
  questionLabel: string;
  questionKey: string;
  type: string;
  responses: { value: string; count: number; percentage: number }[];
}

@Component({
  selector: 'app-interview-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="dashboard-container">
      <mat-card class="header-card">
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>analytics</mat-icon>
          </div>
          <mat-card-title>Dashboard de Entrevistas</mat-card-title>
          <mat-card-subtitle>Análise das entrevistas socioeducacionais</mat-card-subtitle>
        </mat-card-header>
      </mat-card>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando dados...</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid" *ngIf="!isLoading">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon">assignment_turned_in</mat-icon>
          <div class="stat-value">{{ stats.totalResponses }}</div>
          <div class="stat-label">Total de Entrevistas</div>
        </mat-card>

        <mat-card class="stat-card success">
          <mat-icon class="stat-icon">check_circle</mat-icon>
          <div class="stat-value">{{ stats.completedCount }}</div>
          <div class="stat-label">Concluídas</div>
        </mat-card>

        <mat-card class="stat-card warning">
          <mat-icon class="stat-icon">pending</mat-icon>
          <div class="stat-value">{{ stats.pendingCount }}</div>
          <div class="stat-label">Pendentes</div>
        </mat-card>

        <mat-card class="stat-card info">
          <mat-icon class="stat-icon">description</mat-icon>
          <div class="stat-value">{{ forms.length }}</div>
          <div class="stat-label">Formulários</div>
        </mat-card>
      </div>

      <!-- Filter by Form -->
      <mat-card class="filter-card" *ngIf="!isLoading && forms.length > 0">
        <mat-card-content>
          <mat-form-field appearance="outline">
            <mat-label>Filtrar por Formulário</mat-label>
            <mat-select [(ngModel)]="selectedFormVersion" (selectionChange)="onFormChange()">
              <mat-option value="">Todos os formulários</mat-option>
              <mat-option *ngFor="let form of forms" [value]="form.version">
                {{ form.title }} ({{ form.version }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Recent Responses Table -->
      <mat-card class="table-card" *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title>Entrevistas Recentes</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="recentResponses" class="responses-table">
            
            <ng-container matColumnDef="studentId">
              <th mat-header-cell *matHeaderCellDef>Aluno ID</th>
              <td mat-cell *matCellDef="let response">{{ response.studentId }}</td>
            </ng-container>

            <ng-container matColumnDef="formVersion">
              <th mat-header-cell *matHeaderCellDef>Formulário</th>
              <td mat-cell *matCellDef="let response">
                <mat-chip>{{ response.formVersion }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let response">
                <mat-chip [color]="response.status === 'completed' ? 'primary' : 'warn'" 
                         [highlighted]="response.status === 'completed'">
                  {{ response.status === 'completed' ? 'Concluída' : 'Pendente' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="completionDate">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let response">
                {{ response.completionDate | date:'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Ações</th>
              <td mat-cell *matCellDef="let response">
                <button mat-icon-button 
                        [routerLink]="['/interviews/response', response.id]"
                        matTooltip="Ver detalhes">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div class="empty-state" *ngIf="recentResponses.length === 0">
            <mat-icon>inbox</mat-icon>
            <p>Nenhuma entrevista encontrada</p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Quick Actions -->
      <mat-card class="actions-card" *ngIf="!isLoading">
        <mat-card-header>
          <mat-card-title>Ações Rápidas</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="quick-actions">
            <button mat-raised-button color="primary" routerLink="/interviews/new">
              <mat-icon>add</mat-icon>
              Novo Formulário
            </button>
            <button mat-raised-button color="accent" routerLink="/interviews">
              <mat-icon>list</mat-icon>
              Ver Formulários
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
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

      &.success .stat-icon {
        color: #4caf50;
      }

      &.warning .stat-icon {
        color: #ff9800;
      }

      &.info .stat-icon {
        color: #2196f3;
      }
    }

    .filter-card {
      margin-bottom: 24px;
    }

    .table-card {
      margin-bottom: 24px;

      .responses-table {
        width: 100%;
      }

      .empty-state {
        text-align: center;
        padding: 48px;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #ccc;
          margin-bottom: 16px;
        }

        p {
          color: #666;
        }
      }
    }

    .actions-card {
      .quick-actions {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }
    }
  `]
})
export class InterviewDashboardComponent implements OnInit {
  private interviewService = inject(InterviewService);
  private snackBar = inject(MatSnackBar);

  forms: FormDefinition[] = [];
  allResponses: InterviewResponse[] = [];
  recentResponses: InterviewResponse[] = [];
  selectedFormVersion: string = '';
  
  stats: InterviewStats = {
    totalResponses: 0,
    completedCount: 0,
    pendingCount: 0,
    byFormVersion: {}
  };
  
  isLoading = true;
  displayedColumns: string[] = ['studentId', 'formVersion', 'status', 'completionDate', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // Carregar formulários
    this.interviewService.listForms().subscribe(forms => {
      this.forms = forms;
    });

    // Carregar todas as respostas (de todos os formulários)
    // Nota: Idealmente teríamos um endpoint específico para listar todas as respostas
    // Por enquanto, vamos simular com dados vazios ou usar o que temos
    this.simulateLoadResponses();
  }

  private simulateLoadResponses(): void {
    // Como não temos um endpoint para listar todas as respostas,
    // vamos simular dados para demonstração
    // Em produção, você criaria um endpoint específico no backend
    
    setTimeout(() => {
      this.allResponses = [];
      this.recentResponses = [];
      this.calculateStats();
      this.isLoading = false;
    }, 1000);
  }

  private calculateStats(): void {
    this.stats = {
      totalResponses: this.allResponses.length,
      completedCount: this.allResponses.filter(r => r.status === 'completed').length,
      pendingCount: this.allResponses.filter(r => r.status === 'pending').length,
      byFormVersion: {}
    };

    // Contar por versão de formulário
    this.allResponses.forEach(response => {
      const version = response.formVersion;
      this.stats.byFormVersion[version] = (this.stats.byFormVersion[version] || 0) + 1;
    });
  }

  onFormChange(): void {
    if (this.selectedFormVersion) {
      // Filtrar respostas pelo formulário selecionado
      this.interviewService.getFormResponses(this.selectedFormVersion).subscribe(responses => {
        this.recentResponses = responses.slice(0, 10); // Últimas 10
        this.calculateFilteredStats(responses);
      });
    } else {
      this.recentResponses = this.allResponses.slice(0, 10);
      this.calculateStats();
    }
  }

  private calculateFilteredStats(responses: InterviewResponse[]): void {
    this.stats.totalResponses = responses.length;
    this.stats.completedCount = responses.filter(r => r.status === 'completed').length;
    this.stats.pendingCount = responses.filter(r => r.status === 'pending').length;
  }
}
