// src/app/features/interviews/components/interviews-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

import { InterviewService } from '../../../core/services/interview.service';
import { FormDefinition, InterviewResponse } from '../../../core/models/interview.model';

@Component({
  selector: 'app-interviews-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <div class="interviews-list-container">
      <mat-card>
        <mat-card-header>
          <div mat-card-avatar class="header-icon">
            <mat-icon>assignment</mat-icon>
          </div>
          <mat-card-title>Formulários de Entrevista</mat-card-title>
          <mat-card-subtitle>Gerencie os questionários socioeducacionais</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Actions Bar -->
          <div class="actions-bar">
            <div class="stats">
              <mat-chip-set>
                <mat-chip [highlighted]="true" color="primary">
                  <mat-icon matChipAvatar>check_circle</mat-icon>
                  {{ activeFormsCount }} Ativo(s)
                </mat-chip>
                <mat-chip>
                  <mat-icon matChipAvatar>folder</mat-icon>
                  {{ forms.length }} Total
                </mat-chip>
              </mat-chip-set>
            </div>
            <button mat-raised-button color="primary" routerLink="/interviews/new">
              <mat-icon>add</mat-icon>
              Novo Formulário
            </button>
          </div>

          <!-- Loading State -->
          <div class="loading-state" *ngIf="isLoading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Carregando formulários...</p>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="!isLoading && forms.length === 0">
            <mat-icon>assignment_late</mat-icon>
            <h3>Nenhum formulário encontrado</h3>
            <p>Crie seu primeiro formulário de entrevista socioeducacional.</p>
            <button mat-raised-button color="primary" routerLink="/interviews/new">
              <mat-icon>add</mat-icon>
              Criar Formulário
            </button>
          </div>

          <!-- Forms Table -->
          <table mat-table [dataSource]="forms" class="forms-table" *ngIf="!isLoading && forms.length > 0">
            
            <!-- Title Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Formulário</th>
              <td mat-cell *matCellDef="let form">
                <div class="form-title">
                  <strong>{{ form.title }}</strong>
                  <span class="version">{{ form.version }}</span>
                  <mat-icon *ngIf="form.isActive" class="active-icon" color="primary" matTooltip="Formulário Ativo">
                    check_circle
                  </mat-icon>
                </div>
                <div class="form-description" *ngIf="form.description">
                  {{ form.description | slice:0:60 }}{{ form.description.length > 60 ? '...' : '' }}
                </div>
              </td>
            </ng-container>

            <!-- Questions Count Column -->
            <ng-container matColumnDef="questions">
              <th mat-header-cell *matHeaderCellDef>Perguntas</th>
              <td mat-cell *matCellDef="let form">
                <span class="questions-count">
                  <mat-icon>quiz</mat-icon>
                  {{ form.questions?.length || 0 }}
                </span>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let form">
                <mat-chip [color]="form.isActive ? 'primary' : 'default'" [highlighted]="form.isActive">
                  {{ form.isActive ? 'Ativo' : 'Inativo' }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Created At Column -->
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Criado em</th>
              <td mat-cell *matCellDef="let form">
                {{ form.createdAt | date:'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-header">Ações</th>
              <td mat-cell *matCellDef="let form" class="actions-cell">
                <button mat-icon-button 
                        [color]="form.isActive ? 'warn' : 'primary'"
                        (click)="toggleStatus(form)"
                        [matTooltip]="form.isActive ? 'Desativar' : 'Ativar'">
                  <mat-icon>{{ form.isActive ? 'toggle_off' : 'toggle_on' }}</mat-icon>
                </button>
                
                <button mat-icon-button 
                        color="primary" 
                        [routerLink]="['/interviews/edit', form.id]"
                        matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                
                <button mat-icon-button 
                        [matMenuTriggerFor]="menu"
                        matTooltip="Mais opções">
                  <mat-icon>more_vert</mat-icon>
                </button>
                
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewResponses(form)">
                    <mat-icon>visibility</mat-icon>
                    <span>Ver Respostas</span>
                  </button>
                  <button mat-menu-item (click)="duplicateForm(form)">
                    <mat-icon>content_copy</mat-icon>
                    <span>Duplicar</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item (click)="deleteForm(form)" class="delete-option">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>Excluir</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.active-row]="row.isActive"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Quick Help Card -->
      <mat-card class="help-card" *ngIf="!isLoading">
        <mat-card-header>
          <mat-icon mat-card-avatar>help_outline</mat-icon>
          <mat-card-title>Como funciona?</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="help-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <strong>Crie o formulário</strong>
                <p>Adicione perguntas do tipo texto, seleção, sim/não ou múltipla escolha.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <strong>Ative o formulário</strong>
                <p>Apenas formulários ativos são exibidos durante o processo de matrícula.</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <strong>Responda na matrícula</strong>
                <p>Após matricular um aluno, o sistema solicitará o preenchimento da entrevista.</p>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .interviews-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 24px;
    }

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

    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      
      p {
        margin-top: 16px;
        color: #666;
      }
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      
      mat-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #ccc;
        margin-bottom: 16px;
      }
      
      h3 {
        margin: 0 0 8px;
        color: #333;
      }
      
      p {
        color: #666;
        margin-bottom: 24px;
      }
    }

    .forms-table {
      width: 100%;
      
      .form-title {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .version {
          font-size: 12px;
          color: #666;
          background-color: #f5f5f5;
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        .active-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
      
      .form-description {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }
      
      .questions-count {
        display: flex;
        align-items: center;
        gap: 4px;
        
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          color: #666;
        }
      }
      
      .actions-header {
        text-align: center;
      }
      
      .actions-cell {
        display: flex;
        gap: 4px;
        justify-content: center;
      }
      
      .active-row {
        background-color: #f5f5f5;
      }
    }

    .delete-option {
      color: #f44336;
    }

    .help-card {
      background-color: #f9f9f9;
      
      mat-icon {
        color: #666;
      }
      
      .help-steps {
        display: flex;
        gap: 24px;
        margin-top: 16px;
        
        .step {
          display: flex;
          gap: 12px;
          flex: 1;
          
          .step-number {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #006aac;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
          }
          
          .step-content {
            strong {
              display: block;
              margin-bottom: 4px;
              color: #333;
            }
            
            p {
              margin: 0;
              font-size: 13px;
              color: #666;
              line-height: 1.4;
            }
          }
        }
      }
    }
  `]
})
export class InterviewsListComponent implements OnInit {
  private interviewService = inject(InterviewService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  forms: FormDefinition[] = [];
  isLoading = true;
  displayedColumns: string[] = ['title', 'questions', 'status', 'createdAt', 'actions'];

  get activeFormsCount(): number {
    return this.forms.filter(f => f.isActive).length;
  }

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.isLoading = true;
    this.interviewService.listForms().subscribe(forms => {
      this.forms = forms;
      this.isLoading = false;
    });
  }

  toggleStatus(form: FormDefinition): void {
    if (!form.id) return;

    const action = form.isActive 
      ? this.interviewService.deactivateForm(form.id)
      : this.interviewService.activateForm(form.id);

    action.subscribe(success => {
      if (success) {
        form.isActive = !form.isActive;
        this.snackBar.open(
          `Formulário ${form.isActive ? 'ativado' : 'desativado'} com sucesso!`,
          'Fechar',
          { duration: 3000 }
        );
      } else {
        this.snackBar.open('Erro ao alterar status', 'Fechar', { duration: 3000 });
      }
    });
  }

  deleteForm(form: FormDefinition): void {
    if (!form.id) return;

    if (confirm(`Tem certeza que deseja excluir o formulário "${form.title}"?\n\nEsta ação não pode ser desfeita.`)) {
      this.interviewService.deleteForm(form.id).subscribe(success => {
        if (success) {
          this.forms = this.forms.filter(f => f.id !== form.id);
          this.snackBar.open('Formulário excluído com sucesso!', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open('Erro ao excluir formulário', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  duplicateForm(form: FormDefinition): void {
    const duplicated: FormDefinition = {
      ...form,
      id: undefined,
      title: `${form.title} (Cópia)`,
      version: `${form.version}_copy`,
      isActive: false,
      createdAt: undefined
    };

    this.interviewService.createForm(duplicated).subscribe(newForm => {
      if (newForm) {
        this.forms.unshift(newForm);
        this.snackBar.open('Formulário duplicado com sucesso!', 'Fechar', { duration: 3000 });
      } else {
        this.snackBar.open('Erro ao duplicar formulário', 'Fechar', { duration: 3000 });
      }
    });
  }

  viewResponses(form: FormDefinition): void {
    // TODO: Navigate to responses view
    this.snackBar.open(`Visualização de respostas em desenvolvimento (${form.version})`, 'Fechar', { duration: 2000 });
  }
}
