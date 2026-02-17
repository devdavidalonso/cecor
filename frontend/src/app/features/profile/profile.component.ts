// src/app/features/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
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
    MatTabsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="perfil-container">
      <h1>Meu Perfil</h1>
      
      <div class="profile-content" *ngIf="currentUser">
        <div class="profile-header">
          <div class="avatar">
            <div class="avatar-circle">
              <mat-icon *ngIf="!photoUrl">person</mat-icon>
              <img *ngIf="photoUrl" [src]="photoUrl" alt="Foto de perfil">
            </div>
            <button mat-mini-fab color="primary" (click)="fileInput.click()" class="upload-button">
              <mat-icon>photo_camera</mat-icon>
            </button>
            <input #fileInput type="file" hidden (change)="onPhotoSelected($event)" accept="image/*">
          </div>
          
          <div class="user-info">
            <h2>{{ currentUser.name }}</h2>
            <p class="email">{{ currentUser.email }}</p>
            <div class="role-chip">
              <mat-chip-listbox>
                <mat-chip color="primary" selected>{{ currentUser.profile }}</mat-chip>
              </mat-chip-listbox>
            </div>
          </div>
        </div>
        
        <mat-divider></mat-divider>
        
        <mat-tab-group>
          <!-- Dados Pessoais -->
          <mat-tab label="Dados Pessoais">
            <div class="tab-content">
              <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>
              
              <form [formGroup]="perfilForm" (ngSubmit)="salvarPerfil()">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Nome Completo</mat-label>
                    <input matInput formControlName="nome">
                    <mat-error *ngIf="perfilForm.get('nome')?.hasError('required')">
                      Nome é obrigatório
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>E-mail</mat-label>
                    <input matInput formControlName="email" readonly>
                    <mat-hint>O e-mail não pode ser alterado</mat-hint>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>CPF</mat-label>
                    <input matInput formControlName="cpf">
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Telefone</mat-label>
                    <input matInput formControlName="telefone">
                  </mat-form-field>
                  
                  <div class="actions">
                    <button mat-raised-button color="primary" type="submit" [disabled]="perfilForm.invalid || isSubmitting">
                      <mat-icon>save</mat-icon> Salvar Alterações
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </mat-tab>
          
          <!-- Alteração de Senha -->
          <mat-tab label="Alterar Senha">
            <div class="tab-content">
              <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>
              
              <form [formGroup]="senhaForm" (ngSubmit)="alterarSenha()">
                <div class="form-grid">
                  <mat-form-field appearance="outline">
                    <mat-label>Senha Atual</mat-label>
                    <input matInput type="password" formControlName="senhaAtual">
                    <mat-error *ngIf="senhaForm.get('senhaAtual')?.hasError('required')">
                      Senha atual é obrigatória
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Nova Senha</mat-label>
                    <input matInput type="password" formControlName="novaSenha">
                    <mat-error *ngIf="senhaForm.get('novaSenha')?.hasError('required')">
                      Nova senha é obrigatória
                    </mat-error>
                    <mat-error *ngIf="senhaForm.get('novaSenha')?.hasError('minlength')">
                      A senha deve ter pelo menos 6 caracteres
                    </mat-error>
                  </mat-form-field>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Confirmar Nova Senha</mat-label>
                    <input matInput type="password" formControlName="confirmarSenha">
                    <mat-error *ngIf="senhaForm.get('confirmarSenha')?.hasError('required')">
                      Confirmação da senha é obrigatória
                    </mat-error>
                    <mat-error *ngIf="senhaForm.get('confirmarSenha')?.hasError('mustMatch')">
                      As senhas não coincidem
                    </mat-error>
                  </mat-form-field>
                  
                  <div class="actions">
                    <button mat-raised-button color="primary" type="submit" [disabled]="senhaForm.invalid || isSubmitting">
                      <mat-icon>lock</mat-icon> Alterar Senha
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </mat-tab>
          
          <!-- Preferências -->
          <mat-tab label="Preferências">
            <div class="tab-content">
              <mat-progress-bar *ngIf="isLoading" mode="indeterminate"></mat-progress-bar>
              
              <form [formGroup]="prefForm" (ngSubmit)="salvarPreferencias()">
                <div class="form-grid">
                  <h3>Notificações</h3>
                  
                  <div class="notification-options">
                    <div class="notification-option">
                      <mat-checkbox formControlName="notificacoesEmail">Receber notificações por e-mail</mat-checkbox>
                    </div>
                    
                    <div class="notification-option">
                      <mat-checkbox formControlName="notificacoesTelegram">Receber notificações por Telegram</mat-checkbox>
                    </div>
                    
                    <div class="notification-option">
                      <mat-checkbox formControlName="notificacoesSMS">Receber notificações por SMS</mat-checkbox>
                    </div>
                    
                    <div class="notification-option">
                      <mat-checkbox formControlName="notificacoesApp">Receber notificações no aplicativo</mat-checkbox>
                    </div>
                  </div>
                  
                  <h3>Interface</h3>
                  
                  <div class="interface-options">
                    <div class="interface-option">
                      <mat-checkbox formControlName="temaEscuro">Usar tema escuro</mat-checkbox>
                    </div>
                    
                    <div class="interface-option">
                      <mat-checkbox formControlName="altaContraste">Modo de alto contraste</mat-checkbox>
                    </div>
                    
                    <div class="interface-option">
                      <mat-checkbox formControlName="fonteMaior">Usar fonte maior</mat-checkbox>
                    </div>
                  </div>
                  
                  <div class="actions">
                    <button mat-raised-button color="primary" type="submit" [disabled]="isSubmitting">
                      <mat-icon>save</mat-icon> Salvar Preferências
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .perfil-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1 {
      margin-bottom: 20px;
    }
    
    .profile-content {
      background-color: white;
      border-radius: 4px;
      box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
      overflow: hidden;
    }
    
    .profile-header {
      display: flex;
      padding: 20px;
      align-items: center;
      gap: 20px;
    }
    
    .avatar {
      position: relative;
    }
    
    .avatar-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background-color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .avatar-circle mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #9e9e9e;
    }
    
    .avatar-circle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .upload-button {
      position: absolute;
      bottom: 0;
      right: 0;
    }
    
    .user-info {
      flex-grow: 1;
    }
    
    .user-info h2 {
      margin: 0 0 8px;
      font-size: 24px;
    }
    
    .email {
      margin: 0 0 8px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .tab-content {
      padding: 20px;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }
    
    .actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
    
    .notification-options,
    .interface-options {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }
    
    h3 {
      grid-column: 1 / -1;
      margin: 16px 0 8px;
      font-size: 18px;
      font-weight: 500;
    }
    
    @media (max-width: 600px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }
      
      .user-info {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  photoUrl: string | null = null;
  
  perfilForm: FormGroup;
  senhaForm: FormGroup;
  prefForm: FormGroup;
  
  isLoading = false;
  isSubmitting = false;
  
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    // Inicializar formulários
    this.perfilForm = this.fb.group({
      nome: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      cpf: [''],
      telefone: ['']
    });
    
    this.senhaForm = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, {
      validators: this.mustMatch('novaSenha', 'confirmarSenha')
    });
    
    this.prefForm = this.fb.group({
      notificacoesEmail: [true],
      notificacoesTelegram: [false],
      notificacoesSMS: [false],
      notificacoesApp: [true],
      temaEscuro: [false],
      altaContraste: [false],
      fonteMaior: [false]
    });
  }
  
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  // Carrega os dados do perfil do usuário
  loadUserProfile(): void {
    this.isLoading = true;
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (user) {
        // Preencher formulário com dados do usuário
        this.perfilForm.patchValue({
          nome: user.name,
          email: user.email,
          // Outros campos viriam da API em uma implementação real
          cpf: '',
          telefone: ''
        });
        
        // Em uma implementação real, carregaríamos também as preferências do usuário
      }
      
      this.isLoading = false;
    });
  }
  
  // Validador personalizado para confirmar senha
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
  
  // Manipula o upload de foto
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }
    
    const file = input.files[0];
    
    // Verificar tamanho do arquivo (limite de 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      this.snackBar.open('A imagem é muito grande. O tamanho máximo é 5MB.', 'Fechar', { duration: 5000 });
      return;
    }
    
    // Criar um URL temporário para exibir a imagem selecionada
    this.photoUrl = URL.createObjectURL(file);
    
    // Em uma implementação real, faríamos upload para o servidor
    this.snackBar.open('Foto selecionada. Clique em Salvar Alterações para aplicar.', 'Fechar', { duration: 3000 });
  }
  
  // Salvar alterações no perfil
  salvarPerfil(): void {
    if (this.perfilForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Simulação de API (em uma implementação real, enviaríamos para o backend)
    setTimeout(() => {
      this.isSubmitting = false;
      this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', { duration: 3000 });
    }, 1500);
  }
  
  // Alterar senha
  alterarSenha(): void {
    if (this.senhaForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Simulação de API (em uma implementação real, enviaríamos para o backend)
    setTimeout(() => {
      this.isSubmitting = false;
      this.snackBar.open('Senha alterada com sucesso!', 'Fechar', { duration: 3000 });
      this.senhaForm.reset();
    }, 1500);
  }
  
  // Salvar preferências
  salvarPreferencias(): void {
    this.isSubmitting = true;
    
    // Simulação de API (em uma implementação real, enviaríamos para o backend)
    setTimeout(() => {
      this.isSubmitting = false;
      this.snackBar.open('Preferências salvas com sucesso!', 'Fechar', { duration: 3000 });
    }, 1500);
  }
}