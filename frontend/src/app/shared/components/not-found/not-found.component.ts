import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <mat-icon class="not-found-icon">error_outline</mat-icon>
        <h1>404</h1>
        <h2>Página não encontrada</h2>
        <p>A página que você está procurando não existe ou foi removida.</p>
        <button mat-raised-button color="primary" routerLink="/">
          <mat-icon>home</mat-icon>
          Voltar para o início
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 20px;
    }
    
    .not-found-content {
      text-align: center;
      max-width: 500px;
    }
    
    .not-found-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #f44336;
    }
    
    h1 {
      font-size: 48px;
      margin: 10px 0;
      color: #3f51b5;
    }
    
    h2 {
      font-size: 24px;
      margin: 10px 0;
    }
    
    p {
      margin: 20px 0;
      color: rgba(0, 0, 0, 0.6);
    }
    
    button {
      margin-top: 20px;
    }
  `]
})
export class NotFoundComponent { 
}