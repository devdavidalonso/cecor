// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

import { SsoService } from '../services/sso.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const ssoService = inject(SsoService);

  if (authService.checkAuth()) {
    return true;
  }

  // Redirect to the login page
  // Redirect to the login page (SSO)
  ssoService.login();

  return false;
};