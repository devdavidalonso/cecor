// src/app/features/teacher-portal/components/student-profile/student-profile.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Perfil do Aluno</mat-card-title>
          <mat-card-subtitle>Em desenvolvimento - Fase 5</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Esta funcionalidade será implementada na Fase 5.</p>
          <button mat-raised-button color="primary" routerLink="/teacher/courses">
            <mat-icon>arrow_back</mat-icon>
            Voltar para Turmas
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class StudentProfileComponent {}
