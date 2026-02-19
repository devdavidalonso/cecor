import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { CourseService, Course } from '../../../core/services/course.service';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <div class="details-container" *ngIf="course">
      <div class="header-banner" [style.background-image]="'url(' + (course.coverImage || 'https://via.placeholder.com/1200x400?text=Course+Cover') + ')'">
        <div class="overlay">
          <div class="header-content">
            <button mat-icon-button color="primary" routerLink="/courses" class="back-btn">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div class="title-section">
              <h1>{{ course.name }}</h1>
              <p>{{ course.shortDescription }}</p>
              <div class="badge-row">
                <mat-chip-set>
                    <mat-chip class="difficulty-chip" [ngClass]="course.difficultyLevel?.toLowerCase() || 'beginner'">
                        {{ course.difficultyLevel || 'Beginner' }}
                    </mat-chip>
                    <mat-chip color="accent" selected>{{ course.status }}</mat-chip>
                </mat-chip-set>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-grid">
        <div class="main-content">
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>About this course</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="description">{{ course.detailedDescription || 'No description available for this course.' }}</p>
              
              <mat-divider></mat-divider>
              
              <div class="details-section">
                <h3>Prerequisites</h3>
                <p>{{ course.prerequisites || 'None' }}</p>
              </div>

              <div class="details-section">
                <h3>Target Audience</h3>
                <p>{{ course.targetAudience || 'General public' }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="side-content">
           <mat-card class="sidebar-card">
             <mat-card-content>
                <div class="sidebar-item">
                  <mat-icon>schedule</mat-icon>
                  <div>
                    <strong>Workload</strong>
                    <p>{{ course.workload }} hours</p>
                  </div>
                </div>

                <div class="sidebar-item">
                  <mat-icon>event</mat-icon>
                  <div>
                    <strong>Duration</strong>
                    <p>{{ course.duration }} weeks</p>
                  </div>
                </div>

                <div class="sidebar-item">
                  <mat-icon>calendar_today</mat-icon>
                  <div>
                    <strong>Days</strong>
                    <p>{{ course.weekDays }}</p>
                  </div>
                </div>

                <div class="sidebar-item">
                  <mat-icon>access_time</mat-icon>
                  <div>
                    <strong>Time</strong>
                    <p>{{ course.startTime }} - {{ course.endTime }}</p>
                  </div>
                </div>

                <div class="sidebar-item">
                  <mat-icon>people</mat-icon>
                  <div>
                    <strong>Capacity</strong>
                    <p>{{ course.maxStudents }} students max</p>
                  </div>
                </div>
                
                <div class="sidebar-item" *ngIf="professorName">
                  <mat-icon>person</mat-icon>
                  <div>
                    <strong>Professor</strong>
                    <p>{{ professorName }}</p>
                  </div>
                </div>
                
                <mat-divider></mat-divider>
                
                <div class="actions">
                  <button mat-raised-button color="primary" [routerLink]="['/courses/edit', course.id]" class="full-width">
                    <mat-icon>edit</mat-icon> Edit Course
                  </button>
                </div>
             </mat-card-content>
           </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .details-container {
      background-color: #f8fafc;
      min-height: 100vh;
    }

    .header-banner {
      height: 400px;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%);
      display: flex;
      align-items: flex-end;
      padding: 40px;
    }

    .header-content {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .back-btn {
        background: white !important;
    }

    .title-section h1 {
      color: white;
      font-size: 3rem;
      margin-bottom: 10px;
      font-weight: 700;
    }

    .title-section p {
      color: rgba(255,255,255,0.8);
      font-size: 1.2rem;
      max-width: 600px;
    }

    .badge-row {
        margin-top: 16px;
    }

    .difficulty-chip.beginner { background-color: #dcfce7 !important; color: #166534 !important; }
    .difficulty-chip.intermediate { background-color: #fef9c3 !important; color: #854d0e !important; }
    .difficulty-chip.advanced { background-color: #fee2e2 !important; color: #991b1b !important; }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 30px;
      max-width: 1200px;
      margin: -50px auto 40px;
      position: relative;
      z-index: 10;
      padding: 0 20px;
    }

    .info-card {
      padding: 20px;
      border-radius: 12px;
    }

    .description {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #334155;
      margin: 20px 0;
      white-space: pre-wrap;
    }

    .details-section {
      margin-top: 30px;
    }

    .details-section h3 {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 10px;
    }

    .sidebar-card {
      position: sticky;
      top: 20px;
      border-radius: 12px;
      padding: 10px;
    }

    .sidebar-item {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .sidebar-item mat-icon {
      color: #3b82f6;
    }

    .sidebar-item strong {
      display: block;
      color: #64748b;
      font-size: 0.85rem;
      text-transform: uppercase;
    }

    .sidebar-item p {
      margin: 0;
      color: #1e293b;
      font-weight: 500;
    }

    .actions {
        margin-top: 20px;
    }

    .full-width {
        width: 100%;
    }

    @media (max-width: 900px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      .header-banner {
        height: 300px;
      }
      .title-section h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class CourseDetailsComponent implements OnInit {
  course: Course | null = null;
  professorName: string = '';

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourseData(+id);
    }
  }

  loadCourseData(id: number) {
    this.courseService.getCourse(id).subscribe({
      next: (course) => {
        this.course = course;
        if (course.professorId) {
          this.loadProfessorName(course.professorId);
        }
      },
      error: (err) => console.error('Error loading course', err)
    });
  }

  loadProfessorName(professorId: number | undefined) {
    if (!professorId) return;
    
    this.courseService.getProfessors().subscribe({
      next: (profs) => {
        // Professor ID in profs array might be string or number depending on backend.
        // Using loose equality to be safe or assuming number match if consistent.
        // Looking at mock-courses.ts, professorId is 101 (number).
        const prof = profs.find(p => p.id == professorId);
        if (prof) {
          this.professorName = `${prof.firstName} ${prof.lastName}`;
        }
      }
    });
  }
}