# 🔐 INTEGRATION GUIDE - Keycloak + CECOR

**Objetivo:** Integrar o sistema CECOR com autenticação centralizada via Keycloak (lar-sso)

---

## 📋 PRÉ-REQUISITOS

- ✅ lar-sso funcionando (Keycloak acessível em http://localhost:8081)
- ✅ Docker e Docker Compose instalados
- ✅ Go 1.22+ instalado
- ✅ Node.js 18+ e npm instalados

---

## 🎯 VISÃO GERAL DA INTEGRAÇÃO

```
Usuário → Frontend (Angular) → Keycloak (Login)
                ↓                      ↓
            Token JWT              Token JWT
                ↓                      ↓
         Backend (Go) ← Valida Token ←┘
                ↓
          PostgreSQL
```

---

## 🔧 PARTE 1 - CONFIGURAÇÃO DO KEYCLOAK

### 1.1 - Acessar Console Admin

1. Abra: http://localhost:8081
2. Faça login:
   - Username: `admin`
   - Password: `admin`

### 1.2 - Criar Realm "cecor"

1. No menu lateral esquerdo, clique no dropdown do realm (geralmente "master")
2. Clique em "Create Realm"
3. Preencha:
   - **Realm name:** `cecor`
   - **Enabled:** ON
4. Clique em "Create"

### 1.3 - Criar Client para o Frontend

1. No realm "cecor", vá em **Clients** → **Create client**
2. Preencha:
   - **Client type:** OpenID Connect
   - **Client ID:** `cecor-frontend`
3. Clique em "Next"
4. Configure:
   - **Client authentication:** OFF (public client)
   - **Authorization:** OFF
   - **Authentication flow:**
     - ✅ Standard flow
     - ✅ Direct access grants
5. Clique em "Next"
6. Configure URLs:
   - **Root URL:** `http://localhost:4200`
   - **Home URL:** `http://localhost:4200`
   - **Valid redirect URIs:** `http://localhost:4200/*`
   - **Valid post logout redirect URIs:** `http://localhost:4200/*`
   - **Web origins:** `http://localhost:4200`
7. Clique em "Save"

### 1.4 - Criar Client para o Backend

1. Vá em **Clients** → **Create client**
2. Preencha:
   - **Client ID:** `cecor-backend`
3. Clique em "Next"
4. Configure:
   - **Client authentication:** ON (confidential)
   - **Authorization:** OFF
5. Clique em "Save"
6. Vá na aba **Credentials** e copie o **Client Secret** (você vai precisar)

### 1.5 - Criar Roles

1. Vá em **Realm roles** → **Create role**
2. Crie as seguintes roles:

**Role 1:**
- **Role name:** `administrador`
- **Description:** Administrador do sistema

**Role 2:**
- **Role name:** `professor`
- **Description:** Professor que registra frequência

**Role 3:**
- **Role name:** `aluno`
- **Description:** Aluno que visualiza sua frequência

### 1.6 - Criar Usuários de Teste

#### Usuário 1 - Administrador
1. Vá em **Users** → **Add user**
2. Preencha:
   - **Username:** `admin.cecor`
   - **Email:** `admin@cecor.test`
   - **First name:** `Administrador`
   - **Last name:** `CECOR`
   - **Email verified:** ON
3. Clique em "Create"
4. Vá na aba **Credentials**:
   - **Password:** `admin123`
   - **Temporary:** OFF
   - Clique em "Set password"
5. Vá na aba **Role mapping**:
   - Clique em "Assign role"
   - Selecione `administrador`
   - Clique em "Assign"

#### Usuário 2 - Professor
1. Repita o processo:
   - **Username:** `prof.maria`
   - **Email:** `maria@cecor.test`
   - **Password:** `prof123`
   - **Role:** `professor`

#### Usuário 3 - Aluno
1. Repita o processo:
   - **Username:** `aluno.joao`
   - **Email:** `joao@cecor.test`
   - **Password:** `aluno123`
   - **Role:** `aluno`

---

## 🔧 PARTE 2 - CONFIGURAÇÃO DO BACKEND (GO)

### 2.1 - Instalar Dependências

```bash
cd backend
go get github.com/coreos/go-oidc/v3/oidc
go get golang.org/x/oauth2
```

### 2.2 - Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto backend:

```env
# Keycloak Configuration
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=cecor
KEYCLOAK_CLIENT_ID=cecor-backend
KEYCLOAK_CLIENT_SECRET=<seu-client-secret-aqui>

# Application
APP_PORT=8080
APP_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=cecor
DB_PASSWORD=cecor123
DB_NAME=cecor_db
```

### 2.3 - Criar Middleware de Autenticação

Crie o arquivo `backend/internal/auth/middleware.go`:

```go
package auth

import (
    "context"
    "net/http"
    "strings"

    "github.com/coreos/go-oidc/v3/oidc"
    "github.com/gin-gonic/gin"
    "golang.org/x/oauth2"
)

type KeycloakMiddleware struct {
    verifier *oidc.IDTokenVerifier
    config   *oauth2.Config
}

func NewKeycloakMiddleware(issuerURL, clientID, clientSecret string) (*KeycloakMiddleware, error) {
    ctx := context.Background()
    
    provider, err := oidc.NewProvider(ctx, issuerURL)
    if err != nil {
        return nil, err
    }

    config := &oauth2.Config{
        ClientID:     clientID,
        ClientSecret: clientSecret,
        Endpoint:     provider.Endpoint(),
    }

    verifier := provider.Verifier(&oidc.Config{ClientID: clientID})

    return &KeycloakMiddleware{
        verifier: verifier,
        config:   config,
    }, nil
}

func (k *KeycloakMiddleware) ValidateToken() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Token ausente"})
            c.Abort()
            return
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        
        ctx := context.Background()
        idToken, err := k.verifier.Verify(ctx, tokenString)
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
            c.Abort()
            return
        }

        var claims struct {
            Email         string   `json:"email"`
            EmailVerified bool     `json:"email_verified"`
            Name          string   `json:"name"`
            PreferredUsername string `json:"preferred_username"`
            RealmAccess   struct {
                Roles []string `json:"roles"`
            } `json:"realm_access"`
        }

        if err := idToken.Claims(&claims); err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Erro ao extrair claims"})
            c.Abort()
            return
        }

        c.Set("user_email", claims.Email)
        c.Set("user_name", claims.Name)
        c.Set("user_roles", claims.RealmAccess.Roles)
        c.Set("username", claims.PreferredUsername)

        c.Next()
    }
}

func (k *KeycloakMiddleware) RequireRole(role string) gin.HandlerFunc {
    return func(c *gin.Context) {
        roles, exists := c.Get("user_roles")
        if !exists {
            c.JSON(http.StatusForbidden, gin.H{"error": "Roles não encontradas"})
            c.Abort()
            return
        }

        userRoles := roles.([]string)
        hasRole := false
        for _, r := range userRoles {
            if r == role {
                hasRole = true
                break
            }
        }

        if !hasRole {
            c.JSON(http.StatusForbidden, gin.H{"error": "Permissão negada"})
            c.Abort()
            return
        }

        c.Next()
    }
}
```

### 2.4 - Configurar Rotas com Middleware

Edite `backend/cmd/api/main.go`:

```go
package main

import (
    "log"
    "os"

    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "seu-projeto/internal/auth"
)

func main() {
    // Carregar variáveis de ambiente
    if err := godotenv.Load(); err != nil {
        log.Println("Arquivo .env não encontrado")
    }

    // Configurar Keycloak
    keycloakURL := os.Getenv("KEYCLOAK_URL")
    realm := os.Getenv("KEYCLOAK_REALM")
    clientID := os.Getenv("KEYCLOAK_CLIENT_ID")
    clientSecret := os.Getenv("KEYCLOAK_CLIENT_SECRET")

    issuerURL := keycloakURL + "/realms/" + realm

    keycloakMiddleware, err := auth.NewKeycloakMiddleware(issuerURL, clientID, clientSecret)
    if err != nil {
        log.Fatal("Erro ao configurar Keycloak:", err)
    }

    // Configurar Gin
    router := gin.Default()

    // Rotas públicas
    public := router.Group("/api/v1")
    {
        public.GET("/health", func(c *gin.Context) {
            c.JSON(200, gin.H{"status": "ok"})
        })
    }

    // Rotas protegidas
    protected := router.Group("/api/v1")
    protected.Use(keycloakMiddleware.ValidateToken())
    {
        protected.GET("/profile", func(c *gin.Context) {
            name, _ := c.Get("user_name")
            email, _ := c.Get("user_email")
            roles, _ := c.Get("user_roles")
            
            c.JSON(200, gin.H{
                "name":  name,
                "email": email,
                "roles": roles,
            })
        })
    }

    // Rotas apenas para administradores
    admin := router.Group("/api/v1/admin")
    admin.Use(keycloakMiddleware.ValidateToken())
    admin.Use(keycloakMiddleware.RequireRole("administrador"))
    {
        admin.GET("/users", func(c *gin.Context) {
            c.JSON(200, gin.H{"message": "Lista de usuários (apenas admin)"})
        })
    }

    port := os.Getenv("APP_PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("Servidor rodando na porta %s", port)
    router.Run(":" + port)
}
```

### 2.5 - Testar Backend

```bash
# Subir o backend
cd backend
go run cmd/api/main.go

# Testar endpoint público
curl http://localhost:8080/api/v1/health
# Deve retornar: {"status":"ok"}
```

---

## 🔧 PARTE 3 - CONFIGURAÇÃO DO FRONTEND (ANGULAR)

### 3.1 - Instalar Dependências

```bash
cd frontend
npm install keycloak-angular keycloak-js
```

### 3.2 - Configurar Keycloak no Angular

Crie o arquivo `frontend/src/app/core/init/keycloak-init.factory.ts`:

```typescript
import { KeycloakService } from 'keycloak-angular';

export function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8081',
        realm: 'cecor',
        clientId: 'cecor-frontend',
      },
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html',
      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: ['/assets', '/api/v1/health'],
    });
}
```

### 3.3 - Configurar no app.config.ts (ou app.module.ts)

Se você usa **standalone components** (Angular 17+), edite `app.config.ts`:

```typescript
import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { initializeKeycloak } from './core/init/keycloak-init.factory';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
  ],
};
```

Se você usa **módulos tradicionais**, edite `app.module.ts`:

```typescript
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from './core/init/keycloak-init.factory';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    KeycloakAngularModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### 3.4 - Criar AuthGuard

Crie `frontend/src/app/core/guards/auth.guard.ts`:

```typescript
import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard extends KeycloakAuthGuard {
  constructor(
    protected override readonly router: Router,
    protected readonly keycloak: KeycloakService
  ) {
    super(router, keycloak);
  }

  async isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    if (!this.authenticated) {
      await this.keycloak.login({
        redirectUri: window.location.origin + state.url,
      });
      return false;
    }

    const requiredRoles = route.data['roles'];
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.some((role: string) => this.roles.includes(role));
  }
}
```

### 3.5 - Proteger Rotas

Edite `frontend/src/app/app.routes.ts` (ou `app-routing.module.ts`):

```typescript
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'alunos',
    canActivate: [AuthGuard],
    data: { roles: ['administrador'] },
    loadChildren: () => import('./features/alunos/alunos.routes').then(m => m.ALUNOS_ROUTES),
  },
];
```

### 3.6 - Criar Serviço de Autenticação

Crie `frontend/src/app/core/services/auth.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private keycloak: KeycloakService) {}

  async getUserProfile(): Promise<KeycloakProfile> {
    return await this.keycloak.loadUserProfile();
  }

  getUserRoles(): string[] {
    return this.keycloak.getUserRoles();
  }

  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  async logout(): Promise<void> {
    await this.keycloak.logout(window.location.origin);
  }

  getToken(): string {
    return this.keycloak.getToken();
  }

  isLoggedIn(): boolean {
    return this.keycloak.isLoggedIn();
  }
}
```

### 3.7 - Criar Componente de Header com Logout

Crie `frontend/src/app/layout/header/header.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header>
      <div class="user-info" *ngIf="userProfile">
        <span>Olá, {{ userProfile.firstName }}!</span>
        <span>Roles: {{ roles.join(', ') }}</span>
        <button (click)="logout()">Sair</button>
      </div>
    </header>
  `,
  styles: [`
    header {
      background: #3f51b5;
      color: white;
      padding: 1rem;
    }
    .user-info {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    button {
      background: #ff4081;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
  `],
})
export class HeaderComponent implements OnInit {
  userProfile?: KeycloakProfile;
  roles: string[] = [];

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.userProfile = await this.authService.getUserProfile();
    this.roles = this.authService.getUserRoles();
  }

  async logout() {
    await this.authService.logout();
  }
}
```

---

## 🧪 TESTES DE INTEGRAÇÃO

### Teste 1 - Login com Administrador

1. Acesse http://localhost:4200
2. Será redirecionado para Keycloak
3. Faça login com:
   - Username: `admin.cecor`
   - Password: `admin123`
4. Deve retornar para a aplicação logado

### Teste 2 - Validar Token no Backend

```bash
# 1. Copie o token do localStorage do navegador (F12 → Application → Local Storage)

# 2. Teste o endpoint protegido
curl -H "Authorization: Bearer SEU_TOKEN_AQUI" http://localhost:8080/api/v1/profile

# Deve retornar seus dados de usuário
```

### Teste 3 - Logout

1. Clique no botão "Sair"
2. Deve ser deslogado e redirecionado para página inicial

---

## 🐛 TROUBLESHOOTING

### Erro: "CORS policy"
**Solução:** Verifique se o backend está com CORS habilitado:

```go
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:4200"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
}))
```

### Erro: "Token inválido"
**Possíveis causas:**
1. Client Secret errado no `.env`
2. Realm ou Client ID errado
3. Token expirado (renovar o login)

### Erro: "Redirect URI mismatch"
**Solução:** Verifique se no Keycloak Client está configurado:
- Valid redirect URIs: `http://localhost:4200/*`

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Keycloak acessível em http://localhost:8081
- [ ] Realm "cecor" criado
- [ ] 2 Clients configurados (frontend + backend)
- [ ] 3 Roles criadas
- [ ] 3 Usuários de teste criados
- [ ] Backend valida token JWT
- [ ] Frontend redireciona para Keycloak no login
- [ ] Logout funciona corretamente
- [ ] Roles são extraídas do token
- [ ] Guards protegem rotas no frontend

---

## 📚 REFERÊNCIAS

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [keycloak-angular](https://github.com/mauriciovigolo/keycloak-angular)
- [go-oidc](https://github.com/coreos/go-oidc)

---

**Próximos passos:** Após validar a integração, siga para o desenvolvimento dos CRUDs conforme o MVP-ROADMAP.md

🚀 **Boa integração!**
