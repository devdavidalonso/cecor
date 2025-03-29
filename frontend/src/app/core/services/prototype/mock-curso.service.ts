// src/app/core/services/prototype/mock-curso.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Curso, PaginatedResponse } from '../curso.service';

@Injectable()
export class MockCursoService {
  // Dados mockados para cursos
  private cursos: Curso[] = [
    {
      id: 1,
      nome: 'Informática Básica',
      descricaoResumida: 'Curso introdutório de informática para iniciantes',
      descricaoDetalhada: 'Aprenda os fundamentos da informática, incluindo uso do sistema operacional, navegação na internet, processamento de texto e planilhas eletrônicas. Este curso é ideal para quem tem pouco ou nenhum conhecimento em informática e deseja adquirir habilidades básicas para uso pessoal ou profissional.',
      cargaHoraria: 40,
      numeroMaximoAlunos: 20,
      diasSemanais: '1,3,5', // Segunda, Quarta e Sexta
      horarioInicio: '09:00',
      horarioFim: '11:00',
      duracao: 10, // Em semanas
      status: 'ativo',
      nivelDificuldade: 'Iniciante',
      publicoAlvo: 'Pessoas de todas as idades interessadas em aprender informática básica',
      requisitosPrevios: 'Nenhum conhecimento prévio necessário',
      tags: 'informática,tecnologia,iniciante',
      imagemUrl: 'assets/images/cursos/informatica-basica.jpg'
    },
    {
      id: 2,
      nome: 'Corte e Costura',
      descricaoResumida: 'Aprenda técnicas de corte e costura para iniciantes',
      descricaoDetalhada: 'Neste curso prático, você aprenderá as técnicas fundamentais de corte e costura, desde a escolha de tecidos até a finalização de peças. Ideal para iniciantes que desejam aprender a criar e ajustar suas próprias roupas, desenvolver habilidades para empreendimentos em costura ou simplesmente adquirir conhecimentos para uso doméstico.',
      cargaHoraria: 60,
      numeroMaximoAlunos: 15,
      diasSemanais: '2,4', // Terça e Quinta
      horarioInicio: '14:00',
      horarioFim: '17:00',
      duracao: 12, // Em semanas
      status: 'ativo',
      nivelDificuldade: 'Iniciante',
      publicoAlvo: 'Jovens e adultos interessados em aprender costura',
      requisitosPrevios: 'Nenhum conhecimento prévio necessário',
      tags: 'costura,moda,artesanato',
      imagemUrl: 'assets/images/cursos/corte-costura.jpg'
    },
    {
      id: 3,
      nome: 'Jiu-Jitsu Infantil',
      descricaoResumida: 'Aulas de jiu-jitsu para crianças de 8 a 12 anos',
      descricaoDetalhada: 'O curso de Jiu-Jitsu Infantil oferece aulas adaptadas para crianças, focando no desenvolvimento da disciplina, coordenação motora e autoconfiança. As técnicas são ensinadas de forma lúdica e segura, promovendo valores como respeito, perseverança e trabalho em equipe.',
      cargaHoraria: 36,
      numeroMaximoAlunos: 25,
      diasSemanais: '6', // Sábado
      horarioInicio: '10:00',
      horarioFim: '12:00',
      duracao: 12, // Em semanas
      status: 'ativo',
      nivelDificuldade: 'Iniciante',
      publicoAlvo: 'Crianças de 8 a 12 anos',
      requisitosPrevios: 'Nenhum conhecimento prévio necessário',
      tags: 'jiu-jitsu,esporte,infantil',
      imagemUrl: 'assets/images/cursos/jiu-jitsu-infantil.jpg'
    },
    {
      id: 4,
      nome: 'Pintura em Tela',
      descricaoResumida: 'Curso de pintura em tela para todas as idades',
      descricaoDetalhada: 'O curso de Pintura em Tela oferece uma introdução às técnicas básicas de pintura acrílica, composição de cores e elementos artísticos. Os participantes aprenderão a criar suas próprias obras, desenvolver um estilo pessoal e explorar sua criatividade através das artes visuais.',
      cargaHoraria: 48,
      numeroMaximoAlunos: 15,
      diasSemanais: '3,5', // Quarta e Sexta
      horarioInicio: '19:00',
      horarioFim: '21:00',
      duracao: 8, // Em semanas
      status: 'ativo',
      nivelDificuldade: 'Iniciante a Intermediário',
      publicoAlvo: 'Pessoas de todas as idades interessadas em pintura',
      requisitosPrevios: 'Nenhum conhecimento prévio necessário',
      tags: 'pintura,arte,criatividade',
      imagemUrl: 'assets/images/cursos/pintura-tela.jpg'
    }
  ];
  
  constructor() {
    console.log('MockCursoService inicializado');
  }
  
  /**
   * Obtém uma lista paginada de cursos (simulada)
   */
  getCursos(page: number = 1, pageSize: number = 20, filtros?: any): Observable<PaginatedResponse<Curso>> {
    // Aplicar filtros se fornecidos
    let cursosFiltrados = [...this.cursos];
    
    if (filtros) {
      // Filtrar por nome
      if (filtros.nome) {
        const nome = filtros.nome.toLowerCase();
        cursosFiltrados = cursosFiltrados.filter(c => 
          c.nome.toLowerCase().includes(nome)
        );
      }
      
      // Filtrar por status
      if (filtros.status) {
        cursosFiltrados = cursosFiltrados.filter(c => 
          c.status === filtros.status
        );
      }
      
      // Adicione mais filtros conforme necessário
    }
    
    // Aplicar paginação
    const total = cursosFiltrados.length;
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const paginatedCursos = cursosFiltrados.slice(start, end);
    
    // Criar resposta paginada
    const response: PaginatedResponse<Curso> = {
      data: paginatedCursos,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
    
    // Simular atraso de rede para experiência mais realista
    return of(response).pipe(delay(800));
  }
  
  /**
   * Obtém um curso específico pelo ID (simulado)
   */
  getCursoById(id: number): Observable<Curso> {
    const curso = this.cursos.find(c => c.id === id);
    
    if (!curso) {
      // Simular erro 404
      return throwError(() => new Error('Curso não encontrado')).pipe(delay(800));
    }
    
    // Simular atraso de rede
    return of(curso).pipe(delay(800));
  }
  
  /**
   * Cria um novo curso (simulado)
   */
  criarCurso(curso: Curso): Observable<Curso> {
    // Gerar ID para o novo curso
    const novoCurso: Curso = {
      ...curso,
      id: Math.max(...this.cursos.map(c => c.id || 0)) + 1
    };
    
    // Adicionar curso à lista
    this.cursos.push(novoCurso);
    
    // Simular atraso de rede
    return of(novoCurso).pipe(delay(800));
  }
  
  /**
   * Atualiza um curso existente (simulado)
   */
  atualizarCurso(id: number, curso: Curso): Observable<Curso> {
    const index = this.cursos.findIndex(c => c.id === id);
    
    if (index === -1) {
      // Simular erro 404
      return throwError(() => new Error('Curso não encontrado')).pipe(delay(800));
    }
    
    // Atualizar curso
    const cursoAtualizado: Curso = {
      ...this.cursos[index],
      ...curso,
      id // Garantir que o ID não seja alterado
    };
    
    this.cursos[index] = cursoAtualizado;
    
    // Simular atraso de rede
    return of(cursoAtualizado).pipe(delay(800));
  }
  
  /**
   * Exclui um curso (exclusão lógica simulada)
   */
  excluirCurso(id: number): Observable<void> {
    const index = this.cursos.findIndex(c => c.id === id);
    
    if (index === -1) {
      // Simular erro 404
      return throwError(() => new Error('Curso não encontrado')).pipe(delay(800));
    }
    
    // Exclusão lógica (alterar status para 'inativo')
    this.cursos[index] = {
      ...this.cursos[index],
      status: 'inativo'
    };
    
    // Simular atraso de rede
    return of(void 0).pipe(delay(800));
  }
  
  /**
   * Obtém cursos em destaque para a página inicial (simulado)
   */
  getCursosDestaque(limite: number = 4): Observable<Curso[]> {
    const cursosAtivos = this.cursos.filter(c => c.status === 'ativo');
    const cursosDestaque = cursosAtivos.slice(0, limite);
    
    // Simular atraso de rede
    return of(cursosDestaque).pipe(delay(800));
  }
  
  /**
   * Busca cursos por termo de pesquisa (simulado)
   */
  buscarCursos(termo: string, page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<Curso>> {
    // Reutilizar getCursos com filtro de nome
    return this.getCursos(page, pageSize, { nome: termo });
  }
}