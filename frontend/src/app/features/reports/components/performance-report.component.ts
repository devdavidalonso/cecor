// src/app/features/reports/components/performance-report.component.ts
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
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-performance-report',
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
    MatTabsModule  // Este é o principal módulo necessário
  ],
  template: `
    <div class="container">
      <h1>Performance Report</h1>
      
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
              <mat-label>Period</mat-label>
              <mat-select formControlName="period">
                <mat-option value="current">Current Month</mat-option>
                <mat-option value="last3">Last 3 Months</mat-option>
                <mat-option value="last6">Last 6 Months</mat-option>
                <mat-option value="year">This Year</mat-option>
                <mat-option value="custom">Custom Range</mat-option>
              </mat-select>
            </mat-form-field>
            
            <div class="date-range" *ngIf="filterForm.get('period')?.value === 'custom'">
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
            </div>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary" [disabled]="filterForm.invalid">
            <mat-icon>assessment</mat-icon> Generate Report
          </button>
          <button mat-button color="accent">
            <mat-icon>file_download</mat-icon> Export
          </button>
        </mat-card-actions>
      </mat-card>
      
      <div class="report-content">
        <!-- Utilizando div para teste até resolvermos o problema com mat-tabs -->
        <div>
          <h2>Overview</h2>
          <div class="tab-content">
            <p>Performance overview will be displayed here</p>
          </div>
          
          <h2>Attendance Trends</h2>
          <div class="tab-content">
            <p>Attendance trends will be displayed here</p>
          </div>
          
          <h2>Comparative Analysis</h2>
          <div class="tab-content">
            <p>Comparative analysis will be displayed here</p>
          </div>
        </div>
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
    
    .date-range {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      width: 100%;
    }
    
    mat-card-actions {
      display: flex;
      gap: 8px;
      padding: 8px 16px 16px !important;
    }
    
    .report-content {
      margin-top: 24px;
    }
    
    .tab-content {
      padding: 20px;
      margin-bottom: 20px;
    }
    
    h2 {
      margin-top: 24px;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 8px;
    }
  `]
})
export class PerformanceReportComponent implements OnInit {
  filterForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    this.filterForm = this.fb.group({
      courseId: ['', []],
      period: ['current', []],
      startDate: [firstDayOfMonth, []],
      endDate: [currentDate, []]
    });
  }
  
  ngOnInit(): void {
    // Lógica de inicialização
  }
}