import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatListModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="authService.isAuthenticated$ | async; else loginTemplate">
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav"
                    [fixedInViewport]="true" [fixedTopGap]="64">
          <app-sidebar [sidenav]="sidenav"></app-sidebar>
        </mat-sidenav>
        <mat-sidenav-content>
          <app-header [sidenav]="sidenav"></app-header>
          <main class="content">
            <ng-content></ng-content>
          </main>
          <app-footer></app-footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </ng-container>
    
    <ng-template #loginTemplate>
      <div class="auth-container">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
  styles: [`
    .sidenav-container {
      height: 100%;
    }
    
    .sidenav {
      width: 250px;
    }
    
    .content {
      padding: 20px;
      min-height: calc(100vh - 128px); /* 100vh - (header + footer) */
    }
    
    .auth-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }
  `]
})
export class LayoutComponent {
  constructor(public authService: AuthService) {}
}