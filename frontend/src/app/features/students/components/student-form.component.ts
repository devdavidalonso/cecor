// src/app/features/students/components/student-form.component.ts

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';

import { StudentService } from '@core/services/student.service';
import { Student } from '@core/models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDividerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h1>{{ isEditMode ? 'Edit Student' : 'New Student' }}</h1>
      
      <form [formGroup]="studentForm" (ngSubmit)="onSubmit()">
        <mat-stepper linear #stepper>
          <!-- Personal Information Step -->
          <mat-step [stepControl]="personalInfoForm" label="Personal Information">
            <ng-template matStepLabel>Personal Information</ng-template>
            <div formGroupName="personalInfo" class="step-content">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" required>
                <mat-error *ngIf="personalInfoForm.get('name')?.hasError('required')">
                  Name is required
                </mat-error>
              </mat-form-field>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Birth Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="birthDate" required>
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  <mat-error *ngIf="personalInfoForm.get('birthDate')?.hasError('required')">
                    Birth date is required
                  </mat-error>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>CPF</mat-label>
                  <input matInput formControlName="cpf">
                </mat-form-field>
              </div>
              
              <div class="form-actions">
                <button mat-button matStepperNext type="button">Next</button>
              </div>
            </div>
          </mat-step>
          
          <!-- Contact Information Step -->
          <mat-step [stepControl]="contactInfoForm" label="Contact Information">
            <ng-template matStepLabel>Contact Information</ng-template>
            <div formGroupName="contactInfo" class="step-content">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" required>
                <mat-error *ngIf="contactInfoForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="contactInfoForm.get('email')?.hasError('email')">
                  Please enter a valid email
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Main Phone</mat-label>
                <input matInput formControlName="mainPhone" required>
                <mat-error *ngIf="contactInfoForm.get('mainPhone')?.hasError('required')">
                  Main phone is required
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Address</mat-label>
                <textarea matInput formControlName="address" rows="3" required></textarea>
                <mat-error *ngIf="contactInfoForm.get('address')?.hasError('required')">
                  Address is required
                </mat-error>
              </mat-form-field>
              
              <div class="form-actions">
                <button mat-button matStepperPrevious type="button">Back</button>
                <button mat-button matStepperNext type="button">Next</button>
              </div>
            </div>
          </mat-step>
          
          <!-- Additional Information Step -->
          <mat-step [stepControl]="additionalInfoForm" label="Additional Information">
            <ng-template matStepLabel>Additional Information</ng-template>
            <div formGroupName="additionalInfo" class="step-content">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Medical Information</mat-label>
                <textarea matInput formControlName="medicalInfo" rows="3"></textarea>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Accessibility Needs</mat-label>
                <textarea matInput formControlName="accessibilityNeeds" rows="3"></textarea>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Observation</mat-label>
                <textarea matInput formControlName="observation" rows="3"></textarea>
              </mat-form-field>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status" required>
                    <mat-option value="active">Active</mat-option>
                    <mat-option value="inactive">Inactive</mat-option>
                    <mat-option value="suspended">Suspended</mat-option>
                  </mat-select>
                  <mat-error *ngIf="additionalInfoForm.get('status')?.hasError('required')">
                    Status is required
                  </mat-error>
                </mat-form-field>
              </div>
              
              <div class="form-actions">
                <button mat-button matStepperPrevious type="button">Back</button>
                <button mat-button matStepperNext type="button">Next</button>
              </div>
            </div>
          </mat-step>
          
          <!-- Review & Submit Step -->
          <mat-step>
            <ng-template matStepLabel>Review & Submit</ng-template>
            <div class="step-content">
              <h2>Review Student Information</h2>
              
              <mat-card>
                <mat-card-content>
                  <h3>Personal Information</h3>
                  <p><strong>Name:</strong> {{ personalInfoForm.get('name')?.value }}</p>
                  <p><strong>Birth Date:</strong> {{ personalInfoForm.get('birthDate')?.value | date }}</p>
                  <p><strong>CPF:</strong> {{ personalInfoForm.get('cpf')?.value }}</p>
                  
                  <mat-divider class="my-3"></mat-divider>
                  
                  <h3>Contact Information</h3>
                  <p><strong>Email:</strong> {{ contactInfoForm.get('email')?.value }}</p>
                  <p><strong>Main Phone:</strong> {{ contactInfoForm.get('mainPhone')?.value }}</p>
                  <p><strong>Address:</strong> {{ contactInfoForm.get('address')?.value }}</p>
                  
                  <mat-divider class="my-3"></mat-divider>
                  
                  <h3>Additional Information</h3>
                  <p><strong>Status:</strong> {{ additionalInfoForm.get('status')?.value }}</p>
                  <p *ngIf="additionalInfoForm.get('medicalInfo')?.value">
                    <strong>Medical Information:</strong> {{ additionalInfoForm.get('medicalInfo')?.value }}
                  </p>
                  <p *ngIf="additionalInfoForm.get('accessibilityNeeds')?.value">
                    <strong>Accessibility Needs:</strong> {{ additionalInfoForm.get('accessibilityNeeds')?.value }}
                  </p>
                  <p *ngIf="additionalInfoForm.get('observation')?.value">
                    <strong>Observation:</strong> {{ additionalInfoForm.get('observation')?.value }}
                  </p>
                </mat-card-content>
              </mat-card>
              
              <div class="form-actions final-actions">
                <button mat-button matStepperPrevious type="button">Back</button>
                <button mat-raised-button color="primary" type="submit" [disabled]="studentForm.invalid || loading">
                  {{ isEditMode ? 'Update' : 'Create' }}
                </button>
                <button mat-button type="button" (click)="cancel()">Cancel</button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </form>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .step-content {
      margin-top: 20px;
      margin-bottom: 20px;
    }
    
    .full-width {
      width: 100%;
    }
    
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .form-row > * {
      flex: 1;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    .final-actions {
      margin-top: 24px;
    }
    
    .my-3 {
      margin-top: 16px;
      margin-bottom: 16px;
    }
  `]
})
export class StudentFormComponent implements OnInit {
  studentForm!: FormGroup;
  loading = false;
  isEditMode = false;
  studentId: number | null = null;
  
  get personalInfoForm(): FormGroup {
    return this.studentForm.get('personalInfo') as FormGroup;
  }
  
  get contactInfoForm(): FormGroup {
    return this.studentForm.get('contactInfo') as FormGroup;
  }
  
  get additionalInfoForm(): FormGroup {
    return this.studentForm.get('additionalInfo') as FormGroup;
  }
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    
    // Check if we're in edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.studentId = +idParam;
      this.loadStudentData(this.studentId);
    }
  }
  
  initForm(): void {
    this.studentForm = this.fb.group({
      personalInfo: this.fb.group({
        name: ['', Validators.required],
        birthDate: ['', Validators.required],
        cpf: ['']
      }),
      contactInfo: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        mainPhone: ['', Validators.required],
        address: ['', Validators.required]
      }),
      additionalInfo: this.fb.group({
        medicalInfo: [''],
        accessibilityNeeds: [''],
        observation: [''],
        status: ['active', Validators.required]
      })
    });
  }
  
  loadStudentData(id: number): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.studentService.getStudent(id).subscribe({
      next: (student) => {
        // Update form with student data
        this.personalInfoForm.patchValue({
          name: student.name,
          birthDate: student.birthDate ? new Date(student.birthDate) : null,
          cpf: student.cpf
        });
        
        this.contactInfoForm.patchValue({
          email: student.email,
          mainPhone: student.mainPhone,
          address: student.address
        });
        
        this.additionalInfoForm.patchValue({
          medicalInfo: student.medicalInfo || '',
          accessibilityNeeds: student.accessibilityNeeds || '',
          observation: student.observation || '',
          status: student.status
        });
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Error loading student data', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading student data:', error);
      }
    });
  }
  
  onSubmit(): void {
    if (this.studentForm.invalid || this.loading) {
      return;
    }
    
    this.loading = true;
    this.cdr.detectChanges();
    
    // Combine all form groups into a single student object
    const studentData: Partial<Student> = {
      ...this.personalInfoForm.value,
      ...this.contactInfoForm.value,
      ...this.additionalInfoForm.value
    };
    
    const request$ = this.isEditMode && this.studentId
      ? this.studentService.updateStudent(this.studentId, studentData)
      : this.studentService.createStudent(studentData);
      
    request$.subscribe({
      next: (student) => {
        this.snackBar.open(
          this.isEditMode ? 'Student updated successfully' : 'Student created successfully',
          'Close',
          { duration: 3000 }
        );
        this.loading = false;
        this.router.navigate(['/students']);
      },
      error: (error) => {
        this.snackBar.open(
          `Error ${this.isEditMode ? 'updating' : 'creating'} student`,
          'Close',
          { duration: 3000 }
        );
        this.loading = false;
        this.cdr.detectChanges();
        console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} student:`, error);
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/students']);
  }
}