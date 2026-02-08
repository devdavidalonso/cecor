import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav } from '@angular/material/sidenav';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar color="primary" class="header">
      <button mat-icon-button (click)="sidenav.toggle()" aria-label="Toggle menu">
        <mat-icon>menu</mat-icon>
      </button>
      
      <span class="title">Sistema de Gestão Educacional CECOR</span>
      
      <span class="spacer"></span>
      
      <button mat-icon-button aria-label="Notificações">
        <mat-icon>notifications</mat-icon>
      </button>
      
      <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="Menu do usuário">
        <mat-icon>account_circle</mat-icon>
      </button>
      
      <mat-menu #userMenu="matMenu">
        <ng-container *ngIf="authService.currentUser$ | async as user">
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>
        </ng-container>
        
        <button mat-menu-item routerLink="/perfil">
          <mat-icon>person</mat-icon>
          <span>Meu Perfil</span>
        </button>
        
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Sair</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 2;
    }
    
    .title {
      margin-left: 8px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .user-info {
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    
    .user-name {
      font-weight: 500;
    }
    
    .user-email {
      font-size: 12px;
      opacity: 0.7;
    }
  `]
})
export class HeaderComponent {
  @Input() sidenav!: MatSidenav;

  constructor(public authService: AuthService) { }

  logout(): void {
    this.authService.logout();
  }
}