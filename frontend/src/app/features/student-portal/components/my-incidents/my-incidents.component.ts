// src/app/features/student-portal/components/my-incidents/my-incidents.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

import { StudentPortalService, Incident } from '../../../../core/services/student-portal.service';

@Component({
  selector: 'app-my-incidents',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <div class="incidents-container">
      <div class="header">
        <button mat-button routerLink="/student/dashboard">
          <mat-icon>arrow_back</mat-icon>
          Voltar
        </button>
        <h1>🔔 Minhas Ocorrências</h1>
      </div>
      <div class="incidents-list" *ngIf="incidents.length > 0">
        <mat-card *ngFor="let incident of incidents" class="incident-card">
          <mat-card-header>
            <mat-card-title>{{ incident.title }}</mat-card-title>
            <mat-card-subtitle>{{ incident.createdAt | date:'dd/MM/yyyy' }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ incident.description }}</p>
            <mat-chip [color]="incident.status === 'resolved' ? 'primary' : 'warn'">
              {{ incident.status }}
            </mat-chip>
          </mat-card-content>
        </mat-card>
      </div>
      <div class="empty-state" *ngIf="incidents.length === 0">
        <mat-icon>check_circle</mat-icon>
        <p>Nenhuma ocorrência registrada.</p>
      </div>
    </div>
  `,
  styles: [`
    .incidents-container { padding: 24px; max-width: 900px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .incidents-list { display: flex; flex-direction: column; gap: 16px; }
    .empty-state { text-align: center; padding: 48px; }
  `]
})
export class MyIncidentsComponent implements OnInit {
  private studentService = inject(StudentPortalService);
  incidents: Incident[] = [];

  ngOnInit(): void {
    this.studentService.getMyIncidents().subscribe({
      next: (data) => this.incidents = data,
      error: (err) => console.error('Erro ao carregar ocorrências:', err)
    });
  }
}
