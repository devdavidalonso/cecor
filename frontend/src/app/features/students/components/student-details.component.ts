// src/app/features/students/components/student-details.component.ts

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StudentService } from '@core/services/student.service';
import { Student, Guardian } from '@core/models/student.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
@Component({
  selector: 'app-student-details',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Adicionar esta linha
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container" *ngIf="student">
      <div class="header">
        <div class="title-section">
          <h1>{{ student.name }}</h1>
          <mat-chip-set>
            <mat-chip [color]="getStatusColor(student.status)" selected>{{ student.status }}</mat-chip>
          </mat-chip-set>
        </div>
        
        <div class="actions">
          <button mat-raised-button color="primary" [routerLink]="['/students/edit', student.id]">
            <mat-icon>edit</mat-icon>
            Edit
          </button>
          <button mat-button color="warn" (click)="deleteStudent()">
            <mat-icon>delete</mat-icon>
            Delete
          </button>
          <button mat-button [routerLink]="['/students']">
            <mat-icon>arrow_back</mat-icon>
            Back to List
          </button>
        </div>
      </div>
      
      <mat-tabs>
        <!-- Personal Information Tab -->
        <mat-tab label="Information">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Personal Information</mat-card-title>
              </mat-card-header>
              
              <mat-card-content>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Registration Number</div>
                    <div class="info-value">{{ student.registrationNumber }}</div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">CPF</div>
                    <div class="info-value">{{ student.cpf || 'Not provided' }}</div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">Birth Date</div>
                    <div class="info-value">{{ student.birthDate | date }}</div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">{{ student.email }}</div>
                  </div>
                  
                  <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">{{ student.mainPhone }}</div>
                  </div>
                  
                  <div class="info-item full-width">
                    <div class="info-label">Address</div>
                    <div class="info-value">{{ student.address }}</div>
                  </div>
                  
                  <div class="info-item full-width" *ngIf="student.medicalInfo">
                    <div class="info-label">Medical Information</div>
                    <div class="info-value">{{ student.medicalInfo }}</div>
                  </div>
                  
                  <div class="info-item full-width" *ngIf="student.accessibilityNeeds">
                    <div class="info-label">Accessibility Needs</div>
                    <div class="info-value">{{ student.accessibilityNeeds }}</div>
                  </div>
                  
                  <div class="info-item full-width" *ngIf="student.observation">
                    <div class="info-label">Observation</div>
                    <div class="info-value">{{ student.observation }}</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <!-- Guardians Tab -->
        <mat-tab label="Guardians">
          <div class="tab-content">
            <div class="tab-actions">
              <button mat-raised-button color="primary" (click)="addGuardian()">
                <mat-icon>add</mat-icon>
                Add Guardian
              </button>
            </div>
            
            <div *ngIf="guardians.length === 0" class="empty-state">
              <p>No guardians registered for this student.</p>
            </div>
            
            <div *ngFor="let guardian of guardians" class="guardian-card">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>{{ guardian.name }}</mat-card-title>
                  <mat-card-subtitle>{{ guardian.relationship }}</mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <div class="info-grid">
                    <div class="info-item" *ngIf="guardian.email">
                      <div class="info-label">Email</div>
                      <div class="info-value">{{ guardian.email }}</div>
                    </div>
                    
                    <div class="info-item" *ngIf="guardian.cpf">
                      <div class="info-label">CPF</div>
                      <div class="info-value">{{ guardian.cpf }}</div>
                    </div>
                    
                    <div class="info-item full-width">
                      <div class="info-label">Phones</div>
                      <div class="info-value">
                        <div *ngFor="let phone of guardian.phones">
                          {{ phone.number }} ({{ phone.type }})
                        </div>
                      </div>
                    </div>
                    
                    <div class="info-item full-width">
                      <div class="info-label">Permissions</div>
                      <div class="info-value permissions">
                        <span [class.permission-granted]="guardian.permissions.pickupStudent" 
                              [class.permission-denied]="!guardian.permissions.pickupStudent">
                          Pickup Student
                        </span>
                        <span [class.permission-granted]="guardian.permissions.receiveNotifications" 
                              [class.permission-denied]="!guardian.permissions.receiveNotifications">
                          Receive Notifications
                        </span>
                        <span [class.permission-granted]="guardian.permissions.authorizeActivities" 
                              [class.permission-denied]="!guardian.permissions.authorizeActivities">
                          Authorize Activities
                        </span>
                      </div>
                    </div>
                  </div>
                </mat-card-content>
                
                <mat-card-actions align="end">
                  <button mat-button color="primary" (click)="editGuardian(guardian)">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>
                  <button mat-button color="warn" (click)="deleteGuardian(guardian)">
                    <mat-icon>delete</mat-icon>
                    Remove
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>
        
        <!-- Documents Tab -->
        <mat-tab label="Documents">
          <div class="tab-content">
            <div class="tab-actions">
              <button mat-raised-button color="primary" (click)="uploadDocument()">
                <mat-icon>upload</mat-icon>
                Upload Document
              </button>
            </div>
            
            <div *ngIf="documents.length === 0" class="empty-state">
              <p>No documents uploaded for this student.</p>
            </div>
            
            <table mat-table [dataSource]="documents" *ngIf="documents.length > 0" class="mat-elevation-z2">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let doc">{{ doc.name }}</td>
              </ng-container>
              
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let doc">{{ doc.type }}</td>
              </ng-container>
              
              <ng-container matColumnDef="uploadDate">
                <th mat-header-cell *matHeaderCellDef>Upload Date</th>
                <td mat-cell *matCellDef="let doc">{{ doc.createdAt | date }}</td>
              </ng-container>
              
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let doc">
                  <button mat-icon-button color="primary" (click)="viewDocument(doc)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="downloadDocument(doc)">
                    <mat-icon>download</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteDocument(doc)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="['name', 'type', 'uploadDate', 'actions']"></tr>
              <tr mat-row *matRowDef="let row; columns: ['name', 'type', 'uploadDate', 'actions'];"></tr>
            </table>
          </div>
        </mat-tab>
        
        <!-- Notes Tab -->
        <mat-tab label="Notes">
          <div class="tab-content">
            <div class="tab-actions">
              <button mat-raised-button color="primary" (click)="addNote()">
                <mat-icon>add</mat-icon>
                Add Note
              </button>
              <mat-slide-toggle [checked]="includeConfidential" (change)="toggleConfidential()">
                Include Confidential Notes
              </mat-slide-toggle>
            </div>
            
            <div *ngIf="notes.length === 0" class="empty-state">
              <p>No notes for this student.</p>
            </div>
            
            <div *ngFor="let note of notes" class="note-card">
              <mat-card [class.confidential]="note.isConfidential">
                <mat-card-header>
                  <mat-card-title>
                    {{ note.createdAt | date:'medium' }}
                    <mat-chip *ngIf="note.isConfidential" color="warn" selected>Confidential</mat-chip>
                  </mat-card-title>
                  <mat-card-subtitle>By: {{ note.authorName }}</mat-card-subtitle>
                </mat-card-header>
                
                <mat-card-content>
                  <p>{{ note.content }}</p>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
        
        <!-- Enrollments Tab -->
        <mat-tab label="Enrollments">
          <div class="tab-content">
            <div class="tab-actions">
              <button mat-raised-button color="primary" [routerLink]="['/enrollments/new']" [queryParams]="{studentId: student.id}">
                <mat-icon>add</mat-icon>
                New Enrollment
              </button>
            </div>
            
            <!-- Enrollment content here -->
          </div>
        </mat-tab>
      </mat-tabs>
    </div>
    
    <div class="loading-container" *ngIf="!student && loading">
      <mat-spinner></mat-spinner>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .title-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .tab-content {
      padding: 24px 0;
    }
    
    .tab-actions {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.6);
      font-size: 12px;
    }
    
    .info-value {
      font-size: 16px;
    }
    
    .full-width {
      grid-column: 1 / -1;
    }
    
    .guardian-card {
      margin-bottom: 16px;
    }
    
    .empty-state {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 32px;
      background-color: #f5f5f5;
      border-radius: 4px;
      color: rgba(0, 0, 0, 0.6);
    }
    
    .permissions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .permission-granted {
      color: #4caf50;
      font-weight: 500;
    }
    
    .permission-denied {
      color: #f44336;
      text-decoration: line-through;
      opacity: 0.7;
    }
    
    .note-card {
      margin-bottom: 16px;
    }
    
    .confidential {
      border-left: 4px solid #f44336;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 400px;
    }
  `]
})
export class StudentDetailsComponent implements OnInit {
  student: Student | null = null;
  guardians: Guardian[] = [];
  documents: any[] = [];
  notes: any[] = [];
  loading = true;
  includeConfidential = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.loadStudentData(id);
    } else {
      this.router.navigate(['/students']);
    }
  }
  
  loadStudentData(id: number): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.studentService.getStudent(id).subscribe({
      next: (student) => {
        this.student = student;
        this.loadGuardians(id);
        this.loadDocuments(id);
        this.loadNotes(id);
      },
      error: (error) => {
        this.snackBar.open('Error loading student data', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/students']);
      }
    });
  }
  
  loadGuardians(studentId: number): void {
    this.studentService.getGuardians(studentId).subscribe({
      next: (guardians) => {
        this.guardians = guardians;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Error loading guardians', 'Close', { duration: 3000 });
      }
    });
  }
  
  loadDocuments(studentId: number): void {
    this.studentService.getDocuments(studentId).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Error loading documents', 'Close', { duration: 3000 });
      }
    });
  }
  
  loadNotes(studentId: number): void {
    this.studentService.getNotes(studentId, this.includeConfidential).subscribe({
      next: (notes) => {
        this.notes = notes;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Error loading notes', 'Close', { duration: 3000 });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'warn';
      case 'suspended':
        return 'accent';
      default:
        return '';
    }
  }
  
  deleteStudent(): void {
    if (!this.student) return;
    
    if (confirm(`Are you sure you want to delete the student ${this.student.name}?`)) {
      this.studentService.deleteStudent(this.student.id).subscribe({
        next: () => {
          this.snackBar.open('Student deleted successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/students']);
        },
        error: (error) => {
          this.snackBar.open('Error deleting student', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  // Guardian actions
  addGuardian(): void {
    // Implementation would typically open a dialog or navigate to a form
    console.log('Add guardian');
  }
  
  editGuardian(guardian: Guardian): void {
    console.log('Edit guardian', guardian);
  }
  
  deleteGuardian(guardian: Guardian): void {
    if (confirm(`Are you sure you want to remove ${guardian.name} as a guardian?`)) {
      this.studentService.deleteGuardian(guardian.id).subscribe({
        next: () => {
          this.snackBar.open('Guardian removed successfully', 'Close', { duration: 3000 });
          this.loadGuardians(this.student!.id);
        },
        error: (error) => {
          this.snackBar.open('Error removing guardian', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  // Document actions
  uploadDocument(): void {
    console.log('Upload document');
  }
  
  viewDocument(doc: any): void {
    console.log('View document', doc);
  }
  
  downloadDocument(doc: any): void {
    console.log('Download document', doc);
  }
  
  deleteDocument(doc: any): void {
    console.log('Delete document', doc);
  }
  
  // Note actions
  addNote(): void {
    console.log('Add note');
  }
  
  toggleConfidential(): void {
    this.includeConfidential = !this.includeConfidential;
    if (this.student) {
      this.loadNotes(this.student.id);
    }
  }
}