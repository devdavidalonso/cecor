// src/components/documents/DocumentList.jsx
import { useState, useEffect } from 'react';
import { FiFile, FiDownload, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import { useAlert } from '../../contexts/AlertContext';
import { documentService } from '../../lib/api';
import DocumentUpload from './DocumentUpload';

const DocumentList = ({ studentId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  const { showAlert, error: showError } = useAlert();
  
  // Carregar documentos do aluno
  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getStudentDocuments(studentId);
      setDocuments(response.data || response);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao carregar documentos do aluno.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar documentos ao montar o componente
  useEffect(() => {
    if (studentId) {
      loadDocuments();
    }
  }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Formata data no padrão brasileiro
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  // Função para baixar documento
  const handleDownload = async (documentId, documentName) => {
    try {
      const response = await documentService.downloadDocument(studentId, documentId);
      
      // Criar um link temporário para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extrair a extensão do arquivo
      const fileExtension = documentName.split('.').pop();
      
      // Nome do arquivo para download
      link.setAttribute('download', `${documentName}.${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      
      showAlert('Download iniciado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao baixar documento.'
      );
    }
  };
  
  // Função para visualizar documento
  const handleView = async (documentId) => {
    try {
      const response = await documentService.downloadDocument(studentId, documentId);
      
      // Criar um link temporário para visualização
      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar documento:', error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao visualizar documento.'
      );
    }
  };
  
  // Função para excluir documento
  const handleDelete = async (documentId) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await documentService.deleteDocument(studentId, documentId);
        showAlert('Documento excluído com sucesso!', 'success');
        loadDocuments();
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
        showError(
          error.response?.data?.message || 
          error.message || 
          'Erro ao excluir documento.'
        );
      }
    }
  };
  
  // Função para pegar o ícone baseado no tipo de documento
  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'identification':
        return 'Identificação';
      case 'medical':
        return 'Médico';
      case 'school':
        return 'Escolar';
      case 'address':
        return 'Endereço';
      case 'authorization':
        return 'Autorização';
      default:
        return 'Outro';
    }
  };
  
  // Função para determinar a cor do badge de tipo de documento
  const getDocumentTypeBadgeColor = (type) => {
    switch (type) {
      case 'identification':
        return 'bg-blue-100 text-blue-800';
      case 'medical':
        return 'bg-red-100 text-red-800';
      case 'school':
        return 'bg-green-100 text-green-800';
      case 'address':
        return 'bg-yellow-100 text-yellow-800';
      case 'authorization':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handler para o sucesso do upload
  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    loadDocuments();
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Documentos do Aluno</h3>
        
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {showUploadForm ? (
            <>Cancelar</>
          ) : (
            <>
              <FiPlus className="mr-2" />
              Adicionar Documento
            </>
          )}
        </button>
      </div>
      
      {/* Formulário de upload */}
      {showUploadForm && (
        <div className="mb-8">
          <DocumentUpload 
            studentId={studentId} 
            onSuccess={handleUploadSuccess} 
          />
        </div>
      )}
      
      {/* Lista de documentos */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {documents.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <FiFile className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece adicionando um documento ao aluno.
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {documents.map((document) => (
                  <li key={document.id}>
                    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <FiFile className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{document.title}</div>
                          <div className="text-sm text-gray-500">
                            {document.description && <p className="mb-1">{document.description}</p>}
                            <span className="mb-1">Enviado em: {formatDate(document.createdAt)}</span>
                          </div>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocumentTypeBadgeColor(document.type)}`}>
                            {getDocumentTypeIcon(document.type)}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(document.id)}
                          className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                          title="Visualizar"
                        >
                          <FiEye className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDownload(document.id, document.title)}
                          className="p-1 rounded-full text-green-600 hover:bg-green-100"
                          title="Baixar"
                        >
                          <FiDownload className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(document.id)}
                          className="p-1 rounded-full text-red-600 hover:bg-red-100"
                          title="Excluir"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DocumentList;