// src/app/core/services/report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly API_URL = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  // Relatório de frequência
  getAttendanceReport(courseId: number, startDate: string, endDate: string): Observable<any> {
    let params = new HttpParams()
      .set('courseId', courseId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.API_URL}/attendance`, { params });
  }

  // Relatório de desempenho
  getPerformanceReport(courseId: number, period: string, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams()
      .set('courseId', courseId.toString())
      .set('period', period);

    if (period === 'custom' && startDate && endDate) {
      params = params
        .set('startDate', startDate)
        .set('endDate', endDate);
    }

    return this.http.get<any>(`${this.API_URL}/performance`, { params });
  }

  // Exportação de Reports
  exportReport(reportType: string, format: string, params: any): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('format', format);

    // Adicionar todos os parâmetros de filtro
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return this.http.get(`${this.API_URL}/${reportType}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}