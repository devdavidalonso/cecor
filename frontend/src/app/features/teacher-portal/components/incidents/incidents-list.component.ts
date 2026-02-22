// src/app/features/teacher-portal/components/incidents/incidents-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { IncidentService, Incident, IncidentStatistics } from '../../../../core/services/incident.service';

@Component({
  selector: 'app-incidents-list',
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
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="incidents-container">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <h1>Ocorrências</h1>
          <p>Gerencie ocorrências e problemas reportados</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/teacher/incidents/new">
          <mat-icon>add</mat-icon>
          Nova Ocorrência
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid" *ngIf="statistics">
        <mat-card class="stat-card">
          <mat-icon class="stat-icon">report_problem</mat-icon>
          <div class="stat-value">{{ statistics.openCount }}</div>
          <div class="stat-label">Ocorrências Abertas</div>
        </mat-card>
        <mat-card class="stat-card success">
          <mat-icon class="stat-icon">check_circle</mat-icon>
          <div class="stat-value">{{ statistics.resolvedToday }}</div>
          <div class="stat-label">Resolvidas Hoje</div>
        </mat-card>
        <mat-card class="stat-card warning">
          <mat-icon class="stat-icon">timeline</mat-icon>
          <div class="stat-value">{{ statistics.openThisWeek }}</div>
          <div class="stat-label">Novas Esta Semana</div>
        </mat-card>
        <mat-card class="stat-card info">
          <mat-icon class="stat-icon">insert_chart</mat-icon>
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">Total Geral</div>
        </mat-card>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select [(ngModel)]="filters.type" (selectionChange)="applyFilters()">
                <mat-option value="">Todos</mat-option>
                <mat-option value="disciplinary">Disciplinar</mat-option>
                <mat-option value="infrastructure">Infraestrutura</mat-option>
                <mat-option value="health">Saúde</mat-option>
                <mat-option value="safety">Segurança</mat-option>
                <mat-option value="other">Outros</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="filters.status" (selectionChange)="applyFilters()">
                <mat-option value="">Todos</mat-option>
                <mat-option value="open">Aberta</mat-option>
                <mat-option value="in_analysis">Em Análise</mat-option>
                <mat-option value="resolved">Resolvida</mat-option>
                <mat-option value="cancelled">Cancelada</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Severidade</mat-label>
              <mat-select [(ngModel)]="filters.severity" (selectionChange)="applyFilters()">
                <mat-option value="">Todas</mat-option>
                <mat-option value="low">Baixa</mat-option>
                <mat-option value="medium">Média</mat-option>
                <mat-option value="high">Alta</mat-option>
                <mat-option value="critical">Crítica</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar</mat-label>
              <input matInput [(ngModel)]="filters.search" (keyup.enter)="applyFilters()" placeholder="Título ou descrição">
              <button mat-icon-button matSuffix (click)="applyFilters()">
                <mat-icon>search</mat-icon>
              </button>
            </mat-form-field>

            <button mat-stroked-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Limpar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando ocorrências...</p>
      </div>

      <!-- Incidents List -->
      <div class="incidents-list" *ngIf="!isLoading">
        <mat-card 
          *ngFor="let incident of incidents" 
          class="incident-card"
          [class]="'status-' + incident.status"
        >
          <mat-card-header>
            <div class="incident-header-content">
              <div class="incident-title-row">
                <mat-chip [class]="'type-' + incident.type" class="type-chip">
                  {{ getTypeLabel(incident.type) }}
                </mat-chip>
                <h3 class="incident-title">{{ incident.title }}</h3>
              </div>
              <div class="incident-meta">
                <span class="meta-item">
                  <mat-icon>calendar_today</mat-icon>
                  {{ incident.createdAt | date:'dd/MM/yyyy HH:mm' }}
                </span>
                <span class="meta-item" *ngIf="incident.reportedByName">
                  <mat-icon>person</mat-icon>
                  {{ incident.reportedByName }}
                </span>
                <span class="meta-item" *ngIf="incident.courseName">
                  <mat-icon>school</mat-icon>
                  {{ incident.courseName }}
                </span>
                <span class="meta-item" *ngIf="incident.studentName">
                  <mat-icon>person_outline</mat-icon>
                  {{ incident.studentName }}
                </span>
              </div>
            </div>
            <div class="incident-badges">
              <mat-chip [class]="'severity-' + incident.severity" class="severity-chip">
                {{ getSeverityLabel(incident.severity) }}
              </mat-chip>
              <mat-chip [class]="'status-' + incident.status" class="status-chip">
                {{ getStatusLabel(incident.status) }}
              </mat-chip>
            </div>
          </mat-card-header>

          <mat-card-content>
            <p class="incident-description">{{ incident.description }}</p>
            
            <div class="resolution-info" *ngIf="incident.status === 'resolved' && incident.resolutionNotes">
              <mat-divider></mat-divider>
              <div class="resolution-content">
                <strong>Resolução:</strong>
                <p>{{ incident.resolutionNotes }}</p>
                <span class="resolved-by" *ngIf="incident.resolvedByName">
                  Resolvido por {{ incident.resolvedByName }} em {{ incident.resolvedAt | date:'dd/MM/yyyy' }}
                </span>
              </div>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-button [routerLink]="['/teacher/incidents', incident.id]">
              <mat-icon>visibility</mat-icon>
              Ver Detalhes
            </button>
            
            <button 
              mat-button 
              color="primary"
              *ngIf="incident.status === 'open' || incident.status === 'in_analysis'"
              (click)="resolveIncident(incident)"
            >
              <mat-icon>check_circle</mat-icon>
              Resolver
            </button>

            <button 
              mat-button 
              *ngIf="incident.status === 'resolved'"
              (click)="reopenIncident(incident)"
            >
              <mat-icon>replay</mat-icon>
              Reabrir
            </button>

            <button 
              mat-icon-button 
              color="warn"
              *ngIf="incident.status === 'open'"
              (click)="deleteIncident(incident)"
              matTooltip="Excluir"
            >
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Empty State -->
        <mat-card class="empty-card" *ngIf="incidents.length === 0">
          <mat-card-content>
            <mat-icon class="empty-icon">check_circle</mat-icon>
            <p>Nenhuma ocorrência encontrada.</p>
            <p class="empty-subtitle" *ngIf="hasActiveFilters()">Tente ajustar os filtros.</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Pagination -->
      <mat-paginator
        *ngIf="totalItems > 0"
        [length]="totalItems"
        [pageSize]="filters.size"
        [pageSizeOptions]="[10, 20, 50]"
        [pageIndex]="filters.page - 1"
        (page)="onPageChange($event)"
        aria-label="Paginação de ocorrências"
      ></mat-paginator>
    </div>
  `,
  styles: [`
    .incidents-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      .header-content {
        h1 {
          font-size: 28px;
          font-weight: 500;
          margin: 0;
          color: #333;
        }

        p {
          color: #666;
          margin: 4px 0 0 0;
        }
      }

      button {
        display: flex;
        align-items: center;
        gap: 8px;
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
        color: #0083c0;
      }
    }

    .filters-card {
      margin-bottom: 24px;

      .filters-row {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;

        mat-form-field {
          min-width: 150px;

          &.search-field {
            flex: 1;
            min-width: 200px;
          }
        }

        button {
          margin-top: -20px;
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

    .incidents-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .incident-card {
      border-left: 4px solid #ccc;

      &.status-open {
        border-left-color: #006aac;
      }

      &.status-in_analysis {
        border-left-color: #ff9800;
      }

      &.status-resolved {
        border-left-color: #4caf50;
      }

      &.status-cancelled {
        border-left-color: #9e9e9e;
      }

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;

        .incident-header-content {
          flex: 1;

          .incident-title-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .type-chip {
              font-size: 12px;
              padding: 4px 8px;
              height: auto;
            }

            .incident-title {
              margin: 0;
              font-size: 18px;
              font-weight: 500;
            }
          }

          .incident-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;

            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 13px;
              color: #666;

              mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
              }
            }
          }
        }

        .incident-badges {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
      }

      .incident-description {
        color: #555;
        line-height: 1.6;
        margin: 0 0 16px 0;
      }

      .resolution-info {
        mat-divider {
          margin: 16px 0;
        }

        .resolution-content {
          background-color: #f5f5f5;
          padding: 16px;
          border-radius: 8px;

          p {
            margin: 8px 0 0 0;
            color: #666;
          }

          .resolved-by {
            display: block;
            margin-top: 8px;
            font-size: 12px;
            color: #999;
          }
        }
      }

      mat-card-actions {
        display: flex;
        gap: 8px;
        padding: 8px 16px 16px;

        button {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .type-chip {
      &.type-disciplinary {
        background-color: #fff3e0;
        color: #ef6c00;
      }

      &.type-infrastructure {
        background-color: #ffebee;
        color: #c62828;
      }

      &.type-health {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      &.type-safety {
        background-color: #e3f2fd;
        color: #1565c0;
      }

      &.type-other {
        background-color: #f5f5f5;
        color: #616161;
      }
    }

    .severity-chip {
      &.severity-low {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      &.severity-medium {
        background-color: #fff3e0;
        color: #ef6c00;
      }

      &.severity-high {
        background-color: #ffebee;
        color: #c62828;
      }

      &.severity-critical {
        background-color: #b71c1c;
        color: white;
      }
    }

    .status-chip {
      &.status-open {
        background-color: #006aac;
        color: white;
      }

      &.status-in_analysis {
        background-color: #ff9800;
        color: white;
      }

      &.status-resolved {
        background-color: #4caf50;
        color: white;
      }

      &.status-cancelled {
        background-color: #9e9e9e;
        color: white;
      }
    }

    .empty-card {
      text-align: center;
      padding: 48px;

      .empty-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #4caf50;
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

    mat-paginator {
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .incidents-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .filters-card .filters-row {
        flex-direction: column;
        align-items: stretch;

        mat-form-field {
          width: 100%;
        }
      }

      .incident-card mat-card-header {
        flex-direction: column;

        .incident-badges {
          flex-direction: row;
          margin-top: 16px;
        }
      }
    }
  `]
})
export class IncidentsListComponent implements OnInit {
  private incidentService = inject(IncidentService);
  private snackBar = inject(MatSnackBar);

  incidents: Incident[] = [];
  statistics: IncidentStatistics | null = null;
  isLoading = false;
  totalItems = 0;

  filters = {
    type: '',
    status: '',
    severity: '',
    search: '',
    page: 1,
    size: 20
  };

  ngOnInit(): void {
    this.loadStatistics();
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.isLoading = true;
    
    this.incidentService.listIncidents(this.filters).subscribe({
      next: (response) => {
        this.incidents = response.data;
        this.totalItems = response.total;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar ocorrências:', err);
        this.snackBar.open('Erro ao carregar ocorrências.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  loadStatistics(): void {
    this.incidentService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (err) => {
        console.error('Erro ao carregar estatísticas:', err);
      }
    });
  }

  applyFilters(): void {
    this.filters.page = 1;
    this.loadIncidents();
  }

  clearFilters(): void {
    this.filters = {
      type: '',
      status: '',
      severity: '',
      search: '',
      page: 1,
      size: 20
    };
    this.loadIncidents();
  }

  hasActiveFilters(): boolean {
    return !!this.filters.type || !!this.filters.status || !!this.filters.severity || !!this.filters.search;
  }

  onPageChange(event: PageEvent): void {
    this.filters.page = event.pageIndex + 1;
    this.filters.size = event.pageSize;
    this.loadIncidents();
  }

  resolveIncident(incident: Incident): void {
    const notes = prompt('Adicione notas sobre a resolução:');
    if (notes === null) return;

    this.incidentService.resolveIncident(incident.id!, notes).subscribe({
      next: () => {
        this.snackBar.open('Ocorrência resolvida com sucesso!', 'Fechar', { duration: 3000 });
        this.loadIncidents();
        this.loadStatistics();
      },
      error: (err) => {
        console.error('Erro ao resolver ocorrência:', err);
        this.snackBar.open('Erro ao resolver ocorrência.', 'Fechar', { duration: 5000 });
      }
    });
  }

  reopenIncident(incident: Incident): void {
    this.incidentService.reopenIncident(incident.id!).subscribe({
      next: () => {
        this.snackBar.open('Ocorrência reaberta.', 'Fechar', { duration: 3000 });
        this.loadIncidents();
        this.loadStatistics();
      },
      error: (err) => {
        console.error('Erro ao reabrir ocorrência:', err);
        this.snackBar.open('Erro ao reabrir ocorrência.', 'Fechar', { duration: 5000 });
      }
    });
  }

  deleteIncident(incident: Incident): void {
    if (!confirm('Tem certeza que deseja excluir esta ocorrência?')) return;

    this.incidentService.deleteIncident(incident.id!).subscribe({
      next: () => {
        this.snackBar.open('Ocorrência excluída.', 'Fechar', { duration: 3000 });
        this.loadIncidents();
        this.loadStatistics();
      },
      error: (err) => {
        console.error('Erro ao excluir ocorrência:', err);
        this.snackBar.open('Erro ao excluir ocorrência.', 'Fechar', { duration: 5000 });
      }
    });
  }

  getTypeLabel(type: string): string {
    return this.incidentService.getTypeLabel(type);
  }

  getSeverityLabel(severity: string): string {
    return this.incidentService.getSeverityLabel(severity);
  }

  getStatusLabel(status: string): string {
    return this.incidentService.getStatusLabel(status);
  }
}
