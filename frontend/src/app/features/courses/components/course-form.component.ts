import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CourseService, Course } from '../../../core/services/course.service';

// Force Rebuild

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatStepperModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatSnackBarModule,
    RouterModule
  ],
  template: `
    <div class="course-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>{{ isEditMode ? 'Edit Course' : 'Create New Course' }}</mat-card-title>
          <mat-card-subtitle>{{ isEditMode ? 'Update the details of the course' : 'Fill in the details to publish a new course' }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-stepper [linear]="true" #stepper>
            <!-- Step 1: Basic Info -->
            <mat-step [stepControl]="basicInfoForm">
              <form [formGroup]="basicInfoForm">
                <ng-template matStepLabel>Basic Info</ng-template>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'COURSE.NAME' | translate }}</mat-label>
                    <input matInput formControlName="name" placeholder="Ex: Introduction to Programming">
                    <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">{{ 'VALIDATION.REQUIRED' | translate }}</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'COURSE.SHORT_DESCRIPTION' | translate }}</mat-label>
                    <input matInput formControlName="shortDescription" placeholder="Brief summary">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'TEACHER.TITLE_SINGLE' | translate }}</mat-label>
                    <mat-select formControlName="professorId">
                      <mat-option *ngFor="let prof of professors" [value]="prof.id">
                        {{ prof.firstName }} {{ prof.lastName }}
                      </mat-option>
                    </mat-select>
                    <mat-icon matSuffix>person</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>URL da Imagem de Capa</mat-label>
                    <input matInput formControlName="coverImage" placeholder="https://example.com/image.jpg">
                    <mat-icon matSuffix>image</mat-icon>
                  </mat-form-field>
                  
                   <div class="image-preview" *ngIf="basicInfoForm.get('coverImage')?.value">
                      <img [src]="basicInfoForm.get('coverImage')?.value" alt="Course Cover Preview" (error)="onImageError($event)">
                   </div>

                   <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ 'COURSE.GOOGLE_CLASSROOM_URL' | translate }}</mat-label>
                    <input matInput formControlName="googleClassroomUrl" placeholder="https://classroom.google.com/c/...">
                    <mat-icon matSuffix>link</mat-icon>
                    <mat-error *ngIf="basicInfoForm.get('googleClassroomUrl')?.hasError('pattern')">{{ 'COURSE.INVALID_URL' | translate }}</mat-error>
                  </mat-form-field>
                </div>

                <div class="stepper-actions">
                  <button mat-button color="warn" routerLink="/courses">Cancel</button>
                  <button mat-raised-button color="primary" matStepperNext>Next</button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Details -->
            <mat-step [stepControl]="detailsForm">
              <form [formGroup]="detailsForm">
                <ng-template matStepLabel>Details</ng-template>
                
                <div class="form-grid">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Detailed Description</mat-label>
                    <textarea matInput formControlName="detailedDescription" rows="5"></textarea>
                  </mat-form-field>

                  <div class="row">
                    <mat-form-field appearance="outline">
                        <mat-label>Difficulty Level</mat-label>
                        <mat-select formControlName="difficultyLevel">
                            <mat-option value="Beginner">Beginner</mat-option>
                            <mat-option value="Intermediate">Intermediate</mat-option>
                            <mat-option value="Advanced">Advanced</mat-option>
                        </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Target Audience</mat-label>
                        <input matInput formControlName="targetAudience">
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Prerequisites</mat-label>
                    <input matInput formControlName="prerequisites">
                  </mat-form-field>
                </div>

                <div class="stepper-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext>Next</button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Schedule & Capacity -->
            <mat-step [stepControl]="scheduleForm">
              <form [formGroup]="scheduleForm">
                <ng-template matStepLabel>Schedule & Capacity</ng-template>
                
                <div class="form-grid">
                  <div class="row">
                    <mat-form-field appearance="outline">
                      <mat-label>Workload (Hours)</mat-label>
                      <input matInput type="number" formControlName="workload">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Max Students</mat-label>
                      <input matInput type="number" formControlName="maxStudents">
                    </mat-form-field>
                  </div>
                  
                  <div class="row">
                     <mat-form-field appearance="outline">
                        <mat-label>Duration (Weeks)</mat-label>
                        <input matInput type="number" formControlName="duration">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>Week Days</mat-label>
                         <mat-select formControlName="weekDays" multiple>
                            <mat-option value="Mon">Monday</mat-option>
                            <mat-option value="Tue">Tuesday</mat-option>
                            <mat-option value="Wed">Wednesday</mat-option>
                            <mat-option value="Thu">Thursday</mat-option>
                            <mat-option value="Fri">Friday</mat-option>
                            <mat-option value="Sat">Saturday</mat-option>
                            <mat-option value="Sun">Sunday</mat-option>
                        </mat-select>
                    </mat-form-field>
                  </div>

                  <div class="row">
                    <mat-form-field appearance="outline">
                        <mat-label>Start Time</mat-label>
                        <input matInput type="time" formControlName="startTime">
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>End Time</mat-label>
                        <input matInput type="time" formControlName="endTime">
                    </mat-form-field>
                  </div>
                  
                  <div class="row">
                    <mat-form-field appearance="outline">
                        <mat-label>Start Date</mat-label>
                        <input matInput [matDatepicker]="pickerStart" formControlName="startDate">
                        <mat-datepicker-toggle matSuffix [for]="pickerStart"></mat-datepicker-toggle>
                        <mat-datepicker #pickerStart></mat-datepicker>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                        <mat-label>End Date</mat-label>
                        <input matInput [matDatepicker]="pickerEnd" formControlName="endDate">
                        <mat-datepicker-toggle matSuffix [for]="pickerEnd"></mat-datepicker-toggle>
                        <mat-datepicker #pickerEnd></mat-datepicker>
                    </mat-form-field>
                  </div>
                </div>

                <div class="stepper-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="primary" matStepperNext>Review</button>
                </div>
              </form>
            </mat-step>

            <!-- Step 4: Review & Submit -->
            <mat-step>
              <ng-template matStepLabel>Review</ng-template>
              
              <div class="review-container">
                <h3>Review Course Details</h3>
                
                <div class="review-section">
                    <h4>{{ basicInfoForm.get('name')?.value }}</h4>
                    <p>{{ basicInfoForm.get('shortDescription')?.value }}</p>
                    <div class="image-preview-small" *ngIf="basicInfoForm.get('coverImage')?.value">
                        <img [src]="basicInfoForm.get('coverImage')?.value" alt="Cover">
                    </div>
                </div>
                 
                 <div class="review-summary">
                    <p><strong>Workload:</strong> {{ scheduleForm.get('workload')?.value }}h</p>
                    <p><strong>Duration:</strong> {{ scheduleForm.get('duration')?.value }} weeks</p>
                    <p><strong>Schedule:</strong> {{ scheduleForm.get('weekDays')?.value }} | {{ scheduleForm.get('startTime')?.value }} - {{ scheduleForm.get('endTime')?.value }}</p>
                 </div>

                <div class="stepper-actions">
                  <button mat-button matStepperPrevious>Back</button>
                  <button mat-raised-button color="accent" (click)="submit()" [disabled]="isSubmitting">
                    {{ isSubmitting ? 'Publishing...' : 'Publish Course' }}
                  </button>
                </div>
              </div>
            </mat-step>
          </mat-stepper>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .course-form-container {
      display: flex;
      justify-content: center;
      padding: 20px;
      background-color: #f5f7fa;
      min-height: 80vh;
    }
    
    .form-card {
      width: 100%;
      max-width: 900px;
      padding: 20px;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 20px;
    }

    .row {
      display: flex;
      gap: 16px;
    }
    
    .row mat-form-field {
        flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .stepper-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }

    .image-preview {
        width: 100%;
        height: 200px;
        overflow: hidden;
        border-radius: 8px;
        margin-bottom: 16px;
        background-color: #eee;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .image-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .review-container {
        padding: 20px;
        text-align: center;
    }

    .image-preview-small {
        width: 150px;
        height: 100px;
        margin: 10px auto;
        border-radius: 4px;
        overflow: hidden;
    }
    
    .image-preview-small img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
  `]
})
export class CourseFormComponent implements OnInit {
  basicInfoForm: FormGroup;
  detailsForm: FormGroup;
  scheduleForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  courseId: number | null = null;
  professors: any[] = [];

  constructor(
    private _formBuilder: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.basicInfoForm = this._formBuilder.group({
      name: ['', Validators.required],
      shortDescription: [''],
      coverImage: [''],
      googleClassroomUrl: ['', [Validators.pattern('https?://.*')]],
      professorId: ['']
    });

    this.detailsForm = this._formBuilder.group({
      detailedDescription: [''],
      difficultyLevel: ['Beginner'],
      targetAudience: [''],
      prerequisites: ['']
    });

    this.scheduleForm = this._formBuilder.group({
      workload: [0, [Validators.required, Validators.min(1)]],
      maxStudents: [20, [Validators.required, Validators.min(1)]],
      duration: [1, [Validators.required, Validators.min(1)]],
      weekDays: [[]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadProfessors();
    this.checkEditMode();
  }

  loadProfessors() {
    this.courseService.getProfessors().subscribe({
      next: (profs) => this.professors = profs,
      error: (err) => console.error('Error loading professors', err)
    });
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.courseId = +id;
      this.loadCourseData(this.courseId);
    }
  }

  loadCourseData(id: number) {
    this.courseService.getCourse(id).subscribe({
      next: (course) => {
        this.basicInfoForm.patchValue({
          name: course.name,
          shortDescription: course.shortDescription,
          coverImage: course.coverImage,
          googleClassroomUrl: course.googleClassroomUrl,
          professorId: course.professorId
        });

        this.detailsForm.patchValue({
          detailedDescription: course.detailedDescription,
          difficultyLevel: course.difficultyLevel,
          targetAudience: course.targetAudience,
          prerequisites: course.prerequisites
        });

        const weekDays = course.weekDays ? course.weekDays.split(',') : [];
        this.scheduleForm.patchValue({
          workload: course.workload,
          maxStudents: course.maxStudents,
          duration: course.duration,
          weekDays: weekDays,
          startTime: course.startTime,
          endTime: course.endTime,
          startDate: course.startDate,
          endDate: course.endDate
        });
      },
      error: (err) => {
        this.snackBar.open('Error loading course data.', 'Close', { duration: 3000 });
        this.router.navigate(['/courses']);
      }
    });
  }

  onImageError(event: any) {
    event.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
  }

  submit() {
    if (this.basicInfoForm.valid && this.detailsForm.valid && this.scheduleForm.valid) {
      this.isSubmitting = true;

      const courseData: Course = {
        ...this.basicInfoForm.value,
        ...this.detailsForm.value,
        ...this.scheduleForm.value,
        weekDays: this.scheduleForm.value.weekDays ? this.scheduleForm.value.weekDays.join(',') : '', // Convert array to string
        status: 'active'
      };

      const request = this.isEditMode && this.courseId
        ? this.courseService.updateCourse(this.courseId, courseData)
        : this.courseService.createCourse(courseData);

      request.subscribe({
        next: (res: Course) => {
          this.snackBar.open(this.isEditMode ? 'Course updated successfully!' : 'Course created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/courses']);
        },
        error: (err: any) => {
          console.error(err);
          this.snackBar.open(`Error ${this.isEditMode ? 'updating' : 'creating'} course. Please try again.`, 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    } else {
      this.snackBar.open('Please fill all required fields.', 'Close', { duration: 3000 });
    }
  }
}