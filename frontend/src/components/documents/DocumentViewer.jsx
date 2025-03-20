// src/components/documents/DocumentViewer.jsx
import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import { useAlert } from '../../contexts/AlertContext';
import { documentService } from '../../lib/api';

const DocumentViewer = ({ studentId, documentId, onClose }) => {
  const [document, setDocument] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { showAlert, error: showError } = useAlert();
  
  // Carregar documento
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        
        // Carregar metadados do documento
        const metadataResponse = await documentService.getDocumentDetails(studentId, documentId);
        setDocument(metadataResponse.data || metadataResponse);
        
        // Baixar o documento para visualização
        const fileResponse = await documentService.downloadDocument(studentId, documentId);
        const url = URL.createObjectURL(new Blob([fileResponse.data]));
        setDocumentUrl(url);
      } catch (error) {
        console.error('Erro ao carregar documento:', error);
        showError(
          error.response?.data?.message || 
          error.message || 
          'Erro ao carregar documento para visualização.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId && documentId) {
      loadDocument();
    }
    
    // Limpar URL do objeto ao desmontar o componente
    return () => {
      if (documentUrl) {
        URL.revokeObjectURL(documentUrl);
      }
    };
  }, [studentId, documentId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Função para baixar documento
  const handleDownload = async () => {
    try {
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = documentUrl;
      
      // Extrair a extensão do arquivo
      const fileExtension = document.fileName.split('.').pop();
      
      // Nome do arquivo para download
      link.setAttribute('download', `${document.title}.${fileExtension}`);
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
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full">
          <div className="text-center py-8">
            <p className="text-gray-500">Documento não encontrado.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full h-5/6 flex flex-col">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{document.title}</h3>
          
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-full text-blue-600 hover:bg-blue-100"
              title="Baixar"
            >
              <FiDownload className="h-5 w-5" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
              title="Fechar"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Visualizador de documento */}
        <div className="flex-1 overflow-auto p-4">
          {document.mimeType && document.mimeType.startsWith('image/') ? (
            <img
              src={documentUrl}
              alt={document.title}
              className="max-w-full h-auto mx-auto"
            />
          ) : document.mimeType === 'application/pdf' ? (
            <iframe
              src={documentUrl}
              title={document.title}
              className="w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  Este tipo de documento não pode ser visualizado diretamente.
                </p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <FiDownload className="inline-block mr-2" />
                  Baixar Documento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;