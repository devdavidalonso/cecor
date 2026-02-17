// src/app/core/factories/course-service.factory.ts
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CourseService } from '../services/course.service';
import { PrototypeService } from '../services/prototype/prototype.service';

export function courseServiceFactory() {
  const http = inject(HttpClient);
  const prototypeService = inject(PrototypeService);
  
  // Retorna o CourseService - o modo protótipo é gerenciado internamente
  return new CourseService(http);
}
