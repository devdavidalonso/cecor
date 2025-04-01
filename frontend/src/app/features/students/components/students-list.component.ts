import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StudentService, StudentFilters } from '@core/services/student.service';
import { Student } from '@core/models/student.model';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h1>Students</h1>
      
      <mat-card>
        <mat-card-header>
          <mat-card-title>Search</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
            <div class="filter-row">
              <mat-form-field>
                <mat-label>Name</mat-label>
                <input matInput formControlName="name">
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>Email</mat-label>
                <input matInput formControlName="email">
              </mat-form-field>
              
              <mat-form-field>
                <mat-label>CPF</mat-label>
                <input matInput formControlName="cpf">
              </mat-form-field>
              
              <button mat-raised-button color="primary" type="submit">Search</button>
              <button mat-button type="button" (click)="resetFilters()">Clear</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
      
      <div class="table-container">
        <table mat-table [dataSource]="students" matSort (matSortChange)="sortData($event)">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let student">{{ student.name }}</td>
          </ng-container>
          
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
            <td mat-cell *matCellDef="let student">{{ student.email }}</td>
          </ng-container>
          
          <ng-container matColumnDef="mainPhone">
            <th mat-header-cell *matHeaderCellDef>Phone</th>
            <td mat-cell *matCellDef="let student">{{ student.mainPhone }}</td>
          </ng-container>
          
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
            <td mat-cell *matCellDef="let student">{{ student.status }}</td>
          </ng-container>
          
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let student">
              <button mat-icon-button [routerLink]="['/students', student.id]">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button [routerLink]="['/students/edit', student.id]">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteStudent(student.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
        
        <mat-paginator 
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 20, 50]"
          (page)="onPageChange($event)">
        </mat-paginator>
      </div>
      
      <div class="actions-row">
        <button mat-raised-button color="primary" routerLink="/students/new">
          <mat-icon>add</mat-icon>
          New Student
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    
    .filter-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    }
    
    .table-container {
      margin-top: 20px;
      overflow-x: auto;
    }
    
    table {
      width: 100%;
    }
    
    .actions-row {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  `]
})
export class StudentsListComponent implements OnInit {
  students: Student[] = [];
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 20;
  displayedColumns: string[] = ['name', 'email', 'mainPhone', 'status', 'actions'];
  filterForm: FormGroup;
  
  constructor(
    private studentService: StudentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      name: [''],
      email: [''],
      cpf: [''],
      status: [''],
      courseId: ['']
    });
  }
  
  ngOnInit(): void {
    this.loadStudents();
  }
  
  loadStudents(): void {
    const filters = this.getFilters();
    
    this.studentService.getStudents(this.currentPage, this.pageSize, filters)
      .subscribe({
        next: (response) => {
          this.students = response.data;
          this.totalItems = response.totalItems;
        },
        error: (error) => {
          this.snackBar.open('Error loading students', 'Close', { duration: 3000 });
          console.error('Error loading students:', error);
        }
      });
  }
  
  applyFilters(): void {
    this.currentPage = 1; // Reset to first page
    this.loadStudents();
  }
  
  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadStudents();
  }
  
  getFilters(): StudentFilters {
    const formValues = this.filterForm.value;
    
    const filters: StudentFilters = {};
    if (formValues.name) filters.name = formValues.name;
    if (formValues.email) filters.email = formValues.email;
    if (formValues.cpf) filters.cpf = formValues.cpf;
    if (formValues.status) filters.status = formValues.status;
    if (formValues.courseId) filters.courseId = parseInt(formValues.courseId);
    
    return filters;
  }
  
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadStudents();
  }
  
  sortData(sort: Sort): void {
    // Implement sorting logic or API call with sort parameters
  }
  
  deleteStudent(id: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id)
        .subscribe({
          next: () => {
            this.snackBar.open('Student deleted successfully', 'Close', { duration: 3000 });
            this.loadStudents();
          },
          error: (error) => {
            this.snackBar.open('Error deleting student', 'Close', { duration: 3000 });
            console.error('Error deleting student:', error);
          }
        });
    }
  }
}