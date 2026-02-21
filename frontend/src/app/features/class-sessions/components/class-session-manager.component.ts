import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-class-session-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule
  ],
  template: `
    <div class="manager-container">
      <div class="header-actions">
        <div>
          <h2>Class Sessions Manager</h2>
          <p class="subtitle">Overview and manage all upcoming classes across courses</p>
        </div>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon> Create Extra Session
        </button>
      </div>

      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="sessions" class="full-width-table">
            
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef> Date & Time </th>
              <td mat-cell *matCellDef="let s"> 
                <strong>{{s.date | date:'longDate'}}</strong><br>
                <span class="text-sm text-gray-500">{{s.startTime}} - {{s.endTime}}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="course">
              <th mat-header-cell *matHeaderCellDef> Course </th>
              <td mat-cell *matCellDef="let s"> {{s.courseName}} </td>
            </ng-container>

            <ng-container matColumnDef="topic">
              <th mat-header-cell *matHeaderCellDef> Topic / Ementa </th>
              <td mat-cell *matCellDef="let s"> {{s.topic}} </td>
            </ng-container>

            <ng-container matColumnDef="location">
              <th mat-header-cell *matHeaderCellDef> Location </th>
              <td mat-cell *matCellDef="let s"> {{s.locationName || 'TBD'}} </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let s">
                <mat-chip-option [color]="s.isCancelled ? 'warn' : 'primary'" [selected]="true" [selectable]="false">
                  {{ s.isCancelled ? 'Cancelled' : 'Scheduled' }}
                </mat-chip-option>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let s">
                <button mat-icon-button color="primary" title="Edit Session">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="accent" title="Mark Attendance" routerLink="/attendance">
                  <mat-icon>fact_check</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            
            <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="6">No upcoming sessions found.</td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .manager-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    h2 { margin: 0; font-size: 24px; color: #333; }
    .subtitle { margin: 4px 0 0; color: #666; }
    .table-card { overflow: hidden; }
    .full-width-table { width: 100%; }
    .text-sm { font-size: 0.875rem; }
    .text-gray-500 { color: #6b7280; }
  `]
})
export class ClassSessionManagerComponent implements OnInit {
  displayedColumns: string[] = ['date', 'course', 'topic', 'location', 'status', 'actions'];
  sessions = [
    { id: 1, date: new Date().toISOString(), startTime: '19:00', endTime: '22:00', courseName: 'Informática Básica', topic: 'Windows e Navegadores', locationName: 'Lab 01', isCancelled: false },
    { id: 2, date: new Date(Date.now() + 86400000).toISOString(), startTime: '14:00', endTime: '18:00', courseName: 'Culinária I', topic: 'Massas e Molhos', locationName: 'Cozinha Principal', isCancelled: false },
    { id: 3, date: new Date(Date.now() + 172800000).toISOString(), startTime: '19:00', endTime: '21:00', courseName: 'Inglês', topic: 'Verb To Be', locationName: 'Sala 03', isCancelled: true }
  ];

  constructor() {}

  ngOnInit(): void {
    // In a real scenario, fetch upcoming sessions from ClassSessionService
  }
}
