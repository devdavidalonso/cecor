// src/app/core/services/attendance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Attendance, AttendanceFilters, AttendanceStatus } from '../models/attendance.model';
import { PaginatedResponse } from '../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly API_URL = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  deleteAttendance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  registerBatch(attendances: Partial<Attendance>[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/registrar`, attendances);
  }

  getClassAttendance(courseId: number, date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.API_URL}/curso/${courseId}/data/${date}`);
  }

  getStudentHistory(studentId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.API_URL}/aluno/${studentId}`);
  }

  getStudentPercentage(studentId: number, courseId: number): Observable<{ percentage: number }> {
    return this.http.get<{ percentage: number }>(`${this.API_URL}/aluno/${studentId}/percentual`, {
      params: new HttpParams().set('curso_id', courseId.toString())
    });
  }

  // Legacy/Generic methods (optional to keep or remove depending on usage)
  getAttendance(filters: AttendanceFilters, page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<Attendance>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (filters.courseId) params = params.set('courseId', filters.courseId.toString());
    if (filters.studentId) params = params.set('studentId', filters.studentId.toString());
    if (filters.status) params = params.set('status', filters.status);
    
    return this.http.get<PaginatedResponse<Attendance>>(this.API_URL, { params });
  }
}