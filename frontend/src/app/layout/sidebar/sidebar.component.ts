import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';

import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  text: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sidebar-container">
      <div class="sidebar-header">
        <div class="logo">CECOR</div>
      </div>
      
      <mat-nav-list>
        <ng-container *ngFor="let item of menuItems">
          <!-- Verificar permissões -->
          <ng-container *ngIf="!item.roles || checkRoles(item.roles)">
            <!-- Item com subitens -->
            <mat-expansion-panel *ngIf="item.children && item.children.length" class="mat-elevation-z0">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span class="nav-item-text">{{ item.text }}</span>
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <mat-nav-list>
                <ng-container *ngFor="let child of item.children">
                  <ng-container *ngIf="!child.roles || checkRoles(child.roles)">
                    <a mat-list-item [routerLink]="child.route" routerLinkActive="active-link"
                      (click)="closeIfMobile()">
                      <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                      <span matListItemTitle>{{ child.text }}</span>
                    </a>
                  </ng-container>
                </ng-container>
              </mat-nav-list>
            </mat-expansion-panel>
            
            <!-- Item simples -->
            <a *ngIf="!item.children" mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
              (click)="closeIfMobile()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.text }}</span>
            </a>
          </ng-container>
        </ng-container>
      </mat-nav-list>
    </div>
  `,
  styles: [`
    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .sidebar-header {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #3f51b5;
      color: white;
    }
    
    .logo {
      font-size: 24px;
      font-weight: bold;
    }
    
    .active-link {
      background-color: rgba(63, 81, 181, 0.1);
    }
    
    mat-expansion-panel {
      border-radius: 0 !important;
      box-shadow: none !important;
    }
    
    .nav-item-text {
      margin-left: 8px;
    }
  `]
})
export class SidebarComponent {
  @Input() sidenav!: MatSidenav;
  
  menuItems: MenuItem[] = [
    {
      text: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      text: 'Alunos',
      icon: 'people',
      children: [
        {
          text: 'Listar Alunos',
          icon: 'list',
          route: '/alunos'
        },
        {
          text: 'Cadastrar Aluno',
          icon: 'person_add',
          route: '/alunos/cadastrar'
        }
      ]
    },
    {
      text: 'Courses',
      icon: 'school',
      children: [
        {
          text: 'Listar Cursos',
          icon: 'list',
          route: '/courses'
        },
        {
          text: 'Cadastrar Curso',
          icon: 'add_circle',
          route: '/courses/new'
        }
      ]
    },
    {
      text: 'Enrollments',
      icon: 'how_to_reg',
      children: [
        {
          text: 'Listar Matrículas',
          icon: 'list',
          route: '/enrollments'
        },
        {
          text: 'New Enrollment',
          icon: 'add_circle',
          route: '/enrollments/new'
        }
      ]
    },
    {
      text: 'Attendance',
      icon: 'fact_check',
      route: '/attendance'
    },
    {
      text: 'Reports',
      icon: 'assessment',
      route: '/reports'
    },
    {
      text: 'Entrevistas',
      icon: 'question_answer',
      route: '/entrevistas'
    },
    {
      text: 'Voluntariado',
      icon: 'volunteer_activism',
      route: '/voluntariado'
    },
    {
      text: 'Administração',
      icon: 'admin_panel_settings',
      route: '/administracao',
      roles: ['admin']
    }
  ];
  
  constructor(private authService: AuthService) {}
  
  checkRoles(roles: string[]): boolean {
    return roles.some(role => this.authService.hasRole(role));
  }
  
  closeIfMobile(): void {
    if (window.innerWidth < 768) {
      this.sidenav.close();
    }
  }
}