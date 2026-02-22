import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CourseService, Course } from '../../../core/services/course.service';
import { StudentService } from '../../../core/services/student.service';
import { ReportService, CourseAttendanceStats, StudentAttendanceStats } from '../../../core/services/report.service';
import { Student } from '../../../core/models/student.model';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  template: `
    <div class="reports-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Attendance Reports</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <mat-tab-group>
            <!-- Course Report Tab -->
            <mat-tab label="Course Report">
              <div class="tab-content">
                <form [formGroup]="courseReportForm" (ngSubmit)="generateCourseReport()">
                  <div class="filters-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Course</mat-label>
                      <mat-select formControlName="courseId">
                        <mat-option *ngFor="let course of courses" [value]="course.id">
                          {{ course.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Start Date</mat-label>
                      <mat-datepicker-toggle matPrefix [for]="pickerStartCourse" matTooltip="Abrir calendário"></mat-datepicker-toggle>
                      <input matInput 
                             [matDatepicker]="pickerStartCourse" 
                             formControlName="startDate"
                             placeholder="DD/MM/AAAA"
                             maxlength="10"
                             autocomplete="off">
                      <mat-datepicker #pickerStartCourse></mat-datepicker>
                      <mat-hint>Digite ou selecione</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>End Date</mat-label>
                      <mat-datepicker-toggle matPrefix [for]="pickerEndCourse" matTooltip="Abrir calendário"></mat-datepicker-toggle>
                      <input matInput 
                             [matDatepicker]="pickerEndCourse" 
                             formControlName="endDate"
                             placeholder="DD/MM/AAAA"
                             maxlength="10"
                             autocomplete="off">
                      <mat-datepicker #pickerEndCourse></mat-datepicker>
                      <mat-hint>Digite ou selecione</mat-hint>
                    </mat-form-field>

                    <button mat-raised-button color="primary" type="submit" [disabled]="courseReportForm.invalid || isLoading">
                      Generate
                    </button>
                    <button mat-stroked-button color="accent" type="button" (click)="exportCoursePDF()" [disabled]="!courseStats.length">
                      <mat-icon>picture_as_pdf</mat-icon> Export PDF
                    </button>
                  </div>
                </form>

                <div *ngIf="isLoading" class="loading-spinner">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>

                <div *ngIf="courseStats.length > 0" class="results-table">
                  <table mat-table [dataSource]="courseStats" class="mat-elevation-z2">
                    <ng-container matColumnDef="studentName">
                      <th mat-header-cell *matHeaderCellDef> Student </th>
                      <td mat-cell *matCellDef="let element"> {{element.StudentName}} </td>
                    </ng-container>

                    <ng-container matColumnDef="totalClasses">
                      <th mat-header-cell *matHeaderCellDef> Total Classes </th>
                      <td mat-cell *matCellDef="let element"> {{element.TotalClasses}} </td>
                    </ng-container>

                    <ng-container matColumnDef="presentCount">
                      <th mat-header-cell *matHeaderCellDef> Present </th>
                      <td mat-cell *matCellDef="let element"> {{element.PresentCount}} </td>
                    </ng-container>

                    <ng-container matColumnDef="absentCount">
                      <th mat-header-cell *matHeaderCellDef> Absent </th>
                      <td mat-cell *matCellDef="let element"> {{element.AbsentCount}} </td>
                    </ng-container>

                    <ng-container matColumnDef="attendanceRate">
                      <th mat-header-cell *matHeaderCellDef> Rate </th>
                      <td mat-cell *matCellDef="let element"> {{element.AttendanceRate | number:'1.0-2'}}% </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumnsCourse"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumnsCourse;"></tr>
                  </table>
                </div>
                <div *ngIf="!isLoading && hasSearchedCourse && courseStats.length === 0" class="no-data">
                  No data found for the selected criteria.
                </div>
              </div>
            </mat-tab>

            <!-- Student Report Tab -->
            <mat-tab label="Student Report">
              <div class="tab-content">
                <form [formGroup]="studentReportForm" (ngSubmit)="generateStudentReport()">
                  <div class="filters-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Student</mat-label>
                      <mat-select formControlName="studentId">
                        <mat-option *ngFor="let student of students" [value]="student.id">
                          {{ student.user.name }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Start Date</mat-label>
                      <mat-datepicker-toggle matPrefix [for]="pickerStartStudent" matTooltip="Abrir calendário"></mat-datepicker-toggle>
                      <input matInput 
                             [matDatepicker]="pickerStartStudent" 
                             formControlName="startDate"
                             placeholder="DD/MM/AAAA"
                             maxlength="10"
                             autocomplete="off">
                      <mat-datepicker #pickerStartStudent></mat-datepicker>
                      <mat-hint>Digite ou selecione</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>End Date</mat-label>
                      <mat-datepicker-toggle matPrefix [for]="pickerEndStudent" matTooltip="Abrir calendário"></mat-datepicker-toggle>
                      <input matInput 
                             [matDatepicker]="pickerEndStudent" 
                             formControlName="endDate"
                             placeholder="DD/MM/AAAA"
                             maxlength="10"
                             autocomplete="off">
                      <mat-datepicker #pickerEndStudent></mat-datepicker>
                      <mat-hint>Digite ou selecione</mat-hint>
                    </mat-form-field>

                    <button mat-raised-button color="primary" type="submit" [disabled]="studentReportForm.invalid || isLoading">
                      Generate
                    </button>
                     <button mat-stroked-button color="accent" type="button" (click)="exportStudentPDF()" [disabled]="!studentStats.length">
                      <mat-icon>picture_as_pdf</mat-icon> Export PDF
                    </button>
                  </div>
                </form>

                <div *ngIf="isLoading" class="loading-spinner">
                  <mat-spinner diameter="40"></mat-spinner>
                </div>

                <div *ngIf="studentStats.length > 0" class="results-table">
                  <table mat-table [dataSource]="studentStats" class="mat-elevation-z2">
                    <ng-container matColumnDef="courseName">
                      <th mat-header-cell *matHeaderCellDef> Course </th>
                      <td mat-cell *matCellDef="let element"> {{element.CourseName}} </td>
                    </ng-container>

                    <ng-container matColumnDef="totalClasses">
                      <th mat-header-cell *matHeaderCellDef> Total Classes </th>
                      <td mat-cell *matCellDef="let element"> {{element.TotalClasses}} </td>
                    </ng-container>

                    <ng-container matColumnDef="presentCount">
                      <th mat-header-cell *matHeaderCellDef> Present </th>
                      <td mat-cell *matCellDef="let element"> {{element.PresentCount}} </td>
                    </ng-container>

                    <ng-container matColumnDef="absentCount">
                      <th mat-header-cell *matHeaderCellDef> Absent </th>
                      <td mat-cell *matCellDef="let element"> {{element.AbsentCount}} </td>
                    </ng-container>

                    <ng-container matColumnDef="attendanceRate">
                      <th mat-header-cell *matHeaderCellDef> Rate </th>
                      <td mat-cell *matCellDef="let element"> {{element.AttendanceRate | number:'1.0-2'}}% </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumnsStudent"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumnsStudent;"></tr>
                  </table>
                </div>
                 <div *ngIf="!isLoading && hasSearchedStudent && studentStats.length === 0" class="no-data">
                  No data found for the selected criteria.
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 20px;
    }
    .tab-content {
      padding: 20px 0;
    }
    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      margin-bottom: 20px;
    }
    .results-table {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }
    .no-data {
      text-align: center;
      padding: 20px;
      color: #666;
      font-style: italic;
    }
  `]
})
export class ReportsListComponent implements OnInit {
  courseReportForm: FormGroup;
  studentReportForm: FormGroup;
  courses: Course[] = [];
  students: Student[] = [];
  courseStats: CourseAttendanceStats[] = [];
  studentStats: StudentAttendanceStats[] = [];
  isLoading = false;
  hasSearchedCourse = false;
  hasSearchedStudent = false;

  displayedColumnsCourse = ['studentName', 'totalClasses', 'presentCount', 'absentCount', 'attendanceRate'];
  displayedColumnsStudent = ['courseName', 'totalClasses', 'presentCount', 'absentCount', 'attendanceRate'];

  constructor(
    private formBuilder: FormBuilder,
    private courseService: CourseService,
    private studentService: StudentService,
    private reportService: ReportService,
    private snackBar: MatSnackBar
  ) {
    this.courseReportForm = this.formBuilder.group({
      courseId: [null, Validators.required],
      startDate: [null],
      endDate: [null]
    });

    this.studentReportForm = this.formBuilder.group({
      studentId: [null, Validators.required],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadStudents();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => this.courses = Array.isArray(data) ? data : (data as any).data || [],
      error: (err) => console.error('Error loading courses', err)
    });
  }

  loadStudents() {
    this.studentService.getStudents().subscribe({
      next: (data) => this.students = (data as any).data || [],
      error: (err) => console.error('Error loading students', err)
    });
  }

  generateCourseReport() {
    if (this.courseReportForm.valid) {
      this.isLoading = true;
      this.hasSearchedCourse = true;
      const { courseId, startDate, endDate } = this.courseReportForm.value;
      const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';

      this.reportService.getCourseAttendanceReport(courseId, formattedStartDate, formattedEndDate).subscribe({
        next: (stats) => {
          this.courseStats = stats || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Error generating report', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  generateStudentReport() {
     if (this.studentReportForm.valid) {
      this.isLoading = true;
      this.hasSearchedStudent = true;
      const { studentId, startDate, endDate } = this.studentReportForm.value;
      const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : '';
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : '';

      this.reportService.getStudentAttendanceReport(studentId, formattedStartDate, formattedEndDate).subscribe({
        next: (stats) => {
          this.studentStats = stats || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Error generating report', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  exportCoursePDF() {
    const doc = new jsPDF();
    const courseId = this.courseReportForm.get('courseId')?.value;
    const courseName = this.courses.find(c => c.id === courseId)?.name || 'Course';
    
    doc.text(`Attendance Report: ${courseName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
      head: [['Student', 'Total Classes', 'Present', 'Absent', 'Attendance Rate']],
      body: this.courseStats.map(stat => [
        stat.StudentName,
        stat.TotalClasses,
        stat.PresentCount,
        stat.AbsentCount,
        `${stat.AttendanceRate.toFixed(2)}%`
      ]),
      startY: 30
    });

    doc.save(`attendance_report_course_${courseId}.pdf`);
  }

  exportStudentPDF() {
    const doc = new jsPDF();
    const studentId = this.studentReportForm.get('studentId')?.value;
    const studentName = this.students.find(s => s.id === studentId)?.user?.name || 'Student';

    doc.text(`Attendance Report: ${studentName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
      head: [['Course', 'Total Classes', 'Present', 'Absent', 'Attendance Rate']],
      body: this.studentStats.map(stat => [
        stat.CourseName,
        stat.TotalClasses,
        stat.PresentCount,
        stat.AbsentCount,
        `${stat.AttendanceRate.toFixed(2)}%`
      ]),
      startY: 30
    });

    doc.save(`attendance_report_student_${studentId}.pdf`);
  }
}
