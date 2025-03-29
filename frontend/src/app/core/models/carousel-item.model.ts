// src/app/core/models/carousel-item.model.ts
export interface CarouselItem {
    id: number;
    imageUrl: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    order?: number;
    active?: boolean;
  }