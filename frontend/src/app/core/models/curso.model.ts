// src/app/core/models/curso.model.ts
export interface Curso {
    id: number;
    nome: string;
    descricaoResumida: string;
    descricaoDetalhada: string;
    cargaHoraria: number;
    numeroMaximoAlunos: number;
    diasSemanais: string;
    horarioInicio: string;
    horarioFim: string;
    duracao: number;
    imagemUrl?: string;
    status: string;
    nivelDificuldade?: string;
    publicoAlvo?: string;
    requisitosPrevios?: string;
    professorNome?: string;
    professorId?: number;
    tags?: string[];
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }