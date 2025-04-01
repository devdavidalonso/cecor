// src/app/features/alunos/components/alunos-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { AlunoService, Aluno, PaginatedResponse } from '../../../core/services/aluno.service';
import { debounceTime, finalize } from 'rxjs';

@Component({
  selector: 'app-alunos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule,
    MatSelectModule
  ],
  template: `
    <div class="list-container">
      <div class="actions-container">
        <h1>Alunos</h1>
        <button mat-raised-button color="primary" routerLink="/alunos/novo">
          <mat-icon>add</mat-icon> Novo Aluno
        </button>
      </div>
      
      <mat-card>
        <mat-card-content>
          <!-- Filtros -->
          <form [formGroup]="filtrosForm" class="filtros-form">
            <div class="filtros-row">
              <mat-form-field appearance="outline">
                <mat-label>Buscar</mat-label>
                <input matInput formControlName="termo" placeholder="Nome, e-mail ou CPF">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Status</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="ativo">Ativo</mat-option>
                  <mat-option value="inativo">Inativo</mat-option>
                  <mat-option value="suspenso">Suspenso</mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Curso</mat-label>
                <mat-select formControlName="cursoId">
                  <mat-option value="">Todos</mat-option>
                  <mat-option value="1">Informática Básica</mat-option>
                  <mat-option value="2">Corte e Costura</mat-option>
                  <mat-option value="3">Jiu-Jitsu Infantil</mat-option>
                  <mat-option value="4">Pintura em Tela</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
            
            <div class="filtros-actions">
              <button mat-button (click)="limparFiltros()">Limpar Filtros</button>
              <button mat-raised-button color="primary" (click)="buscarAlunos()">Filtrar</button>
            </div>
          </form>
          
          <!-- Loading indicator -->
          <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>
          
          <!-- Tabela de alunos -->
          <div class="table-container">
            <table mat-table [dataSource]="alunos" matSort (matSortChange)="sortData($event)">
              <!-- Nome Column -->
              <ng-container matColumnDef="nome">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Nome </th>
                <td mat-cell *matCellDef="let aluno"> {{aluno.nome}} </td>
              </ng-container>
              
              <!-- Idade/Data de Nascimento Column -->
              <ng-container matColumnDef="idade">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Idade </th>
                <td mat-cell *matCellDef="let aluno"> 
                  {{aluno.idade}} anos
                  <span class="nascimento-data">
                    ({{aluno.dataNascimento | date:'dd/MM/yyyy'}})
                  </span>
                </td>
              </ng-container>
              
              <!-- Contato Column -->
              <ng-container matColumnDef="contato">
                <th mat-header-cell *matHeaderCellDef> Contato </th>
                <td mat-cell *matCellDef="let aluno">
                  <div class="contato-info">
                    <span class="email">{{aluno.email}}</span>
                    <span class="telefone">{{aluno.telefonePrincipal}}</span>
                  </div>
                </td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef> Status </th>
                <td mat-cell *matCellDef="let aluno">
                  <mat-chip [color]="getStatusColor(aluno.status)">
                    {{aluno.status || 'Ativo'}}
                  </mat-chip>
                </td>
              </ng-container>
              
              <!-- Ações Column -->
              <ng-container matColumnDef="acoes">
                <th mat-header-cell *matHeaderCellDef> Ações </th>
                <td mat-cell *matCellDef="let aluno">
                  <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Ações">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item [routerLink]="['/alunos', aluno.id]">
                      <mat-icon>visibility</mat-icon>
                      <span>Ver Detalhes</span>
                    </button>
                    <button mat-menu-item [routerLink]="['/alunos/editar', aluno.id]">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button mat-menu-item [routerLink]="['/matriculas/nova']" [queryParams]="{alunoId: aluno.id}">
                      <mat-icon>how_to_reg</mat-icon>
                      <span>New Enrollment</span>
                    </button>
                    <button mat-menu-item (click)="excluirAluno(aluno.id)">
                      <mat-icon>delete</mat-icon>
                      <span>Excluir</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>
              
              <!-- Table setup -->
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  [routerLink]="['/alunos', row.id]" class="aluno-row"></tr>
              
              <!-- No data message -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell no-data-cell" [attr.colspan]="displayedColumns.length">
                  <ng-container *ngIf="!isLoading">
                    Nenhum aluno encontrado
                  </ng-container>
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Paginação -->
          <mat-paginator
            [length]="totalItems"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex"
            [pageSizeOptions]="[10, 20, 50, 100]"
            (page)="onPageChange($event)"
            showFirstLastButtons
            aria-label="Selecionar página de alunos">
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .list-container {
      padding: 20px;
    }
    
    .actions-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .filtros-form {
      margin-bottom: 20px;
    }
    
    .filtros-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .filtros-row mat-form-field {
      flex: 1 1 250px;
    }
    
    .filtros-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }
    
    .table-container {
      overflow-x: auto;
    }
    
    table {
      width: 100%;
    }
    
    .aluno-row {
      cursor: pointer;
    }
    
    .aluno-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    .contato-info {
      display: flex;
      flex-direction: column;
    }
    
    .email {
      font-size: 14px;
    }
    
    .telefone {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .nascimento-data {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
      margin-left: 4px;
    }
    
    .no-data-cell {
      padding: 16px;
      text-align: center;
      font-style: italic;
    }
    
    /* Responsive adjustments */
    @media (max-width: 600px) {
      .filtros-row {
        flex-direction: column;
      }
      
      .actions-container {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class AlunosListComponent implements OnInit {
  // Dados da tabela
  alunos: Aluno[] = [];
  displayedColumns: string[] = ['nome', 'idade', 'contato', 'status', 'acoes'];
  
  // Paginação
  pageIndex = 0;
  pageSize = 20;
  totalItems = 0;
  
  // Controle de carregamento
  isLoading = false;
  
  // Formulário de filtros
  filtrosForm: FormGroup;
  
  constructor(
    private alunoService: AlunoService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Inicializa formulário de filtros
    this.filtrosForm = this.fb.group({
      termo: [''],
      status: [''],
      cursoId: ['']
    });
  }
  
  ngOnInit(): void {
    // Carrega dados iniciais
    this.buscarAlunos();
    
    // Configura busca automática ao digitar no campo de busca após 500ms
    this.filtrosForm.get('termo')?.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.buscarAlunos();
      });
  }
  
  /**
   * Carrega alunos com filtros aplicados
   */
  buscarAlunos(): void {
    this.isLoading = true;
    
    // Prepara filtros
    const filtros: any = {
      ...this.filtrosForm.value
    };
    
    // Aplica filtro de termo (nome, email ou CPF)
    if (filtros.termo) {
      if (filtros.termo.match(/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)) {
        // Se for um CPF formatado
        filtros.cpf = filtros.termo;
        delete filtros.termo;
      } else if (filtros.termo.includes('@')) {
        // Se parecer um email
        filtros.email = filtros.termo;
        delete filtros.termo;
      } else {
        // Caso contrário, busca por nome
        filtros.nome = filtros.termo;
        delete filtros.termo;
      }
    } else {
      delete filtros.termo;
    }
    
    // Remove filtros vazios
    Object.keys(filtros).forEach(key => {
      if (!filtros[key]) {
        delete filtros[key];
      }
    });
    
    // Faz a chamada para a API
    this.alunoService.getAlunos(this.pageIndex + 1, this.pageSize, filtros)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: PaginatedResponse<Aluno>) => {
          this.alunos = response.data;
          this.totalItems = response.totalItems;
        },
        error: (error) => {
          console.error('Erro ao carregar alunos:', error);
          this.snackBar.open('Erro ao carregar alunos. Tente novamente mais tarde.', 'Fechar', { duration: 5000 });
        }
      });
  }
  
  /**
   * Limpa todos os filtros e recarrega dados
   */
  limparFiltros(): void {
    this.filtrosForm.reset({
      termo: '',
      status: '',
      cursoId: ''
    });
    this.buscarAlunos();
  }
  
  /**
   * Callback para evento de paginação
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.buscarAlunos();
  }
  
  /**
   * Callback para ordenação de colunas
   */
  sortData(sort: Sort): void {
    // Implementação de ordenação (em uma versão real, seria enviada para o backend)
    if (!sort.active || sort.direction === '') {
      return;
    }
    
    this.buscarAlunos();
  }
  
  /**
   * Retorna a cor do chip de status
   */
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'primary';
      case 'inativo':
        return 'warn';
      case 'suspenso':
        return 'accent';
      default:
        return 'primary';
    }
  }
  
  /**
   * Exclui um aluno após confirmação
   */
  excluirAluno(id: number): void {
    if (confirm('Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.')) {
      this.alunoService.excluirAluno(id)
        .subscribe({
          next: () => {
            this.snackBar.open('Aluno excluído com sucesso', 'Fechar', { duration: 3000 });
            this.buscarAlunos();
          },
          error: (error) => {
            console.error('Erro ao excluir aluno:', error);
            this.snackBar.open('Erro ao excluir aluno. Tente novamente mais tarde.', 'Fechar', { duration: 5000 });
          }
        });
    }
  }
}