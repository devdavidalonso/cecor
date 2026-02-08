import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { User } from '../models/user.model';
import { SsoService } from './sso.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly router: Router,
    private readonly ssoService: SsoService
  ) {
    this.checkAuth();
  }

  checkAuth(): boolean {
    const isAuth = this.ssoService.isAuthenticated;
    this.isAuthenticatedSubject.next(isAuth);
    
    if (isAuth) {
      const user = this.getUserFromClaims();
      this.currentUserSubject.next(user);
    } else {
      this.currentUserSubject.next(null);
    }
    
    return isAuth;
  }

  private getUserFromClaims(): User {
    const claims: any = this.ssoService.identityClaims;
    const roles = this.ssoService.getUserRoles();
    
    return {
      id: claims?.sub || '',
      name: this.ssoService.getUserName(),
      email: this.ssoService.getUserEmail(),
      roles: roles,
      profile: this.mapRolesToProfile(roles)
    };
  }

  private mapRolesToProfile(roles: string[]): string {
    if (roles.includes('administrador')) return 'administrador';
    if (roles.includes('professor')) return 'professor';
    if (roles.includes('aluno')) return 'aluno';
    return 'user';
  }

  login(): void {
    this.ssoService.login();
  }

  logout(): void {
    this.ssoService.logout();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return this.ssoService.accessToken;
  }

  getCurrentUser(): User | null {
    if (!this.currentUserSubject.value && this.ssoService.isAuthenticated) {
      // Lazy load user data if not already loaded
      this.checkAuth();
    }
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return roles.some(role => user.roles.includes(role));
  }
}

