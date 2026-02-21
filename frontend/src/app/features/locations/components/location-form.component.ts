import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  template: `
    <div class="location-form-container">
      <mat-card class="form-card">
        <mat-card-header>
          <div mat-card-avatar>
              <mat-icon class="header-icon">meeting_room</mat-icon>
          </div>
          <mat-card-title>Location Registration</mat-card-title>
          <mat-card-subtitle>Manage classrooms and laboratory spaces</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="locationForm" (ngSubmit)="onSubmit()" class="form-grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Location Name</mat-label>
              <input matInput formControlName="name" placeholder="e.g. Lab 01, Main Auditorium">
              <mat-error *ngIf="locationForm.get('name')?.hasError('required')">Name is required</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Capacity</mat-label>
              <input matInput type="number" formControlName="capacity" placeholder="e.g. 40">
              <mat-error *ngIf="locationForm.get('capacity')?.hasError('required')">Capacity is required</mat-error>
              <mat-error *ngIf="locationForm.get('capacity')?.hasError('min')">Capacity must be at least 1</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Resources</mat-label>
              <textarea matInput formControlName="resources" rows="3" placeholder="Projector, Whiteboard, 20 Computers..."></textarea>
            </mat-form-field>

            <div class="toggle-container">
              <mat-slide-toggle formControlName="isAvailable" color="primary">
                Is Currently Available for Booking?
              </mat-slide-toggle>
            </div>

            <div class="form-actions">
               <button mat-button type="button" routerLink="/locations">Cancel</button>
               <button mat-raised-button color="primary" type="submit" [disabled]="locationForm.invalid || isSubmitting">
                 {{ isSubmitting ? 'Saving...' : 'Save Location' }}
               </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .location-form-container {
      display: flex;
      justify-content: center;
      padding: 24px;
      min-height: 85vh;
      background-color: #f8f9fa;
    }
    
    .form-card {
      width: 100%;
      max-width: 600px;
      padding: 16px;
    }

    .header-icon {
        font-size: 24px;
        color: #0d9488;
    }

    .form-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }
    
    .full-width { width: 100%; }

    .toggle-container {
        padding: 8px 0;
        margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
  `]
})
export class LocationFormComponent implements OnInit {
  locationForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      capacity: [20, [Validators.required, Validators.min(1)]],
      resources: [''],
      isAvailable: [true]
    });
  }

  ngOnInit(): void {
    // Usually we would check route params for ID to populate edit mode
  }

  onSubmit() {
    if (this.locationForm.valid) {
      this.isSubmitting = true;
      console.log('Location saved:', this.locationForm.value);
      
      // Mock saving directly since we might not have the LocationService fully implemented
      setTimeout(() => {
        this.snackBar.open('Location saved successfully!', 'Close', { duration: 3000 });
        this.isSubmitting = false;
        // this.router.navigate(['/locations']);
      }, 800);
    }
  }
}
