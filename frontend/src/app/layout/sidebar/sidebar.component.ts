import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model'; // Assuming User model is here

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
    MatExpansionModule,
    TranslateModule
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
          <ng-container *ngIf="hasRequiredRole(item.roles) | async">
            <!-- Item com subitens -->
            <mat-expansion-panel *ngIf="item.children && item.children.length" class="mat-elevation-z0">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>{{ item.icon }}</mat-icon>
                  <span class="nav-item-text">{{ item.text | translate }}</span>
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <mat-nav-list>
                <ng-container *ngFor="let child of item.children">
                  <ng-container *ngIf="hasRequiredRole(child.roles) | async">
                    <a mat-list-item [routerLink]="child.route" routerLinkActive="active-link"
                      (click)="closeIfMobile()">
                      <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                      <span matListItemTitle>{{ child.text | translate }}</span>
                    </a>
                  </ng-container>
                </ng-container>
              </mat-nav-list>
            </mat-expansion-panel>
            
            <!-- Item simples -->
            <a *ngIf="!item.children" mat-list-item [routerLink]="item.route" routerLinkActive="active-link"
              (click)="closeIfMobile()">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.text | translate }}</span>
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
      background-color: white;
    }
    
    .sidebar-header {
      height: 64px; /* Matches standard toolbar height */
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #1565c0; /* Matches primary 800 */
      color: white;
      box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
      z-index: 1;
    }
    
    .logo {
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    .active-link {
      background-color: rgba(21, 101, 192, 0.08); /* Primary color with opacity */
      color: #1565c0;
      font-weight: 500;
      border-right: 3px solid #1565c0;
    }

    /* Hover effect for list items */
    mat-nav-list a:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
    
    mat-expansion-panel {
      border-radius: 0 !important;
      box-shadow: none !important;
      background-color: transparent !important;
    }
    
    .nav-item-text {
      margin-left: 8px;
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() sidenav!: MatSidenav;
  
  menuItems: MenuItem[] = [
    {
      text: 'NAV.DASHBOARD',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      text: 'NAV.STUDENTS',
      icon: 'people',
      children: [
        {
          text: 'NAV.STUDENTS_LIST',
          icon: 'list',
          route: '/students'
        },
        {
          text: 'NAV.STUDENTS_NEW',
          icon: 'person_add',
          route: '/students/new'
        }
      ]
    },
    {
      text: 'NAV.COURSES',
      icon: 'school',
      children: [
        {
          text: 'NAV.COURSES_LIST',
          icon: 'list',
          route: '/courses'
        },
        {
          text: 'NAV.COURSES_NEW',
          icon: 'add_circle',
          route: '/courses/new'
        }
      ]
    },
    {
      text: 'NAV.ENROLLMENTS',
      icon: 'how_to_reg',
      children: [
        {
          text: 'NAV.ENROLLMENTS_LIST',
          icon: 'list',
          route: '/enrollments'
        },
        {
          text: 'NAV.ENROLLMENTS_NEW',
          icon: 'add_circle',
          route: '/enrollments/new'
        }
      ]
    },
    {
      text: 'NAV.ATTENDANCE',
      icon: 'fact_check',
      route: '/attendance'
    },
    {
      text: 'NAV.REPORTS',
      icon: 'assessment',
      route: '/reports'
    },
    {
      text: 'NAV.INTERVIEWS',
      icon: 'question_answer',
      route: '/interviews'
    },
    {
      text: 'NAV.TEACHERS',
      icon: 'supervisor_account',
      route: '/teachers',
      roles: ['admin', 'administrador']
    },
    {
      text: 'NAV.ADMINISTRATION',
      icon: 'admin_panel_settings',
      route: '/administration',
      roles: ['admin', 'administrador']
    },
    {
      text: 'NAV.VOLUNTEERING',
      icon: 'volunteer_activism',
      route: '/volunteering'
    }
  ];
  
  currentUserRoles: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserRoles = user?.roles || [];
    });
  }
  
  hasRequiredRole(requiredRoles?: string[]): Observable<boolean> {
    if (!requiredRoles || requiredRoles.length === 0) {
      return of(true); // No roles required, so always show
    }
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user || !user.roles) {
          return false;
        }
        return requiredRoles.some(role => user.roles!.includes(role));
      })
    );
  }
  
  closeIfMobile(): void {
    if (window.innerWidth < 768) {
      this.sidenav.close();
    }
  }
}