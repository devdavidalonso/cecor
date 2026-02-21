import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

/**
 * Formato de data pt-BR para uso com MatDatepicker em toda a aplicação.
 * Suporta digitação manual (DD/MM/YYYY) e seleção pelo calendário.
 *
 * Uso:
 *   providers: [
 *     ...BRAZILIAN_DATE_PROVIDERS
 *   ]
 */
export const BRAZILIAN_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const BRAZILIAN_DATE_PROVIDERS = [
  { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  { provide: MAT_DATE_FORMATS, useValue: BRAZILIAN_DATE_FORMATS },
];
