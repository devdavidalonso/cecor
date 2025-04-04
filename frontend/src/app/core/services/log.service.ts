// src/app/core/services/log.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

@Injectable({
  providedIn: 'root'
})
export class LogService {
  constructor(private http: HttpClient) {}

  log(level: LogLevel, message: string, context?: any): void {
    // Em produção, envie para o backend
    if (environment.production) {
      this.http.post(`${environment.apiUrl}/logs`, {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
        type: 'frontend',
        appVersion: environment.version
      }).subscribe();
    } else {
      // Em desenvolvimento, apenas console
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: any): void {
    this.log(LogLevel.ERROR, message, context);
  }
}