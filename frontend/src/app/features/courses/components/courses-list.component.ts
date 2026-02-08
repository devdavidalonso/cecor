import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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

import { CourseService, Course } from '../../../core/services/course.service';

@Component({
  selector: 'app-courses-list',
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
    MatCardModule
  ],
  template: `
    <div class="courses-list-container">
      <div class="header-actions">
        <div>
          <h2>Courses Management</h2>
          <p class="subtitle">Manage all your educational courses in one place</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/courses/new">
          <mat-icon>add</mat-icon>
          Create New Course
        </button>
      </div>

      <mat-card class="table-card">
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="full-width-table">

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Course Name </th>
              <td mat-cell *matCellDef="let course"> 
                <div class="course-name-cell">
                   <span class="course-title">{{course.name}}</span>
                </div>
              </td>
            </ng-container>

            <!-- Duration Column -->
            <ng-container matColumnDef="duration">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Duration </th>
              <td mat-cell *matCellDef="let course"> {{course.duration}} weeks </td>
            </ng-container>

            <!-- Workload Column -->
            <ng-container matColumnDef="workload">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Workload </th>
              <td mat-cell *matCellDef="let course"> {{course.workload}}h </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let course">
                <mat-chip-option [color]="getStatusColor(course.status)" [selected]="true" [selectable]="false">
                  {{course.status | titlecase}}
                </mat-chip-option>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let course">
                <button mat-icon-button color="primary" [routerLink]="['/courses', course.id]" matTooltip="View Details">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="accent" [routerLink]="['/courses', course.id, 'edit']" matTooltip="Edit Course">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteCourse(course)" matTooltip="Delete Course">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <!-- Row shown when there is no matching data. -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell" colspan="5">No courses found created yet.</td>
            </tr>
          </table>
        </div>

        <mat-paginator [pageSize]="10" [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Select page of courses"></mat-paginator>
      </mat-card>

      <!-- Dashboard Statistics -->
      <div class="stats-grid">
        <mat-card class="stat-card total-card">
          <div class="stat-content">
            <div class="stat-value">{{stats.total}}</div>
            <div class="stat-label">Total Courses</div>
            <mat-icon class="stat-icon">school</mat-icon>
          </div>
        </mat-card>

        <mat-card class="stat-card active-card">
          <div class="stat-content">
            <div class="stat-value">{{stats.active}}</div>
            <div class="stat-label">Active</div>
            <mat-icon class="stat-icon">check_circle</mat-icon>
          </div>
        </mat-card>

         <mat-card class="stat-card draft-card">
          <div class="stat-content">
            <div class="stat-value">{{stats.draft}}</div>
            <div class="stat-label">Drafts</div>
            <mat-icon class="stat-icon">edit_note</mat-icon>
          </div>
        </mat-card>

        <mat-card class="stat-card inactive-card">
          <div class="stat-content">
            <div class="stat-value">{{stats.inactive}}</div>
            <div class="stat-label">Inactive</div>
            <mat-icon class="stat-icon">disabled_by_default</mat-icon>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .courses-list-container {
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

    h2 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }

    .subtitle {
      margin: 4px 0 0;
      color: #666;
    }

    .table-card {
      overflow: hidden;
      margin-bottom: 32px;
    }

    .table-container {
      overflow-x: auto;
    }

    .full-width-table {
      width: 100%;
    }

    .course-title {
      font-weight: 500;
    }

    /* Stats Dashboard */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .stat-card {
      padding: 20px;
      border-radius: 12px;
    }

    .stat-content {
      position: relative;
    }

    .stat-value {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-icon {
      position: absolute;
      top: 0;
      right: 0;
      font-size: 48px;
      height: 48px;
      width: 48px;
      opacity: 0.1;
    }

    /* Card Themes */
    .total-card { border-left: 4px solid #3f51b5; }
    .total-card .stat-value { color: #3f51b5; }

    .active-card { border-left: 4px solid #4caf50; }
    .active-card .stat-value { color: #4caf50; }

    .draft-card { border-left: 4px solid #ff9800; }
    .draft-card .stat-value { color: #ff9800; }

    .inactive-card { border-left: 4px solid #f44336; }
    .inactive-card .stat-value { color: #f44336; }
  `]
})
export class CoursesListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'duration', 'workload', 'status', 'actions'];
  dataSource: MatTableDataSource<Course>;

  stats = {
    total: 0,
    active: 0,
    draft: 0,
    inactive: 0
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private courseService: CourseService) {
    this.dataSource = new MatTableDataSource<Course>([]);
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.dataSource.data = courses;
        this.calculateStats(courses);
      },
      error: (err) => {
        console.error('Error loading courses', err);
      }
    });
  }

  calculateStats(courses: Course[]) {
    this.stats = {
      total: courses.length,
      active: courses.filter(c => c.status?.toLowerCase() === 'active').length,
      draft: courses.filter(c => c.status?.toLowerCase() === 'draft').length,
      inactive: courses.filter(c => c.status?.toLowerCase() === 'inactive').length
    };
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'primary';
      case 'inactive': return 'warn';
      case 'draft': return 'accent';
      default: return '';
    }
  }

  deleteCourse(course: Course) {
    if (confirm(`Are you sure you want to delete "${course.name}"?`)) {
      if (course.id) {
        this.courseService.deleteCourse(course.id).subscribe({
          next: () => {
            this.loadCourses(); // Refresh list
          },
          error: (err) => console.error('Error deleting course', err)
        });
      }
    }
  }
}