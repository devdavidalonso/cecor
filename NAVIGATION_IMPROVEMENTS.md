# 🎨 GUIA DE NAVEGAÇÃO E PERMISSÕES - FRONTEND

**Objetivo:** Adaptar o menu e navegação do frontend conforme o perfil do usuário

---

## 🎯 VISÃO GERAL

Cada perfil deve ver apenas as opções relevantes para suas responsabilidades:

| Funcionalidade         | Admin | Professor | Aluno |
|------------------------|-------|-----------|-------|
| Dashboard              | ✅    | ✅        | ✅    |
| Alunos (CRUD)          | ✅    | ❌        | ❌    |
| Professores (CRUD)     | ✅    | ❌        | ❌    |
| Cursos (CRUD)          | ✅    | ❌        | ❌    |
| Matrículas             | ✅    | ❌        | ❌    |
| Minhas Turmas          | ❌    | ✅        | ❌    |
| Registrar Frequência   | ❌    | ✅        | ❌    |
| Meus Cursos            | ❌    | ❌        | ✅    |
| Minha Frequência       | ❌    | ❌        | ✅    |
| Relatórios (Todos)     | ✅    | ❌        | ❌    |
| Relatórios (Minhas)    | ❌    | ✅        | ❌    |

---

## 📁 ESTRUTURA DE ARQUIVOS

```
frontend/src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts           # Já existe
│   │   └── role.guard.ts           # CRIAR
│   ├── services/
│   │   ├── auth.service.ts         # Já existe
│   │   └── navigation.service.ts   # CRIAR
│   └── models/
│       └── menu-item.model.ts      # CRIAR
├── shared/
│   └── components/
│       ├── sidebar/
│       │   ├── sidebar.component.ts        # MODIFICAR
│       │   ├── sidebar.component.html      # MODIFICAR
│       │   └── sidebar.component.scss
│       └── header/
│           ├── header.component.ts         # MODIFICAR
│           └── header.component.html
└── features/
    ├── dashboard/
    │   ├── admin-dashboard/        # CRIAR
    │   ├── professor-dashboard/    # CRIAR
    │   └── aluno-dashboard/        # CRIAR
    ...
```

---

## 🛠️ IMPLEMENTAÇÃO

### 1. Criar Model de Menu Item

**Arquivo:** `frontend/src/app/core/models/menu-item.model.ts`

```typescript
export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  roles: string[];  // Quais roles podem ver este item
  children?: MenuItem[];
  badge?: string | number;
}
```

---

### 2. Criar Navigation Service

**Arquivo:** `frontend/src/app/core/services/navigation.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private allMenuItems: MenuItem[] = [
    // ADMIN
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
      roles: ['administrador']
    },
    {
      label: 'Alunos',
      icon: 'school',
      route: '/students',
      roles: ['administrador']
    },
    {
      label: 'Professores',
      icon: 'person',
      route: '/teachers',
      roles: ['administrador']
    },
    {
      label: 'Cursos',
      icon: 'book',
      route: '/courses',
      roles: ['administrador']
    },
    {
      label: 'Matrículas',
      icon: 'assignment',
      route: '/enrollments',
      roles: ['administrador']
    },
    {
      label: 'Relatórios',
      icon: 'assessment',
      route: '/reports',
      roles: ['administrador']
    },
    
    // PROFESSOR
    {
      label: 'Minhas Turmas',
      icon: 'groups',
      route: '/my-classes',
      roles: ['professor']
    },
    {
      label: 'Registrar Frequência',
      icon: 'how_to_reg',
      route: '/attendance/register',
      roles: ['professor']
    },
    {
      label: 'Relatórios',
      icon: 'assessment',
      route: '/reports/my-classes',
      roles: ['professor']
    },
    
    // ALUNO
    {
      label: 'Meus Cursos',
      icon: 'library_books',
      route: '/my-courses',
      roles: ['aluno']
    },
    {
      label: 'Minha Frequência',
      icon: 'event_available',
      route: '/my-attendance',
      roles: ['aluno']
    }
  ];

  constructor(private authService: AuthService) {}

  getMenuItemsForCurrentUser(): MenuItem[] {
    const userRoles = this.authService.getUserRoles();
    
    return this.allMenuItems.filter(item => 
      item.roles.some(role => userRoles.includes(role))
    );
  }

  canAccessRoute(route: string): boolean {
    const menuItem = this.allMenuItems.find(item => item.route === route);
    if (!menuItem) return false;
    
    const userRoles = this.authService.getUserRoles();
    return menuItem.roles.some(role => userRoles.includes(role));
  }
}
```

---

### 3. Criar Role Guard

**Arquivo:** `frontend/src/app/core/guards/role.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { 
  ActivatedRouteSnapshot, 
  CanActivate, 
  Router, 
  RouterStateSnapshot 
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const userRoles = this.authService.getUserRoles();
    const hasRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      // Redireciona para dashboard apropriado
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}
```

---

### 4. Atualizar Rotas com Role Guard

**Arquivo:** `frontend/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  
  // ROTAS ADMIN
  {
    path: 'students',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['administrador'] },
    loadChildren: () => import('./features/students/students.routes')
      .then(m => m.STUDENT_ROUTES)
  },
  {
    path: 'teachers',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['administrador'] },
    loadChildren: () => import('./features/teachers/teachers.routes')
      .then(m => m.TEACHER_ROUTES)
  },
  {
    path: 'courses',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['administrador'] },
    loadChildren: () => import('./features/courses/courses.routes')
      .then(m => m.COURSE_ROUTES)
  },
  {
    path: 'enrollments',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['administrador'] },
    loadChildren: () => import('./features/enrollments/enrollments.routes')
      .then(m => m.ENROLLMENT_ROUTES)
  },
  
  // ROTAS PROFESSOR
  {
    path: 'my-classes',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['professor'] },
    loadChildren: () => import('./features/my-classes/my-classes.routes')
      .then(m => m.MY_CLASSES_ROUTES)
  },
  {
    path: 'attendance',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['professor'] },
    loadChildren: () => import('./features/attendance/attendance.routes')
      .then(m => m.ATTENDANCE_ROUTES)
  },
  
  // ROTAS ALUNO
  {
    path: 'my-courses',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['aluno'] },
    loadChildren: () => import('./features/my-courses/my-courses.routes')
      .then(m => m.MY_COURSES_ROUTES)
  },
  {
    path: 'my-attendance',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['aluno'] },
    loadChildren: () => import('./features/my-attendance/my-attendance.routes')
      .then(m => m.MY_ATTENDANCE_ROUTES)
  },
  
  // ROTAS COMPARTILHADAS (com roles específicas)
  {
    path: 'reports',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['administrador', 'professor'] },
    loadChildren: () => import('./features/reports/reports.routes')
      .then(m => m.REPORT_ROUTES)
  },
  
  // ERRO
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent)
  }
];
```

---

### 5. Atualizar Sidebar Component

**Arquivo:** `frontend/src/app/shared/components/sidebar/sidebar.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

import { NavigationService } from '../../../core/services/navigation.service';
import { MenuItem } from '../../../core/models/menu-item.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatBadgeModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];

  constructor(private navigationService: NavigationService) {}

  ngOnInit(): void {
    this.loadMenu();
  }

  private loadMenu(): void {
    this.menuItems = this.navigationService.getMenuItemsForCurrentUser();
  }
}
```

**Arquivo:** `frontend/src/app/shared/components/sidebar/sidebar.component.html`

```html
<mat-nav-list>
  <mat-list-item 
    *ngFor="let item of menuItems"
    [routerLink]="item.route"
    routerLinkActive="active">
    
    <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
    
    <span matListItemTitle>{{ item.label }}</span>
    
    <span 
      *ngIf="item.badge"
      matListItemMeta
      [matBadge]="item.badge"
      matBadgeColor="warn">
    </span>
  </mat-list-item>
</mat-nav-list>
```

---

### 6. Adicionar Estilos ao Sidebar

**Arquivo:** `frontend/src/app/shared/components/sidebar/sidebar.component.scss`

```scss
mat-nav-list {
  padding-top: 0;
}

mat-list-item {
  border-radius: 8px;
  margin: 4px 8px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &.active {
    background-color: rgba(63, 81, 181, 0.12);
    
    mat-icon {
      color: #3f51b5;
    }
    
    span {
      color: #3f51b5;
      font-weight: 500;
    }
  }

  mat-icon {
    margin-right: 16px;
    color: rgba(0, 0, 0, 0.54);
  }
}
```

---

### 7. Atualizar AuthService

**Arquivo:** `frontend/src/app/core/services/auth.service.ts`

Adicione o método para pegar roles:

```typescript
export class AuthService {
  // ... código existente ...

  getUserRoles(): string[] {
    const claims = this.oauthService.getIdentityClaims() as any;
    if (!claims) return [];
    
    // Keycloak retorna roles em resource_access
    const roles = claims.resource_access?.['cecor-frontend']?.roles || [];
    
    // Também pode retornar em realm_access
    const realmRoles = claims.realm_access?.roles || [];
    
    return [...roles, ...realmRoles];
  }

  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }
}
```

---

### 8. Criar Dashboard Específico por Perfil

#### Admin Dashboard

**Arquivo:** `frontend/src/app/features/dashboard/admin-dashboard/admin-dashboard.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard do Administrador</h1>
      
      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-icon>school</mat-icon>
          <div class="stat-content">
            <h3>{{ totalAlunos }}</h3>
            <p>Alunos Cadastrados</p>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon>person</mat-icon>
          <div class="stat-content">
            <h3>{{ totalProfessores }}</h3>
            <p>Professores Ativos</p>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon>book</mat-icon>
          <div class="stat-content">
            <h3>{{ totalCursos }}</h3>
            <p>Cursos Disponíveis</p>
          </div>
        </mat-card>

        <mat-card class="stat-card">
          <mat-icon>assignment</mat-icon>
          <div class="stat-content">
            <h3>{{ totalMatriculas }}</h3>
            <p>Matrículas Ativas</p>
          </div>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Ações Rápidas</h2>
        <button mat-raised-button color="primary" routerLink="/students/new">
          <mat-icon>add</mat-icon> Novo Aluno
        </button>
        <button mat-raised-button color="accent" routerLink="/courses/new">
          <mat-icon>add</mat-icon> Novo Curso
        </button>
        <button mat-raised-button routerLink="/enrollments/new">
          <mat-icon>person_add</mat-icon> Nova Matrícula
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }

    .stat-card {
      display: flex;
      align-items: center;
      padding: 24px;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-right: 16px;
        color: #3f51b5;
      }

      .stat-content {
        h3 {
          margin: 0;
          font-size: 32px;
          font-weight: 500;
        }

        p {
          margin: 4px 0 0 0;
          color: rgba(0, 0, 0, 0.54);
        }
      }
    }

    .quick-actions {
      margin-top: 32px;

      button {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalAlunos = 0;
  totalProfessores = 0;
  totalCursos = 0;
  totalMatriculas = 0;

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    // TODO: Chamar API para pegar estatísticas
    // Por enquanto, valores mockados
    this.totalAlunos = 42;
    this.totalProfessores = 8;
    this.totalCursos = 12;
    this.totalMatriculas = 156;
  }
}
```

#### Professor Dashboard

**Arquivo:** `frontend/src/app/features/dashboard/professor-dashboard/professor-dashboard.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-professor-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1>Minhas Turmas</h1>
      
      <div class="classes-grid">
        <mat-card *ngFor="let turma of minhasTurmas" class="class-card">
          <h3>{{ turma.nome }}</h3>
          <p>{{ turma.totalAlunos }} alunos matriculados</p>
          <p class="frequency">Taxa de frequência média: {{ turma.frequenciaMedia }}%</p>
          
          <div class="actions">
            <button mat-button color="primary" [routerLink]="['/attendance/register', turma.id]">
              Registrar Chamada
            </button>
            <button mat-button [routerLink]="['/reports/class', turma.id]">
              Ver Relatório
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }

    .classes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .class-card {
      padding: 16px;

      h3 {
        margin-top: 0;
      }

      .frequency {
        color: #4caf50;
        font-weight: 500;
      }

      .actions {
        margin-top: 16px;
        display: flex;
        gap: 8px;
      }
    }
  `]
})
export class ProfessorDashboardComponent {
  minhasTurmas = [
    { id: 1, nome: 'Português - Turma A', totalAlunos: 25, frequenciaMedia: 87 },
    { id: 2, nome: 'Português - Turma B', totalAlunos: 22, frequenciaMedia: 92 }
  ];
}
```

#### Aluno Dashboard

**Arquivo:** `frontend/src/app/features/dashboard/aluno-dashboard/aluno-dashboard.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-aluno-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1>Meus Cursos</h1>
      
      <div class="courses-grid">
        <mat-card *ngFor="let curso of meusCursos" class="course-card">
          <h3>{{ curso.nome }}</h3>
          <p>Professor: {{ curso.professor }}</p>
          
          <div class="frequency-info">
            <p>Frequência: {{ curso.frequencia }}%</p>
            <mat-progress-bar 
              mode="determinate" 
              [value]="curso.frequencia"
              [color]="curso.frequencia >= 75 ? 'primary' : 'warn'">
            </mat-progress-bar>
          </div>
          
          <div class="stats">
            <span>Presenças: {{ curso.presencas }}</span>
            <span>Faltas: {{ curso.faltas }}</span>
          </div>
          
          <button mat-button color="primary" [routerLink]="['/my-attendance', curso.id]">
            Ver Detalhes
          </button>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }

    .course-card {
      padding: 16px;

      .frequency-info {
        margin: 16px 0;
        
        p {
          margin-bottom: 8px;
          font-weight: 500;
        }
      }

      .stats {
        display: flex;
        justify-content: space-around;
        margin: 16px 0;
        
        span {
          font-size: 14px;
          color: rgba(0, 0, 0, 0.6);
        }
      }
    }
  `]
})
export class AlunoDashboardComponent {
  meusCursos = [
    { 
      id: 1, 
      nome: 'Matemática Básica', 
      professor: 'Carlos Alberto', 
      frequencia: 85,
      presencas: 17,
      faltas: 3
    },
    { 
      id: 2, 
      nome: 'Português', 
      professor: 'Maria Silva', 
      frequencia: 92,
      presencas: 23,
      faltas: 2
    }
  ];
}
```

---

### 9. Dashboard Principal (Roteador)

**Arquivo:** `frontend/src/app/features/dashboard/dashboard.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProfessorDashboardComponent } from './professor-dashboard/professor-dashboard.component';
import { AlunoDashboardComponent } from './aluno-dashboard/aluno-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AdminDashboardComponent,
    ProfessorDashboardComponent,
    AlunoDashboardComponent
  ],
  template: `
    <app-admin-dashboard *ngIf="isAdmin"></app-admin-dashboard>
    <app-professor-dashboard *ngIf="isProfessor"></app-professor-dashboard>
    <app-aluno-dashboard *ngIf="isAluno"></app-aluno-dashboard>
  `
})
export class DashboardComponent implements OnInit {
  isAdmin = false;
  isProfessor = false;
  isAluno = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('administrador');
    this.isProfessor = this.authService.hasRole('professor');
    this.isAluno = this.authService.hasRole('aluno');
  }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar `menu-item.model.ts`
- [ ] Criar `navigation.service.ts`
- [ ] Criar `role.guard.ts`
- [ ] Atualizar `auth.service.ts` (getUserRoles)
- [ ] Atualizar `app.routes.ts` (adicionar RoleGuard)
- [ ] Atualizar `sidebar.component.ts`
- [ ] Atualizar `sidebar.component.html`
- [ ] Adicionar estilos ao sidebar
- [ ] Criar `admin-dashboard.component.ts`
- [ ] Criar `professor-dashboard.component.ts`
- [ ] Criar `aluno-dashboard.component.ts`
- [ ] Criar `dashboard.component.ts` (roteador)
- [ ] Criar componente `unauthorized.component.ts`

---

## 🧪 COMO TESTAR

1. **Login como Admin:**
   - Menu deve mostrar: Dashboard, Alunos, Professores, Cursos, Matrículas, Relatórios
   - Dashboard mostra estatísticas gerais

2. **Login como Professor:**
   - Menu deve mostrar: Minhas Turmas, Registrar Frequência, Relatórios
   - Dashboard mostra cards das turmas
   - NÃO deve conseguir acessar /students

3. **Login como Aluno:**
   - Menu deve mostrar: Meus Cursos, Minha Frequência
   - Dashboard mostra cursos com progresso
   - NÃO deve conseguir acessar /courses ou /attendance/register

---

## 📝 PRÓXIMOS PASSOS

Após implementar:
1. Testar navegação com cada perfil
2. Verificar que rotas protegidas retornam 403/Unauthorized
3. Ajustar estilos conforme necessário
4. Documentar permissões no USER_MANUAL.md
