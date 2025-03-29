// src/app/core/guards/gestor.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const GestorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Verifica se o usuário está autenticado e tem o papel de gestor ou admin
  if (authService.checkAuth() && (authService.hasRole('gestor') || authService.hasRole('admin'))) {
    return true;
  }
  
  if (!authService.checkAuth()) {
    // Se não estiver autenticado, redirecionar para login
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  } else {
    // Se estiver autenticado mas não for gestor ou admin, redirecionar para acesso negado
    router.navigate(['/acesso-negado']);
  }
  
  return false;
};