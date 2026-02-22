// src/app/features/teacher-portal/components/teacher-calendar/teacher-calendar.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TeacherPortalService } from '../../../../core/services/teacher-portal.service';

interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  sessions: CalendarSession[];
}

interface CalendarSession {
  id: number;
  courseId: number;
  courseName: string;
  startTime: string;
  endTime: string;
  locationName?: string;
  topic?: string;
  attendanceRecorded: boolean;
  color: string;
}

@Component({
  selector: 'app-teacher-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="calendar-container">
      <!-- Header -->
      <div class="header">
        <h1>Calendário de Aulas</h1>
        <div class="month-navigation">
          <button mat-icon-button (click)="previousMonth()">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <span class="current-month">{{ currentMonth | date:'MMMM yyyy':'':'pt-BR' }}</span>
          <button mat-icon-button (click)="nextMonth()">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div class="legend-item" *ngFor="let course of courseColors">
          <span class="legend-color" [style.background-color]="course.color"></span>
          <span class="legend-label">{{ course.name }}</span>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Carregando calendário...</p>
      </div>

      <!-- Calendar -->
      <mat-card class="calendar-card" *ngIf="!isLoading">
        <mat-card-content>
          <!-- Weekday Headers -->
          <div class="weekday-headers">
            <div class="weekday">Dom</div>
            <div class="weekday">Seg</div>
            <div class="weekday">Ter</div>
            <div class="weekday">Qua</div>
            <div class="weekday">Qui</div>
            <div class="weekday">Sex</div>
            <div class="weekday">Sáb</div>
          </div>

          <!-- Calendar Grid -->
          <div class="calendar-grid">
            <div 
              *ngFor="let day of calendarDays" 
              class="calendar-day"
              [class.today]="day.isToday"
              [class.other-month]="!day.isCurrentMonth"
            >
              <div class="day-header">
                <span class="day-number">{{ day.dayOfMonth }}</span>
              </div>
              <div class="day-sessions">
                <div 
                  *ngFor="let session of day.sessions" 
                  class="session-item"
                  [style.background-color]="session.color"
                  [class.attendance-recorded]="session.attendanceRecorded"
                  [matTooltip]="session.courseName + ' - ' + session.startTime"
                  (click)="onSessionClick(session)"
                >
                  <span class="session-time">{{ session.startTime }}</span>
                  <span class="session-name">{{ session.courseName }}</span>
                  <mat-icon *ngIf="session.attendanceRecorded" class="recorded-icon">check_circle</mat-icon>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Selected Day Details -->
      <mat-card class="details-card" *ngIf="selectedDate">
        <mat-card-header>
          <mat-card-title>Aulas de {{ selectedDate | date:'dd/MM/yyyy' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="session-list" *ngIf="selectedDateSessions.length > 0; else noSessions">
            <div 
              *ngFor="let session of selectedDateSessions" 
              class="session-detail"
              [class]="'status-' + (session.attendanceRecorded ? 'recorded' : 'pending')"
            >
              <div class="session-info">
                <span class="course-name" [style.color]="session.color">{{ session.courseName }}</span>
                <span class="session-time">{{ session.startTime }} - {{ session.endTime }}</span>
                <span class="session-location" *ngIf="session.locationName">
                  <mat-icon>place</mat-icon> {{ session.locationName }}
                </span>
                <span class="session-topic" *ngIf="session.topic">{{ session.topic }}</span>
              </div>
              <div class="session-actions">
                <mat-chip *ngIf="session.attendanceRecorded" class="status-chip recorded">
                  <mat-icon>check</mat-icon> Chamada realizada
                </mat-chip>
                <mat-chip *ngIf="!session.attendanceRecorded" class="status-chip pending">
                  <mat-icon>schedule</mat-icon> Chamada pendente
                </mat-chip>
                <button 
                  mat-raised-button 
                  color="primary"
                  [routerLink]="['/teacher/attendance', session.id]"
                >
                  <mat-icon>fact_check</mat-icon>
                  {{ session.attendanceRecorded ? 'Ver Chamada' : 'Fazer Chamada' }}
                </button>
              </div>
            </div>
          </div>
          <ng-template #noSessions>
            <div class="empty-day">
              <mat-icon>event_available</mat-icon>
              <p>Nenhuma aula prevista para este dia.</p>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .calendar-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h1 {
        font-size: 24px;
        font-weight: 500;
        margin: 0;
        color: #333;
      }

      .month-navigation {
        display: flex;
        align-items: center;
        gap: 16px;

        .current-month {
          font-size: 18px;
          font-weight: 500;
          text-transform: capitalize;
          min-width: 150px;
          text-align: center;
        }
      }
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
        }

        .legend-label {
          font-size: 14px;
          color: #666;
        }
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px;

      p {
        margin-top: 16px;
        color: #666;
      }
    }

    .calendar-card {
      margin-bottom: 24px;

      .weekday-headers {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        margin-bottom: 8px;

        .weekday {
          text-align: center;
          font-weight: 500;
          color: #666;
          padding: 8px;
          font-size: 14px;
        }
      }

      .calendar-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;

        .calendar-day {
          min-height: 100px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 4px;
          background-color: #fafafa;

          &.today {
            background-color: #e3f2fd;
            border-color: #006aac;

            .day-number {
              background-color: #006aac;
              color: white;
            }
          }

          &.other-month {
            background-color: #f5f5f5;
            opacity: 0.6;
          }

          .day-header {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 4px;

            .day-number {
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              font-size: 12px;
              font-weight: 500;
            }
          }

          .day-sessions {
            display: flex;
            flex-direction: column;
            gap: 2px;

            .session-item {
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 11px;
              color: white;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
              transition: transform 0.1s;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;

              &:hover {
                transform: scale(1.02);
              }

              &.attendance-recorded {
                opacity: 0.7;
              }

              .session-time {
                font-weight: 600;
              }

              .session-name {
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .recorded-icon {
                font-size: 12px;
                width: 12px;
                height: 12px;
                margin-left: auto;
              }
            }
          }
        }
      }
    }

    .details-card {
      .session-list {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .session-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #e0e0e0;

          &.status-recorded {
            background-color: #e8f5e9;
            border-color: #4caf50;
          }

          &.status-pending {
            background-color: #fff3e0;
            border-color: #ff9800;
          }

          .session-info {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .course-name {
              font-weight: 600;
              font-size: 16px;
            }

            .session-time {
              color: #666;
              font-size: 14px;
            }

            .session-location {
              display: flex;
              align-items: center;
              gap: 4px;
              color: #666;
              font-size: 14px;

              mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
              }
            }

            .session-topic {
              color: #666;
              font-size: 13px;
              font-style: italic;
            }
          }

          .session-actions {
            display: flex;
            align-items: center;
            gap: 12px;

            .status-chip {
              &.recorded {
                background-color: #4caf50;
                color: white;
              }

              &.pending {
                background-color: #ff9800;
                color: white;
              }

              mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
              }
            }

            button {
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }
        }
      }

      .empty-day {
        text-align: center;
        padding: 48px;

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #ccc;
          margin-bottom: 16px;
        }

        p {
          color: #666;
        }
      }
    }

    @media (max-width: 768px) {
      .calendar-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .calendar-card {
        .calendar-grid {
          .calendar-day {
            min-height: 60px;

            .day-sessions {
              .session-item {
                font-size: 9px;
                padding: 1px 3px;

                .session-name {
                  display: none;
                }
              }
            }
          }
        }
      }

      .session-detail {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 16px;
      }
    }
  `]
})
export class TeacherCalendarComponent implements OnInit {
  private teacherService = inject(TeacherPortalService);
  private router = inject(Router);

  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  selectedDate: Date | null = null;
  selectedDateSessions: CalendarSession[] = [];
  isLoading = false;

  courseColors: { id: number; name: string; color: string }[] = [
    { id: 1, name: 'Excel Básico', color: '#006aac' },
    { id: 2, name: 'Informática', color: '#4caf50' },
    { id: 3, name: 'Word Avançado', color: '#ff9800' }
  ];

  ngOnInit(): void {
    this.generateCalendar();
    this.loadSessions();
  }

  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    this.calendarDays = [];
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      this.calendarDays.push({
        date: date,
        dayOfMonth: date.getDate(),
        isToday: this.isToday(date),
        isCurrentMonth: date.getMonth() === month,
        sessions: []
      });
    }
  }

  loadSessions(): void {
    this.isLoading = true;
    
    // TODO: Load real sessions from API
    setTimeout(() => {
      // Mock sessions
      const mockSessions: CalendarSession[] = [
        {
          id: 1,
          courseId: 1,
          courseName: 'Excel Básico',
          startTime: '09:00',
          endTime: '11:00',
          locationName: 'Sala 3',
          topic: 'Fórmulas Básicas',
          attendanceRecorded: true,
          color: '#006aac'
        },
        {
          id: 2,
          courseId: 2,
          courseName: 'Informática',
          startTime: '14:00',
          endTime: '16:00',
          locationName: 'Sala 2',
          topic: 'Windows',
          attendanceRecorded: false,
          color: '#4caf50'
        }
      ];

      // Add sessions to calendar days
      this.calendarDays.forEach(day => {
        if (this.isToday(day.date) || day.date.getDate() === 15) {
          day.sessions = mockSessions;
        }
      });

      this.isLoading = false;
    }, 500);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  previousMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.currentMonth = new Date(this.currentMonth);
    this.generateCalendar();
    this.loadSessions();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.currentMonth = new Date(this.currentMonth);
    this.generateCalendar();
    this.loadSessions();
  }

  onSessionClick(session: CalendarSession): void {
    this.router.navigate(['/teacher/attendance', session.id]);
  }

  onDayClick(day: CalendarDay): void {
    this.selectedDate = day.date;
    this.selectedDateSessions = day.sessions;
  }
}
