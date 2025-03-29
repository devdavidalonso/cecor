// src/app/core/services/curso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Curso, PaginatedResponse } from '../models/curso.model';
import { PrototypeService } from './prototype/prototype.service';

// Dados mockados para o modo de protótipo
const MOCK_CURSOS: Curso[] = [
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

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private apiUrl = `${environment.apiUrl}/cursos`;
  
  constructor(
    private http: HttpClient,
    private prototypeService: PrototypeService
  ) {}
  
  /**
   * Obtém uma lista paginada de cursos
   */
  getCursos(page: number = 1, pageSize: number = 20, filtros?: any): Observable<PaginatedResponse<Curso>> {
    // Se estiver no modo protótipo, retorna dados mockados
    if (this.prototypeService.isPrototypeEnabled()) {
      let cursosFiltrados = [...MOCK_CURSOS];
      
      // Aplica filtros se fornecidos
      if (filtros) {
        if (filtros.status) {
          cursosFiltrados = cursosFiltrados.filter(c => c.status === filtros.status);
        }
        
        if (filtros.professorId) {
          cursosFiltrados = cursosFiltrados.filter(c => c.professorId === filtros.professorId);
        }
        
        if (filtros.nivelDificuldade) {
          cursosFiltrados = cursosFiltrados.filter(c => c.nivelDificuldade === filtros.nivelDificuldade);
        }
      }
      
      // Calcular paginação
      const totalItems = cursosFiltrados.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedCursos = cursosFiltrados.slice(start, end);
      
      const response: PaginatedResponse<Curso> = {
        data: paginatedCursos,
        page,
        pageSize,
        totalItems,
        totalPages
      };
      
      return of(response).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    // Adiciona filtros à query, se houver
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] != null) {
          params = params.set(key, filtros[key].toString());
        }
      });
    }
    
    return this.http.get<PaginatedResponse<Curso>>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('Erro ao obter cursos:', error);
        
        // Retorna dados mockados em caso de erro
        const mockResponse: PaginatedResponse<Curso> = {
          data: MOCK_CURSOS,
          page: 1,
          pageSize: MOCK_CURSOS.length,
          totalItems: MOCK_CURSOS.length,
          totalPages: 1
        };
        
        return of(mockResponse);
      })
    );
  }
  
  /**
   * Obtém um curso pelo ID
   */
  getCursoById(id: number): Observable<Curso | null> {
    // Se estiver no modo protótipo, retorna dados mockados
    if (this.prototypeService.isPrototypeEnabled()) {
      const curso = MOCK_CURSOS.find(c => c.id === id) || null;
      return of(curso).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.get<Curso>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Erro ao obter curso com ID ${id}:`, error);
        
        // Retorna null em caso de erro
        return of(null);
      })
    );
  }

  
  
  /**
   * Busca cursos por termo
   */
  searchCursos(searchTerm: string): Observable<PaginatedResponse<Curso>> {
    // Se estiver no modo protótipo, filtra os cursos mockados
    if (this.prototypeService.isPrototypeEnabled()) {
      // Converte para minúsculas para busca case-insensitive
      const term = searchTerm.toLowerCase();
      
      // Filtra os cursos que contêm o termo no nome ou descrição
      const cursosFiltrados = MOCK_CURSOS.filter(curso => 
        curso.nome.toLowerCase().includes(term) || 
        curso.descricaoResumida.toLowerCase().includes(term) ||
        (curso.tags && curso.tags.some(tag => tag.toLowerCase().includes(term)))
      );
      
      const response: PaginatedResponse<Curso> = {
        data: cursosFiltrados,
        page: 1,
        pageSize: cursosFiltrados.length,
        totalItems: cursosFiltrados.length,
        totalPages: 1
      };
      
      return of(response).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    let params = new HttpParams().set('search', searchTerm);
    
    return this.http.get<PaginatedResponse<Curso>>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(error => {
        console.error('Erro ao buscar cursos:', error);
        
        // Em caso de erro, retorna um array vazio
        const emptyResponse: PaginatedResponse<Curso> = {
          data: [],
          page: 1,
          pageSize: 0,
          totalItems: 0,
          totalPages: 0
        };
        
        return of(emptyResponse);
      })
    );
  }
  
  /**
   * Cria um novo curso (apenas admin)
   */
  createCurso(curso: Omit<Curso, 'id'>): Observable<Curso> {
    // Se estiver no modo protótipo, simula a criação
    if (this.prototypeService.isPrototypeEnabled()) {
      const newCurso: Curso = {
        ...curso,
        id: Math.max(0, ...MOCK_CURSOS.map(c => c.id)) + 1
      };
      
      MOCK_CURSOS.push(newCurso);
      return of(newCurso).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.post<Curso>(this.apiUrl, curso);
  }
  
  /**
   * Atualiza um curso existente (apenas admin)
   */
  updateCurso(id: number, curso: Partial<Curso>): Observable<Curso> {
    // Se estiver no modo protótipo, simula a atualização
    if (this.prototypeService.isPrototypeEnabled()) {
      const index = MOCK_CURSOS.findIndex(c => c.id === id);
      
      if (index !== -1) {
        MOCK_CURSOS[index] = {
          ...MOCK_CURSOS[index],
          ...curso
        };
        
        return of(MOCK_CURSOS[index]).pipe(delay(500));
      }
      
      return of({
        id: -1,
        nome: 'Curso não encontrado',
        descricaoResumida: '',
        descricaoDetalhada: '',
        cargaHoraria: 0,
        numeroMaximoAlunos: 0,
        diasSemanais: '',
        horarioInicio: '',
        horarioFim: '',
        duracao: 0,
        status: 'inativo'
      }).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.put<Curso>(`${this.apiUrl}/${id}`, curso);
  }
  
  /**
   * Remove um curso (apenas admin)
   */
  deleteCurso(id: number): Observable<void> {
    // Se estiver no modo protótipo, simula a remoção
    if (this.prototypeService.isPrototypeEnabled()) {
      const index = MOCK_CURSOS.findIndex(c => c.id === id);
      
      if (index !== -1) {
        MOCK_CURSOS.splice(index, 1);
      }
      
      return of(undefined).pipe(delay(500));
    }
    
    // Caso contrário, faz a requisição à API
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}