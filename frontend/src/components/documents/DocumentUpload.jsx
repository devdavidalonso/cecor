// src/components/documents/DocumentUpload.jsx
import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FiUpload, FiX, FiFile, FiPaperclip } from 'react-icons/fi';
import { useAlert } from '../../contexts/AlertContext';
import { documentService } from '../../lib/api';

const DocumentUpload = ({ studentId, onSuccess }) => {
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const { showAlert, error: showError } = useAlert();
  
  // Validação dos campos
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('O título do documento é obrigatório')
      .max(100, 'O título deve ter no máximo 100 caracteres'),
    description: Yup.string()
      .max(500, 'A descrição deve ter no máximo 500 caracteres'),
    type: Yup.string()
      .required('O tipo de documento é obrigatório'),
    file: Yup.mixed()
      .required('O arquivo é obrigatório')
      .test(
        'fileFormat',
        'Formato de arquivo não suportado. Use PDF, DOC, DOCX, JPG ou PNG.',
        value => {
          if (!value) return false;
          const supportedFormats = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
          return supportedFormats.includes(value.type);
        }
      )
      .test(
        'fileSize',
        'O arquivo deve ter no máximo 10MB',
        value => {
          if (!value) return false;
          return value.size <= 10 * 1024 * 1024; // 10MB
        }
      ),
  });
  
  // Valores iniciais
  const initialValues = {
    title: '',
    description: '',
    type: '',
    file: null,
  };
  
  // Função para lidar com o envio do formulário
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Criar FormData para enviar arquivo
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('type', values.type);
      formData.append('file', values.file);
      
      // Enviar para o backend
      await documentService.uploadDocument(studentId, formData);
      
      showAlert('Documento enviado com sucesso!', 'success');
      resetForm();
      setFilePreview(null);
      setFileName('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao enviar documento. Tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  // Função para lidar com a seleção de arquivo
  const handleFileChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (!file) return;
    
    setFieldValue('file', file);
    setFileName(file.name);
    
    // Se for uma imagem, criar preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };
  
  // Função para remover o arquivo selecionado
  const removeFile = (setFieldValue) => {
    setFieldValue('file', null);
    setFileName('');
    setFilePreview(null);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Upload de Documento</h3>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched, setFieldValue, values }) => (
          <Form className="space-y-4">
            {/* Título do documento */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título*
              </label>
              <Field
                id="title"
                name="title"
                type="text"
                placeholder="Ex: Atestado Médico, RG, Comprovante de Residência"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && touched.title && (
                <div className="mt-1 text-sm text-red-600">{errors.title}</div>
              )}
            </div>
            
            {/* Descrição do documento */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows="3"
                placeholder="Descrição adicional do documento (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.description && touched.description && (
                <div className="mt-1 text-sm text-red-600">{errors.description}</div>
              )}
            </div>
            
            {/* Tipo de documento */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento*
              </label>
              <Field
                as="select"
                id="type"
                name="type"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um tipo...</option>
                <option value="identification">Documento de Identificação</option>
                <option value="medical">Documento Médico</option>
                <option value="school">Documento Escolar</option>
                <option value="address">Comprovante de Endereço</option>
                <option value="authorization">Autorização</option>
                <option value="other">Outro</option>
              </Field>
              {errors.type && touched.type && (
                <div className="mt-1 text-sm text-red-600">{errors.type}</div>
              )}
            </div>
            
            {/* Upload do arquivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arquivo*
              </label>
              
              {!values.file ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-2 text-center">
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Selecione um arquivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, setFieldValue)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG ou PNG até 10MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex items-center p-4 border border-gray-300 rounded-md">
                  {filePreview ? (
                    <div className="mr-4 flex-shrink-0 h-16 w-16 overflow-hidden rounded-md border border-gray-200">
                      <img src={filePreview} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="mr-4 flex-shrink-0 h-16 w-16 flex items-center justify-center bg-gray-100 rounded-md">
                      <FiFile className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {fileName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(values.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(setFieldValue)}
                    className="ml-4 flex-shrink-0 p-1 rounded-full text-gray-400 hover:text-red-500"
                  >
                    <span className="sr-only">Remover</span>
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              )}
              
              {errors.file && touched.file && (
                <div className="mt-1 text-sm text-red-600">{errors.file}</div>
              )}
            </div>
            
            {/* Botão de envio */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPaperclip className="mr-2" />
                {isSubmitting ? 'Enviando...' : 'Enviar Documento'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DocumentUpload;



