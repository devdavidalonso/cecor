// src/app/features/alunos/services/aluno.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Aluno {
  id?: number;
  nome: string;
  dataNascimento: Date;
  idade?: number;
  cpf: string;
  email: string;
  telefonePrincipal: string;
  telefoneAdicional?: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  informacoesMedicas?: string;
  necessidadesEspeciais?: string;
  responsaveis: Array<{
    id?: number;
    nome: string;
    cpf?: string;
    grauParentesco: string;
    email?: string;
    telefone: string;
    permissoes: {
      retirarAluno: boolean;
      receberNotificacoes: boolean;
      autorizarAtividades: boolean;
    }
  }>;
  documentos?: Array<{
    id?: number;
    tipo: string;
    nome: string;
    url: string;
    dataUpload: Date;
  }>;
  observacoes?: string;
  observacaoConfidencial?: boolean;
  status?: string;
  numeroMatricula?: string;
  dataCadastro?: Date;
  dataUltimaAtualizacao?: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlunoService {
  private apiUrl = `${environment.apiUrl}/alunos`;

  constructor(private http: HttpClient) { }

  /**
   * Obter lista paginada de alunos com filtros opcionais
   */
  getAlunos(
    page: number = 1, 
    pageSize: number = 20, 
    filtros?: { [key: string]: any }
  ): Observable<PaginatedResponse<Aluno>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // Adicionar filtros se existirem
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          params = params.set(key, filtros[key].toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Aluno>>(this.apiUrl, { params });
  }

  /**
   * Obter aluno pelo ID
   */
  getAlunoPorId(id: number): Observable<Aluno> {
    return this.http.get<Aluno>(`${this.apiUrl}/${id}`);
  }

  /**
   * Criar novo aluno
   */
  criarAluno(formData: FormData): Observable<Aluno> {
    return this.http.post<Aluno>(this.apiUrl, formData);
  }

  /**
   * Atualizar aluno existente
   */
  atualizarAluno(formData: FormData): Observable<Aluno> {
    // Extrair ID do aluno do formData (está dentro do campo 'aluno' como JSON)
    const alunoJson = formData.get('aluno') as string;
    const aluno = JSON.parse(alunoJson);
    const id = aluno.id;

    return this.http.put<Aluno>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Excluir aluno
   */
  excluirAluno(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obter responsáveis de um aluno
   */
  getResponsaveis(alunoId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.apiUrl}/${alunoId}/responsaveis`);
  }

  /**
   * Adicionar responsável ao aluno
   */
  adicionarResponsavel(alunoId: number, responsavel: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${alunoId}/responsaveis`, responsavel);
  }

  /**
   * Obter documentos de um aluno
   */
  getDocumentos(alunoId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.apiUrl}/${alunoId}/documentos`);
  }

  /**
   * Obter notas/observações de um aluno
   */
  getNotas(alunoId: number, incluirConfidenciais: boolean = false): Observable<Array<any>> {
    let params = new HttpParams()
      .set('incluirConfidenciais', incluirConfidenciais.toString());
    
    return this.http.get<Array<any>>(`${this.apiUrl}/${alunoId}/notas`, { params });
  }

  /**
   * Adicionar nota/observação ao aluno
   */
  adicionarNota(alunoId: number, nota: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${alunoId}/notas`, nota);
  }
}