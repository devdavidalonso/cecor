// src/app/core/services/notification.service.ts
import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);
  
  private notifications = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notifications.asObservable();

  private unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCount.asObservable();

  // Toast Notifications (SnackBar)
  showSuccess(message: string, action: string = 'Fechar', duration: number = 3000): void {
    this.show(message, action, 'success', duration);
  }

  showError(message: string, action: string = 'Fechar', duration: number = 5000): void {
    this.show(message, action, 'error', duration);
  }

  showWarning(message: string, action: string = 'Fechar', duration: number = 4000): void {
    this.show(message, action, 'warning', duration);
  }

  showInfo(message: string, action: string = 'Fechar', duration: number = 3000): void {
    this.show(message, action, 'info', duration);
  }

  private show(message: string, action: string, type: string, duration: number): void {
    const config: MatSnackBarConfig = {
      duration: duration,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    };

    this.snackBar.open(message, action, config);
  }

  // In-APP Notifications
  loadNotifications(): void {
    this.http.get<AppNotification[]>(`${environment.apiUrl}/notifications`).subscribe({
      next: (data) => {
        this.notifications.next(data);
        this.updateUnreadCount(data);
      },
      error: (err) => console.error('Erro ao carregar notificações:', err)
    });
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/notifications/read-all`, {});
  }

  private updateUnreadCount(notifications: AppNotification[]): void {
    const count = notifications.filter(n => !n.read).length;
    this.unreadCount.next(count);
  }

  // Simulação de notificações (até ter backend completo)
  addMockNotification(notification: AppNotification): void {
    const current = this.notifications.value;
    this.notifications.next([notification, ...current]);
    this.updateUnreadCount(this.notifications.value);
  }
}
