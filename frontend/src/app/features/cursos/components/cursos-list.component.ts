// src/app/features/cursos/components/cursos-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime, switchMap, catchError } from 'rxjs/operators';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

// Serviços e componentes personalizados
import { CursoService } from '../../../core/services/curso.service';
import { Curso, PaginatedResponse } from '../../../core/models/curso.model';
import { PrototypeHighlightDirective } from '../../../shared/directives/prototype-highlight.directive';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatChipsModule,
    MatSnackBarModule,
    MatGridListModule,
    MatDividerModule,
    MatTooltipModule,
    PrototypeHighlightDirective
  ],
  template: `
    <!-- Indicador de modo protótipo -->
    <div *ngIf="isPrototypeMode$ | async" class="prototype-indicator" appPrototypeHighlight>
      <mat-icon>build</mat-icon> 
      Modo Protótipo Ativado - Listagem de Cursos com Dados Simulados
    </div>
    
    <div class="page-header">
      <h1>Cursos Disponíveis</h1>
      
      <!-- Campo de busca com Material Design -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar cursos</mat-label>
        <input matInput type="text" [formControl]="searchControl" placeholder="Digite o nome do curso">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>
    
    <!-- Área de carregamento -->
    <div *ngIf="loading" class="loading-container">
      <mat-spinner diameter="40"></mat-spinner>
      <p>Carregando cursos...</p>
    </div>
    
    <!-- Mensagem de erro -->
    <div *ngIf="error && !loading" class="error-container">
      <mat-icon color="warn">error</mat-icon>
      <p>{{ error }}</p>
      <button mat-raised-button color="primary" (click)="carregarCursos()">
        Tentar novamente
      </button>
    </div>
    
    <!-- Sem resultados -->
    <div *ngIf="!loading && !error && cursos.length === 0" class="empty-container">
      <mat-icon>search_off</mat-icon>
      <p>Nenhum curso encontrado.</p>
      <button mat-raised-button color="primary" (click)="limparBusca()">
        Limpar Busca
      </button>
    </div>
    
    <!-- Lista de cursos com Material Design Cards -->
    <div *ngIf="!loading && !error && cursos.length > 0" class="cursos-grid">
      <mat-card *ngFor="let curso of cursos" class="curso-card">
        <img *ngIf="curso.imagemUrl" 
             [src]="curso.imagemUrl" 
             alt="Imagem do curso {{ curso.nome }}"
             class="curso-imagem">
        
        <mat-card-content>
          <div class="curso-nivel">
            <span class="nivel-badge" 
                  [class.nivel-iniciante]="curso.nivelDificuldade?.includes('Iniciante')"
                  [class.nivel-intermediario]="curso.nivelDificuldade?.includes('Intermediário')"
                  [class.nivel-avancado]="curso.nivelDificuldade?.includes('Avançado')">
              {{ curso.nivelDificuldade || 'Iniciante' }}
            </span>
          </div>
          
          <h2 class="curso-titulo">{{ curso.nome }}</h2>
          <p class="curso-descricao">{{ curso.descricaoResumida }}</p>
          
          <div class="curso-info">
            <span class="info-item">
              <mat-icon>schedule</mat-icon>
              {{ curso.cargaHoraria }} horas
            </span>
            <span class="info-item">
              <mat-icon>date_range</mat-icon>
              {{ formatarDiasSemana(curso.diasSemanais) }}
            </span>
            <span class="info-item">
              <mat-icon>access_time</mat-icon>
              {{ curso.horarioInicio }} - {{ curso.horarioFim }}
            </span>
          </div>
          
          <div class="tags-container" *ngIf="curso.tags">
            <mat-chip-set>
              <mat-chip *ngFor="let tag of getTagsArray(curso.tags)">
                {{ tag }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </mat-card-content>
        
        <mat-card-actions align="end">
          <button mat-button [routerLink]="['/cursos', curso.id]" matTooltip="Ver detalhes do curso">
            <mat-icon>info</mat-icon> Detalhes
          </button>
          <button mat-raised-button color="primary" [routerLink]="['/cursos', curso.id]" matTooltip="Ver detalhes e matricular-se">
            <mat-icon>how_to_reg</mat-icon> Ver Curso
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
    
    <!-- Paginador do Angular Material -->
    <mat-paginator *ngIf="!loading && !error && totalCursos > 0"
                  [length]="totalCursos"
                  [pageSize]="pageSize"
                  [pageSizeOptions]="[4, 8, 12, 20]"
                  (page)="onPageChange($event)"
                  aria-label="Selecione a página">
    </mat-paginator>
  `,
  styles: [`
    .prototype-indicator {
      background-color: #ff9800;
      color: white;
      padding: 8px 16px;
      margin-bottom: 16px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 24px;
    }
    
    .page-header h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
    
    .search-field {
      min-width: 300px;
    }
    
    .loading-container, .error-container, .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 16px;
      text-align: center;
    }
    
    .loading-container mat-spinner, .error-container mat-icon, .empty-container mat-icon {
      margin-bottom: 16px;
    }
    
    .error-container mat-icon, .empty-container mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #f44336;
    }
    
    .empty-container mat-icon {
      color: #9e9e9e;
    }
    
    .cursos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .curso-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .curso-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
    
    .curso-imagem {
      height: 180px;
      object-fit: cover;
      width: 100%;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
    
    .curso-nivel {
      margin-bottom: 8px;
    }
    
    .nivel-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      background-color: #e0e0e0;
    }
    
    .nivel-iniciante {
      background-color: #4caf50;
      color: white;
    }
    
    .nivel-intermediario {
      background-color: #ff9800;
      color: white;
    }
    
    .nivel-avancado {
      background-color: #f44336;
      color: white;
    }
    
    .curso-titulo {
      margin: 8px 0;
      font-size: 18px;
      font-weight: 500;
      color: #333;
      line-height: 1.3;
    }
    
    .curso-descricao {
      margin: 0 0 16px 0;
      color: #555;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.5;
    }
    
    .curso-info {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #666;
    }
    
    .info-item mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }
    
    .tags-container {
      margin-bottom: 16px;
    }
    
    mat-card-content {
      flex-grow: 1;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }
      
      .page-header h1 {
        margin-bottom: 16px;
      }
      
      .search-field {
        width: 100%;
        min-width: auto;
      }
      
      .cursos-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CursosListComponent implements OnInit {
  cursos: Curso[] = [];
  loading = false;
  error: string | null = null;
  searchControl = new FormControl('');
  
  // Paginação
  page = 1;
  pageSize = 8;
  totalCursos = 0;
  totalPages = 0;
  
  // Modo protótipo
  isPrototypeMode$: Observable<boolean>;
  
  constructor(
    private cursoService: CursoService,
    private snackBar: MatSnackBar,
    private prototypeService: PrototypeService
  ) {
    this.isPrototypeMode$ = this.prototypeService.prototypeEnabled$;
  }
  
  ngOnInit() {
    // Carregar cursos iniciais
    this.carregarCursos();
    
    // Configurar busca com debounce
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Aguardar 300ms após última digitação
      switchMap(term => {
        if (!term) {
          // Se o termo de busca for vazio, carrega todos os cursos
          return this.realizarBusca('');
        }
        
        this.loading = true;
        return this.realizarBusca(term);
      })
    ).subscribe();
  }
  
  carregarCursos() {
    this.loading = true;
    this.error = null;
    
    this.cursoService.getCursos(this.page, this.pageSize).subscribe({
      next: (response: PaginatedResponse<Curso>) => {
        this.cursos = response.data;
        this.totalCursos = response.meta.total;
        this.totalPages = response.meta.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = `Erro ao carregar cursos: ${err.message || 'Erro desconhecido'}`;
        this.loading = false;
        this.snackBar.open('Falha ao carregar cursos. Por favor, tente novamente.', 'Fechar', {
          duration: 5000
        });
      }
    });
  }
  
  onPageChange(event: PageEvent) {
    this.page = event.pageIndex + 1; // O pageIndex é baseado em zero
    this.pageSize = event.pageSize;
    
    // Recarregar cursos com novos parâmetros de paginação
    const searchTerm = this.searchControl.value || '';
    this.realizarBusca(searchTerm).subscribe();
  }
  
  realizarBusca(termo: string | null) {
    this.loading = true;
    this.error = null;
    
    if (!termo) {
      return this.cursoService.getCursos(this.page, this.pageSize).pipe(
        map((response: PaginatedResponse<Curso>) => {
          this.cursos = response.data;
          this.totalCursos = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.loading = false;
          return response;
        }),
        catchError(err => {
          this.error = `Erro ao carregar cursos: ${err.message || 'Erro desconhecido'}`;
          this.loading = false;
          return [];
        })
      );
    }
    
    return this.cursoService.buscarCursos(termo, this.page, this.pageSize).pipe(
      map((response: PaginatedResponse<Curso>) => {
        this.cursos = response.data;
        this.totalCursos = response.meta.total;
        this.totalPages = response.meta.totalPages;
        this.loading = false;
        return response;
      }),
      catchError(err => {
        this.error = `Erro ao buscar cursos: ${err.message || 'Erro desconhecido'}`;
        this.loading = false;
        return [];
      })
    );
  }
  
  limparBusca() {
    this.searchControl.setValue('');
    this.page = 1;
    this.carregarCursos();
  }
  
  // Métodos auxiliares para formatação
  formatarDiasSemana(diasStr: string | undefined): string {
    if (!diasStr) return 'Não especificado';
    
    const diasMap: { [key: string]: string } = {
      '1': 'Seg',
      '2': 'Ter',
      '3': 'Qua',
      '4': 'Qui',
      '5': 'Sex',
      '6': 'Sáb',
      '0': 'Dom'
    };
    
    return diasStr.split(',')
      .map(dia => diasMap[dia.trim()] || dia.trim())
      .join(', ');
  }
  
  getTagsArray(tagsStr: string | undefined): string[] {
    if (!tagsStr) return [];
    return tagsStr.split(',').map(tag => tag.trim());
  }
}