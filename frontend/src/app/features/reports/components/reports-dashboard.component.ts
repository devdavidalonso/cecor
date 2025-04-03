// src/app/features/reports/components/reports-dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <h1>Reports Dashboard</h1>
      
      <div class="report-cards">
        <mat-card class="report-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>date_range</mat-icon>
            <mat-card-title>Attendance Report</mat-card-title>
            <mat-card-subtitle>Analyze student attendance</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View detailed attendance statistics by course, student, or date range.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/reports/attendance">VIEW REPORT</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="report-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>trending_up</mat-icon>
            <mat-card-title>Performance Report</mat-card-title>
            <mat-card-subtitle>Analyze student performance</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>View performance metrics and identify trends across courses and periods.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/reports/performance">VIEW REPORT</button>
          </mat-card-actions>
        </mat-card>
        
        <mat-card class="report-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>school</mat-icon>
            <mat-card-title>Course Report</mat-card-title>
            <mat-card-subtitle>Course analysis</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Compare course enrollment, attendance, and completion statistics.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" disabled>COMING SOON</button>
          </mat-card-actions>
        </mat-card>
        
        <mat-card class="report-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>event_note</mat-icon>
            <mat-card-title>Certificate Report</mat-card-title>
            <mat-card-subtitle>Certificate issuance and status</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>Track certificate issuance, verification, and student qualification status.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" disabled>COMING SOON</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    
    .report-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .report-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .report-card mat-card-content {
      flex-grow: 1;
    }
    
    .report-card mat-card-actions {
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class ReportsDashboardComponent {}