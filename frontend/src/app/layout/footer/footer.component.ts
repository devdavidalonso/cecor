import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';

import { environment } from '@environments/environment';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar class="footer">
      <span>© {{ currentYear }} CECOR - Centro de Educação Comunitária</span>
      <span class="spacer"></span>
      <span class="version">v{{ version }}</span>
    </mat-toolbar>
  `,
  styles: [`
    .footer {
      height: 48px;
      background-color: #f5f5f5;
      color: rgba(0, 0, 0, 0.7);
      font-size: 14px;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .version {
      font-size: 12px;
      opacity: 0.7;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  version = environment.version;
}