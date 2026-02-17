// src/app/features/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { CarouselComponent } from '../../shared/components/carousel/carousel.component';
import { CarouselService } from '../../core/services/carousel.service';
import { CourseService } from '../../core/services/course.service';
import { PrototypeService } from '../../core/services/prototype/prototype.service';
import { CarouselItem } from '../../core/models/carousel-item.model';
import { Course } from '../../core/services/course.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    CarouselComponent
  ],
  template: `
    <!-- Indicador de Protótipo -->
    <div *ngIf="isPrototypeMode$ | async" class="prototype-indicator">
      <mat-icon>construction</mat-icon> Modo Protótipo - Dados Simulados
    </div>

    <!-- Carrossel -->
    <app-carousel 
      [items]="carouselItems"
      [loading]="carouselLoading"
      [autoplay]="true"
      [autoplayDelay]="5000">
    </app-carousel>

    <!-- Seção de Bem-vindo -->
    <section class="welcome-section">
      <div class="container">
        <h1>Bem-vindo ao CECOR</h1>
        <p class="subtitle">Centro de Educação Comunitária</p>
        <p class="description">
          Nosso objetivo é transformar vidas por meio da educação. Oferecemos diversos cursos gratuitos 
          para a comunidade, com foco em desenvolvimento pessoal e profissional.
        </p>
      </div>
    </section>

    <!-- Seção de Busca de Cursos -->
    <section class="courses-section">
      <div class="container">
        <div class="section-header">
          <h2>Nossos Cursos</h2>
          
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar cursos</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Digite o nome do curso">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
        
        <!-- Estado de carregamento -->
        <div *ngIf="loading" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Carregando cursos...</p>
        </div>
        
        <!-- Mensagem de erro -->
        <div *ngIf="error" class="error-container">
          <mat-icon color="warn">error_outline</mat-icon>
          <p>{{ error }}</p>
          <button mat-raised-button color="primary" (click)="loadCursos()">Tentar Novamente</button>
        </div>

        <!-- Lista de cursos -->
        <div *ngIf="!loading && !error" class="courses-grid">
          <mat-card *ngFor="let course of courses" class="course-card">
            <img mat-card-image [src]="course.coverImage || 'assets/images/curso-default.jpg'" [alt]="course.name">
            <mat-card-content>
              <h3>{{ curso.nome }}</h3>
              <p class="course-description">{{ course.shortDescription }}</p>
              <div class="course-details">
                <div class="detail-item">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ course.workload }}h</span>
                </div>
                <div class="detail-item">
                  <mat-icon>event</mat-icon>
                  <span>{{ course.weekDays }}</span>
                </div>
                <div class="detail-item">
                  <mat-icon>people</mat-icon>
                  <span>{{ course.maxStudents }} vagas</span>
                </div>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" [routerLink]="['/courses', course.id]">VER DETALHES</button>
              <button mat-raised-button color="primary" [routerLink]="['/courses', course.id, 'enroll']">MATRICULAR-SE</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <!-- Sem resultados -->
        <div *ngIf="!loading && !error && courses.length === 0" class="no-results">
          <mat-icon>search_off</mat-icon>
          <p>Nenhum curso encontrado com os critérios de busca.</p>
        </div>
      </div>
    </section>

    <!-- Seção CTA -->
    <section class="cta-section">
      <div class="container">
        <h2>Transforme seu futuro com o CECOR</h2>
        <p>Inscreva-se hoje mesmo em nossos cursos gratuitos e comece uma nova jornada de aprendizado.</p>
        <button mat-raised-button color="accent" routerLink="/courses">VER TODOS OS CURSOS</button>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .prototype-indicator {
      background-color: #ff9800;
      color: white;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 500;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* Welcome Section */
    .welcome-section {
      padding: 40px 0;
      background-color: #f5f5f5;
      text-align: center;
    }

    .welcome-section h1 {
      font-size: 32px;
      color: #004789;
      margin: 0 0 8px;
    }

    .subtitle {
      font-size: 20px;
      color: #666;
      margin-bottom: 16px;
    }

    .description {
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Courses Section */
    .courses-section {
      padding: 40px 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .section-header h2 {
      color: #004789;
      margin: 0;
    }

    .search-field {
      min-width: 300px;
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .course-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .course-card img {
      height: 200px;
      object-fit: cover;
    }

    .course-card h3 {
      color: #004789;
      margin: 0 0 8px;
    }

    .course-description {
      flex-grow: 1;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .course-details {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }

    .detail-item mat-icon {
      font-size: 16px;
      height: 16px;
      width: 16px;
      line-height: 16px;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 8px 16px 16px !important;
      margin-top: auto;
    }

    /* Loading and Error States */
    .loading-container, .error-container, .no-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      text-align: center;
    }

    .error-container mat-icon, .no-results mat-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      margin-bottom: 16px;
    }

    .error-container p, .no-results p {
      margin-bottom: 16px;
      color: #666;
    }

    /* CTA Section */
    .cta-section {
      background-color: #004789;
      color: white;
      padding: 60px 0;
      text-align: center;
    }

    .cta-section h2 {
      font-size: 28px;
      margin: 0 0 16px;
    }

    .cta-section p {
      margin-bottom: 24px;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .search-field {
        width: 100%;
        min-width: auto;
      }

      .courses-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  // Observable para verificar o modo de protótipo
  isPrototypeMode$ = this.prototypeService.prototypeEnabled$;
  
  // Controle para a busca
  searchControl = new FormControl('');
  
  // Propriedades do carrossel
  carouselItems: CarouselItem[] = [];
  carouselLoading = true;
  
  // Propriedades da lista de cursos
  courses: Course[] = [];
  loading = true;
  error: string | null = null;
  
  constructor(
    private carouselService: CarouselService,
    private courseService: CourseService,
    private prototypeService: PrototypeService
  ) {}
  
  ngOnInit(): void {
    // Carregar itens do carrossel
    this.loadCarouselItems();
    
    // Carregar cursos
    this.loadCourses();
    
    // Configurar busca com debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.filterCourses(value || '');
      });
  }
  
  loadCarouselItems(): void {
    this.carouselLoading = true;
    this.carouselService.getCarouselItems().subscribe({
      next: (items) => {
        this.carouselItems = items;
        this.carouselLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar itens do carrossel:', err);
        this.carouselLoading = false;
      }
    });
  }
  
  loadCourses(): void {
    this.loading = true;
    this.error = null;
    
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Não foi possível carregar os cursos. Por favor, tente novamente mais tarde.';
        this.loading = false;
        console.error('Erro ao carregar cursos:', err);
      }
    });
  }
  
  filterCourses(searchText: string): void {
    if (!searchText.trim()) {
      this.loadCourses();
      return;
    }
    
    this.loading = true;
    this.error = null;
    
    // Filtra cursos localmente
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        const search = searchText.toLowerCase();
        this.courses = courses.filter(c => 
          c.name?.toLowerCase().includes(search) || 
          c.shortDescription?.toLowerCase().includes(search)
        ) || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao realizar a busca. Por favor, tente novamente.';
        this.loading = false;
        console.error('Erro ao buscar cursos:', err);
      }
    });
  }
}