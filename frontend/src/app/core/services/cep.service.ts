// src/app/core/services/cep.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean; // Adicione a propriedade erro como opcional
}

@Injectable({
  providedIn: 'root'
})
export class CEPService {
  // API pública gratuita do ViaCEP
  private readonly apiUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) { }

  /**
   * Busca endereço a partir do CEP informado
   * @param cep CEP (apenas números)
   * @returns Observable com dados do endereço
   */
  buscarCep(cep: string): Observable<CepResponse | null> {
    if (!cep || cep.length !== 8) {
      return of(null);
    }

    return this.http.get<CepResponse>(`${this.apiUrl}/${cep}/json`)
      .pipe(
        timeout(10000), // Timeout de 10 segundos
        map(response => {
          // A API do ViaCEP retorna um objeto com erro: true quando o CEP não foi encontrado
          if (response.erro) {
            return null;
          }
          return response;
        }),
        catchError(() => of(null))
      );
  }
}