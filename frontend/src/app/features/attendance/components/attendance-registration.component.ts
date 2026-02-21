import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { CourseService, Course } from '../../../core/services/course.service';
import { StudentService } from '../../../core/services/student.service';
import { ClassSession } from '../../../core/models/class-session.model';

@Component({
  selector: 'app-attendance-registration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatInputModule
  ],
  template: `
    <div class="attendance-container">
      <div class="header-banner">
        <h2>{{ 'ATTENDANCE.REGISTER' | translate }}</h2>
        <p>Select a course and session to record today's attendance.</p>
      </div>

      <mat-card class="selection-card">
        <mat-card-content class="selection-grid">
          <mat-form-field appearance="outline">
            <mat-label>{{ 'ATTENDANCE.COURSE' | translate }}</mat-label>
            <mat-select [(ngModel)]="selectedCourseId" (selectionChange)="onCourseSelect()">
              <mat-option *ngFor="let course of courses" [value]="course.id">
                {{ course.name }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Class Session</mat-label>
            <mat-select [(ngModel)]="selectedSessionId" (selectionChange)="onSessionSelect()" [disabled]="!selectedCourseId">
              <mat-option *ngFor="let session of sessions" [value]="session.id">
                {{ session.date | date:'shortDate' }} - {{ session.startTime }} ({{ session.topic }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card class="students-card" *ngIf="selectedSessionId">
        <mat-card-header>
          <mat-card-title>Students Roll Call</mat-card-title>
          <mat-card-subtitle>
             Mark toggles if the student is Present. Leave unchecked if Absent.
          </mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
           <table mat-table [dataSource]="students" class="w-full">
             <!-- Name Column -->
             <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef> Student Name </th>
                <td mat-cell *matCellDef="let element"> {{ element.name }} </td>
             </ng-container>

             <!-- Present Column -->
             <ng-container matColumnDef="present">
                <th mat-header-cell *matHeaderCellDef> Present </th>
                <td mat-cell *matCellDef="let element">
                  <mat-slide-toggle
                    [checked]="element.isPresent"
                    color="primary"
                    (change)="toggleAttendance(element)">
                  </mat-slide-toggle>
                </td>
             </ng-container>

             <!-- Incident/Note Column -->
             <ng-container matColumnDef="incident">
                <th mat-header-cell *matHeaderCellDef> Observation / Incident </th>
                <td mat-cell *matCellDef="let element">
                   <mat-form-field appearance="outline" class="incident-field">
                     <input matInput [(ngModel)]="element.note" placeholder="E.g. Arrived late">
                     <button *ngIf="element.note" matSuffix mat-icon-button aria-label="Clear" (click)="element.note=''">
                        <mat-icon>close</mat-icon>
                     </button>
                   </mat-form-field>
                </td>
             </ng-container>

             <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
             <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.absent-row]="!row.isPresent"></tr>
             
             <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" colspan="4">No students enrolled in this course yet.</td>
             </tr>
           </table>

           <!-- General Class Incident -->
           <div class="general-incident-box mt-4">
              <h4>Class Incident (Optional)</h4>
              <mat-form-field appearance="outline" class="w-full">
                 <textarea matInput [(ngModel)]="classIncident" rows="2" placeholder="Describe any incident involving the infrastructure or the class as a whole..."></textarea>
              </mat-form-field>
           </div>
        </mat-card-content>
        <mat-card-actions align="end">
           <button mat-button (click)="resetForm()">Cancel</button>
           <button mat-raised-button color="primary" (click)="saveAttendance()" [disabled]="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Attendance' }}
           </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .attendance-container {
       padding: 24px;
       max-width: 1200px;
       margin: 0 auto;
    }
    .header-banner {
       margin-bottom: 24px;
    }
    .header-banner h2 {
       margin: 0;
       font-size: 24px;
       color: #1e293b;
    }
    .selection-card {
       margin-bottom: 24px;
       padding: 16px 16px 0 16px;
    }
    .selection-grid {
       display: flex;
       gap: 16px;
    }
    .selection-grid mat-form-field {
       flex: 1;
    }
    .w-full {
       width: 100%;
    }
    .absent-row {
       background-color: #fffbfa;
    }
    .incident-field {
       width: 100%;
       margin-top: 10px;
    }
    ::ng-deep .incident-field .mat-mdc-text-field-wrapper {
       padding-bottom: 0;
    }
    .general-incident-box {
       background: #f8fafc;
       padding: 16px;
       border-radius: 8px;
       border-left: 4px solid #eab308;
    }
    .general-incident-box h4 {
       margin-top: 0;
       color: #854d0e;
    }
    .mt-4 { margin-top: 16px; }
  `]
})
export class AttendanceRegistrationComponent implements OnInit {
  courses: Course[] = [];
  sessions: ClassSession[] = [];
  students: any[] = []; // Usually would extend Student model with isPresent

  selectedCourseId: number | null = null;
  selectedSessionId: number | null = null;
  
  classIncident: string = '';
  isSaving = false;

  displayedColumns: string[] = ['name', 'present', 'incident'];

  constructor(
    private courseService: CourseService,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().subscribe({
      next: (data: Course[]) => this.courses = data,
      error: (err: any) => console.error(err)
    });
  }

  onCourseSelect() {
    this.selectedSessionId = null;
    this.sessions = [];
    this.students = [];
    
    if (this.selectedCourseId) {
      this.loadClassSessions(this.selectedCourseId);
    }
  }

  loadClassSessions(courseId: number) {
    // Mocking class sessions for now, should call a ClassSessionService
    this.sessions = [
      { id: 1, courseId: courseId, date: new Date().toISOString(), startTime: '19:00', endTime: '21:00', topic: 'Introductory Concepts' },
      { id: 2, courseId: courseId, date: new Date(Date.now() + 86400000).toISOString(), startTime: '19:00', endTime: '21:00', topic: 'Deep Dive' }
    ];
  }

  onSessionSelect() {
    if (this.selectedSessionId && this.selectedCourseId) {
       this.loadEnrolledStudents(this.selectedCourseId);
    }
  }

  loadEnrolledStudents(courseId: number) {
     this.studentService.getStudents().subscribe({
        next: (data: any) => {
            // For MVP UI, assume all students returned are enrolled, initialize state
            const studentList = Array.isArray(data) ? data : (data.items || []);
            this.students = studentList.map((s: any) => ({
               studentId: s.id,
               name: s.user ? s.user.name : 'Unknown',
               isPresent: true, // Default to present
               note: ''
            }));
        },
        error: (err: any) => console.error(err)
     });
  }

  toggleAttendance(element: any) {
    element.isPresent = !element.isPresent;
  }

  saveAttendance() {
     this.isSaving = true;
     // Gather payload
     const payload = {
        courseId: this.selectedCourseId,
        classSessionId: this.selectedSessionId,
        classIncident: this.classIncident,
        attendances: this.students.map(s => ({
           studentId: s.studentId,
           status: s.isPresent ? 'present' : 'absent',
           notes: s.note
        }))
     };

     console.log('Publishing Attendance: ', payload);

     // Mock Http call
     setTimeout(() => {
        this.snackBar.open('Attendance registered successfully!', 'Close', { duration: 3000 });
        this.isSaving = false;
        this.resetForm();
     }, 1000);
  }

  resetForm() {
      this.selectedCourseId = null;
      this.selectedSessionId = null;
      this.sessions = [];
      this.students = [];
      this.classIncident = '';
  }
}