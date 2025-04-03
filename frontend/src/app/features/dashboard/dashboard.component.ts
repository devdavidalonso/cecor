import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

interface DashboardCard {
  title: string;
  subtitle: string;
  icon: string;
  value: string | number;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard-container">
      <h1 class="dashboard-title">Dashboard</h1>
      
      <div class="welcome-card">
        <mat-card>
          <mat-card-content>
            <h2>Bem-vindo, {{ (authService.currentUser$ | async)?.name || 'Usuário' }}!</h2>
            <p>Bem-vindo ao Sistema de Gestão Educacional CECOR. Utilize o menu lateral para navegar entre as funcionalidades.</p>
          </mat-card-content>
        </mat-card>
      </div>
      
      <div class="dashboard-grid">
        <div class="dashboard-card" *ngFor="let card of dashboardCards">
          <mat-card [routerLink]="card.route" class="clickable">
            <mat-card-content>
              <div class="card-content">
                <div class="card-info">
                  <h3>{{ card.title }}</h3>
                  <p>{{ card.subtitle }}</p>
                  <div class="card-value" [style.color]="card.color">{{ card.value }}</div>
                </div>
                <div class="card-icon" [style.background-color]="card.color">
                  <mat-icon>{{ card.icon }}</mat-icon>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
      
      <div class="actions-container">
        <h2>Ações Rápidas</h2>
        <div class="quick-actions">
          <button mat-raised-button color="primary" routerLink="/alunos/cadastrar">
            <mat-icon>person_add</mat-icon> Novo Aluno
          </button>
          
          <button mat-raised-button color="accent" routerLink="/enrollments/new">
            <mat-icon>how_to_reg</mat-icon> New Enrollment
          </button>
          
          <button mat-raised-button color="primary" routerLink="/presencas">
            <mat-icon>fact_check</mat-icon> Register Attendance
          </button>
          
          <button mat-raised-button color="accent" routerLink="/relatorios">
            <mat-icon>assessment</mat-icon> Reports
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      margin-top: 64px; /* Altura do header */
    }
    
    .dashboard-title {
      margin-bottom: 20px;
      color: #3f51b5;
    }
    
    .welcome-card {
      margin-bottom: 24px;
    }
    
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .card-info {
      flex: 1;
    }
    
    .card-info h3 {
      margin: 0;
      font-size: 18px;
    }
    
    .card-info p {
      margin: 4px 0 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .card-value {
      font-size: 24px;
      font-weight: bold;
    }
    
    .card-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      color: white;
    }
    
    .clickable {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .clickable:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
    }
    
    .actions-container {
      margin-top: 30px;
    }
    
    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    @media (max-width: 599px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboardCards: DashboardCard[] = [
    {
      title: 'Alunos',
      subtitle: 'Total de alunos ativos',
      icon: 'people',
      value: '---',
      route: '/alunos',
      color: '#4caf50'
    },
    {
      title: 'Cursos',
      subtitle: 'Cursos em andamento',
      icon: 'school',
      value: '---',
      route: '/cursos',
      color: '#2196f3'
    },
    {
      title: 'Enrollments',
      subtitle: 'Active enrollments',
      icon: 'how_to_reg',
      value: '---',
      route: '/matriculas',
      color: '#ff9800'
    },
    {
      title: 'Attendance',
      subtitle: 'Current attendance rate',
      icon: 'fact_check',
      value: '---',
      route: '/presencas',
      color: '#9c27b0'
    }
  ];
  
  constructor(public authService: AuthService) {}
  
  ngOnInit(): void {
    // Aqui você carregaria dados reais da API
    // Este é apenas um exemplo com dados fictícios
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    // Simular carregamento de dados
    setTimeout(() => {
      this.dashboardCards = [
        {
          title: 'Alunos',
          subtitle: 'Total de alunos ativos',
          icon: 'people',
          value: '243',
          route: '/alunos',
          color: '#4caf50'
        },
        {
          title: 'Cursos',
          subtitle: 'Cursos em andamento',
          icon: 'school',
          value: '18',
          route: '/cursos',
          color: '#2196f3'
        },
        {
          title: 'Enrollments',
          subtitle: 'Active enrollments',
          icon: 'how_to_reg',
          value: '312',
          route: '/matriculas',
          color: '#ff9800'
        },
        {
          title: 'Presenças',
          subtitle: 'Taxa de frequência atual',
          icon: 'fact_check',
          value: '87%',
          route: '/presencas',
          color: '#9c27b0'
        }
      ];
    }, 1000);
  }
}