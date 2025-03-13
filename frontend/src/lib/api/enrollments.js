import { api } from '../axios';

/**
 * Serviço para gerenciamento de matrículas
 */
const enrollmentService = {
  /**
   * Obtém matrículas do aluno atual
   * @returns {Promise<Array>} Lista de matrículas
   */
  getStudentEnrollments: async () => {
    try {
      return await api.get('/student/enrollments');
    } catch (error) {
      console.error('Erro ao buscar matrículas do aluno:', error);
      throw error;
    }
  },

  /**
   * Obtém detalhes de uma matrícula específica do aluno
   * @param {number} enrollmentId - ID da matrícula
   * @returns {Promise<Object>} Dados da matrícula
   */
  getStudentEnrollmentById: async (enrollmentId) => {
    try {
      return await api.get(`/student/enrollments/${enrollmentId}`);
    } catch (error) {
      console.error(`Erro ao buscar matrícula ID ${enrollmentId}:`, error);
      throw error;
    }
  },

  // Adicionar essas funções ao src/lib/api/enrollments.js

/**
 * Obtém detalhes de uma matrícula específica (admin)
 * @param {number} enrollmentId - ID da matrícula
 * @returns {Promise<Object>} Dados da matrícula
 */
 getEnrollmentById: async (enrollmentId) => {
    try {
      return await api.get(`/admin/enrollments/${enrollmentId}`);
    } catch (error) {
      console.error(`Erro ao buscar matrícula ID ${enrollmentId}:`, error);
      throw error;
    }
  },
  
  /**
   * Cria uma nova matrícula manualmente (admin)
   * @param {Object} enrollmentData - Dados da matrícula (user_id, course_id)
   * @returns {Promise<Object>} Dados da matrícula criada
   */
  createEnrollment: async (enrollmentData) => {
    try {
      return await api.post('/admin/enrollments', enrollmentData);
    } catch (error) {
      console.error('Erro ao criar matrícula:', error);
      throw error;
    }
  },

  /**
   * Matricula um aluno em um curso
   * @param {Object} enrollmentData - Dados da matrícula (course_id)
   * @returns {Promise<Object>} Dados da matrícula criada
   */
  enrollInCourse: async (enrollmentData) => {
    try {
      return await api.post('/student/enroll', enrollmentData);
    } catch (error) {
      console.error('Erro ao realizar matrícula:', error);
      throw error;
    }
  },

  /**
   * Obtém todas as matrículas (admin)
   * @returns {Promise<Array>} Lista de todas as matrículas
   */
  getAllEnrollments: async () => {
    try {
      return await api.get('/admin/enrollments');
    } catch (error) {
      console.error('Erro ao buscar todas as matrículas:', error);
      throw error;
    }
  },

  /**
   * Atualiza status de uma matrícula (admin)
   * @param {number} enrollmentId - ID da matrícula
   * @param {Object} enrollmentData - Dados atualizados (status)
   * @returns {Promise<Object>} Dados da matrícula atualizados
   */
  updateEnrollment: async (enrollmentId, enrollmentData) => {
    try {
      return await api.put(`/admin/enrollments/${enrollmentId}`, enrollmentData);
    } catch (error) {
      console.error(`Erro ao atualizar matrícula ID ${enrollmentId}:`, error);
      throw error;
    }
  },

  /**
   * Cancela uma matrícula (admin)
   * @param {number} enrollmentId - ID da matrícula
   * @returns {Promise<Object>} Confirmação da operação
   */
  deleteEnrollment: async (enrollmentId) => {
    try {
      return await api.delete(`/admin/enrollments/${enrollmentId}`);
    } catch (error) {
      console.error(`Erro ao cancelar matrícula ID ${enrollmentId}:`, error);
      throw error;
    }
  }
};


export default enrollmentService;