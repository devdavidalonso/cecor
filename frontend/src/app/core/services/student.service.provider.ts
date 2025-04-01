// src/app/core/services/student.service.provider.ts

import { Provider } from '@angular/core';
import { StudentService } from './student.service';
import { StudentMockService } from './student-mock.service';
import { environment } from '@environments/environment';

export const studentServiceProvider: Provider = {
  provide: StudentService,
  useClass: environment.useMocks ? StudentMockService : StudentService
};

// Alternativamente, usando Factory para decisão dinâmica:
/*
export const studentServiceFactory = (featureFlags: FeatureFlagsService, http: HttpClient) => {
  return featureFlags.isEnabled('useRealApi') 
    ? new StudentService(http) 
    : new StudentMockService();
};

export const studentServiceProvider: Provider = {
  provide: StudentService,
  useFactory: studentServiceFactory,
  deps: [FeatureFlagsService, HttpClient]
};
*/