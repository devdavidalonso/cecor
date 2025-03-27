import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
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
        
        <mat-progress-bar *ngIf="loading" mode="indeterminate"></mat-progress-bar>
        
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email" placeholder="seu.email@exemplo.com" required>
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                E-mail é obrigatório
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                E-mail inválido
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input 
                matInput 
                [type]="hidePassword ? 'password' : 'text'" 
                formControlName="password" 
                required
              >
              <button 
                type="button"
                mat-icon-button 
                matSuffix 
                (click)="hidePassword = !hidePassword" 
                [attr.aria-label]="'Mostrar senha'" 
                [attr.aria-pressed]="!hidePassword"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Senha é obrigatória
              </mat-error>
            </mat-form-field>
            
            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="loginForm.invalid || loading"
                class="full-width"
              >
                Entrar
              </button>
            </div>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <a mat-button routerLink="/auth/forgot-password" class="full-width">
            Esqueceu sua senha?
          </a>
        </mat-card-actions>
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
      max-width: 550px;
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
    
    .form-actions {
      margin-top: 20px;
    }
    
    mat-progress-bar {
      margin-bottom: 20px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;
  returnUrl: string = '/';
  
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    // Inicializar formulário
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    
    // Obter URL de retorno dos parâmetros da rota ou usar padrão
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  
  onSubmit(): void {
    // Verificar se o formulário é válido
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    this.cdr.detectChanges();
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login(email, password)
      .subscribe({
        next: () => {
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          this.snackBar.open(
            error.message || 'Falha na autenticação. Verifique suas credenciais.',
            'Fechar',
            { duration: 5000 }
          );
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }
}