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
    startDate: new Date('2024-03-04'),
    endDate: new Date('2024-05-10'),
    coverImage: 'assets/images/courses/informatica-basica.jpg',
    status: 'active',
    prerequisites: 'Nenhum conhecimento prévio necessário'
  },
  {
    id: 3, // Changed ID to avoid conflict with existing course 1
    name: "Introdução à Programação",
    shortDescription: "Aprenda os conceitos básicos da lógica de programação e algoritmos.",
    detailedDescription: "Este curso é ideal para quem nunca programou antes. Abordaremos variáveis, estruturas de controle, loops e funções. Tudo com exemplos práticos e exercícios.",
    coverImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    workload: 40,
    maxStudents: 30,
    prerequisites: "Nenhum",
    difficultyLevel: "Beginner",
    targetAudience: "Iniciantes em tecnologia",
    weekDays: "Seg,Qua",
    startTime: "19:00",
    endTime: "21:00",
    duration: 8,
    startDate: new Date("2024-03-04"),
    endDate: new Date("2024-04-26"),
    status: "active",
    teacherId: 101, // ID numérico simulado
    category: "Technology"
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
    startDate: new Date('2024-03-05'),
    endDate: new Date('2024-05-23'),
    coverImage: 'assets/images/courses/corte-costura.jpg',
    status: 'active',
    prerequisites: 'Nenhum conhecimento prévio necessário'
  }
];
