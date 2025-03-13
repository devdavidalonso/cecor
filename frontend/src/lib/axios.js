import axios from 'axios';

// Obter a URL da API do ambiente (.env.local)
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8080/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos
});

// Interceptor para adicionar o token a cada requisição
axiosInstance.interceptors.request.use(
  (config) => {
    // Apenas no cliente (browser)
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

// Interceptor para tratar erros de resposta
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Tratar erros 401 (não autorizado) - token expirado ou inválido
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Se não estamos em uma rota de autenticação, redirecionar para login
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        
        localStorage.removeItem('token');
        
        // Redirecionamento suave
        window.location.href = '/login?session=expired';
      }
    }
    
    // Formatar mensagem de erro
    let errorMessage = 'Ocorreu um erro. Tente novamente.';
    
    if (error.response) {
      // Resposta do servidor com erro
      errorMessage = error.response.data.error || error.response.data.message || errorMessage;
    } else if (error.request) {
      // Sem resposta do servidor
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    } else {
      // Erro na configuração da requisição
      errorMessage = error.message;
    }
    
    // Enriquecer o objeto de erro com uma mensagem amigável
    error.friendlyMessage = errorMessage;
    
    return Promise.reject(error);
  }
);

// Função helper para extração de dados
const extractData = (response) => response.data;

// Funções de API reutilizáveis
export const api = {
  get: (url, config = {}) => axiosInstance.get(url, config).then(extractData),
  post: (url, data, config = {}) => axiosInstance.post(url, data, config).then(extractData),
  put: (url, data, config = {}) => axiosInstance.put(url, data, config).then(extractData),
  delete: (url, config = {}) => axiosInstance.delete(url, config).then(extractData)
};

export default axiosInstance;