import { api } from '../axios';

/**
 * Serviço para gerenciamento de autenticação
 */
const authService = {
  /**
   * Autentica o usuário e obtém um token JWT
   * @param {Object} credentials - Email e senha do usuário
   * @returns {Promise<Object>} Objeto contendo token e dados do usuário
   */
  login: async (credentials) => {
    try {
      return await api.post('/login', credentials);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  /**
   * Registra um novo usuário (aluno)
   * @param {Object} userData - Dados do novo usuário
   * @returns {Promise<Object>} Objeto com dados do usuário criado
   */
  register: async (userData) => {
    try {
      return await api.post('/register', userData);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  /**
   * Obtém os dados do usuário logado
   * @returns {Promise<Object>} Objeto com dados do usuário
   */
  getCurrentUser: async () => {
    try {
      // A rota pode variar dependendo do perfil (student/admin)
      // Aqui vamos tentar primeiro como aluno
      try {
        return await api.get('/student/profile');
      } catch (error) {
        // Se falhar como aluno, tentar como admin
        if (error.response && error.response.status === 403) {
          return await api.get('/admin/profile');
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      throw error;
    }
  },

  /**
   * Verifica se o token atual é válido
   * @returns {Promise<boolean>} Verdadeiro se o token for válido
   */
  verifyToken: async () => {
    try {
      // Usando a rota de perfil para verificar o token
      await authService.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Faz logout removendo o token do localStorage
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }
};

export default authService;