// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.checkAuth() && authService.hasRole('admin')) {
    return true;
  }
  
  if (!authService.checkAuth()) {
    // Se não estiver autenticado, redirecionar para login
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  } else {
    // Se estiver autenticado mas não for admin, redirecionar para acesso negado
    router.navigate(['/acesso-negado']);
  }
  
  return false;
};
