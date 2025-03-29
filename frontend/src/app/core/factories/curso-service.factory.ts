// src/app/core/factories/curso-service.factory.ts
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CursoService } from '../services/curso.service';
import { MockCursoService } from '../services/prototype/mock-curso.service';
import { PrototypeService } from '../services/prototype/prototype.service';

export function cursoServiceFactory() {
  const http = inject(HttpClient);
  const prototypeService = inject(PrototypeService);
  
  // Se o modo protótipo estiver ativado, use o serviço mockado
  if (prototypeService.isPrototypeEnabled()) {
    console.log('Usando MockCursoService para o modo protótipo');
    return new MockCursoService();
  }
  
  // Caso contrário, use o serviço real
  console.log('Usando CursoService real');
  return new CursoService(http, prototypeService);
}