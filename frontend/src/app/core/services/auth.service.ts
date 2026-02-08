import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';

import { SsoService } from './sso.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  public readonly SSO_API_URL = 'http://localhost:8081';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private ssoService: SsoService
  ) {
    this.checkAuth(); // Check auth status on service initialization
  }

  checkAuth(): boolean {


    // Fallback to old logic (optional, but likely not needed anymore)
    const token = this.getToken();
    const userData = localStorage.getItem(this.USER_KEY);

    if (token) {
      if (userData) {
        try {
          const user = JSON.parse(userData) as User;
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          return true;
        } catch (error) {
          console.error('Error parsing user data from localStorage', error);
        }
      }

      // If no userData or parse failed, try to decode token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.userId,
          name: payload.name,
          email: payload.email,
          roles: payload.roles || [],
          profile: 'user'
        };
        this.storeLoginData(token, user); // Save for next time
        return true;
      } catch (e) {
        console.error('Failed to decode token', e);
      }
    }

    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    return false;
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            // HACK: Create a dummy user object since the API doesn't return user details.
            // This should be replaced with a call to a /me or /validate endpoint.
            const dummyUser: User = {
              id: 1, // Placeholder
              name: email.split('@')[0], // Placeholder
              email: email,
              roles: ['user'], // Placeholder
              profile: 'user' // Placeholder
            };
            this.storeLoginData(response.token, dummyUser);
            this.router.navigate(['/dashboard']);
          }
        }),
        map(response => !!response && !!response.token),
        catchError(error => {
          console.error('Login failed', error);
          return of(false);
        })
      );
  }

  private storeLoginData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.ssoService.logout();
  }

  getToken(): string | null {
    return this.ssoService.accessToken || localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
