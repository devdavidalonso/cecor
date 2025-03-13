import { api } from '../axios';

/**
 * Serviço para gerenciamento de cursos
 */
const courseService = {
  /**
   * Obtém lista de cursos disponíveis para o aluno
   * @returns {Promise<Array>} Lista de cursos
   */
  getAvailableCourses: async () => {
    try {
      return await api.get('/student/courses');
    } catch (error) {
      console.error('Erro ao buscar cursos disponíveis:', error);
      throw error;
    }
  },

  /**
   * Obtém lista de todos os cursos (admin)
   * @returns {Promise<Array>} Lista completa de cursos
   */
  getAllCourses: async () => {
    try {
      return await api.get('/admin/courses');
    } catch (error) {
      console.error('Erro ao buscar todos os cursos:', error);
      throw error;
    }
  },

  /**
   * Obtém detalhes de um curso específico
   * @param {number} courseId - ID do curso
   * @param {boolean} isAdmin - Se a requisição é como admin
   * @returns {Promise<Object>} Dados do curso
   */
  getCourseById: async (courseId, isAdmin = false) => {
    try {
      const endpoint = isAdmin 
        ? `/admin/courses/${courseId}` 
        : `/student/courses/${courseId}`;
      
      return await api.get(endpoint);
    } catch (error) {
      console.error(`Erro ao buscar curso ID ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Cria um novo curso (admin)
   * @param {Object} courseData - Dados do novo curso
   * @returns {Promise<Object>} Dados do curso criado
   */
  createCourse: async (courseData) => {
    try {
      return await api.post('/admin/courses', courseData);
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      throw error;
    }
  },

  /**
   * Atualiza dados de um curso (admin)
   * @param {number} courseId - ID do curso
   * @param {Object} courseData - Dados atualizados
   * @returns {Promise<Object>} Dados do curso atualizados
   */
  updateCourse: async (courseId, courseData) => {
    try {
      return await api.put(`/admin/courses/${courseId}`, courseData);
    } catch (error) {
      console.error(`Erro ao atualizar curso ID ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Exclui um curso (admin)
   * @param {number} courseId - ID do curso
   * @returns {Promise<Object>} Confirmação da operação
   */
  deleteCourse: async (courseId) => {
    try {
      return await api.delete(`/admin/courses/${courseId}`);
    } catch (error) {
      console.error(`Erro ao excluir curso ID ${courseId}:`, error);
      throw error;
    }
  }
};

export default courseService;