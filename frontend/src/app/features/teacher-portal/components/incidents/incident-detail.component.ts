// src/app/features/teacher-portal/components/incidents/incident-detail.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { IncidentService, Incident, IncidentComment } from '../../../../core/services/incident.service';

@Component({
  selector: 'app-incident-detail',
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
    MatDividerModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  template: `
    <div class="detail-container">
      <!-- Header -->
      <div class="header">
        <button mat-button routerLink="/teacher/incidents">
          <mat-icon>arrow_back</mat-icon>
          Voltar para Lista
        </button>
        <div class="header-actions" *ngIf="incident">
          <button 
            mat-raised-button 
            color="primary"
            *ngIf="incident.status === 'open' || incident.status === 'in_analysis'"
            (click)="resolveIncident()"
          >
            <mat-icon>check_circle</mat-icon>
            Resolver
          </button>
          <button 
            mat-stroked-button
            *ngIf="incident.status === 'resolved'"
            (click)="reopenIncident()"
          >
            <mat-icon>replay</mat-icon>
            Reabrir
          </button>
          <button 
            mat-icon-button 
            color="warn"
            *ngIf="canDelete()"
            (click)="deleteIncident()"
            matTooltip="Excluir Ocorrência"
          >
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando detalhes da ocorrência...</p>
      </div>

      <!-- Content -->
      <div class="content" *ngIf="!isLoading && incident">
        <!-- Main Info Card -->
        <mat-card class="info-card">
          <mat-card-header>
            <div class="header-badges">
              <mat-chip [class]="'type-' + incident.type">
                {{ getTypeLabel(incident.type) }}
              </mat-chip>
              <mat-chip [class]="'severity-' + incident.severity">
                {{ getSeverityLabel(incident.severity) }}
              </mat-chip>
              <mat-chip [class]="'status-' + incident.status">
                {{ getStatusLabel(incident.status) }}
              </mat-chip>
            </div>
          </mat-card-header>

          <mat-card-content>
            <h1 class="incident-title">{{ incident.title }}</h1>
            
            <div class="meta-grid">
              <div class="meta-item">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <label>Data de Criação</label>
                  <span>{{ incident.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>

              <div class="meta-item" *ngIf="incident.updatedAt !== incident.createdAt">
                <mat-icon>update</mat-icon>
                <div>
                  <label>Última Atualização</label>
                  <span>{{ incident.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>

              <div class="meta-item" *ngIf="incident.reportedByName">
                <mat-icon>person</mat-icon>
                <div>
                  <label>Reportado por</label>
                  <span>{{ incident.reportedByName }}</span>
                </div>
              </div>

              <div class="meta-item" *ngIf="incident.courseName">
                <mat-icon>school</mat-icon>
                <div>
                  <label>Curso</label>
                  <span>{{ incident.courseName }}</span>
                </div>
              </div>

              <div class="meta-item" *ngIf="incident.studentName">
                <mat-icon>person_outline</mat-icon>
                <div>
                  <label>Aluno Envolvido</label>
                  <span>{{ incident.studentName }}</span>
                </div>
              </div>

              <div class="meta-item" *ngIf="incident.resolvedAt">
                <mat-icon>check_circle</mat-icon>
                <div>
                  <label>Data de Resolução</label>
                  <span>{{ incident.resolvedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
              </div>

              <div class="meta-item" *ngIf="incident.resolvedByName">
                <mat-icon>verified_user</mat-icon>
                <div>
                  <label>Resolvido por</label>
                  <span>{{ incident.resolvedByName }}</span>
                </div>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="description-section">
              <h3>Descrição</h3>
              <p class="description-text">{{ incident.description }}</p>
            </div>

            <div class="resolution-section" *ngIf="incident.resolutionNotes">
              <mat-divider></mat-divider>
              <h3>Notas de Resolução</h3>
              <p class="resolution-text">{{ incident.resolutionNotes }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Comments Section -->
        <mat-card class="comments-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>chat</mat-icon>
              Comentários
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <!-- Comment List -->
            <div class="comments-list" *ngIf="comments.length > 0">
              <div class="comment-item" *ngFor="let comment of comments">
                <div class="comment-avatar">
                  <mat-icon>person</mat-icon>
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.userName }}</span>
                    <span class="comment-date">{{ comment.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <p class="comment-text">{{ comment.comment }}</p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div class="comments-empty" *ngIf="comments.length === 0">
              <mat-icon>chat_bubble_outline</mat-icon>
              <p>Nenhum comentário ainda.</p>
              <p class="empty-subtitle">Seja o primeiro a comentar.</p>
            </div>

            <!-- Add Comment -->
            <div class="add-comment" *ngIf="incident.status !== 'resolved' && incident.status !== 'cancelled'">
              <mat-divider></mat-divider>
              <mat-form-field appearance="outline" class="comment-field">
                <mat-label>Adicionar comentário</mat-label>
                <textarea 
                  matInput 
                  [(ngModel)]="newComment"
                  rows="3"
                  placeholder="Escreva seu comentário..."
                ></textarea>
              </mat-form-field>
              <button 
                mat-raised-button 
                color="primary"
                [disabled]="!newComment.trim() || isSubmittingComment"
                (click)="addComment()"
              >
                <mat-icon *ngIf="!isSubmittingComment">send</mat-icon>
                <mat-spinner diameter="20" *ngIf="isSubmittingComment"></mat-spinner>
                Enviar
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      padding: 24px;
      max-width: 900px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

      button {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;

        button {
          display: flex;
          align-items: center;
          gap: 4px;
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

    .content {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .info-card {
      mat-card-header {
        margin-bottom: 16px;

        .header-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      }

      .incident-title {
        font-size: 24px;
        font-weight: 500;
        margin: 0 0 24px 0;
        color: #333;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 24px;

        .meta-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;

          mat-icon {
            color: #006aac;
            margin-top: 2px;
          }

          > div {
            display: flex;
            flex-direction: column;

            label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            span {
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

      .description-section,
      .resolution-section {
        h3 {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin: 0 0 12px 0;
        }

        .description-text,
        .resolution-text {
          color: #555;
          line-height: 1.7;
          margin: 0;
          white-space: pre-wrap;
        }
      }

      .resolution-section {
        background-color: #f5f5f5;
        padding: 16px;
        border-radius: 8px;
      }
    }

    .comments-card {
      mat-card-header {
        margin-bottom: 16px;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;

          mat-icon {
            color: #006aac;
          }
        }
      }

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 24px;

        .comment-item {
          display: flex;
          gap: 12px;

          .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #e3f2fd;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            mat-icon {
              color: #006aac;
            }
          }

          .comment-content {
            flex: 1;
            background-color: #f5f5f5;
            padding: 12px 16px;
            border-radius: 12px;

            .comment-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;

              .comment-author {
                font-weight: 500;
                color: #333;
              }

              .comment-date {
                font-size: 12px;
                color: #999;
              }
            }

            .comment-text {
              margin: 0;
              color: #555;
              line-height: 1.5;
            }
          }
        }
      }

      .comments-empty {
        text-align: center;
        padding: 32px;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #ccc;
          margin-bottom: 12px;
        }

        p {
          margin: 0 0 4px;
          color: #666;
        }

        .empty-subtitle {
          font-size: 14px;
          color: #999;
        }
      }

      .add-comment {
        mat-divider {
          margin: 16px 0 24px;
        }

        .comment-field {
          width: 100%;
          margin-bottom: 16px;
        }

        button {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }

    // Chip Styles
    ::ng-deep {
      .type-disciplinary {
        background-color: #fff3e0 !important;
        color: #ef6c00 !important;
      }

      .type-infrastructure {
        background-color: #ffebee !important;
        color: #c62828 !important;
      }

      .type-health {
        background-color: #e8f5e9 !important;
        color: #2e7d32 !important;
      }

      .type-safety {
        background-color: #e3f2fd !important;
        color: #1565c0 !important;
      }

      .type-other {
        background-color: #f5f5f5 !important;
        color: #616161 !important;
      }

      .severity-low {
        background-color: #e8f5e9 !important;
        color: #2e7d32 !important;
      }

      .severity-medium {
        background-color: #fff3e0 !important;
        color: #ef6c00 !important;
      }

      .severity-high {
        background-color: #ffebee !important;
        color: #c62828 !important;
      }

      .severity-critical {
        background-color: #b71c1c !important;
        color: white !important;
      }

      .status-open {
        background-color: #006aac !important;
        color: white !important;
      }

      .status-in_analysis {
        background-color: #ff9800 !important;
        color: white !important;
      }

      .status-resolved {
        background-color: #4caf50 !important;
        color: white !important;
      }

      .status-cancelled {
        background-color: #9e9e9e !important;
        color: white !important;
      }
    }

    @media (max-width: 768px) {
      .detail-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        .header-actions {
          width: 100%;
          flex-wrap: wrap;
        }
      }

      .info-card {
        .meta-grid {
          grid-template-columns: 1fr;
        }
      }
    }
  `]
})
export class IncidentDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private incidentService = inject(IncidentService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  incident: Incident | null = null;
  comments: IncidentComment[] = [];
  isLoading = false;
  newComment = '';
  isSubmittingComment = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadIncident(parseInt(id, 10));
    } else {
      this.router.navigate(['/teacher/incidents']);
    }
  }

  loadIncident(id: number): void {
    this.isLoading = true;
    
    this.incidentService.getIncident(id).subscribe({
      next: (incident) => {
        this.incident = incident;
        this.isLoading = false;
        this.loadComments(id);
      },
      error: (err) => {
        console.error('Erro ao carregar ocorrência:', err);
        this.snackBar.open('Erro ao carregar ocorrência.', 'Fechar', { duration: 5000 });
        this.isLoading = false;
        this.router.navigate(['/teacher/incidents']);
      }
    });
  }

  loadComments(incidentId: number): void {
    this.incidentService.getComments(incidentId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => {
        console.error('Erro ao carregar comentários:', err);
      }
    });
  }

  addComment(): void {
    if (!this.newComment.trim() || !this.incident) return;

    this.isSubmittingComment = true;
    
    this.incidentService.addComment(this.incident.id!, this.newComment).subscribe({
      next: () => {
        this.newComment = '';
        this.isSubmittingComment = false;
        this.loadComments(this.incident!.id!);
        this.snackBar.open('Comentário adicionado.', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        console.error('Erro ao adicionar comentário:', err);
        this.isSubmittingComment = false;
        this.snackBar.open('Erro ao adicionar comentário.', 'Fechar', { duration: 5000 });
      }
    });
  }

  resolveIncident(): void {
    if (!this.incident) return;
    
    const notes = prompt('Adicione notas sobre a resolução:');
    if (notes === null) return;

    this.incidentService.resolveIncident(this.incident.id!, notes).subscribe({
      next: () => {
        this.snackBar.open('Ocorrência resolvida com sucesso!', 'Fechar', { duration: 3000 });
        this.loadIncident(this.incident!.id!);
      },
      error: (err) => {
        console.error('Erro ao resolver ocorrência:', err);
        this.snackBar.open('Erro ao resolver ocorrência.', 'Fechar', { duration: 5000 });
      }
    });
  }

  reopenIncident(): void {
    if (!this.incident) return;

    this.incidentService.reopenIncident(this.incident.id!).subscribe({
      next: () => {
        this.snackBar.open('Ocorrência reaberta.', 'Fechar', { duration: 3000 });
        this.loadIncident(this.incident!.id!);
      },
      error: (err) => {
        console.error('Erro ao reabrir ocorrência:', err);
        this.snackBar.open('Erro ao reabrir ocorrência.', 'Fechar', { duration: 5000 });
      }
    });
  }

  deleteIncident(): void {
    if (!this.incident) return;

    if (!confirm('Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.incidentService.deleteIncident(this.incident.id!).subscribe({
      next: () => {
        this.snackBar.open('Ocorrência excluída.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/teacher/incidents']);
      },
      error: (err) => {
        console.error('Erro ao excluir ocorrência:', err);
        this.snackBar.open('Erro ao excluir ocorrência.', 'Fechar', { duration: 5000 });
      }
    });
  }

  canDelete(): boolean {
    if (!this.incident) return false;
    // Only allow delete if status is open
    return this.incident.status === 'open';
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
