import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EnrollmentService } from '../../../core/services/enrollment.service';
import { Enrollment, EnrollmentStatus } from '../../../core/models/enrollment.model';

@Component({
  selector: 'app-enrollments-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatSnackBarModule
  ],
  template: `
    <div class="enrollments-list-container">
      <div class="header-actions">
        <div>
          <h2>Enrollment Management</h2>
          <p class="subtitle">View and manage student registrations in courses</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/enrollments/new">
          <mat-icon>add</mat-icon>
          Register Student
        </button>
      </div>

      <mat-card class="table-card">
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="full-width-table">

            <!-- Number Column -->
            <ng-container matColumnDef="enrollmentNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Number </th>
              <td mat-cell *matCellDef="let enrollment"> {{enrollment.enrollmentNumber}} </td>
            </ng-container>

            <!-- Student Column -->
            <ng-container matColumnDef="studentId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Student ID </th>
              <td mat-cell *matCellDef="let enrollment"> {{enrollment.studentId}} </td>
            </ng-container>

            <!-- Course Column -->
            <ng-container matColumnDef="courseId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Course ID </th>
              <td mat-cell *matCellDef="let enrollment"> {{enrollment.courseId}} </td>
            </ng-container>

            <!-- Date Column -->
            <ng-container matColumnDef="enrollmentDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
              <td mat-cell *matCellDef="let enrollment"> {{enrollment.enrollmentDate | date:'dd/MM/yyyy'}} </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let enrollment">
                <mat-chip-option [color]="getStatusColor(enrollment.status)" [selected]="true" [selectable]="false">
                  {{enrollment.status | titlecase}}
                </mat-chip-option>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let enrollment">
                <button mat-icon-button color="warn" (click)="deleteEnrollment(enrollment)" matTooltip="Cancel Enrollment">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="6">No enrollments found.</td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25, 100]"></mat-paginator>
      </mat-card>
    </div>
  `,
  styles: [`
    .enrollments-list-container {
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
    .table-card { overflow: hidden; margin-bottom: 32px; }
    .table-container { overflow-x: auto; }
    .full-width-table { width: 100%; }
  `]
})
export class EnrollmentsListComponent implements OnInit {
  displayedColumns: string[] = ['enrollmentNumber', 'studentId', 'courseId', 'enrollmentDate', 'status', 'actions'];
  dataSource: MatTableDataSource<Enrollment>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private enrollmentService: EnrollmentService,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Enrollment>([]);
  }

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments() {
    this.enrollmentService.getEnrollments(1, 100).subscribe({
      next: (response) => {
        // Handle paginated response if that's what backend returns, 
        // but currently our simple backend returns an array.
        // Let's assume the service handles any wrapping if necessary.
        // If the service expects PaginatedResponse but backend returns array, 
        // we might need to adjust.
        if (Array.isArray(response)) {
          this.dataSource.data = response;
        } else if (response.data) {
          this.dataSource.data = response.data;
        }
      },
      error: (err) => console.error('Error loading enrollments', err)
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'primary';
      case 'cancelled': return 'warn';
      case 'completed': return 'accent';
      default: return '';
    }
  }

  deleteEnrollment(enrollment: Enrollment) {
    if (confirm(`Are you sure you want to cancel this enrollment?`)) {
      this.enrollmentService.deleteEnrollment(enrollment.id).subscribe({
        next: () => {
          this.snackBar.open('Enrollment cancelled successfully', 'Close', { duration: 3000 });
          this.loadEnrollments();
        },
        error: (err) => {
          this.snackBar.open('Error cancelling enrollment', 'Close', { duration: 3000 });
        }
      });
    }
  }
}