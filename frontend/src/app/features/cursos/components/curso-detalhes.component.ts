// src/app/features/cursos/components/curso-detalhe.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Serviços e componentes personalizados
import { CursoService } from '../../../core/services/curso.service';
import { PrototypeService } from '../../../core/services/prototype/prototype.service';
import { PrototypeHighlightDirective } from '../../../shared/directives/prototype-highlight.directive';
import { AuthService } from '../../../core/services/auth.service';




// Modelo de dados
interface Curso {
  id?: number;
  nome: string;
  descricaoResumida: string;
  descricaoDetalhada: string;
  cargaHoraria: number;
  numeroMaximoAlunos: number;
  diasSemanais: string;
  horarioInicio: string;
  horarioFim: string;
  duracao: number;
  status: string;
  nivelDificuldade?: string;
  publicoAlvo?: string;
  requisitosPrevios?: string;
  tags?: string[];
  imagemUrl?: string;
}

@Component({
  selector: 'app-curso-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PrototypeHighlightDirective
  ],
  template: `
    <!-- Indicador de modo protótipo -->
    <div *ngIf="isPrototypeMode$ | async" class="prototype-indicator" [appPrototypeHighlight]="true">
      <mat-icon>build</mat-icon> Modo Protótipo - Dados de Exemplo
    </div>
    
    <!-- Área de carregamento e erro -->
    <div *ngIf="loading" class="loading-container">
      <mat-spinner diameter="40"></mat-spinner>
      <p>Carregando informações do curso...</p>
    </div>
    
    <div *ngIf="error" class="error-container">
      <mat-icon color="warn">error</mat-icon>
      <p>{{ error }}</p>
      <button mat-raised-button color="primary" (click)="carregarCurso()">
        Tentar novamente
      </button>
    </div>
    
    <!-- Conteúdo principal - Exibido com base no estado do componente -->
    <ng-container *ngIf="!loading && !error">
      <!-- Modo protótipo usa mockCurso, modo normal usa curso -->
      <ng-container *ngIf="(isPrototypeMode$ | async) ? mockCurso : curso as cursoAtual">
        <mat-card class="curso-card">
          <div class="curso-header">
            <div class="curso-info">
              <mat-card-title>{{ cursoAtual?.nome }}</mat-card-title>
              <mat-card-subtitle>
                <span class="nivel-badge" 
                      [class.nivel-iniciante]="cursoAtual?.nivelDificuldade?.includes('Iniciante')"
                      [class.nivel-intermediario]="cursoAtual?.nivelDificuldade?.includes('Intermediário')"
                      [class.nivel-avancado]="cursoAtual?.nivelDificuldade?.includes('Avançado')">
                  {{ cursoAtual?.nivelDificuldade || 'Iniciante' }}
                </span>
                <span class="carga-horaria">
                  <mat-icon>schedule</mat-icon> {{ cursoAtual?.cargaHoraria }} horas
                </span>
              </mat-card-subtitle>
            </div>
            
            <!-- Botão de matrícula -->
            <button mat-raised-button color="primary" (click)="matricular()">
              <mat-icon>how_to_reg</mat-icon> Matricular-se
            </button>
          </div>
          
          <img *ngIf="cursoAtual?.imagemUrl" 
               [src]="cursoAtual?.imagemUrl" 
               alt="Imagem do curso {{ cursoAtual?.nome }}"
               class="curso-imagem">
          
          <mat-card-content>
            <h3>Descrição</h3>
            <p class="descricao">{{ cursoAtual?.descricaoDetalhada }}</p>
            
            <mat-divider class="my-4"></mat-divider>
            
            <div class="detalhes-grid">
              <div class="detalhe-item">
                <h4>Horário</h4>
                <p>{{ formatarDiasSemana(cursoAtual?.diasSemanais) }}</p>
                <p>{{ cursoAtual?.horarioInicio }} às {{ cursoAtual?.horarioFim }}</p>
              </div>
              
              <div class="detalhe-item">
                <h4>Duração</h4>
                <p>{{ cursoAtual?.duracao }} semanas</p>
              </div>
              
              <div class="detalhe-item">
                <h4>Vagas</h4>
                <p>{{ cursoAtual?.numeroMaximoAlunos }} alunos</p>
              </div>
              
              <div class="detalhe-item">
                <h4>Público-alvo</h4>
                <p>{{ cursoAtual?.publicoAlvo || 'Todos os níveis' }}</p>
              </div>
            </div>
            
            <mat-divider class="my-4"></mat-divider>
            
            <div class="requisitos" *ngIf="cursoAtual?.requisitosPrevios">
              <h3>Pré-requisitos</h3>
              <p>{{ cursoAtual?.requisitosPrevios }}</p>
            </div>
            
            <!-- Tags do curso -->
            <div class="tags-container" *ngIf="cursoAtual?.tags">
              <h3>Tags</h3>
              <div class="tags">
                <mat-chip-set>
                  <mat-chip *ngFor="let tag of getTagsArray(cursoAtual?.tags)">
                    {{ tag }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions align="end">
            <button mat-button (click)="voltar()">
              <mat-icon>arrow_back</mat-icon> Voltar
            </button>
            
            <button mat-raised-button color="primary" (click)="matricular()">
              <mat-icon>how_to_reg</mat-icon> Matricular-se
            </button>
          </mat-card-actions>
        </mat-card>
      </ng-container>
    </ng-container>
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
    
    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
    }
    
    .loading-container mat-spinner {
      margin-bottom: 16px;
    }
    
    .error-container mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
    
    .curso-card {
      margin-bottom: 24px;
    }
    
    .curso-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .curso-imagem {
      width: 100%;
      max-height: 300px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    
    .nivel-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      margin-right: 8px;
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
    
    .carga-horaria {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }
    
    .carga-horaria mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
    }
    
    .descricao {
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .detalhes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 24px;
      margin: 16px 0;
    }
    
    .detalhe-item h4 {
      margin: 0 0 8px 0;
      font-weight: 500;
      color: #333;
    }
    
    .detalhe-item p {
      margin: 0;
      color: #555;
    }
    
    .requisitos {
      margin: 16px 0;
    }
    
    .tags-container {
      margin: 16px 0;
    }
    
    .tags {
      margin-top: 8px;
    }
    
    .my-4 {
      margin: 32px 0;
    }
    
    @media (max-width: 600px) {
      .curso-header {
        flex-direction: column;
      }
      
      .curso-header button {
        margin-top: 16px;
        width: 100%;
      }
      
      .detalhes-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CursoDetalhesComponent implements OnInit {
  curso: Curso | null = null;
  mockCurso: Curso | null = null;
  loading: boolean = false;
  error: string | null = null;
  isPrototypeMode$: Observable<boolean>;
  
  // Dados mockados para o modo protótipo
  private readonly MOCK_CURSO: Curso = {
    id: 1,
    nome: 'Informática Básica',
    descricaoResumida: 'Curso introdutório de informática para iniciantes',
    descricaoDetalhada: 'Aprenda os fundamentos da informática, incluindo uso do sistema operacional, navegação na internet, processamento de texto e planilhas eletrônicas. Este curso é ideal para quem tem pouco ou nenhum conhecimento em informática e deseja adquirir habilidades básicas para uso pessoal ou profissional.',
    cargaHoraria: 40,
    numeroMaximoAlunos: 20,
    diasSemanais: '1,3,5', // Segunda, Quarta e Sexta
    horarioInicio: '09:00',
    horarioFim: '11:00',
    duracao: 10, // Em semanas
    status: 'ativo',
    nivelDificuldade: 'Iniciante',
    publicoAlvo: 'Pessoas de todas as idades interessadas em aprender informática básica',
    requisitosPrevios: 'Nenhum conhecimento prévio necessário',
    tags: ['informática', 'tecnologia', 'iniciante'],
    imagemUrl: 'assets/images/cursos/informatica-basica.jpg'
  };
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cursoService: CursoService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private prototypeService: PrototypeService
  ) {
    this.isPrototypeMode$ = of(this.prototypeService.isPrototypeEnabled());
  }
  
  ngOnInit() {
    // Preparar dados mockados para o modo protótipo
    this.mockCurso = this.MOCK_CURSO;
    
    // Carregar dados do curso
    this.carregarCurso();
  }
  
  carregarCurso() {
    this.loading = true;
    this.error = null;
    
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => {
        if (!id) {
          throw new Error('ID do curso não fornecido');
        }
        
        // Se estiver no modo protótipo, não faz requisição real
        if (this.prototypeService.isPrototypeEnabled()) {
          // Simular tempo de carregamento (opcional)
          return of(this.mockCurso).pipe(
            // Simular delay de rede
            tap(() => {
              setTimeout(() => {
                this.loading = false;
              }, 1000);
            })
          );
        }
        
        // Modo real: faz requisição à API
        return this.cursoService.getCursoById(parseInt(id)).pipe(
          catchError(err => {
            this.error = `Erro ao carregar o curso: ${err.message || 'Erro desconhecido'}`;
            this.loading = false;
            return of(null);
          })
        );
      })
    ).subscribe(curso => {
      if (curso && !this.prototypeService.isPrototypeEnabled()) {
        this.curso = curso;
        this.loading = false;
      }
    });
  }
  
  matricular() {
    // Verificar se o usuário está autenticado
    if (!this.authService.checkAuth()) {
      // No modo protótipo, mostrar uma mensagem e navegar para cadastro
      if (this.prototypeService.isPrototypeEnabled()) {
        this.snackBar.open('No modo protótipo: redirecionando para cadastro...', 'Fechar', {
          duration: 3000
        });
        this.router.navigate(['/auth/register']);
        return;
      }
      
      // No modo real, redirecionar para login com retorno
      const cursoId = this.route.snapshot.paramMap.get('id');
      this.router.navigate(['/auth/login'], { 
        queryParams: { 
          returnUrl: `/cursos/${cursoId}/matricular` 
        } 
      });
      return;
    }
    
    // Se autenticado, navegar para o formulário de matrícula
    const cursoId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/matriculas/nova'], { 
      queryParams: { cursoId } 
    });
  }
  
  voltar() {
    this.router.navigate(['/cursos']);
  }
  
  // Métodos auxiliares para formatação
  formatarDiasSemana(diasStr: string | undefined): string {
    if (!diasStr) return 'Não especificado';
    
    const diasMap: { [key: string]: string } = {
      '1': 'Segunda-feira',
      '2': 'Terça-feira',
      '3': 'Quarta-feira',
      '4': 'Quinta-feira',
      '5': 'Sexta-feira',
      '6': 'Sábado',
      '0': 'Domingo'
    };
    
    return diasStr.split(',')
      .map(dia => diasMap[dia.trim()] || dia.trim())
      .join(', ');
  }
  
  getTagsArray(tags: string[] | string | undefined): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    return tags.split(',').map(tag => tag.trim());
  }
}