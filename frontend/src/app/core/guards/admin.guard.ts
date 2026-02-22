// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Verificar se está autenticado
  if (!authService.checkAuth()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Verificar se tem role de admin
  const user = authService.getCurrentUser();
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('administrador') || false;

  if (!isAdmin) {
    snackBar.open(
      'Acesso negado. Esta área é restrita para administradores.', 
      'Fechar', 
      { duration: 5000 }
    );
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
