// src/app/features/reports/components/attendance-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule
  ],
  template: `
    <div class="container">
      <h1>Attendance Report</h1>
      
      <mat-card class="filter-card">
        <mat-card-header>
          <mat-card-title>Report Filters</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="filter-form">
            <mat-form-field appearance="outline">
              <mat-label>Course</mat-label>
              <mat-select formControlName="courseId">
                <mat-option [value]="1">Course 1</mat-option>
                <mat-option [value]="2">Course 2</mat-option>
                <mat-option [value]="3">Course 3</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" [disabled]="filterForm.invalid">
            <mat-icon>search</mat-icon> Generate Report
          </button>
          <button mat-button color="accent">
            <mat-icon>file_download</mat-icon> Export
          </button>
        </mat-card-actions>
      </mat-card>
      
      <div class="report-content">
        <p>Report data will be displayed here</p>
        <p>In development</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    
    .filter-card {
      margin-bottom: 24px;
    }
    
    .filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    mat-form-field {
      flex: 1;
      min-width: 200px;
    }
    
    mat-card-actions {
      display: flex;
      gap: 8px;
      padding: 8px 16px 16px !important;
    }
    
    .report-content {
      margin-top: 24px;
    }
  `]
})
export class AttendanceReportComponent implements OnInit {
  filterForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    this.filterForm = this.fb.group({
      courseId: ['', []],
      startDate: [firstDayOfMonth, []],
      endDate: [currentDate, []]
    });
  }
  
  ngOnInit(): void {
    // Inicialização do componente
  }
}