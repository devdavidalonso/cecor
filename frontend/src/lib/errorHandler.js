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
  if (error.response) {
    const { status, data } = error.response;
    
    // Mensagens com base no código de status HTTP
    switch (status) {
      case 400:
        return data?.error || data?.message || 'Requisição inválida. Verifique os dados e tente novamente.';
      case 401:
        return data?.error || data?.message || 'Credenciais inválidas. Por favor, verifique seu email e senha.';
      case 403:
        return data?.error || data?.message || 'Acesso negado. Você não tem permissão para esta ação.';
      case 404:
        return data?.error || data?.message || 'O recurso solicitado não foi encontrado.';
      case 422:
        return data?.error || data?.message || 'Dados inválidos. Verifique as informações enviadas.';
      case 429:
        return 'Muitas requisições. Por favor, aguarde um momento e tente novamente.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Erro no servidor. Por favor, tente novamente mais tarde.';
      default:
        return data?.error || data?.message || data?.details || defaultMessage;
    }
  }
  
  // Erro de rede ou timeout
  if (error.request) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Tempo de conexão esgotado. Verifique sua internet ou tente novamente mais tarde.';
    }
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
 * @returns {string} Mensagem de erro que foi exibida
 */
export const handleApiError = (error, showError, defaultMessage = 'Ocorreu um erro inesperado.') => {
  // Extrair mensagem amigável
  const message = getErrorMessage(error, defaultMessage);
  
  // Exibir para o usuário
  showError(message);
  
  // Registrar no console com informações detalhadas para depuração
  console.error('API Error:', {
    message,
    status: error.response?.status,
    data: error.response?.data,
    error
  });
  
  // Enviar para serviço de monitoramento de erros (opcional - implementar no futuro)
  // reportError({ message, error });
  
  return message;
};

/**
 * Função para analisar erros de validação estruturados por campo
 * @param {Object} validationErrors - Objeto com erros de validação por campo
 * @returns {Object} Objeto com mensagens de erro por campo
 */
export const parseValidationErrors = (validationErrors) => {
  if (!validationErrors || typeof validationErrors !== 'object') {
    return {};
  }
  
  const fieldErrors = {};
  
  // Processar erros no formato { field: [messages] } ou { field: message }
  Object.entries(validationErrors).forEach(([field, messages]) => {
    if (Array.isArray(messages)) {
      fieldErrors[field] = messages[0]; // Pegar apenas a primeira mensagem
    } else if (typeof messages === 'string') {
      fieldErrors[field] = messages;
    }
  });
  
  return fieldErrors;
};