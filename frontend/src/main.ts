// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment'
// import { setupMockServer } from './app/core/mock/server';
import { setupMirageServer } from './app/core/mock/server';

// Inicializa o servidor de mock apenas se estivermos no modo de protótipo
if (environment.prototype) {
  console.log('Inicializando servidor de mock para modo protótipo');
  setupMirageServer();
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));