import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { SsoService } from '../../../core/services/sso.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-logo">CECOR</div>
          <mat-card-title>Sistema de Gestão Educacional</mat-card-title>
          <mat-card-subtitle>Faça login para continuar</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="seu@email.com">
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                Email é obrigatório
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Formato de email inválido
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput formControlName="password" type="password">
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Senha é obrigatória
              </mat-error>
            </mat-form-field>

            <div class="login-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="loginForm.invalid || loading"
                class="full-width"
              >
                <span *ngIf="!loading">Entrar</span>
                <mat-spinner *ngIf="loading" diameter="24"></mat-spinner>
              </button>
              
              <div class="mt-4 text-center">
                <span class="text-gray-500 text-sm">ou</span>
              </div>

              <button 
                type="button"
                mat-stroked-button 
                color="primary" 
                class="full-width mt-4"
                (click)="loginWithSso()"
              >
                Entrar com SSO (Keycloak)
              </button>
            </div>

            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    
    .login-card {
      max-width: 400px;
      width: 90%;
      padding: 20px;
    }
    
    .login-logo {
      font-size: 32px;
      font-weight: bold;
      color: #3f51b5;
      text-align: center;
      margin-bottom: 20px;
      width: 100%;
    }
    
    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 20px;
    }
    
    mat-card-title {
      margin-top: 10px;
    }
    
    .full-width {
      width: 100%;
    }

    .login-actions {
      margin-top: 16px;
    }

    .error-message {
      color: #f44336;
      text-align: center;
      margin-top: 16px;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly ssoService = inject(SsoService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  loading = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    // Para MVP, usar apenas autenticação via Keycloak
    this.loginWithSso();
  }

  loginWithSso(): void {
    this.ssoService.login();
  }
}

