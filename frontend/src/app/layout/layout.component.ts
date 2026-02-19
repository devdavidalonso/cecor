import { Component, ChangeDetectionStrategy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

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
    LayoutModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <ng-container *ngIf="authService.isAuthenticated$ | async; else loginTemplate">
      <mat-sidenav-container class="sidenav-container">

        <mat-sidenav
          #sidenav
          [mode]="(isHandset$ | async) ? 'over' : 'side'"
          class="sidenav">
          <app-sidebar [sidenav]="sidenav"></app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content class="sidenav-content">
          <app-header [sidenav]="sidenav"></app-header>
          <main class="main-content">
            <router-outlet></router-outlet>
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
    :host {
      display: block;
      height: 100%;
    }

    .sidenav-container {
      height: 100%;
      background: #f8f9fa;
    }

    .sidenav {
      width: 240px;
      border-right: none;
      box-shadow: 2px 0 8px rgba(0, 106, 172, 0.08);
    }

    .sidenav-content {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      max-width: 1400px;
      width: 100%;
      box-sizing: border-box;
    }

    .auth-container {
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #e3f1f9 0%, #f8f9fa 100%);
    }
  `]
})
export class LayoutComponent implements AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private readonly breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, Breakpoints.TabletPortrait])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(public authService: AuthService) {}

  ngAfterViewInit(): void {
    // Abrir sidenav em desktop automaticamente; fechar em mobile
    this.isHandset$.subscribe(isHandset => {
      if (this.sidenav) {
        if (isHandset) {
          this.sidenav.close();
        } else {
          this.sidenav.open();
        }
      }
    });
  }
}