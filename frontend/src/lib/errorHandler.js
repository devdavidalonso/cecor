/**
 * Função para extrair mensagem amigável de um erro de API
 * @param {Error} error - Objeto de erro
 * @param {string} defaultMessage - Mensagem padrão
 * @returns {string} Mensagem de erro amigável
 */
export const getErrorMessage = (error, defaultMessage = 'Ocorreu um erro. Tente novamente.') => {
    if (!error) return defaultMessage;
    
    // Se o erro veio do interceptor do axios, já tem friendlyMessage
    if (error.friendlyMessage) {
      return error.friendlyMessage;
    }
    
    // Erro de resposta da API
    if (error.response && error.response.data) {
      return error.response.data.error || 
             error.response.data.message || 
             error.response.data.details ||
             defaultMessage;
    }
    
    // Erro de rede ou timeout
    if (error.request) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }
    
    // Outro tipo de erro
    return error.message || defaultMessage;
  };
  
  /**
   * Função para lidar com erros de API e mostrar mensagens ao usuário
   * @param {Error} error - Objeto de erro
   * @param {Function} showError - Função para exibir o erro (useAlert)
   * @param {string} defaultMessage - Mensagem padrão
   */
  export const handleApiError = (error, showError, defaultMessage) => {
    const message = getErrorMessage(error, defaultMessage);
    showError(message);
    console.error('API Error:', error);
    return message;
  };