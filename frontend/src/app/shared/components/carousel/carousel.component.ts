// src/app/shared/components/carousel/carousel.component.ts
import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';

import { CarouselItem } from '../../../core/models/carousel-item.model';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="carousel-container">
      <!-- Estado de carregamento -->
      <div *ngIf="loading" class="carousel-loading">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
      
      <!-- Conteúdo do carrossel -->
      <div *ngIf="!loading && items.length > 0" class="carousel-content">
        <!-- Slides -->
        <div class="carousel-slides" #slidesContainer [style.transform]="'translateX(' + (-currentIndex * 100) + '%)'">
          <div *ngFor="let item of items" class="carousel-slide" [style.background-image]="'url(' + item.imageUrl + ')'">
            <div class="slide-content">
              <h2 *ngIf="item.title">{{ item.title }}</h2>
              <p *ngIf="item.description">{{ item.description }}</p>
              <a *ngIf="item.buttonText && item.buttonLink" 
                 [routerLink]="item.buttonLink.startsWith('http') ? null : item.buttonLink" 
                 [href]="item.buttonLink.startsWith('http') ? item.buttonLink : null"
                 [target]="item.buttonLink.startsWith('http') ? '_blank' : '_self'"
                 mat-raised-button color="primary">
                {{ item.buttonText }}
              </a>
            </div>
          </div>
        </div>
        
        <!-- Navegação -->
        <button class="carousel-nav carousel-prev" mat-mini-fab color="primary" aria-label="Slide anterior" (click)="prev()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        
        <button class="carousel-nav carousel-next" mat-mini-fab color="primary" aria-label="Próximo slide" (click)="next()">
          <mat-icon>chevron_right</mat-icon>
        </button>
        
        <!-- Indicadores -->
        <div class="carousel-indicators">
          <button *ngFor="let item of items; let i = index" 
                  class="indicator" 
                  [class.active]="i === currentIndex" 
                  (click)="goToSlide(i)"
                  [attr.aria-label]="'Ir para slide ' + (i + 1)">
          </button>
        </div>
      </div>
      
      <!-- Nenhum item -->
      <div *ngIf="!loading && items.length === 0" class="carousel-empty">
        <p>Nenhum item no carrossel</p>
      </div>
    </div>
  `,
  styles: [`
    .carousel-container {
      position: relative;
      width: 100%;
      height: 500px;
      overflow: hidden;
      background-color: #f0f0f0;
    }
    
    /* Loading state */
    .carousel-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    
    /* Slides container */
    .carousel-slides {
      display: flex;
      height: 100%;
      transition: transform 0.5s ease-in-out;
    }
    
    /* Individual slide */
    .carousel-slide {
      min-width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
    }
    
    .carousel-slide::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
    }
    
    /* Slide content */
    .slide-content {
      position: absolute;
      bottom: 80px;
      left: 0;
      right: 0;
      padding: 20px;
      color: white;
      text-align: center;
      z-index: 1;
    }
    
    .slide-content h2 {
      font-size: 32px;
      margin: 0 0 16px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    
    .slide-content p {
      font-size: 18px;
      margin: 0 0 24px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    
    /* Navigation buttons */
    .carousel-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
    }
    
    .carousel-prev {
      left: 20px;
    }
    
    .carousel-next {
      right: 20px;
    }
    
    /* Indicators */
    .carousel-indicators {
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: center;
      gap: 8px;
      z-index: 2;
    }
    
    .indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      border: none;
      padding: 0;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    
    .indicator.active {
      background-color: white;
    }
    
    /* Empty state */
    .carousel-empty {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: #666;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .carousel-container {
        height: 400px;
      }
      
      .slide-content h2 {
        font-size: 24px;
      }
      
      .slide-content p {
        font-size: 16px;
      }
    }
    
    @media (max-width: 480px) {
      .carousel-container {
        height: 300px;
      }
      
      .carousel-nav {
        width: 36px;
        height: 36px;
        min-width: 36px;
        line-height: 36px;
      }
      
      .carousel-nav mat-icon {
        font-size: 20px;
        line-height: 20px;
        height: 20px;
        width: 20px;
      }
    }
  `]
})
export class CarouselComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() items: CarouselItem[] = [];
  @Input() loading = false;
  @Input() autoplay = false;
  @Input() autoplayDelay = 5000; // ms
  
  @ViewChild('slidesContainer') slidesContainer!: ElementRef;
  
  currentIndex = 0;
  autoplaySubscription: Subscription | null = null;
  touchStartX = 0;
  
  ngOnInit(): void {
    if (this.autoplay) {
      this.startAutoplay();
    }
  }
  
  ngAfterViewInit(): void {
    // Adicionar event listeners para gestos de toque
    if (this.slidesContainer) {
      const element = this.slidesContainer.nativeElement;
      
      element.addEventListener('touchstart', (e: TouchEvent) => {
        this.touchStartX = e.touches[0].clientX;
      }, { passive: true });
      
      element.addEventListener('touchend', (e: TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = this.touchStartX - touchEndX;
        
        // Se o deslocamento for significativo, troca o slide
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });
    }
  }
  
  ngOnDestroy(): void {
    this.stopAutoplay();
  }
  
  startAutoplay(): void {
    if (this.autoplaySubscription) {
      this.stopAutoplay();
    }
    
    this.autoplaySubscription = interval(this.autoplayDelay).subscribe(() => {
      this.next();
    });
  }
  
  stopAutoplay(): void {
    if (this.autoplaySubscription) {
      this.autoplaySubscription.unsubscribe();
      this.autoplaySubscription = null;
    }
  }
  
  pauseAutoplay(): void {
    this.stopAutoplay();
  }
  
  resumeAutoplay(): void {
    if (this.autoplay) {
      this.startAutoplay();
    }
  }
  
  prev(): void {
    this.pauseAutoplay();
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.items.length - 1;
    this.resumeAutoplay();
  }
  
  next(): void {
    this.pauseAutoplay();
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.resumeAutoplay();
  }
  
  goToSlide(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.pauseAutoplay();
      this.currentIndex = index;
      this.resumeAutoplay();
    }
  }
}