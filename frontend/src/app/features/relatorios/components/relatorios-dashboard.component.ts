// src/app/features/relatorios/components/relatorios-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Curso {
  id: number;
  nome: string;
}

interface Indicadores {
  totalAlunos: number;
  totalCursos: number;
  totalMatriculas: number;
  taxaFrequencia: number;
}

interface FrequenciaCurso {
  nome: string;
  taxa: number;
}

interface AlunoFaltoso {
  nome: string;
  curso: string;
  faltas: number;
  ultimaPresenca: Date;
}

interface Matricula {
  aluno: string;
  curso: string;
  data: Date;
  status: string;
}

interface FaixaEtaria {
  nome: string;
  quantidade: number;
}

interface Relatorio {
  id: number;
  titulo: string;
  descricao: string;
  icone: string;
}

@Component({
  selector: 'app-relatorios-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <h1 class="page-title">Dashboard de Reports</h1>
      
      <div class="filter-section">
        <form [formGroup]="filtroForm" class="filter-form">
          <mat-form-field appearance="outline">
            <mat-label>Período</mat-label>
            <mat-select formControlName="periodo">
              <mat-option value="ultima_semana">Última Semana</mat-option>
              <mat-option value="ultimo_mes">Último Mês</mat-option>
              <mat-option value="ultimo_trimestre">Último Trimestre</mat-option>
              <mat-option value="ultimo_ano">Último Ano</mat-option>
              <mat-option value="personalizado">Período Personalizado</mat-option>
            </mat-select>
          </mat-form-field>
          
          <ng-container *ngIf="filtroForm.get('periodo')?.value === 'personalizado'">
            <mat-form-field appearance="outline">
              <mat-label>Data Inicial</mat-label>
              <input matInput [matDatepicker]="pickerInicio" formControlName="dataInicio">
              <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
              <mat-datepicker #pickerInicio></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Data Final</mat-label>
              <input matInput [matDatepicker]="pickerFim" formControlName="dataFim">
              <mat-datepicker-toggle matSuffix [for]="pickerFim"></mat-datepicker-toggle>
              <mat-datepicker #pickerFim></mat-datepicker>
            </mat-form-field>
          </ng-container>
          
          <mat-form-field appearance="outline">
            <mat-label>Curso</mat-label>
            <mat-select formControlName="cursoId">
              <mat-option value="">Todos os Cursos</mat-option>
              <mat-option *ngFor="let curso of cursos" [value]="curso.id">
                {{ curso.nome }}
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <button mat-raised-button color="primary" (click)="atualizarDashboard()">
            <mat-icon>update</mat-icon> Atualizar Dados
          </button>
        </form>
      </div>
      
      <!-- Indicadores gerais -->
      <div class="cards-container">
        <mat-card class="dashboard-card">
          <mat-card-content>
            <div class="card-icon-container">
              <mat-icon class="card-icon">people</mat-icon>
            </div>
            <div class="card-data">
              <div class="card-value">{{ indicadores.totalAlunos }}</div>
              <div class="card-title">Alunos Ativos</div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="dashboard-card">
          <mat-card-content>
            <div class="card-icon-container">
              <mat-icon class="card-icon">school</mat-icon>
            </div>
            <div class="card-data">
              <div class="card-value">{{ indicadores.totalCursos }}</div>
              <div class="card-title">Cursos Ativos</div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="dashboard-card">
          <mat-card-content>
            <div class="card-icon-container">
              <mat-icon class="card-icon">how_to_reg</mat-icon>
            </div>
            <div class="card-data">
              <div class="card-value">{{ indicadores.totalMatriculas }}</div>
              <div class="card-title">Matrículas Ativas</div>
            </div>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="dashboard-card">
          <mat-card-content>
            <div class="card-icon-container percent">
              <span class="card-percent">{{ indicadores.taxaFrequencia }}%</span>
            </div>
            <div class="card-data">
              <div class="card-title">Taxa de Frequência</div>
              <div class="card-subtitle">Média geral</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Frequência dos cursos -->
      <mat-card class="content-card">
        <mat-card-header>
          <mat-card-title>Taxa de Frequência por Curso</mat-card-title>
          <mat-card-subtitle>Percentual de presenças registradas</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="chart-container">
            <div class="progress-bars">
              <div *ngFor="let curso of frequenciaCursos" class="progress-item">
                <div class="progress-label">
                  <span class="progress-name">{{ curso.nome }}</span>
                  <span class="progress-value">{{ curso.taxa }}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" [style.width.%]="curso.taxa" [style.background-color]="getCorFrequencia(curso.taxa)"></div>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Gráfico de matrículas e faltas -->
      <div class="side-by-side-cards">
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>Alunos com Faltas Consecutivas</mat-card-title>
            <mat-card-subtitle>Alunos em risco de evasão</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Curso</th>
                  <th>Faltas</th>
                  <th>Última Presença</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let aluno of alunosFaltosos">
                  <td>{{ aluno.nome }}</td>
                  <td>{{ aluno.curso }}</td>
                  <td [ngClass]="{'faltas-alto': aluno.faltas >= 3, 'faltas-medio': aluno.faltas === 2, 'faltas-baixo': aluno.faltas === 1}">
                    {{ aluno.faltas }}
                  </td>
                  <td>{{ aluno.ultimaPresenca | date: 'dd/MM/yyyy' }}</td>
                  <td>
                    <div class="action-buttons">
                      <button mat-icon-button color="primary" matTooltip="Enviar notificação">
                        <mat-icon>notification_important</mat-icon>
                      </button>
                      <button mat-icon-button color="accent" matTooltip="Ligar para aluno">
                        <mat-icon>call</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="content-card">
          <mat-card-header>
            <mat-card-title>Matrículas Recentes</mat-card-title>
            <mat-card-subtitle>Últimas matrículas realizadas</mat-card-subtitle>
          </mat-card-header>
          
          <mat-card-content>
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Curso</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let matricula of matriculasRecentes">
                  <td>{{ matricula.aluno }}</td>
                  <td>{{ matricula.curso }}</td>
                  <td>{{ matricula.data | date: 'dd/MM/yyyy' }}</td>
                  <td [ngClass]="{'status-ativo': matricula.status === 'Ativa', 
                                 'status-pendente': matricula.status === 'Pendente', 
                                 'status-cancelada': matricula.status === 'Cancelada'}">
                    {{ matricula.status }}
                  </td>
                </tr>
              </tbody>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
      
      <!-- Distribuição de alunos -->
      <mat-card class="content-card">
        <mat-card-header>
          <mat-card-title>Distribuição de Alunos por Faixa Etária</mat-card-title>
          <mat-card-subtitle>Total de alunos ativos por idade</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="distribution-container">
            <div *ngFor="let faixa of distribuicaoIdade" class="distribution-item">
              <div class="distribution-label">{{ faixa.nome }}</div>
              <div class="distribution-bar-container">
                <div class="distribution-bar" [style.height.px]="getAlturaBarraIdade(faixa.quantidade)"></div>
              </div>
              <div class="distribution-value">{{ faixa.quantidade }}</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
      
      <!-- Reports disponíveis -->
      <mat-card class="content-card">
        <mat-card-header>
          <mat-card-title>Reports Disponíveis</mat-card-title>
          <mat-card-subtitle>Selecione um relatório para visualizar ou exportar</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="reports-grid">
            <div class="report-card" *ngFor="let relatorio of relatoriosDisponiveis">
              <div class="report-icon">
                <mat-icon>{{ relatorio.icone }}</mat-icon>
              </div>
              <div class="report-info">
                <div class="report-title">{{ relatorio.titulo }}</div>
                <div class="report-description">{{ relatorio.descricao }}</div>
              </div>
              <div class="report-actions">
                <button mat-stroked-button color="primary" [routerLink]="['/relatorios', relatorio.id]">Ver</button>
                <button mat-stroked-button (click)="exportarRelatorio(relatorio.id)">Exportar</button>
              </div>
            </div>
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
    
    .page-title {
      margin-bottom: 24px;
      color: #333;
    }
    
    .filter-section {
      margin-bottom: 24px;
    }
    
    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
    }
    
    .filter-form mat-form-field {
      flex: 1;
      min-width: 200px;
    }
    
    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .dashboard-card {
      padding: 16px;
    }
    
    .dashboard-card mat-card-content {
      display: flex;
      align-items: center;
      padding: 0;
    }
    
    .card-icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #3f51b5;
      margin-right: 16px;
    }
    
    .card-icon {
      font-size: 30px;
      height: 30px;
      width: 30px;
      color: white;
    }
    
    .card-percent {
      font-size: 18px;
      font-weight: 500;
      color: white;
    }
    
    .percent {
      background-color: #4caf50;
    }
    
    .card-data {
      display: flex;
      flex-direction: column;
    }
    
    .card-value {
      font-size: 24px;
      font-weight: 500;
    }
    
    .card-title {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .card-subtitle {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.38);
    }
    
    .content-card {
      margin-bottom: 24px;
    }
    
    .chart-container {
      margin-top: 16px;
      padding: 0 16px;
    }
    
    .progress-bars {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .progress-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .progress-label {
      display: flex;
      justify-content: space-between;
    }
    
    .progress-name {
      font-weight: 500;
    }
    
    .progress-value {
      font-weight: 500;
    }
    
    .progress-bar-bg {
      height: 8px;
      width: 100%;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-bar-fill {
      height: 100%;
      border-radius: 4px;
    }
    
    .side-by-side-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .custom-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    
    .custom-table th {
      text-align: left;
      padding: 12px 8px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .custom-table td {
      padding: 12px 8px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
    }
    
    .faltas-alto {
      font-weight: 500;
      color: #f44336;
    }
    
    .faltas-medio {
      font-weight: 500;
      color: #ff9800;
    }
    
    .faltas-baixo {
      font-weight: 500;
      color: #4caf50;
    }
    
    .status-ativo {
      color: #4caf50;
      font-weight: 500;
    }
    
    .status-pendente {
      color: #ff9800;
      font-weight: 500;
    }
    
    .status-cancelada {
      color: #f44336;
      font-weight: 500;
    }
    
    .distribution-container {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      height: 250px;
      gap: 24px;
      margin: 24px 0;
      padding: 0 16px;
    }
    
    .distribution-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
    }
    
    .distribution-label {
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .distribution-bar-container {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 8px;
    }
    
    .distribution-bar {
      width: 70%;
      background-color: #3f51b5;
      border-radius: 4px 4px 0 0;
    }
    
    .distribution-value {
      font-weight: 500;
    }
    
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .report-card {
      display: flex;
      flex-direction: column;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 16px;
    }
    
    .report-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #e3f2fd;
      margin-bottom: 16px;
    }
    
    .report-icon mat-icon {
      color: #2196f3;
    }
    
    .report-info {
      margin-bottom: 16px;
    }
    
    .report-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .report-description {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .report-actions {
      display: flex;
      gap: 8px;
      margin-top: auto;
    }
    
    .report-actions button {
      flex: 1;
    }
    
    @media (max-width: 768px) {
      .side-by-side-cards {
        grid-template-columns: 1fr;
      }
      
      .filter-form button {
        width: 100%;
      }
      
      .distribution-container {
        overflow-x: auto;
        justify-content: flex-start;
        padding-bottom: 16px;
      }
      
      .distribution-item {
        min-width: 80px;
      }
    }
  `]
})
export class RelatoriosDashboardComponent implements OnInit {
  // Formulário de filtros
  filtroForm: FormGroup;
  
  // Dados do dashboard
  cursos: Curso[] = [];
  indicadores: Indicadores = {
    totalAlunos: 0,
    totalCursos: 0,
    totalMatriculas: 0,
    taxaFrequencia: 0
  };
  frequenciaCursos: FrequenciaCurso[] = [];
  alunosFaltosos: AlunoFaltoso[] = [];
  matriculasRecentes: Matricula[] = [];
  distribuicaoIdade: FaixaEtaria[] = [];
  relatoriosDisponiveis: Relatorio[] = [];
  
  // Altura máxima para a barra de distribuição (em pixels)
  private alturaMaximaBarraIdade = 200;
  
  constructor(private formBuilder: FormBuilder) {
    this.filtroForm = this.formBuilder.group({
      periodo: ['ultimo_mes'],
      dataInicio: [null],
      dataFim: [null],
      cursoId: ['']
    });
  }
  
  ngOnInit(): void {
    // Carregar dados iniciais
    this.carregarCursos();
    this.atualizarDashboard();
  }
  
  /**
   * Carrega a lista de cursos para o filtro
   */
  carregarCursos(): void {
    // Aqui seria feita uma chamada para a API
    // Simulando dados para exemplo
    this.cursos = [
      { id: 1, nome: 'Informática Básica' },
      { id: 2, nome: 'Corte e Costura' },
      { id: 3, nome: 'Jiu-Jitsu Infantil' },
      { id: 4, nome: 'Pintura em Tela' },
      { id: 5, nome: 'Inglês para Iniciantes' }
    ];
  }
  
  /**
   * Atualiza todos os dados do dashboard com base nos filtros
   */
  atualizarDashboard(): void {
    // Aqui seriam feitas chamadas para as APIs correspondentes
    // Simulando dados para exemplo
    this.carregarIndicadoresGerais();
    this.carregarFrequenciaCursos();
    this.carregarAlunosFaltosos();
    this.carregarMatriculasRecentes();
    this.carregarDistribuicaoIdade();
    this.carregarRelatoriosDisponiveis();
  }
  
  /**
   * Carrega os indicadores gerais
   */
  carregarIndicadoresGerais(): void {
    // Simulando dados
    this.indicadores = {
      totalAlunos: 243,
      totalCursos: 18,
      totalMatriculas: 312,
      taxaFrequencia: 87
    };
  }
  
  /**
   * Carrega os dados de frequência por curso
   */
  carregarFrequenciaCursos(): void {
    // Simulando dados
    this.frequenciaCursos = [
      { nome: 'Informática Básica', taxa: 92 },
      { nome: 'Corte e Costura', taxa: 88 },
      { nome: 'Jiu-Jitsu Infantil', taxa: 95 },
      { nome: 'Pintura em Tela', taxa: 78 },
      { nome: 'Inglês para Iniciantes', taxa: 82 }
    ];
  }
  
  /**
   * Carrega os dados de alunos com faltas consecutivas
   */
  carregarAlunosFaltosos(): void {
    // Simulando dados
    this.alunosFaltosos = [
      { 
        nome: 'Maria Silva', 
        curso: 'Corte e Costura', 
        faltas: 3, 
        ultimaPresenca: new Date('2023-03-15') 
      },
      { 
        nome: 'João Oliveira', 
        curso: 'Informática Básica', 
        faltas: 2, 
        ultimaPresenca: new Date('2023-03-20') 
      },
      { 
        nome: 'Ana Costa', 
        curso: 'Pintura em Tela', 
        faltas: 3, 
        ultimaPresenca: new Date('2023-03-10') 
      },
      { 
        nome: 'Carlos Souza', 
        curso: 'Inglês para Iniciantes', 
        faltas: 1, 
        ultimaPresenca: new Date('2023-03-22') 
      }
    ];
  }
  
  /**
   * Carrega os dados de matrículas recentes
   */
  carregarMatriculasRecentes(): void {
    // Simulando dados
    this.matriculasRecentes = [
      { 
        aluno: 'Pedro Santos', 
        curso: 'Jiu-Jitsu Infantil', 
        data: new Date('2023-03-25'), 
        status: 'Ativa' 
      },
      { 
        aluno: 'Mariana Lima', 
        curso: 'Corte e Costura', 
        data: new Date('2023-03-23'), 
        status: 'Pendente' 
      },
      { 
        aluno: 'Roberto Alves', 
        curso: 'Informática Básica', 
        data: new Date('2023-03-22'), 
        status: 'Ativa' 
      },
      { 
        aluno: 'Carla Ribeiro', 
        curso: 'Pintura em Tela', 
        data: new Date('2023-03-20'), 
        status: 'Cancelada' 
      }
    ];
  }
  
  /**
   * Carrega os dados de distribuição de alunos por faixa etária
   */
  carregarDistribuicaoIdade(): void {
    // Simulando dados
    this.distribuicaoIdade = [
      { nome: 'Até 12 anos', quantidade: 67 },
      { nome: '13-17 anos', quantidade: 85 },
      { nome: '18-25 anos', quantidade: 42 },
      { nome: '26-35 anos', quantidade: 28 },
      { nome: '36-50 anos', quantidade: 15 },
      { nome: '51+ anos', quantidade: 6 }
    ];
  }
  
  /**
   * Carrega a lista de Reports disponíveis
   */
  carregarRelatoriosDisponiveis(): void {
    // Simulando dados
    this.relatoriosDisponiveis = [
      { 
        id: 1, 
        titulo: 'Frequência de Alunos', 
        descricao: 'Relatório detalhado de presenças e faltas por aluno e curso', 
        icone: 'fact_check' 
      },
      { 
        id: 2, 
        titulo: 'Desempenho de Cursos', 
        descricao: 'Análise de desempenho por curso, incluindo retenção e evasão', 
        icone: 'trending_up' 
      },
      { 
        id: 3, 
        titulo: 'Matrículas do Período', 
        descricao: 'Relatório de novas matrículas, renovações e cancelamentos', 
        icone: 'how_to_reg' 
      },
      { 
        id: 4, 
        titulo: 'Dados Demográficos', 
        descricao: 'Perfil dos alunos por idade, localização e outros atributos', 
        icone: 'pie_chart' 
      }
    ];
  }
  
  /**
   * Retorna a cor da barra de progresso com base na taxa de frequência
   */
  getCorFrequencia(taxa: number): string {
    if (taxa >= 90) {
      return '#4caf50'; // Verde
    } else if (taxa >= 75) {
      return '#2196f3'; // Azul
    } else if (taxa >= 60) {
      return '#ff9800'; // Laranja
    } else {
      return '#f44336'; // Vermelho
    }
  }
  
  /**
   * Calcula a altura da barra para a visualização de distribuição por idade
   */
  getAlturaBarraIdade(quantidade: number): number {
    // Encontrar o valor máximo para normalizar
    const maxQuantidade = Math.max(...this.distribuicaoIdade.map(item => item.quantidade));
    
    // Normalizar a altura (regra de três)
    return (quantidade / maxQuantidade) * this.alturaMaximaBarraIdade;
  }
  
  /**
   * Exporta um relatório em formato PDF ou Excel
   */
  exportarRelatorio(relatorioId: number): void {
    // Aqui seria implementada a lógica de exportação
    // Poderia chamar um serviço que faria a chamada para a API
    
    const relatorio = this.relatoriosDisponiveis.find(r => r.id === relatorioId);
    if (relatorio) {
      console.log(`Exportando relatório: ${relatorio.titulo}`);
      
      // Exibir diálogo para escolher formato
      this.mostrarDialogoExportacao(relatorio);
    }
  }
  
  /**
   * Mostraria um diálogo para escolher o formato de exportação
   * (Na implementação real, isso seria um componente de diálogo do Angular Material)
   */
  mostrarDialogoExportacao(relatorio: Relatorio): void {
    // Simular a escolha de formato (PDF, Excel, etc.)
    const formato = 'PDF';
    
    // Aqui seria mostrado um diálogo e processada a resposta
    console.log(`Relatório "${relatorio.titulo}" será exportado em formato ${formato}`);
    
    // Simular download bem-sucedido
    setTimeout(() => {
      console.log('Exportação concluída com sucesso!');
      // Aqui poderia ser exibida uma notificação de sucesso
    }, 1500);
  }
  
  /**
   * Formata um número para exibição com separador de milhares
   */
  formatarNumero(valor: number): string {
    return valor.toLocaleString('pt-BR');
  }
  
  /**
   * Faz o filtro de período com base na seleção do usuário
   */
  aplicarFiltroPeriodo(): { inicio: Date, fim: Date } {
    const hoje = new Date();
    let dataInicio: Date;
    let dataFim: Date = hoje;
    
    switch (this.filtroForm.get('periodo')?.value) {
      case 'ultima_semana':
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - 7);
        break;
        
      case 'ultimo_mes':
        dataInicio = new Date(hoje);
        dataInicio.setMonth(hoje.getMonth() - 1);
        break;
        
      case 'ultimo_trimestre':
        dataInicio = new Date(hoje);
        dataInicio.setMonth(hoje.getMonth() - 3);
        break;
        
      case 'ultimo_ano':
        dataInicio = new Date(hoje);
        dataInicio.setFullYear(hoje.getFullYear() - 1);
        break;
        
      case 'personalizado':
        dataInicio = this.filtroForm.get('dataInicio')?.value || new Date(hoje.getFullYear(), 0, 1);
        dataFim = this.filtroForm.get('dataFim')?.value || hoje;
        break;
        
      default:
        // Por padrão, último mês
        dataInicio = new Date(hoje);
        dataInicio.setMonth(hoje.getMonth() - 1);
    }
    
    return { inicio: dataInicio, fim: dataFim };
  }
}