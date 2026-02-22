// src/app/core/services/interview.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FormDefinition, InterviewResponse, InterviewStatus } from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private readonly apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  // ==================== ADMIN: Form Definitions ====================

  /**
   * Lista todos os formulários de entrevista
   */
  listForms(): Observable<FormDefinition[]> {
    return this.http.get<FormDefinition[]>(`${this.apiUrl}/admin/interview-forms`)
      .pipe(
        catchError(error => {
          console.error('Error loading forms:', error);
          return of([]);
        })
      );
  }

  /**
   * Busca um formulário específico por ID
   */
  getForm(id: string): Observable<FormDefinition | null> {
    return this.http.get<FormDefinition>(`${this.apiUrl}/admin/interview-forms/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error loading form:', error);
          return of(null);
        })
      );
  }

  /**
   * Cria um novo formulário
   */
  createForm(form: FormDefinition): Observable<FormDefinition | null> {
    return this.http.post<FormDefinition>(`${this.apiUrl}/admin/interview-forms`, form)
      .pipe(
        catchError(error => {
          console.error('Error creating form:', error);
          return of(null);
        })
      );
  }

  /**
   * Atualiza um formulário existente
   */
  updateForm(id: string, form: FormDefinition): Observable<boolean> {
    return this.http.put(`${this.apiUrl}/admin/interview-forms/${id}`, form, { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(error => {
          console.error('Error updating form:', error);
          return of(false);
        })
      );
  }

  /**
   * Remove um formulário
   */
  deleteForm(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/admin/interview-forms/${id}`, { observe: 'response' })
      .pipe(
        map(response => response.status === 204),
        catchError(error => {
          console.error('Error deleting form:', error);
          return of(false);
        })
      );
  }

  /**
   * Ativa um formulário
   */
  activateForm(id: string): Observable<boolean> {
    return this.http.patch(`${this.apiUrl}/admin/interview-forms/${id}/activate`, {}, { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(error => {
          console.error('Error activating form:', error);
          return of(false);
        })
      );
  }

  /**
   * Desativa um formulário
   */
  deactivateForm(id: string): Observable<boolean> {
    return this.http.patch(`${this.apiUrl}/admin/interview-forms/${id}/deactivate`, {}, { observe: 'response' })
      .pipe(
        map(response => response.status === 200),
        catchError(error => {
          console.error('Error deactivating form:', error);
          return of(false);
        })
      );
  }

  // ==================== Interview Responses ====================

  /**
   * Verifica se um aluno tem entrevista pendente
   */
  getPendingInterview(studentId: number): Observable<FormDefinition | null> {
    return this.http.get<FormDefinition>(`${this.apiUrl}/interviews/pending?studentId=${studentId}`)
      .pipe(
        catchError(error => {
          if (error.status === 204) {
            return of(null); // No pending interview
          }
          console.error('Error checking pending interview:', error);
          return of(null);
        })
      );
  }

  /**
   * Verifica status da entrevista de um aluno
   */
  checkInterviewStatus(studentId: number): Observable<InterviewStatus | null> {
    return this.http.get<InterviewStatus>(`${this.apiUrl}/interviews/check?studentId=${studentId}`)
      .pipe(
        catchError(error => {
          console.error('Error checking interview status:', error);
          return of(null);
        })
      );
  }

  /**
   * Submete respostas da entrevista
   */
  submitResponse(response: InterviewResponse): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/interviews/response`, response, { observe: 'response' })
      .pipe(
        map(response => response.status === 201),
        catchError(error => {
          console.error('Error submitting response:', error);
          return of(false);
        })
      );
  }

  /**
   * Busca resposta da entrevista de um aluno
   */
  getStudentInterview(studentId: number): Observable<InterviewResponse | null> {
    return this.http.get<InterviewResponse>(`${this.apiUrl}/interviews/student/${studentId}`)
      .pipe(
        catchError(error => {
          console.error('Error loading student interview:', error);
          return of(null);
        })
      );
  }

  /**
   * Lista todas as respostas de um formulário específico
   */
  getFormResponses(version: string): Observable<InterviewResponse[]> {
    return this.http.get<InterviewResponse[]>(`${this.apiUrl}/admin/interview-forms/${version}/responses`)
      .pipe(
        catchError(error => {
          console.error('Error loading form responses:', error);
          return of([]);
        })
      );
  }
}
