// src/lib/axios.js
import axios from 'axios';

// Determinar a URL base da API
const getBaseUrl = () => {
  // Para desenvolvimento local, usamos o localhost ou domínio personalizado
  if (typeof window !== 'undefined') {
    // No ambiente do navegador, usamos o mesmo domínio/porta do frontend com o prefixo /api
    return '/api';  // O proxy do Next.js redirecionará para o backend
  }
  
  // Para SSR ou uso em Node.js, usamos a variável de ambiente
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
};

// Criar instância personalizada do axios
export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar interceptor para incluir o token JWT em cada requisição
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Adicionar interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratar erro de autenticação (token expirado ou inválido)
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      // Se não estivermos na página de login
      if (!window.location.pathname.includes('/login')) {
        // Limpar o token e redirecionar para login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;