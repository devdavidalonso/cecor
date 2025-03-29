// src/app/features/presencas/components/registro-presenca.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';

interface Aluno {
  id: number;
  nome: string;
  idade: number;
  foto?: string;
  dataMatricula: Date;
  status: 'presente' | 'ausente' | 'parcial' | 'pendente';
  modulos: { id: string; nome: string; status: 'presente' | 'ausente' | 'pendente' }[];
  justificativa?: string;
  faltasConsecutivas: number;
}

interface Curso {
  id: number;
  nome: string;
  diasSemana: string;
  horario: string;
  modulos: { id: string; nome: string }[];
}

@Component({
  selector: 'app-registro-presenca',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatTableModule,
    MatRadioModule,
    MatMenuModule,
    MatDividerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <mat-card class="main-card">
        <mat-card-header>
          <mat-card-title>Registro de Presenças</mat-card-title>
          <mat-card-subtitle>Marque a presença dos alunos para cada aula</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="filtroForm" class="filtro-form">
            <div class="filter-row">
              <mat-form-field appearance="outline">
                <mat-label>Curso</mat-label>
                <mat-select formControlName="cursoId" (selectionChange)="onCursoChange()">
                  <mat-option *ngFor="let curso of cursos" [value]="curso.id">
                    {{ curso.nome }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Data</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="data">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>
              
              <button mat-raised-button color="primary" (click)="buscarAlunos()" [disabled]="filtroForm.invalid">
                <mat-icon>search</mat-icon> Buscar
              </button>
            </div>
          </form>
          
          <ng-container *ngIf="cursoSelecionado">
            <mat-card class="curso-info-card">
              <div class="curso-info">
                <div class="curso-nome">
                  <h3>{{ cursoSelecionado.nome }}</h3>
                </div>
                <div class="curso-detalhes">
                  <div class="info-item">
                    <mat-icon>calendar_today</mat-icon>
                    <span>{{ cursoSelecionado.diasSemana }}</span>
                  </div>
                  <div class="info-item">
                    <mat-icon>access_time</mat-icon>
                    <span>{{ cursoSelecionado.horario }}</span>
                  </div>
                </div>
              </div>
              
              <div class="modulos-seletor">
                <h4>Módulos da Aula</h4>
                <div class="chip-container">
                  <mat-chip-listbox multiple>
                    <mat-chip-option *ngFor="let modulo of cursoSelecionado.modulos" [value]="modulo.id" selected>
                      {{ modulo.nome }}
                    </mat-chip-option>
                  </mat-chip-listbox>
                </div>
              </div>
            </mat-card>
          </ng-container>
          
          <div *ngIf="isLoading" class="loading-container">
            <mat-spinner [diameter]="40"></mat-spinner>
            <p>Carregando lista de alunos...</p>
          </div>
          
          <ng-container *ngIf="alunos.length > 0 && !isLoading">
            <div class="acoes-container">
              <button mat-raised-button color="primary" (click)="marcarTodosPresentes()">
                <mat-icon>done_all</mat-icon> Marcar Todos como Presentes
              </button>
              
              <button mat-stroked-button (click)="resetarPresencas()">
                <mat-icon>refresh</mat-icon> Resetar Marcações
              </button>
            </div>
            
            <div class="alunos-lista">
              <div *ngFor="let aluno of alunos" class="aluno-card" 
                   [ngClass]="{'alerta-faltas': aluno.faltasConsecutivas >= 2}">
                <div class="aluno-info">
                  <div class="aluno-foto" *ngIf="aluno.foto">
                    <img [src]="aluno.foto" alt="Foto do aluno">
                  </div>
                  <div class="aluno-foto aluno-sem-foto" *ngIf="!aluno.foto">
                    <mat-icon>person</mat-icon>
                  </div>
                  
                  <div class="aluno-dados">
                    <h3>{{ aluno.nome }}</h3>
                    <div class="aluno-dados-secundarios">
                      <span>{{ aluno.idade }} anos</span>
                      <span class="separador">|</span>
                      <span>Matrícula: {{ aluno.dataMatricula | date:'dd/MM/yyyy' }}</span>
                    </div>
                    
                    <div *ngIf="aluno.faltasConsecutivas > 0" class="faltas-alerta">
                      <mat-icon>warning</mat-icon>
                      <span>{{ aluno.faltasConsecutivas }} faltas consecutivas</span>
                    </div>
                  </div>
                </div>
                
                <mat-divider></mat-divider>
                
                <div class="presenca-container">
                  <div class="presenca-header">
                    <h4>Registro de Presença</h4>
                    
                    <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Opções">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                    <mat-menu #menu="matMenu">
                      <button mat-menu-item (click)="adicionarJustificativa(aluno)">
                        <mat-icon>note_add</mat-icon>
                        <span>Adicionar Justificativa</span>
                      </button>
                      <button mat-menu-item (click)="verHistorico(aluno)">
                        <mat-icon>history</mat-icon>
                        <span>Ver Histórico</span>
                      </button>
                      <button mat-menu-item (click)="enviarNotificacao(aluno)">
                        <mat-icon>notification_important</mat-icon>
                        <span>Enviar Notificação</span>
                      </button>
                    </mat-menu>
                  </div>
                  
                  <div class="radio-container">
                    <mat-radio-group [(ngModel)]="aluno.status" (change)="atualizarStatus(aluno)">
                      <mat-radio-button value="presente" color="primary">Presente</mat-radio-button>
                      <mat-radio-button value="ausente" color="warn">Ausente</mat-radio-button>
                      <mat-radio-button value="parcial" color="accent">Parcial</mat-radio-button>
                    </mat-radio-group>
                  </div>
                  
                  <div *ngIf="aluno.status === 'parcial'" class="modulos-presenca">
                    <h5>Presenças por Módulo</h5>
                    <div class="modulos-grid">
                      <div *ngFor="let modulo of aluno.modulos" class="modulo-item">
                        <span class="modulo-nome">{{ modulo.nome }}</span>
                        <mat-radio-group [(ngModel)]="modulo.status" (change)="atualizarStatusModulo(aluno)">
                          <mat-radio-button value="presente" color="primary">P</mat-radio-button>
                          <mat-radio-button value="ausente" color="warn">A</mat-radio-button>
                        </mat-radio-group>
                      </div>
                    </div>
                  </div>
                  
                  <div *ngIf="aluno.justificativa" class="justificativa-container">
                    <mat-icon>note</mat-icon>
                    <div class="justificativa-content">
                      <span class="justificativa-label">Justificativa:</span>
                      <p>{{ aluno.justificativa }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="submit-container">
              <button mat-raised-button color="primary" (click)="salvarPresencas()">
                <mat-icon>save</mat-icon> Salvar Presenças
              </button>
            </div>
          </ng-container>
          
          <div *ngIf="!isLoading && alunos.length === 0 && buscaRealizada" class="empty-state">
            <mat-icon>person_search</mat-icon>
            <h3>Nenhum aluno encontrado</h3>
            <p>Não há alunos matriculados no curso selecionado ou a data está incorreta.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }
    
    .main-card {
      margin-bottom: 24px;
    }
    
    .filtro-form {
      margin-bottom: 24px;
    }
    
    .filter-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
    }
    
    .filter-row mat-form-field {
      flex: 1;
      min-width: 200px;
    }
    
    .curso-info-card {
      margin-bottom: 24px;
      padding: 16px;
    }
    
    .curso-info {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    
    .curso-nome h3 {
      margin: 0;
      font-size: 18px;
    }
    
    .curso-detalhes {
      display: flex;
      gap: 16px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .modulos-seletor h4 {
      margin-top: 0;
      margin-bottom: 8px;
    }
    
    .chip-container {
      margin-top: 8px;
    }
    
    .acoes-container {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .alunos-lista {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .aluno-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .alerta-faltas {
      border-color: #f44336;
      border-width: 2px;
    }
    
    .aluno-info {
      display: flex;
      padding: 16px;
      gap: 16px;
    }
    
    .aluno-foto {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #e0e0e0;
    }
    
    .aluno-foto img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .aluno-sem-foto mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #9e9e9e;
    }
    
    .aluno-dados {
      flex: 1;
    }
    
    .aluno-dados h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
    }
    
    .aluno-dados-secundarios {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 8px;
    }
    
    .separador {
      margin: 0 8px;
    }
    
    .faltas-alerta {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      font-size: 14px;
      margin-top: 8px;
    }
    
    .presenca-container {
      padding: 16px;
    }
    
    .presenca-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .presenca-header h4 {
      margin: 0;
    }
    
    .radio-container {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .modulos-presenca {
      margin-top: 16px;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .modulos-presenca h5 {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .modulos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }
    
    .modulo-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .modulo-nome {
      font-weight: 500;
    }
    
    .justificativa-container {
      margin-top: 16px;
      padding: 12px;
      background-color: #fff8e1;
      border-radius: 4px;
      display: flex;
      gap: 12px;
    }
    
    .justificativa-content {
      flex: 1;
    }
    
    .justificativa-label {
      font-weight: 500;
    }
    
    .justificativa-content p {
      margin: 4px 0 0 0;
    }
    
    .submit-container {
      display: flex;
      justify-content: center;
      margin-top: 24px;
    }
    
    .submit-container button {
      padding: 8px 24px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
    }
    
    .loading-container p {
      margin-top: 16px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .empty-state mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }
    
    .empty-state h3 {
      margin: 0 0 8px 0;
    }
    
    .empty-state p {
      margin: 0;
      text-align: center;
    }
    
    @media (max-width: 600px) {
      .filter-row {
        flex-direction: column;
        align-items: stretch;
      }
      
      .acoes-container {
        flex-direction: column;
      }
      
      .curso-info {
        flex-direction: column;
      }
      
      .curso-detalhes {
        margin-top: 8px;
      }
      
      .radio-container {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class RegistroPresencaComponent implements OnInit {
  // Formulário para filtros
  filtroForm: FormGroup;
  
  // Propriedades de estado
  cursoSelecionado: Curso | null = null;
  alunos: Aluno[] = [];
  isLoading: boolean = false;
  buscaRealizada: boolean = false;
  
  // Dados de exemplo para cursos
  cursos: Curso[] = [
    {
      id: 1,
      nome: 'Jiu-Jitsu Infantil',
      diasSemana: 'Sábados',
      horario: '10:00 - 12:00',
      modulos: [
        { id: 'warmup', nome: 'Aquecimento' },
        { id: 'technique', nome: 'Técnica' },
        { id: 'sparring', nome: 'Treino Livre' }
      ]
    },
    {
      id: 2,
      nome: 'Corte e Costura',
      diasSemana: 'Terças e Quintas',
      horario: '14:00 - 17:00',
      modulos: [
        { id: 'theory', nome: 'Teoria' },
        { id: 'practice', nome: 'Prática' }
      ]
    },
    {
      id: 3,
      nome: 'Informática Básica',
      diasSemana: 'Segunda, Quarta e Sexta',
      horario: '09:00 - 11:00',
      modulos: [
        { id: 'theory', nome: 'Teoria' },
        { id: 'practice', nome: 'Laboratório' }
      ]
    }
  ];
  
  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    // Inicializar formulário de filtro
    this.filtroForm = this.formBuilder.group({
      cursoId: ['', Validators.required],
      data: [new Date(), Validators.required]
    });
  }
  
  ngOnInit(): void {
    // Inicialização adicional, se necessário
  }
  
  // Quando o curso muda, atualiza o curso selecionado
  onCursoChange(): void {
    const cursoId = this.filtroForm.get('cursoId')?.value;
    this.cursoSelecionado = this.cursos.find(c => c.id === cursoId) || null;
  }
  
  // Busca os alunos do curso para a data selecionada
  buscarAlunos(): void {
    if (this.filtroForm.invalid) return;
    
    const { cursoId, data } = this.filtroForm.value;
    
    this.isLoading = true;
    this.buscaRealizada = true;
    
    // Simulando uma chamada de API
    setTimeout(() => {
      // Dados de exemplo
      if (cursoId === 1) {
        this.alunos = [
          {
            id: 1,
            nome: 'Maria da Silva',
            idade: 15,
            foto: 'https://i.pravatar.cc/150?img=1',
            dataMatricula: new Date(2023, 1, 15),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 0
          },
          {
            id: 2,
            nome: 'João Oliveira',
            idade: 14,
            foto: 'https://i.pravatar.cc/150?img=2',
            dataMatricula: new Date(2023, 2, 10),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 2,
            justificativa: 'Aluno avisou que está doente e apresentará atestado médico.'
          },
          {
            id: 3,
            nome: 'Ana Costa',
            idade: 16,
            foto: 'https://i.pravatar.cc/150?img=5',
            dataMatricula: new Date(2023, 1, 5),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 0
          },
          {
            id: 4,
            nome: 'Pedro Santos',
            idade: 15,
            dataMatricula: new Date(2023, 3, 20),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 3
          }
        ];
      } else if (cursoId === 2) {
        this.alunos = [
          {
            id: 5,
            nome: 'Carla Souza',
            idade: 35,
            foto: 'https://i.pravatar.cc/150?img=9',
            dataMatricula: new Date(2023, 2, 15),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 0
          },
          {
            id: 6,
            nome: 'Márcia Lima',
            idade: 42,
            foto: 'https://i.pravatar.cc/150?img=10',
            dataMatricula: new Date(2023, 1, 20),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 1
          }
        ];
      } else if (cursoId === 3) {
        this.alunos = [
          {
            id: 7,
            nome: 'Lucas Ferreira',
            idade: 10,
            foto: 'https://i.pravatar.cc/150?img=16',
            dataMatricula: new Date(2023, 3, 5),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 0
          },
          {
            id: 8,
            nome: 'Gabriela Martins',
            idade: 11,
            foto: 'https://i.pravatar.cc/150?img=17',
            dataMatricula: new Date(2023, 3, 5),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 0
          },
          {
            id: 9,
            nome: 'Thiago Almeida',
            idade: 9,
            foto: 'https://i.pravatar.cc/150?img=18',
            dataMatricula: new Date(2023, 3, 5),
            status: 'pendente',
            modulos: this.cursoSelecionado?.modulos.map(m => ({ 
              id: m.id, 
              nome: m.nome, 
              status: 'pendente' 
            })) || [],
            faltasConsecutivas: 1
          }
        ];
      } else {
        this.alunos = [];
      }
      
      this.isLoading = false;
    }, 1000);
  }
  
  // Atualiza o status geral do aluno
  atualizarStatus(aluno: Aluno): void {
    // Se o status é pendente, não atualiza os módulos
    if (aluno.status === 'pendente') return;
    
    // Se o status é presente ou ausente, atualiza todos os módulos
    if (aluno.status === 'presente' || aluno.status === 'ausente') {
      aluno.modulos.forEach(modulo => {
        modulo.status = aluno.status === 'presente' ? 'presente' : 'ausente';
      });
    }
    
    // Se o status é parcial, os módulos serão atualizados individualmente pelo usuário
  }
  
  // Atualiza o status de um módulo específico
  atualizarStatusModulo(aluno: Aluno): void {
    // Verificar se todos os módulos têm o mesmo status
    const todosPresentes = aluno.modulos.every(m => m.status === 'presente');
    const todosAusentes = aluno.modulos.every(m => m.status === 'ausente');
    
    // Atualizar o status geral do aluno com base nos módulos
    if (todosPresentes) {
      aluno.status = 'presente';
    } else if (todosAusentes) {
      aluno.status = 'ausente';
    } else {
      aluno.status = 'parcial';
    }
  }
  
  // Marca todos os alunos como presentes
  marcarTodosPresentes(): void {
    this.alunos.forEach(aluno => {
      aluno.status = 'presente';
      aluno.modulos.forEach(modulo => {
        modulo.status = 'presente';
      });
    });
    
    this.snackBar.open('Todos os alunos marcados como presentes', 'OK', { duration: 3000 });
  }
  
  // Reseta todas as marcações de presença
  resetarPresencas(): void {
    this.alunos.forEach(aluno => {
      aluno.status = 'pendente';
      aluno.modulos.forEach(modulo => {
        modulo.status = 'pendente';
      });
    });
    
    this.snackBar.open('Todas as presenças foram resetadas', 'OK', { duration: 3000 });
  }
  
  // Adiciona uma justificativa para um aluno
  adicionarJustificativa(aluno: Aluno): void {
    // Em uma implementação real, abriria um dialog para inserir a justificativa
    const justificativa = prompt('Insira a justificativa para o aluno ' + aluno.nome + ':');
    
    if (justificativa) {
      aluno.justificativa = justificativa;
      this.snackBar.open('Justificativa adicionada com sucesso', 'OK', { duration: 3000 });
    }
  }
  
  // Ver histórico de presenças de um aluno
  verHistorico(aluno: Aluno): void {
    this.snackBar.open(`Histórico de ${aluno.nome} será aberto em uma nova janela`, 'OK', { duration: 3000 });
    // Em uma implementação real, abriria uma nova página ou dialog com o histórico
  }
  
  // Enviar notificação para um aluno
  enviarNotificacao(aluno: Aluno): void {
    if (aluno.faltasConsecutivas > 0) {
      this.snackBar.open(`Notificação de falta enviada para ${aluno.nome} e seus responsáveis`, 'OK', { duration: 3000 });
    } else {
      this.snackBar.open(`Este aluno não possui faltas recentes para notificar`, 'OK', { duration: 3000 });
    }
  }
  
  // Salvar todas as presenças
  salvarPresencas(): void {
    // Verificar se todas as presenças foram marcadas
    const pendentes = this.alunos.filter(a => a.status === 'pendente');
    
    if (pendentes.length > 0) {
      this.snackBar.open(`Há ${pendentes.length} alunos com presença não marcada. Deseja continuar?`, 'Sim', { 
        duration: 5000,
        panelClass: 'warning-snackbar'
      });
      return;
    }
    
    // Simular o envio para o servidor
    this.isLoading = true;
    
    setTimeout(() => {
      this.isLoading = false;
      this.snackBar.open('Presenças salvas com sucesso!', 'OK', { duration: 3000 });
      
      // Em uma implementação real, redirecionaria para a página de listagem ou dashboard
    }, 1500);
  }
}