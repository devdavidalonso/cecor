import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { EnrollmentService } from '../../../core/services/enrollment.service';
import { CourseService } from '../../../core/services/course.service';
import { StudentService } from '../../../core/services/student.service';

@Component({
  selector: 'app-enrollment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="enrollment-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>New Enrollment</mat-card-title>
          <mat-card-subtitle>Register a student into a course</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="enrollmentForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Student</mat-label>
                <mat-select formControlName="studentId">
                  <mat-option *ngFor="let student of students" [value]="student.id">
                    {{student.user?.name}} ({{student.user?.cpf}})
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="enrollmentForm.get('studentId')?.hasError('required')">Student is required</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Course</mat-label>
                <mat-select formControlName="courseId">
                  <mat-option *ngFor="let course of courses" [value]="course.id">
                    {{course.name}}
                  </mat-option>
                </mat-select>
                <mat-error *ngIf="enrollmentForm.get('courseId')?.hasError('required')">Course is required</mat-error>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/enrollments">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="enrollmentForm.invalid || isSubmitting">
                {{ isSubmitting ? 'Registering...' : 'Register Student' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .enrollment-form-container {
      padding: 40px;
      display: flex;
      justify-content: center;
      background-color: #f5f5f5;
      min-height: calc(100vh - 64px);
    }
    .form-card {
      width: 100%;
      max-width: 600px;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 24px;
    }
    .full-width { width: 100%; }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
    }
  `]
})
export class EnrollmentFormComponent implements OnInit {
  enrollmentForm: FormGroup;
  students: any[] = [];
  courses: any[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private enrollmentService: EnrollmentService,
    private studentService: StudentService,
    private courseService: CourseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.enrollmentForm = this.fb.group({
      studentId: ['', Validators.required],
      courseId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadStudents();
    this.loadCourses();
  }

  loadStudents() {
    // Assuming studentService.getStudents() returns an array or paginated response.
    // Given previous work, it might be paginated.
    this.studentService.getStudents(1, 1000).subscribe({
      next: (res: any) => {
        const studentList = Array.isArray(res) ? res : (res.items || res.data || []);
        this.students = studentList;
      },
      error: (err) => console.error('Error loading students', err)
    });
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (res: any) => {
        this.courses = Array.isArray(res) ? res : (res.items || []);
      },
      error: (err) => console.error('Error loading courses', err)
    });
  }

  onSubmit() {
    if (this.enrollmentForm.valid) {
      this.isSubmitting = true;
      this.enrollmentService.createEnrollment(this.enrollmentForm.value).subscribe({
        next: (response: any) => {
          const studentName = this.students.find(s => s.id === this.enrollmentForm.value.studentId)?.user?.name || 'Student';
          
          // Verificar se precisa redirecionar para entrevista
          if (response.interviewRequired) {
            this.snackBar.open(
              `Matrícula criada! Redirecionando para entrevista socioeducacional...`, 
              'Fechar', 
              { duration: 3000 }
            );
            
            // Redirecionar para o wizard de entrevista
            setTimeout(() => {
              this.router.navigate(['/interviews/respond', response.studentId], {
                queryParams: { 
                  enrollmentId: response.id,
                  formTitle: response.interviewFormTitle,
                  returnUrl: '/enrollments'
                }
              });
            }, 1500);
          } else {
            this.snackBar.open('Student enrolled successfully!', 'Close', { duration: 3000 });
            this.router.navigate(['/enrollments']);
          }
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error?.message || err.error || 'Error enrolling student';
          this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    }
  }
}