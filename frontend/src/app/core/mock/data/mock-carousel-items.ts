// src/app/core/mock/data/mock-carousel-items.ts
import { CarouselItem } from '../../models/carousel-item.model';

export const MOCK_CAROUSEL_ITEMS: CarouselItem[] = [
  {
    id: 1,
    imageUrl: 'assets/images/carousel/slide1.jpg',
    title: 'Cursos para todas as idades',
    description: 'Oferecemos diversos cursos gratuitos para pessoas de todas as idades e níveis de experiência.',
    buttonText: 'Conheça nossos cursos',
    buttonLink: '/cursos',
    order: 1,
    active: true
  },
  {
    id: 2,
    imageUrl: 'assets/images/carousel/slide2.jpg',
    title: 'Aprenda novas habilidades',
    description: 'Desenvolva habilidades profissionais e pessoais com nossos cursos ministrados por professores qualificados.',
    buttonText: 'Matricule-se agora',
    buttonLink: '/cursos',
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

