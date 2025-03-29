// src/app/core/guards/professor.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const ProfessorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Verifica se o usuário está autenticado e tem o papel de professor ou admin
  if (authService.checkAuth() && (authService.hasRole('professor') || authService.hasRole('admin'))) {
    return true;
  }
  
  if (!authService.checkAuth()) {
    // Se não estiver autenticado, redirecionar para login
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  } else {
    // Se estiver autenticado mas não for professor ou admin, redirecionar para acesso negado
    router.navigate(['/acesso-negado']);
  }
  
  return false;
};
