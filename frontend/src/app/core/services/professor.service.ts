import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Professor {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProfessorService {
  private apiUrl = `${environment.apiUrl}/professores`;

  constructor(private http: HttpClient) {}

  getProfessors(): Observable<Professor[]> {
    return this.http.get<Professor[]>(this.apiUrl);
  }

  getProfessor(id: number): Observable<Professor> {
    return this.http.get<Professor>(`${this.apiUrl}/${id}`);
  }

  createProfessor(professor: Professor): Observable<Professor> {
    return this.http.post<Professor>(this.apiUrl, professor);
  }

  updateProfessor(id: number, professor: Professor): Observable<Professor> {
    return this.http.put<Professor>(`${this.apiUrl}/${id}`, professor);
  }

  deleteProfessor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
