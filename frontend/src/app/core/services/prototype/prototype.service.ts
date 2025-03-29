import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrototypeService {
  private prototypeEnabledSubject = new BehaviorSubject<boolean>(false);
  
  // Observable para componentes se inscreverem
  public isPrototypeMode$ = this.prototypeEnabledSubject.asObservable();
  
  constructor() {
    // Verificar preferência salva no localStorage
    this.loadPrototypePreference();
    
    // Verificar parâmetro da URL
    this.checkUrlParam();
  }
  
  private loadPrototypePreference(): void {
    const savedPreference = localStorage.getItem('prototype_mode');
    if (savedPreference !== null) {
      this.prototypeEnabledSubject.next(savedPreference === 'true');
    }
  }
  
  private checkUrlParam(): void {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const prototypeParam = urlParams.get('prototype');
      
      if (prototypeParam === 'true') {
        this.enablePrototypeMode();
      } else if (prototypeParam === 'false') {
        this.disablePrototypeMode();
      }
    }
  }
  
  private persistPrototypePreference(enabled: boolean): void {
    localStorage.setItem('prototype_mode', enabled ? 'true' : 'false');
  }
  
  public enablePrototypeMode(): void {
    this.prototypeEnabledSubject.next(true);
    this.persistPrototypePreference(true);
  }
  
  public disablePrototypeMode(): void {
    this.prototypeEnabledSubject.next(false);
    this.persistPrototypePreference(false);
  }
  
  public togglePrototypeMode(): void {
    const newState = !this.prototypeEnabledSubject.value;
    this.prototypeEnabledSubject.next(newState);
    this.persistPrototypePreference(newState);
  }
  
  public isPrototypeEnabled(): boolean {
    return this.prototypeEnabledSubject.value;
  }
}