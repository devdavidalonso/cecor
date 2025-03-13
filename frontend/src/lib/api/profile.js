import { api } from '../axios';

/**
 * Serviço para gerenciamento de perfil de usuário
 */
const profileService = {
  /**
   * Obtém os dados do perfil do usuário atual
   * @param {string} role - Perfil do usuário ('admin' ou 'aluno')
   * @returns {Promise<Object>} Dados do perfil
   */
  getProfile: async (role = 'aluno') => {
    try {
      const endpoint = role === 'admin' ? '/admin/profile' : '/student/profile';
      return await api.get(endpoint);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  },

  /**
   * Atualiza os dados do perfil do usuário atual
   * @param {Object} profileData - Dados atualizados do perfil
   * @param {string} role - Perfil do usuário ('admin' ou 'aluno')
   * @returns {Promise<Object>} Dados atualizados do perfil
   */
  updateProfile: async (profileData, role = 'aluno') => {
    try {
      const endpoint = role === 'admin' ? '/admin/profile' : '/student/profile';
      return await api.put(endpoint, profileData);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  },

  /**
   * Altera a senha do usuário atual
   * @param {Object} passwordData - Dados de senha (currentPassword, newPassword)
   * @param {string} role - Perfil do usuário ('admin' ou 'aluno')
   * @returns {Promise<Object>} Confirmação da operação
   */
  changePassword: async (passwordData, role = 'aluno') => {
    try {
      const endpoint = role === 'admin' ? '/admin/change-password' : '/student/change-password';
      return await api.post(endpoint, passwordData);
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      throw error;
    }
  }
};

export default profileService;