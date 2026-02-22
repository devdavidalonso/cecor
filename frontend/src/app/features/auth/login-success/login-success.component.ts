import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SsoService } from '../../../core/services/sso.service';

@Component({
    selector: 'app-login-success',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div class="p-8 bg-white rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Autenticação realizada!</h2>
        <p class="text-gray-600">Redirecionando para o sistema...</p>
      </div>
    </div>
  `
})
export class LoginSuccessComponent implements OnInit {
    private router = inject(Router);
    private authService = inject(AuthService);
    private ssoService = inject(SsoService);

    async ngOnInit() {
        // Mantém compatibilidade com rota antiga, mas sem persistir token manual.
        // A sessão/autenticação deve vir exclusivamente do fluxo OIDC do Keycloak.
        await this.ssoService.initSso();
        if (this.authService.checkAuth()) {
            this.router.navigate(['/dashboard']);
            return;
        }

        this.router.navigate(['/auth/login']);
    }
}
