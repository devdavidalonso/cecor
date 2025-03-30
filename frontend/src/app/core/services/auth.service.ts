import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface RefreshResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  
  // BehaviorSubject para controlar o estado de autenticação
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  // BehaviorSubject para dados do usuário
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Verifica se há um token válido no localStorage
   */
  checkAuth(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
      return false;
    }
    
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        const user = JSON.parse(userData) as User;
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        return true;
      }
    } catch (error) {
      console.error('Erro ao processar dados do usuário:', error);
    }
    
    this.logout();
    return false;
  }

  /**
   * Realiza o login do usuário
   */
  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap(response => {
          // Armazenar tokens
          localStorage.setItem(this.TOKEN_KEY, response.token);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
          
          // Armazenar dados do usuário
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          
          // Atualizar estado da autenticação
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }),
        map(response => response.user),
        catchError(error => {
          console.error('Erro ao realizar login:', error);
          const message = error.error?.message || 'Erro ao realizar login';
          return throwError(() => new Error(message));
        })
      );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    // Limpar dados do localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Atualizar estado da autenticação
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Redirecionar para a página de login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Renova o token de acesso usando o refresh token
   */
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token não encontrado'));
    }
    
    return this.http.post<RefreshResponse>(`${this.API_URL}/refresh`, { refreshToken })
      .pipe(
        map(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          return response.token;
        }),
        catchError(error => {
          console.error('Erro ao renovar token:', error);
          this.logout();
          return throwError(() => new Error('Falha ao renovar sessão'));
        })
      );
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verifica se o usuário tem uma determinada permissão/papel
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) {
      return false;
    }
    
    // Na implementação atual, estamos utilizando apenas o perfil principal
    // Futuramente, isso pode ser expandido para incluir múltiplos perfis
    return user.profile === role;
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}