// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AuthService } from './core/services/auth.service';
import { PrototypeControlsComponent } from './features/prototype-controls/prototype-controls.component';
import { PrototypeService } from './core/services/prototype/prototype.service';
import { SsoService } from './core/services/sso.service';

import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    PrototypeControlsComponent
  ],
  template: `
    <router-outlet></router-outlet>
    
    <!-- Controles de protótipo (visíveis apenas no modo protótipo) -->
    <app-prototype-controls *ngIf="isPrototypeMode"></app-prototype-controls>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class AppComponent implements OnInit {
  isPrototypeMode = false;

  constructor(
    private authService: AuthService,
    private prototypeService: PrototypeService,
    private ssoService: SsoService,
    private translationService: TranslationService // ✅ Inject TranslationService
  ) { }

  ngOnInit() {
    // Verificar se há um token válido no localStorage
    this.authService.checkAuth();

    // Listen for user changes to set language
    this.authService.currentUser$.subscribe(user => {
      if (user && user.locale) {
        console.log('🌍 [App] Setting language to:', user.locale);
        this.translationService.changeLang(user.locale);
      }
    });

    // Verificar o modo protótipo
    this.prototypeService.isPrototypeMode$.subscribe((enabled: boolean) => {
      this.isPrototypeMode = enabled;
    });
  }
}