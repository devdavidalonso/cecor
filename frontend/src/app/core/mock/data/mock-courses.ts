// src/app/core/mock/data/mock-courses.ts
import { Course } from '../../services/course.service';

export const MOCK_COURSES: Course[] = [
  {
    id: 1,
    name: 'Informática Básica',
    shortDescription: 'Curso introdutório de informática para iniciantes',
    detailedDescription: 'Aprenda os fundamentos da informática, incluindo uso do sistema operacional, navegação na internet, processamento de texto e planilhas eletrônicas. Este curso é ideal para quem tem pouco ou nenhum conhecimento em informática e deseja adquirir habilidades básicas para uso pessoal ou profissional.',
    workload: 40,
    maxStudents: 20,
    weekDays: 'Segunda, Quarta e Sexta',
    startTime: '09:00',
    endTime: '11:00',
    duration: 10,
    coverImage: 'assets/images/courses/informatica-basica.jpg',
    status: 'active',
    difficultyLevel: 'Iniciante',
    targetAudience: 'Pessoas de todas as idades interessadas em aprender informática básica',
    prerequisites: 'Nenhum conhecimento prévio necessário',
    tags: '["informática", "tecnologia", "iniciante"]'
  },
  {
    id: 2,
    name: 'Corte e Costura',
    shortDescription: 'Aprenda técnicas de corte e costura para iniciantes',
    detailedDescription: 'Neste curso prático, você aprenderá as técnicas fundamentais de corte e costura, desde os primeiros pontos até a confecção de peças simples. O curso aborda o uso de máquina de costura, tipos de tecidos, técnicas de corte, montagem e acabamento.',
    workload: 60,
    maxStudents: 15,
    weekDays: 'Terça e Quinta',
    startTime: '14:00',
    endTime: '17:00',
    duration: 12,
    coverImage: 'assets/images/courses/corte-costura.jpg',
    status: 'active',
    difficultyLevel: 'Iniciante',
    targetAudience: 'Interessados em aprender técnicas básicas de costura',
    prerequisites: 'Nenhum conhecimento prévio necessário',
    tags: '["costura", "artesanato", "moda"]'
  }
];
