// src/app/core/guards/teacher.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rotas do Portal do Professor
 * Permite acesso apenas para usuários com role 'professor', 'admin' ou 'administrador'
 */
export const TeacherGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  // Verificar se está autenticado
  if (!authService.checkAuth()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Verificar se tem role de professor ou admin
  const user = authService.getCurrentUser();
  const isTeacher = user?.roles?.includes('professor') || 
                    user?.roles?.includes('admin') || 
                    user?.roles?.includes('administrador');

  if (!isTeacher) {
    snackBar.open(
      'Acesso restrito a professores e administradores.', 
      'Fechar', 
      { duration: 5000 }
    );
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
