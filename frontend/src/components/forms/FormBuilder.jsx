// src/components/forms/FormBuilder.jsx
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FiPlus, FiMinusCircle, FiMove, FiSettings, FiSave, FiEye } from 'react-icons/fi';
import { useAlert } from '../../contexts/AlertContext';
import { formService } from '../../lib/api';
import FormPreview from './FormPreview';

const FormBuilder = ({ initialValues, onSuccess }) => {
  const [showPreview, setShowPreview] = useState(false);
  const { showAlert, error: showError } = useAlert();
  
  // Schema de validação
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('O título do formulário é obrigatório')
      .max(100, 'O título deve ter no máximo 100 caracteres'),
    description: Yup.string()
      .max(500, 'A descrição deve ter no máximo 500 caracteres'),
    type: Yup.string()
      .required('O tipo de formulário é obrigatório'),
    questions: Yup.array()
      .of(
        Yup.object({
          text: Yup.string()
            .required('O texto da pergunta é obrigatório'),
          type: Yup.string()
            .required('O tipo da pergunta é obrigatório'),
          required: Yup.boolean(),
          options: Yup.array().when('type', {
            is: (type) => ['multipleChoice', 'checkbox', 'dropdown'].includes(type),
            then: Yup.array()
              .of(Yup.string().required('O texto da opção é obrigatório'))
              .min(1, 'Adicione pelo menos uma opção')
              .required('Opções são obrigatórias para este tipo de pergunta'),
            otherwise: Yup.array(),
          }),
        })
      )
      .min(1, 'Adicione pelo menos uma pergunta')
      .required('O formulário deve ter pelo menos uma pergunta'),
  });
  
  // Valores padrão
  const defaultValues = {
    title: '',
    description: '',
    type: '',
    status: 'draft',
    questions: [
      {
        text: '',
        type: 'text',
        required: true,
        options: [],
        validations: {},
      },
    ],
  };
  
  // Valores iniciais
  const formInitialValues = initialValues || defaultValues;
  
  // Manipulador para envio do formulário
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      let response;
      
      if (values.id) {
        // Atualizar formulário existente
        response = await formService.updateForm(values.id, values);
      } else {
        // Criar novo formulário
        response = await formService.createForm(values);
      }
      
      showAlert(
        values.id 
          ? 'Formulário atualizado com sucesso!' 
          : 'Formulário criado com sucesso!',
        'success'
      );
      
      if (onSuccess) {
        onSuccess(response.data || response);
      }
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao salvar formulário. Tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  // Adicionar uma nova pergunta
  const addQuestion = (questions, push) => {
    push({
      text: '',
      type: 'text',
      required: true,
      options: [],
      validations: {},
    });
  };
  
  // Mover uma pergunta para cima
  const moveQuestionUp = (index, values, setValues) => {
    if (index === 0) return;
    
    const newQuestions = [...values.questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index - 1];
    newQuestions[index - 1] = temp;
    
    setValues({
      ...values,
      questions: newQuestions,
    });
  };
  
  // Mover uma pergunta para baixo
  const moveQuestionDown = (index, values, setValues) => {
    if (index === values.questions.length - 1) return;
    
    const newQuestions = [...values.questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[index + 1];
    newQuestions[index + 1] = temp;
    
    setValues({
      ...values,
      questions: newQuestions,
    });
  };
  
  // Tipos de perguntas disponíveis
  const questionTypes = [
    { value: 'text', label: 'Texto (resposta curta)' },
    { value: 'textarea', label: 'Texto (resposta longa)' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
    { value: 'time', label: 'Hora' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telefone' },
    { value: 'multipleChoice', label: 'Múltipla Escolha (uma opção)' },
    { value: 'checkbox', label: 'Caixas de Seleção (múltiplas opções)' },
    { value: 'dropdown', label: 'Lista Suspensa' },
    { value: 'file', label: 'Upload de Arquivo' },
  ];
  
  // Tipos de formulários disponíveis
  const formTypes = [
    { value: 'admission', label: 'Admissão / Matrícula' },
    { value: 'interview', label: 'Entrevista' },
    { value: 'survey', label: 'Pesquisa / Feedback' },
    { value: 'attendance', label: 'Registro de Presença' },
    { value: 'consent', label: 'Termo de Consentimento' },
    { value: 'evaluation', label: 'Avaliação' },
    { value: 'medical', label: 'Informações Médicas' },
    { value: 'other', label: 'Outro' },
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <Formik
        initialValues={formInitialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          isSubmitting,
          setFieldValue,
          setValues,
        }) => (
          <>
            {/* Preview do formulário */}
            {showPreview && (
              <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full h-5/6 flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-medium">Prévia do Formulário</h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                    >
                      <span className="sr-only">Fechar</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-6">
                    <FormPreview formData={values} />
                  </div>
                </div>
              </div>
            )}
            
            <Form>
              {/* Cabeçalho do formulário */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {initialValues?.id ? 'Editar Formulário' : 'Criar Novo Formulário'}
                </h2>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiEye className="mr-2" />
                    Prévia
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSave className="mr-2" />
                    Salvar
                  </button>
                </div>
              </div>
              
              {/* Corpo do formulário */}
              <div className="p-6 space-y-6">
                {/* Informações básicas */}
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <h3 className="text-lg font-medium">Informações Básicas</h3>
                  
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Título*
                    </label>
                    <Field
                      id="title"
                      name="title"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <Field
                      as="textarea"
                      id="description"
                      name="description"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Formulário*
                    </label>
                    <Field
                      as="select"
                      id="type"
                      name="type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um tipo...</option>
                      {formTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="type" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <Field
                      as="select"
                      id="status"
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Rascunho</option>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </Field>
                  </div>
                </div>
                
                {/* Perguntas */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Perguntas</h3>
                    
                    <FieldArray name="questions">
                      {({ push }) => (
                        <button
                          type="button"
                          onClick={() => addQuestion(values.questions, push)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiPlus className="mr-2" />
                          Adicionar Pergunta
                        </button>
                      )}
                    </FieldArray>
                  </div>
                  
                  <ErrorMessage name="questions" component="div" className="mt-1 text-sm text-red-600" />
                  
                  <FieldArray name="questions">
                    {({ remove }) => (
                      <div className="space-y-4">
                        {values.questions.map((question, index) => (
                          <div key={index} className="border border-gray-300 rounded-md p-4">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-md font-medium">Pergunta {index + 1}</h4>
                              
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => moveQuestionUp(index, values, setValues)}
                                  disabled={index === 0}
                                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Mover para cima"
                                >
                                  <FiMove className="h-5 w-5" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => moveQuestionDown(index, values, setValues)}
                                  disabled={index === values.questions.length - 1}
                                  className="p-1 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Mover para baixo"
                                >
                                  <FiMove className="h-5 w-5 transform rotate-180" />
                                </button>
                                
                                {values.questions.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-1 rounded-full text-red-500 hover:bg-red-100"
                                    title="Remover pergunta"
                                  >
                                    <FiMinusCircle className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <label
                                  htmlFor={`questions.${index}.text`}
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Texto da Pergunta*
                                </label>
                                <Field
                                  id={`questions.${index}.text`}
                                  name={`questions.${index}.text`}
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <ErrorMessage
                                  name={`questions.${index}.text`}
                                  component="div"
                                  className="mt-1 text-sm text-red-600"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label
                                    htmlFor={`questions.${index}.type`}
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                  >
                                    Tipo de Resposta*
                                  </label>
                                  <Field
                                    as="select"
                                    id={`questions.${index}.type`}
                                    name={`questions.${index}.type`}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    {questionTypes.map((type) => (
                                      <option key={type.value} value={type.value}>
                                        {type.label}
                                      </option>
                                    ))}
                                  </Field>
                                  <ErrorMessage
                                    name={`questions.${index}.type`}
                                    component="div"
                                    className="mt-1 text-sm text-red-600"
                                  />
                                </div>
                                
                                <div className="flex items-center">
                                  <Field
                                    type="checkbox"
                                    id={`questions.${index}.required`}
                                    name={`questions.${index}.required`}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label
                                    htmlFor={`questions.${index}.required`}
                                    className="ml-2 block text-sm text-gray-700"
                                  >
                                    Esta pergunta é obrigatória
                                  </label>
                                </div>
                              </div>
                              
                              {/* Opções para perguntas de múltipla escolha */}
                              {['multipleChoice', 'checkbox', 'dropdown'].includes(values.questions[index].type) && (
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Opções de Resposta*
                                    </label>
                                    
                                    <FieldArray name={`questions.${index}.options`}>
                                      {({ push }) => (
                                        <button
                                          type="button"
                                          onClick={() => push('')}
                                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
                                        >
                                          <FiPlus className="mr-1" />
                                          Adicionar Opção
                                        </button>
                                      )}
                                    </FieldArray>
                                  </div>
                                  
                                  <FieldArray name={`questions.${index}.options`}>
                                    {({ remove, push }) => (
                                      <div className="space-y-2">
                                        {values.questions[index].options.length === 0 ? (
                                          <div className="p-2 bg-yellow-50 text-yellow-700 text-sm rounded">
                                            Adicione pelo menos uma opção para esta pergunta.
                                          </div>
                                        ) : (
                                          values.questions[index].options.map((option, optionIndex) => (
                                            <div key={optionIndex} className="flex items-center">
                                              <Field
                                                name={`questions.${index}.options.${optionIndex}`}
                                                type="text"
                                                placeholder={`Opção ${optionIndex + 1}`}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                              />
                                              <button
                                                type="button"
                                                onClick={() => remove(optionIndex)}
                                                className="ml-2 p-1 rounded-full text-red-500 hover:bg-red-100"
                                              >
                                                <FiMinusCircle className="h-5 w-5" />
                                              </button>
                                            </div>
                                          ))
                                        )}
                                        <ErrorMessage
                                          name={`questions.${index}.options`}
                                          component="div"
                                          className="mt-1 text-sm text-red-600"
                                        />
                                      </div>
                                    )}
                                  </FieldArray>
                                </div>
                              )}
                              
                              {/* Configurações adicionais para tipos específicos */}
                              {['number', 'date', 'email', 'phone', 'file'].includes(values.questions[index].type) && (
                                <div className="p-3 bg-gray-50 rounded-md">
                                  <div className="flex items-center mb-2">
                                    <FiSettings className="mr-2 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      Configurações adicionais
                                    </span>
                                  </div>
                                  
                                  {values.questions[index].type === 'number' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label
                                          htmlFor={`questions.${index}.validations.min`}
                                          className="block text-sm text-gray-700 mb-1"
                                        >
                                          Valor mínimo
                                        </label>
                                        <Field
                                          id={`questions.${index}.validations.min`}
                                          name={`questions.${index}.validations.min`}
                                          type="number"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label
                                          htmlFor={`questions.${index}.validations.max`}
                                          className="block text-sm text-gray-700 mb-1"
                                        >
                                          Valor máximo
                                        </label>
                                        <Field
                                          id={`questions.${index}.validations.max`}
                                          name={`questions.${index}.validations.max`}
                                          type="number"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {values.questions[index].type === 'date' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label
                                          htmlFor={`questions.${index}.validations.minDate`}
                                          className="block text-sm text-gray-700 mb-1"
                                        >
                                          Data mínima
                                        </label>
                                        <Field
                                          id={`questions.${index}.validations.minDate`}
                                          name={`questions.${index}.validations.minDate`}
                                          type="date"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label
                                          htmlFor={`questions.${index}.validations.maxDate`}
                                          className="block text-sm text-gray-700 mb-1"
                                        >
                                          Data máxima
                                        </label>
                                        <Field
                                          id={`questions.${index}.validations.maxDate`}
                                          name={`questions.${index}.validations.maxDate`}
                                          type="date"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {values.questions[index].type === 'file' && (
                                    <div>
                                      <label
                                        htmlFor={`questions.${index}.validations.fileTypes`}
                                        className="block text-sm text-gray-700 mb-1"
                                      >
                                        Tipos de arquivo permitidos
                                      </label>
                                      <Field
                                        id={`questions.${index}.validations.fileTypes`}
                                        name={`questions.${index}.validations.fileTypes`}
                                        type="text"
                                        placeholder="Ex: pdf,jpg,png,doc"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                      <p className="mt-1 text-xs text-gray-500">
                                        Separados por vírgulas (pdf,jpg,png,doc)
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FieldArray>
                </div>
              </div>
              
              {/* Rodapé com botões de ação */}
              <div className="px-6 py-4 bg-gray-50 text-right border-t">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? 'Salvando...' 
                    : initialValues?.id 
                      ? 'Atualizar Formulário' 
                      : 'Criar Formulário'
                  }
                </button>
              </div>
            </Form>
          </>
        )}
      </Formik>
    </div>
  );
};

export default FormBuilder;