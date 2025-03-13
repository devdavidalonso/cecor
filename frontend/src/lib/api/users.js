import { api } from '../axios';

/**
 * Serviço para gerenciamento de usuários
 */
const userService = {
  /**
   * Atualiza os dados do perfil do usuário atual
   * @param {Object} userData - Dados atualizados do usuário
   * @returns {Promise<Object>} Objeto com dados atualizados
   */
  updateProfile: async (userData) => {
    try {
      // Determinar a rota com base no perfil do usuário
      const profile = userData.profile || 'aluno';
      const endpoint = profile === 'admin' ? '/admin/profile' : '/student/profile';
      
      return await api.put(endpoint, userData);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  /**
   * Obtém lista de todos os usuários (apenas para admin)
   * @returns {Promise<Array>} Lista de usuários
   */
  getAllUsers: async () => {
    try {
      return await api.get('/admin/users');
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  /**
   * Obtém detalhes de um usuário específico (apenas para admin)
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Dados do usuário
   */
  getUserById: async (userId) => {
    try {
      return await api.get(`/admin/users/${userId}`);
    } catch (error) {
      console.error(`Erro ao buscar usuário ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Atualiza dados de um usuário (apenas para admin)
   * @param {number} userId - ID do usuário
   * @param {Object} userData - Dados atualizados
   * @returns {Promise<Object>} Dados do usuário atualizados
   */
  updateUser: async (userId, userData) => {
    try {
      return await api.put(`/admin/users/${userId}`, userData);
    } catch (error) {
      console.error(`Erro ao atualizar usuário ID ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Desativa um usuário (soft delete) (apenas para admin)
   * @param {number} userId - ID do usuário
   * @returns {Promise<Object>} Confirmação da operação
   */
  deleteUser: async (userId) => {
    try {
      return await api.delete(`/admin/users/${userId}`);
    } catch (error) {
      console.error(`Erro ao excluir usuário ID ${userId}:`, error);
      throw error;
    }
  }
};

export default userService;