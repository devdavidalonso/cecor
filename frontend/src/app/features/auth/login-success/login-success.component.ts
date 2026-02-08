import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            const refreshToken = params['refreshToken'];

            if (token) {
                // Store tokens directly via AuthService (we will update AuthService to handle this)
                // For now, assuming AuthService has a method or we use localStorage directly if needed
                // But better to use AuthService.

                // Since we are refactoring, let's look at AuthService. 
                // I will assume for now I can set it in localStorage and then notify AuthService or similar.
                // Actually, let's update AuthService to have a loginWithToken method or similar.

                localStorage.setItem('auth_token', token);
                if (refreshToken) {
                    localStorage.setItem('refresh_token', refreshToken);
                }

                // Navigate to dashboard
                this.router.navigate(['/dashboard']);
            } else {
                // Failed, go back to login
                this.router.navigate(['/auth/login']);
            }
        });
    }
}
