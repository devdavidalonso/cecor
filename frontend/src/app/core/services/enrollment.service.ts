// src/app/core/services/enrollment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Enrollment } from '@core/models/enrollment.model';
import { PaginatedResponse } from '@core/models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private readonly API_URL = `${environment.apiUrl}/matriculas`;

  constructor(private http: HttpClient) {}

  getEnrollments(page: number = 1, pageSize: number = 20, filters?: any): Observable<PaginatedResponse<Enrollment>> {
    const params = { page: page.toString(), pageSize: pageSize.toString(), ...filters };
    return this.http.get<PaginatedResponse<Enrollment>>(this.API_URL, { params });
  }

  getEnrollmentById(id: number): Observable<Enrollment> {
    return this.http.get<Enrollment>(`${this.API_URL}/${id}`);
  }

  createEnrollment(enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.post<Enrollment>(this.API_URL, enrollment);
  }

  updateEnrollment(id: number, enrollment: Partial<Enrollment>): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.API_URL}/${id}`, enrollment);
  }

  deleteEnrollment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}