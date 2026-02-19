import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

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
    MatMenuModule,
    MatDividerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar class="header mat-elevation-z1">

      <!-- Botão hambúrguer (apenas mobile) -->
      <button
        *ngIf="isHandset$ | async"
        mat-icon-button
        (click)="sidenav.toggle()"
        aria-label="Abrir menu"
        class="menu-toggle">
        <mat-icon>menu</mat-icon>
      </button>

      <!-- Título -->
      <span class="page-title">
        🎓 Sistema de Gestão Educacional
      </span>

      <span class="spacer"></span>

      <!-- Ações do header -->
      <div class="header-actions">

        <!-- Notificações -->
        <button mat-icon-button aria-label="Notificações" class="action-btn">
          <mat-icon>notifications_none</mat-icon>
        </button>

        <!-- Avatar / Menu do Usuário -->
        <button
          mat-button
          [matMenuTriggerFor]="userMenu"
          class="user-btn"
          aria-label="Menu do usuário">
          <ng-container *ngIf="authService.currentUser$ | async as user">
            <div class="user-avatar">{{ getInitials(user.name) }}</div>
            <span class="user-name-header">{{ (user.name || '').split(' ')[0] }}</span>
          </ng-container>
          <mat-icon class="dropdown-icon">expand_more</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu" xPosition="before" class="user-menu">
          <ng-container *ngIf="authService.currentUser$ | async as user">
            <div class="menu-user-info">
              <div class="menu-avatar">{{ getInitials(user.name) }}</div>
              <div>
                <div class="menu-user-name">{{ user.name }}</div>
                <div class="menu-user-email">{{ user.email }}</div>
              </div>
            </div>
            <mat-divider></mat-divider>
          </ng-container>

          <button mat-menu-item routerLink="/profile">
            <mat-icon>person_outline</mat-icon>
            <span>Meu Perfil</span>
          </button>

          <mat-divider></mat-divider>

          <button mat-menu-item (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon>
            <span>Sair</span>
          </button>
        </mat-menu>

      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #ffffff !important;
      border-bottom: 1px solid rgba(0, 106, 172, 0.1);
      height: 60px !important;
      padding: 0 16px !important;
      color: #302424 !important;
    }

    .menu-toggle {
      color: #006aac !important;
      margin-right: 8px;
    }

    .page-title {
      font-family: 'Manrope', sans-serif;
      font-weight: 600;
      font-size: 15px;
      color: #302424;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-paulo-rossi {
      width: 44px;
      height: 44px;
      object-fit: contain;
      margin-right: 4px;
      flex-shrink: 0;
    }

    .header-title-block {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .header-cap {
      font-size: 20px;
      line-height: 1;
    }

    .header-title {
      font-family: 'Manrope', sans-serif;
      font-weight: 600;
      font-size: 15px;
      color: #302424;
      white-space: nowrap;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-btn {
      color: #8b8d94 !important;

      &:hover {
        color: #006aac !important;
      }
    }

    /* ---- Botão de usuário ---- */
    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px !important;
      border-radius: 24px !important;
      color: #302424 !important;
      line-height: normal !important;
      height: 40px;

      &:hover {
        background: rgba(0, 106, 172, 0.06) !important;
      }
    }

    .user-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #006aac, #0083c0);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Manrope', sans-serif;
      font-weight: 700;
      font-size: 12px;
      flex-shrink: 0;
    }

    .user-name-header {
      font-family: 'Manrope', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #302424;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      @media (max-width: 600px) {
        display: none;
      }
    }

    .dropdown-icon {
      font-size: 18px !important;
      width: 18px !important;
      height: 18px !important;
      color: #8b8d94 !important;
    }

    /* ---- Menu dropdown do usuário ---- */
    .menu-user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      min-width: 220px;
    }

    .menu-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #006aac, #0083c0);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Manrope', sans-serif;
      font-weight: 700;
      font-size: 16px;
      flex-shrink: 0;
    }

    .menu-user-name {
      font-family: 'Manrope', sans-serif;
      font-weight: 600;
      font-size: 14px;
      color: #302424;
    }

    .menu-user-email {
      font-family: 'Manrope', sans-serif;
      font-size: 12px;
      color: #8b8d94;
    }

    .logout-btn {
      color: #ff5062 !important;

      mat-icon {
        color: #ff5062 !important;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() sidenav!: MatSidenav;

  isHandset$: Observable<boolean>;

  constructor(
    public authService: AuthService,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.isHandset$ = this.breakpointObserver
      .observe(Breakpoints.Handset)
      .pipe(map(r => r.matches), shareReplay());
  }

  logout(): void {
    this.authService.logout();
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }
}