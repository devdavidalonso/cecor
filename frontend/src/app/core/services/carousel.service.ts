// src/app/core/services/carousel.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { CarouselItem } from '../models/carousel-item.model';
import { PrototypeService } from './prototype/prototype.service';

// Dados mockados para o modo de protótipo
const MOCK_CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 1,
    imageUrl: 'assets/images/carousel/slide1.jpg',
    title: 'Cursos para todas as idades',
    description: 'Oferecemos diversos cursos gratuitos para pessoas de todas as idades e níveis de experiência.',
    buttonText: 'Conheça nossos cursos',
    buttonLink: '/courses',
    order: 1,
    active: true
  },
  {
    id: 2,
    imageUrl: 'assets/images/carousel/slide2.jpg',
    title: 'Aprenda novas habilidades',
    description: 'Desenvolva habilidades profissionais e pessoais com nossos cursos ministrados por professores qualificados.',
    buttonText: 'Matricule-se agora',
    buttonLink: '/courses',
    order: 2,
    active: true
  },
  {
    id: 3,
    imageUrl: 'assets/images/carousel/slide3.jpg',
    title: 'Transforme seu futuro',
    description: 'Invista em sua educação e transforme seu futuro com os cursos gratuitos do CECOR.',
    buttonText: 'Saiba mais',
    buttonLink: '/sobre',
    order: 3,
    active: true
  }
];

@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  private apiUrl = `${environment.apiUrl}/carousel`;
  
  constructor(
    private http: HttpClient,
    private prototypeService: PrototypeService
  ) {}
  
  /**
   * Obtém os itens do carrossel
   */
  getCarouselItems(): Observable<CarouselItem[]> {
    // Se estiver no modo protótipo, retorna dados mockados
    if (this.prototypeService.isPrototypeEnabled()) {
      return of(MOCK_CAROUSEL_ITEMS).pipe(
        delay(500) // Simular latência de rede
      );
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.get<CarouselItem[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('Erro ao obter itens do carrossel:', error);
        // Retorna dados mockados em caso de erro
        return of(MOCK_CAROUSEL_ITEMS);
      })
    );
  }
  
  /**
   * Adiciona um novo item ao carrossel (apenas admin)
   */
  addCarouselItem(item: Omit<CarouselItem, 'id'>): Observable<CarouselItem> {
    // Se estiver no modo protótipo, simula a adição
    if (this.prototypeService.isPrototypeEnabled()) {
      const newItem: CarouselItem = {
        ...item,
        id: Math.max(0, ...MOCK_CAROUSEL_ITEMS.map(i => i.id)) + 1
      };
      
      MOCK_CAROUSEL_ITEMS.push(newItem);
      return of(newItem).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.post<CarouselItem>(this.apiUrl, item);
  }
  
  /**
   * Atualiza um item do carrossel existente (apenas admin)
   */
  updateCarouselItem(id: number, item: Partial<CarouselItem>): Observable<CarouselItem> {
    // Se estiver no modo protótipo, simula a atualização
    if (this.prototypeService.isPrototypeEnabled()) {
      const index = MOCK_CAROUSEL_ITEMS.findIndex(i => i.id === id);
      
      if (index !== -1) {
        MOCK_CAROUSEL_ITEMS[index] = {
          ...MOCK_CAROUSEL_ITEMS[index],
          ...item
        };
        
        return of(MOCK_CAROUSEL_ITEMS[index]).pipe(delay(500));
      }
      
      return of({
        id: -1,
        imageUrl: '',
        title: 'Item não encontrado'
      } as CarouselItem).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.put<CarouselItem>(`${this.apiUrl}/${id}`, item);
  }
  
  /**
   * Remove um item do carrossel (apenas admin)
   */
  deleteCarouselItem(id: number): Observable<void> {
    // Se estiver no modo protótipo, simula a remoção
    if (this.prototypeService.isPrototypeEnabled()) {
      const index = MOCK_CAROUSEL_ITEMS.findIndex(i => i.id === id);
      
      if (index !== -1) {
        MOCK_CAROUSEL_ITEMS.splice(index, 1);
      }
      
      return of(undefined).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Reordena os itens do carrossel (apenas admin)
   */
  reorderCarouselItems(itemIds: number[]): Observable<void> {
    // Se estiver no modo protótipo, simula a reordenação
    if (this.prototypeService.isPrototypeEnabled()) {
      // Atualiza a ordem dos itens mockados
      itemIds.forEach((id, index) => {
        const item = MOCK_CAROUSEL_ITEMS.find(i => i.id === id);
        if (item) {
          item.order = index + 1;
        }
      });
      
      // Ordena o array mockado
      MOCK_CAROUSEL_ITEMS.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return of(undefined).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.post<void>(`${this.apiUrl}/reorder`, { itemIds });
  }
}