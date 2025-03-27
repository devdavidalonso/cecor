import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.checkAuth()) {
    return true;
  }
  
  // Armazenar URL pretendida para redirecionamento após login
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};