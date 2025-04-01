// src/app/core/services/feature-flags.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {
  private flags = {
    useRealApi: true,        // Use real API endpoints or mocks
    enableDashboardCharts: true, // Enable charts in dashboard
    enableNotifications: true,  // Enable in-app notifications
    enableReports: true,      // Enable reports module
    enableUploadDocuments: true, // Enable document uploads
    advancedFilters: false     // Enable advanced filtering options
  };
  
  private flagsSubject = new BehaviorSubject<Record<string, boolean>>(this.flags);
  flags$ = this.flagsSubject.asObservable();
  
  constructor() {
    // Try to load flags from localStorage in real application
    this.loadFlags();
  }
  
  isEnabled(flagName: string): boolean {
    return this.flags[flagName as keyof typeof this.flags] ?? false;
  }
  
  isEnabledAsync(flagName: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      observer.next(this.isEnabled(flagName));
      observer.complete();
    });
  }
  
  setFlag(flagName: string, value: boolean): void {
    if (flagName in this.flags) {
      this.flags[flagName as keyof typeof this.flags] = value;
      this.flagsSubject.next({...this.flags});
      this.saveFlags();
    }
  }
  
  private loadFlags(): void {
    try {
      const storedFlags = localStorage.getItem('featureFlags');
      if (storedFlags) {
        const parsed = JSON.parse(storedFlags);
        this.flags = {...this.flags, ...parsed};
        this.flagsSubject.next({...this.flags});
      }
    } catch (error) {
      console.error('Error loading feature flags from localStorage', error);
    }
  }
  
  private saveFlags(): void {
    try {
      localStorage.setItem('featureFlags', JSON.stringify(this.flags));
    } catch (error) {
      console.error('Error saving feature flags to localStorage', error);
    }
  }
}