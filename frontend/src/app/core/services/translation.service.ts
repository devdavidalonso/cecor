// src/app/core/services/translation.service.ts
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

/**
 * Serviço de tradução para facilitar o uso do ngx-translate
 * em toda a aplicação
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  
  // Idioma padrão
  private defaultLang = 'pt-BR';
  
  // Idiomas suportados
  private supportedLangs = ['pt-BR', 'en-US'];

  constructor(private translate: TranslateService) {
    // Define o idioma padrão
    this.translate.setDefaultLang(this.defaultLang);
    
    // Usa o idioma padrão inicialmente
    this.translate.use(this.defaultLang);
  }

  /**
   * Retorna a tradução instantânea de uma chave
   */
  instant(key: string, params?: object): string {
    return this.translate.instant(key, params);
  }

  /**
   * Retorna um Observable com a tradução
   */
  get(key: string, params?: object): Observable<string> {
    return this.translate.get(key, params);
  }

  /**
   * Muda o idioma da aplicação
   */
  changeLang(lang: string): void {
    if (this.supportedLangs.includes(lang)) {
      this.translate.use(lang);
    }
  }

  /**
   * Retorna o idioma atual
   */
  getCurrentLang(): string {
    return this.translate.currentLang || this.defaultLang;
  }

  /**
   * Retorna os idiomas suportados
   */
  getSupportedLangs(): string[] {
    return this.supportedLangs;
  }
}
