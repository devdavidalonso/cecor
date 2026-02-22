// src/app/shared/components/skeleton/skeleton.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [class]="type">
      <!-- Card Skeleton -->
      <ng-container *ngIf="type === 'card'">
        <div class="skeleton-card">
          <div class="skeleton skeleton-header"></div>
          <div class="skeleton skeleton-line medium"></div>
          <div class="skeleton skeleton-line long"></div>
          <div class="skeleton skeleton-line short"></div>
        </div>
      </ng-container>

      <!-- List Skeleton -->
      <ng-container *ngIf="type === 'list'">
        <div class="skeleton-list">
          <div *ngFor="let item of [1,2,3,4,5]" class="skeleton-list-item">
            <div class="skeleton skeleton-circle"></div>
            <div class="skeleton-list-content">
              <div class="skeleton skeleton-line medium"></div>
              <div class="skeleton skeleton-line short"></div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Table Skeleton -->
      <ng-container *ngIf="type === 'table'">
        <div class="skeleton-table">
          <div class="skeleton-table-header">
            <div *ngFor="let col of [1,2,3,4]" class="skeleton skeleton-line"></div>
          </div>
          <div *ngFor="let row of [1,2,3,4,5]" class="skeleton-table-row">
            <div *ngFor="let col of [1,2,3,4]" class="skeleton skeleton-line"></div>
          </div>
        </div>
      </ng-container>

      <!-- Dashboard Skeleton -->
      <ng-container *ngIf="type === 'dashboard'">
        <div class="skeleton-dashboard">
          <div class="skeleton-dashboard-header">
            <div class="skeleton skeleton-header"></div>
            <div class="skeleton skeleton-line short"></div>
          </div>
          <div class="skeleton-dashboard-stats">
            <div *ngFor="let stat of [1,2,3]" class="skeleton skeleton-card">
              <div class="skeleton skeleton-circle"></div>
              <div class="skeleton skeleton-line"></div>
            </div>
          </div>
          <div class="skeleton-dashboard-content">
            <div class="skeleton skeleton-card" style="flex: 2;"></div>
            <div class="skeleton skeleton-card" style="flex: 1;"></div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .skeleton-container {
      width: 100%;
    }

    .skeleton-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px;
      background: white;
      border-radius: 8px;
    }

    .skeleton-list-content {
      flex: 1;
    }

    .skeleton-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .skeleton-table-header,
    .skeleton-table-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 12px 16px;
    }

    .skeleton-table-header {
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }

    .skeleton-table-row {
      border-bottom: 1px solid #f0f0f0;
    }

    .skeleton-dashboard {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .skeleton-dashboard-header {
      .skeleton-header {
        height: 32px;
        width: 200px;
        margin-bottom: 8px;
      }
    }

    .skeleton-dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .skeleton-dashboard-content {
      display: flex;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .skeleton-dashboard-content {
        flex-direction: column;
      }

      .skeleton-table-header,
      .skeleton-table-row {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class SkeletonComponent {
  @Input() type: 'card' | 'list' | 'table' | 'dashboard' = 'card';
}
