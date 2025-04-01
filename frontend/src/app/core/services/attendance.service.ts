// src/app/core/services/attendance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Attendance, AttendanceFilters, AbsenceJustification, AbsenceAlert } from '@core/models/attendance.model';
import { PaginatedResponse } from '@core/models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private readonly API_URL = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getAttendance(filters: AttendanceFilters, page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<Attendance>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (filters.courseId) params = params.set('courseId', filters.courseId.toString());
    if (filters.studentId) params = params.set('studentId', filters.studentId.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.startDate) params = params.set('startDate', filters.startDate.toISOString());
    if (filters.endDate) params = params.set('endDate', filters.endDate.toISOString());
    
    return this.http.get<PaginatedResponse<Attendance>>(this.API_URL, { params });
  }

  getAttendanceById(id: number): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.API_URL}/${id}`);
  }

  registerAttendance(attendance: Partial<Attendance>): Observable<Attendance> {
    return this.http.post<Attendance>(this.API_URL, attendance);
  }

  updateAttendance(id: number, attendance: Partial<Attendance>): Observable<Attendance> {
    return this.http.put<Attendance>(`${this.API_URL}/${id}`, attendance);
  }

  deleteAttendance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // Métodos para justificativas de ausência
  getJustifications(studentId?: number, courseId?: number): Observable<AbsenceJustification[]> {
    let params = new HttpParams();
    if (studentId) params = params.set('studentId', studentId.toString());
    if (courseId) params = params.set('courseId', courseId.toString());
    
    return this.http.get<AbsenceJustification[]>(`${this.API_URL}/justifications`, { params });
  }

  submitJustification(justification: Partial<AbsenceJustification>): Observable<AbsenceJustification> {
    return this.http.post<AbsenceJustification>(`${this.API_URL}/justifications`, justification);
  }

  // Métodos para alertas de ausência
  getAlerts(status?: string): Observable<AbsenceAlert[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    
    return this.http.get<AbsenceAlert[]>(`${this.API_URL}/alerts`, { params });
  }

  resolveAlert(id: number, resolution: { resolutionNotes: string }): Observable<AbsenceAlert> {
    return this.http.put<AbsenceAlert>(`${this.API_URL}/alerts/${id}/resolve`, resolution);
  }

  // Relatórios de presença
  getAttendanceReport(courseId: number, startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams().set('courseId', courseId.toString());
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    
    return this.http.get<any>(`${this.API_URL}/report`, { params });
  }
}