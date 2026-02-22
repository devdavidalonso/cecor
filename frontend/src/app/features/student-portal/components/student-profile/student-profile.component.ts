// src/app/features/student-portal/components/student-profile/student-profile.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { StudentPortalService, StudentProfile } from '../../../../core/services/student-portal.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <div class="header">
        <button mat-button routerLink="/student/dashboard">
          <mat-icon>arrow_back</mat-icon>
          Voltar
        </button>
        <h1>👤 Meu Perfil</h1>
      </div>

      <mat-card *ngIf="profile">
        <mat-card-content>
          <div class="profile-header">
            <div class="avatar">
              <mat-icon>person</mat-icon>
            </div>
            <div class="info">
              <h2>{{ profile.name }}</h2>
              <p>Aluno desde {{ profile.createdAt | date:'MM/yyyy' }}</p>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nome</mat-label>
                <input matInput [value]="profile.name" disabled>
              </mat-form-field>
            </div>

            <div class="form-row two-columns">
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Telefone</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>CPF</mat-label>
                <input matInput [value]="profile.cpf" disabled>
              </mat-form-field>
            </div>

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="!profileForm.dirty">
                <mat-icon>save</mat-icon>
                Salvar Alterações
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container { padding: 24px; max-width: 700px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; background: #e3f2fd; display: flex; align-items: center; justify-content: center; }
    .avatar mat-icon { font-size: 40px; width: 40px; height: 40px; color: #006aac; }
    .form-row { margin-bottom: 16px; }
    .form-row.two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .actions { display: flex; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class StudentProfileComponent implements OnInit {
  private studentService = inject(StudentPortalService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  profile: StudentProfile | null = null;
  profileForm: FormGroup = this.fb.group({
    email: [''],
    phone: ['']
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.studentService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.profileForm.patchValue({
          email: data.email,
          phone: data.phone
        });
      },
      error: (err) => console.error('Erro ao carregar perfil:', err)
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.studentService.updateProfile(this.profileForm.value).subscribe({
        next: () => {
          this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.profileForm.markAsPristine();
        },
        error: () => {
          this.snackBar.open('Erro ao atualizar perfil.', 'Fechar', { duration: 5000 });
        }
      });
    }
  }
}
