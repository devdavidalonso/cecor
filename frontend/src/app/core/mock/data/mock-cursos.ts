// src/app/core/mock/data/mock-cursos.ts
import { Curso } from '../../models/curso.model';

export const MOCK_CURSOS: Curso[] = [
  {
    id: 1,
    nome: 'Informática Básica',
    descricaoResumida: 'Curso introdutório de informática para iniciantes',
    descricaoDetalhada: 'Aprenda os fundamentos da informática, incluindo uso do sistema operacional, navegação na internet, processamento de texto e planilhas eletrônicas. Este curso é ideal para quem tem pouco ou nenhum conhecimento em informática e deseja adquirir habilidades básicas para uso pessoal ou profissional.',
    cargaHoraria: 40,
    numeroMaximoAlunos: 20,
    diasSemanais: 'Segunda, Quarta e Sexta',
    horarioInicio: '09:00',
    horarioFim: '11:00',
    duracao: 10,
    imagemUrl: 'assets/images/cursos/informatica-basica.jpg',
    status: 'ativo',
    nivelDificuldade: 'Iniciante',
    publicoAlvo: 'Pessoas de todas as idades interessadas em aprender informática básica',
    requisitosPrevios: 'Nenhum conhecimento prévio necessário',
    professorNome: 'Professor Silva',
    professorId: 1,
    tags: ['informática', 'tecnologia', 'iniciante']
  },
  {
    id: 2,
    nome: 'Corte e Costura',
    descricaoResumida: 'Aprenda técnicas de corte e costura para iniciantes',
    descricaoDetalhada: 'Neste curso prático, você aprenderá as técnicas fundamentais de corte e costura, desde os primeiros pontos até a confecção de peças simples. O curso aborda o uso de máquina de costura, tipos de tecidos, técnicas de corte, montagem e acabamento.',
    cargaHoraria: 60,
    numeroMaximoAlunos: 15,
    diasSemanais: 'Terça e Quinta',
    horarioInicio: '14:00',
    horarioFim: '17:00',
    duracao: 12,
    imagemUrl: 'assets/images/cursos/corte-costura.jpg',
    status: 'ativo',
    nivelDificuldade: 'Iniciante',
    publicoAlvo: 'Interessados em aprender técnicas básicas de costura',
    requisitosPrevios: 'Nenhum conhecimento prévio necessário',
    professorNome: 'Professora Oliveira',
    professorId: 2,
    tags: ['corte', 'costura', 'moda', 'artesanato']
  },
  {
    id: 3,
    nome: 'Jiu-Jitsu Infantil',
    descricaoResumida: 'Aulas de jiu-jitsu para crianças de 8 a 12 anos',
    descricaoDetalhada: 'O curso de Jiu-Jitsu Infantil é destinado a crianças entre 8 e 12 anos, onde aprenderão técnicas básicas desta arte marcial de forma lúdica e educativa. O curso trabalha não apenas as habilidades físicas, mas também valores como disciplina, respeito e autoconfiança.',
    cargaHoraria: 36,
    numeroMaximoAlunos: 25,
    diasSemanais: 'Sábado',
    horarioInicio: '10:00',
    horarioFim: '12:00',
    duracao: 12,
    imagemUrl: 'assets/images/cursos/jiu-jitsu-infantil.jpg',
    status: 'ativo',
    nivelDificuldade: 'Iniciante',
    publicoAlvo: 'Crianças de 8 a 12 anos',
    requisitosPrevios: 'Nenhum conhecimento prévio necessário',
    professorNome: 'Professor Silva',
    professorId: 1,
    tags: ['jiu-jitsu', 'artes marciais', 'infantil', 'esporte']
  },
  {
    id: 4,
    nome: 'Pintura em Tela',
    descricaoResumida: 'Curso de pintura em tela para todas as idades',
    descricaoDetalhada: 'O curso de Pintura em Tela é destinado a pessoas de todas as idades que desejam aprender a expressar sua criatividade através da pintura. Serão abordadas técnicas básicas e intermediárias de pintura em tela, incluindo uso de cores, composição, luz e sombra.',
    cargaHoraria: 48,
    numeroMaximoAlunos: 15,
    diasSemanais: 'Quarta e Sexta',
    horarioInicio: '19:00',
    horarioFim: '21:00',
    duracao: 8,
    imagemUrl: 'assets/images/cursos/pintura-tela.jpg',
    status: 'ativo',
    nivelDificuldade: 'Iniciante a Intermediário',
    publicoAlvo: 'Pessoas de todas as idades interessadas em pintura',
    requisitosPrevios: 'Nenhum conhecimento prévio necessário',
    professorNome: 'Professora Oliveira',
    professorId: 2,
    tags: ['pintura', 'arte', 'criatividade']
  },
  {
    id: 5,
    nome: 'Violão para Iniciantes',
    descricaoResumida: 'Aprenda a tocar violão do zero',
    descricaoDetalhada: 'O curso de Violão para Iniciantes é destinado a pessoas que desejam aprender a tocar este instrumento desde o nível básico. Serão abordados temas como postura, técnicas de dedilhado, acordes básicos, ritmos populares e leitura de cifras simples.',
    cargaHoraria: 48,
    numeroMaximoAlunos: 12,
    diasSemanais: 'Segunda e Quarta',
    horarioInicio: '18:00',
    horarioFim: '20:00',
    duracao: 12,
    imagemUrl: 'assets/images/cursos/violao.jpg',
    status: 'ativo',
    nivelDificuldade: 'Iniciante',
    publicoAlvo: 'Pessoas a partir de 12 anos sem conhecimento prévio de violão',
    requisitosPrevios: 'Nenhum conhecimento prévio necessário',
    professorNome: 'Professor Santos',
    professorId: 3,
    tags: ['música', 'violão', 'instrumento musical']
  },
  {
    id: 6,
    nome: 'Culinária Básica',
    descricaoResumida: 'Fundamentos da culinária para o dia a dia',
    descricaoDetalhada: 'O curso de Culinária Básica é voltado para quem deseja aprender técnicas fundamentais na cozinha. Serão abordados temas como cortes de alimentos, métodos de cocção, temperos e ervas, além de receitas práticas para o dia a dia.',
    cargaHoraria: 40,
    numeroMaximoAlunos: 15,
    diasSemanais: 'Terça e Quinta',
    horarioInicio: '19:00',
    horarioFim: '21:00',
    duracao: 10,
    imagemUrl: 'assets/images/cursos/culinaria.jpg',
    status: 'ativo',
    nivelDificuldade: 'Iniciante',
    publicoAlvo: 'Pessoas interessadas em aprender a cozinhar',
    requisitosPrevios: 'Nenhum conhecimento prévio necessário',
    professorNome: 'Chef Garcia',
    professorId: 4,
    tags: ['culinária', 'gastronomia', 'cozinha']
  }
];