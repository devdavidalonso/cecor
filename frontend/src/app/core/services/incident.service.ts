// src/app/core/services/incident.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Incident {
  id?: number;
  type: 'disciplinary' | 'infrastructure' | 'health' | 'safety' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'in_analysis' | 'resolved' | 'cancelled';
  
  // Optional relationships
  courseId?: number;
  courseName?: string;
  classSessionId?: number;
  studentId?: number;
  studentName?: string;
  
  // Reporter
  reportedById?: number;
  reportedByName?: string;
  
  // Resolution
  resolutionNotes?: string;
  resolvedById?: number;
  resolvedByName?: string;
  resolvedAt?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface IncidentFilters {
  type?: string;
  status?: string;
  severity?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface IncidentListResponse {
  data: Incident[];
  total: number;
  page: number;
  size: number;
}

export interface IncidentStatistics {
  total: number;
  byType: { [key: string]: number };
  byStatus: { [key: string]: number };
  bySeverity: { [key: string]: number };
  openCount: number;
  resolvedToday: number;
  openThisWeek: number;
}

export interface IncidentComment {
  id: number;
  incidentId: number;
  userId: number;
  userName: string;
  comment: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/incidents`;

  // List all incidents (admin view)
  listIncidents(filters: IncidentFilters = {}): Observable<IncidentListResponse> {
    let params = new HttpParams();
    
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.severity) params = params.set('severity', filters.severity);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.size) params = params.set('size', filters.size.toString());

    return this.http.get<IncidentListResponse>(this.baseUrl, { params });
  }

  // List incidents reported by current user
  listMyIncidents(filters: IncidentFilters = {}): Observable<IncidentListResponse> {
    let params = new HttpParams();
    
    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.severity) params = params.set('severity', filters.severity);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.size) params = params.set('size', filters.size.toString());

    return this.http.get<IncidentListResponse>(`${this.baseUrl}/my`, { params });
  }

  // Get incident by ID
  getIncident(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.baseUrl}/${id}`);
  }

  // Create new incident
  createIncident(incident: Partial<Incident>): Observable<Incident> {
    return this.http.post<Incident>(this.baseUrl, incident);
  }

  // Update incident
  updateIncident(id: number, incident: Partial<Incident>): Observable<Incident> {
    return this.http.put<Incident>(`${this.baseUrl}/${id}`, incident);
  }

  // Delete incident
  deleteIncident(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Resolve incident
  resolveIncident(id: number, resolutionNotes: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/resolve`, { resolutionNotes });
  }

  // Reopen incident
  reopenIncident(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/reopen`, {});
  }

  // Get incident comments
  getComments(incidentId: number): Observable<IncidentComment[]> {
    return this.http.get<IncidentComment[]>(`${this.baseUrl}/${incidentId}/comments`);
  }

  // Add comment
  addComment(incidentId: number, comment: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${incidentId}/comments`, { comment });
  }

  // Get statistics
  getStatistics(filters: IncidentFilters = {}): Observable<IncidentStatistics> {
    let params = new HttpParams();
    
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get<IncidentStatistics>(`${this.baseUrl}/statistics`, { params });
  }

  // Helper methods for labels
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'disciplinary': 'Disciplinar',
      'infrastructure': 'Infraestrutura',
      'health': 'Saúde',
      'safety': 'Segurança',
      'other': 'Outros'
    };
    return labels[type] || type;
  }

  getSeverityLabel(severity: string): string {
    const labels: { [key: string]: string } = {
      'low': 'Baixa',
      'medium': 'Média',
      'high': 'Alta',
      'critical': 'Crítica'
    };
    return labels[severity] || severity;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'open': 'Aberta',
      'in_analysis': 'Em Análise',
      'resolved': 'Resolvida',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }
}
