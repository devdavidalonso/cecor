// src/components/students/StudentForm.jsx (Parte 1)
import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FiPlusCircle, FiMinusCircle, FiUpload, FiSave } from 'react-icons/fi';
import { useAlert } from '../../contexts/AlertContext';
import { studentService } from '../../lib/api';

const StudentForm = ({ initialValues, onSuccess }) => {
  const { showAlert, error: showError } = useAlert();
  const [previewImage, setPreviewImage] = useState(null);
  
  // Formatação para campos de documentos brasileiros
  const formatCPF = (value) => {
    if (!value) return '';
    
    const cpfNumbers = value.replace(/\D/g, '');
    let formattedCPF = cpfNumbers;
    
    if (cpfNumbers.length > 3) {
      formattedCPF = cpfNumbers.substring(0, 3) + '.' + cpfNumbers.substring(3);
    }
    if (cpfNumbers.length > 6) {
      formattedCPF = formattedCPF.substring(0, 7) + '.' + cpfNumbers.substring(6, 9);
    }
    if (cpfNumbers.length > 9) {
      formattedCPF = formattedCPF.substring(0, 11) + '-' + cpfNumbers.substring(9, 11);
    }
    
    return formattedCPF;
  };
  
  const formatPhone = (value) => {
    if (!value) return '';
    
    const phoneNumbers = value.replace(/\D/g, '');
    let formattedPhone = phoneNumbers;
    
    if (phoneNumbers.length > 0) {
      formattedPhone = '(' + phoneNumbers.substring(0, 2);
    }
    if (phoneNumbers.length > 2) {
      formattedPhone += ') ' + phoneNumbers.substring(2, 7);
    }
    if (phoneNumbers.length > 7) {
      formattedPhone += '-' + phoneNumbers.substring(7, 11);
    }
    
    return formattedPhone;
  };
  
  // Função para calcular idade automaticamente a partir da data de nascimento
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };
  
  // Schema de validação Yup
  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required('Nome completo é obrigatório')
      .min(5, 'Nome deve ter pelo menos 5 caracteres'),
    birthDate: Yup.date()
      .required('Data de nascimento é obrigatória')
      .max(new Date(), 'Data não pode ser futura'),
    cpf: Yup.string()
      .required('CPF é obrigatório')
      .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
    email: Yup.string()
      .email('Email inválido')
      .required('Email é obrigatório'),
    mainPhone: Yup.string()
      .required('Telefone principal é obrigatório')
      .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
    address: Yup.object({
      street: Yup.string().required('Rua é obrigatória'),
      number: Yup.string().required('Número é obrigatório'),
      complement: Yup.string(),
      neighborhood: Yup.string().required('Bairro é obrigatório'),
      city: Yup.string().required('Cidade é obrigatória'),
      state: Yup.string().required('Estado é obrigatório'),
      zipCode: Yup.string().required('CEP é obrigatório'),
    }),
    guardians: Yup.array().of(
      Yup.object({
        fullName: Yup.string().required('Nome do responsável é obrigatório'),
        cpf: Yup.string()
          .required('CPF do responsável é obrigatório')
          .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
        email: Yup.string()
          .email('Email inválido')
          .required('Email do responsável é obrigatório'),
        phone1: Yup.string()
          .required('Telefone do responsável é obrigatório')
          .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
        relationship: Yup.string().required('Grau de parentesco é obrigatório'),
      })
    ),
  });
  
  // Valores padrão para um novo aluno
  const defaultValues = {
    fullName: '',
    birthDate: '',
    age: '',
    cpf: '',
    email: '',
    mainPhone: '',
    additionalPhones: {
      phone1: '',
      phone2: '',
    },
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
    photo: null,
    socialNetworks: {
      facebook: '',
      instagram: '',
      other: '',
    },
    medicalInfo: '',
    accessibilityNeeds: '',
    observations: '',
    guardians: [
      {
        fullName: '',
        cpf: '',
        email: '',
        phone1: '',
        phone2: '',
        phone3: '',
        relationship: '',
        permissions: {
          canPickup: true,
          receiveNotifications: true,
          authorizeActivities: true,
        },
      },
    ],
  };
  
  // Inicial values mesclados com defaultValues
  const formInitialValues = { ...defaultValues, ...initialValues };
  
  // Verificar se há uma URL de foto para visualização inicial
  useEffect(() => {
    if (initialValues?.photoUrl) {
      setPreviewImage(initialValues.photoUrl);
    }
  }, [initialValues]);
  
  // Handler para prévia da imagem
  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (!file) return;
    
    setFieldValue('photo', file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Preparando os dados para envio
      const formData = new FormData();
      
      // Adicionando todos os dados dos formulários exceto a foto (por enquanto)
      Object.keys(values).forEach(key => {
        if (key !== 'photo' && key !== 'guardians') {
          if (typeof values[key] === 'object') {
            formData.append(key, JSON.stringify(values[key]));
          } else {
            formData.append(key, values[key]);
          }
        }
      });
      
      // Adicionando guardians como JSON
      formData.append('guardians', JSON.stringify(values.guardians));
      
      // Adicionando a foto se existir
      if (values.photo) {
        formData.append('photo', values.photo);
      }
      
      let response;
      if (values.id) {
        // Atualizando aluno existente
        response = await studentService.updateStudent(values.id, formData);
      } else {
        // Criando novo aluno
        response = await studentService.createStudent(formData);
      }
      
      showAlert(
        values.id ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!',
        'success'
      );
      
      if (onSuccess) {
        onSuccess(response.data || response);
      }
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      showError(
        error.response?.data?.message || 
        error.message || 
        'Erro ao salvar informações do aluno. Tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">
        {initialValues?.id ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
      </h2>
      
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
          handleChange,
          handleBlur,
        }) => (
          <Form className="space-y-6">
            {/* Seção: Informações Pessoais */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b">
                Informações Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Foto do aluno */}
                <div className="md:col-span-2 flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 mb-2">
                    {previewImage || values.photoUrl ? (
                      <img 
                        src={previewImage || values.photoUrl} 
                        alt="Prévia da foto do aluno"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span>Sem foto</span>
                      </div>
                    )}
                  </div>
                  
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md cursor-pointer hover:bg-blue-100 transition-colors">
                    <FiUpload />
                    <span>Escolher Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {/* Nome completo */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo*
                  </label>
                  <Field
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="fullName" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Data de nascimento */}
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento*
                  </label>
                  <Field
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    onChange={(e) => {
                      handleChange(e);
                      const birthDate = e.target.value;
                      if (birthDate) {
                        setFieldValue('age', calculateAge(birthDate));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="birthDate" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Idade (calculada automaticamente) */}
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Idade (calculada)
                  </label>
                  <Field
                    id="age"
                    name="age"
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                
                {/* CPF */}
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                    CPF*
                  </label>
                  <Field
                    id="cpf"
                    name="cpf"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        value={formatCPF(field.value)}
                        onChange={(e) => {
                          setFieldValue('cpf', formatCPF(e.target.value));
                        }}
                        placeholder="000.000.000-00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                  <ErrorMessage name="cpf" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Telefone principal */}
                <div>
                  <label htmlFor="mainPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone Principal*
                  </label>
                  <Field
                    id="mainPhone"
                    name="mainPhone"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        value={formatPhone(field.value)}
                        onChange={(e) => {
                          setFieldValue('mainPhone', formatPhone(e.target.value));
                        }}
                        placeholder="(00) 00000-0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                  <ErrorMessage name="mainPhone" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Telefones adicionais */}
                <div>
                  <label htmlFor="additionalPhones.phone1" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone Adicional 1
                  </label>
                  <Field
                    id="additionalPhones.phone1"
                    name="additionalPhones.phone1"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        value={formatPhone(field.value)}
                        onChange={(e) => {
                          setFieldValue('additionalPhones.phone1', formatPhone(e.target.value));
                        }}
                        placeholder="(00) 00000-0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
                
                <div>
                  <label htmlFor="additionalPhones.phone2" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone Adicional 2
                  </label>
                  <Field
                    id="additionalPhones.phone2"
                    name="additionalPhones.phone2"
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        value={formatPhone(field.value)}
                        onChange={(e) => {
                          setFieldValue('additionalPhones.phone2', formatPhone(e.target.value));
                        }}
                        placeholder="(00) 00000-0000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            
            {/* Seção: Endereço */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b">
                Endereço
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rua */}
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                    Rua*
                  </label>
                  <Field
                    id="address.street"
                    name="address.street"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="address.street" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Número */}
                <div>
                  <label htmlFor="address.number" className="block text-sm font-medium text-gray-700 mb-1">
                    Número*
                  </label>
                  <Field
                    id="address.number"
                    name="address.number"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="address.number" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Complemento */}
                <div>
                  <label htmlFor="address.complement" className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <Field
                    id="address.complement"
                    name="address.complement"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Bairro */}
                <div>
                  <label htmlFor="address.neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro*
                  </label>
                  <Field
                    id="address.neighborhood"
                    name="address.neighborhood"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="address.neighborhood" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Cidade */}
                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade*
                  </label>
                  <Field
                    id="address.city"
                    name="address.city"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="address.city" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* Estado */}
                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado*
                  </label>
                  <Field
                    as="select"
                    id="address.state"
                    name="address.state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </Field>
                  <ErrorMessage name="address.state" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                {/* CEP */}
                <div>
                  <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    CEP*
                  </label>
                  <Field
                    id="address.zipCode"
                    name="address.zipCode"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <ErrorMessage name="address.zipCode" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>
            </div>
            
            {/* Seção: Informações Adicionais */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b">
                Informações Adicionais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Redes sociais */}
                <div>
                  <label htmlFor="socialNetworks.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <Field
                    id="socialNetworks.facebook"
                    name="socialNetworks.facebook"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="socialNetworks.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <Field
                    id="socialNetworks.instagram"
                    name="socialNetworks.instagram"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="socialNetworks.other" className="block text-sm font-medium text-gray-700 mb-1">
                    Outra Rede Social
                  </label>
                  <Field
                    id="socialNetworks.other"
                    name="socialNetworks.other"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Informações médicas */}
                <div className="md:col-span-2">
                  <label htmlFor="medicalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                    Informações Médicas Relevantes
                  </label>
                  <Field
                    as="textarea"
                    id="medicalInfo"
                    name="medicalInfo"
                    rows="3"
                    placeholder="Alergias, medicamentos, condições médicas relevantes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Necessidades de acessibilidade */}
                <div className="md:col-span-2">
                  <label htmlFor="accessibilityNeeds" className="block text-sm font-medium text-gray-700 mb-1">
                    Necessidades Especiais de Acessibilidade
                  </label>
                  <Field
                    as="textarea"
                    id="accessibilityNeeds"
                    name="accessibilityNeeds"
                    rows="3"
                    placeholder="Descreva quaisquer necessidades especiais de acessibilidade..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Observações */}
                <div className="md:col-span-2">
                  <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <Field
                    as="textarea"
                    id="observations"
                    name="observations"
                    rows="3"
                    placeholder="Observações adicionais sobre o aluno..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Seção: Responsáveis */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b">
                Responsáveis
              </h3>
              
              <FieldArray name="guardians">
                {({ push, remove }) => (
                  <div>
                    {values.guardians && values.guardians.length > 0 && values.guardians.map((guardian, index) => (
                      <div key={index} className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-md font-medium">
                            Responsável {index + 1}
                          </h4>
                          
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="flex items-center text-red-500 hover:text-red-700"
                            >
                              <FiMinusCircle className="mr-1" /> Remover
                            </button>
                            // src/components/students/StudentForm.jsx (Parte 3)
                          )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome do responsável */}
                            <div>
                              <label 
                                htmlFor={`guardians.${index}.fullName`} 
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Nome Completo*
                              </label>
                              <Field
                                id={`guardians.${index}.fullName`}
                                name={`guardians.${index}.fullName`}
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <ErrorMessage 
                                name={`guardians.${index}.fullName`} 
                                component="div" 
                                className="mt-1 text-sm text-red-600" 
                              />
                            </div>
                            
                            {/* CPF do responsável */}
                            <div>
                              <label 
                                htmlFor={`guardians.${index}.cpf`} 
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                CPF*
                              </label>
                              <Field
                                id={`guardians.${index}.cpf`}
                                name={`guardians.${index}.cpf`}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="text"
                                    value={formatCPF(field.value)}
                                    onChange={(e) => {
                                      setFieldValue(`guardians.${index}.cpf`, formatCPF(e.target.value));
                                    }}
                                    placeholder="000.000.000-00"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                )}
                              />
                              <ErrorMessage 
                                name={`guardians.${index}.cpf`} 
                                component="div" 
                                className="mt-1 text-sm text-red-600" 
                              />
                            </div>
                            
                            {/* Email do responsável */}
                            <div>
                              <label 
                                htmlFor={`guardians.${index}.email`} 
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Email*
                              </label>
                              <Field
                                id={`guardians.${index}.email`}
                                name={`guardians.${index}.email`}
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <ErrorMessage 
                                name={`guardians.${index}.email`} 
                                component="div" 
                                className="mt-1 text-sm text-red-600" 
                              />
                            </div>
                            
                            {/* Grau de parentesco */}
                            <div>
                              <label 
                                htmlFor={`guardians.${index}.relationship`} 
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Grau de Parentesco*
                              </label>
                              <Field
                                as="select"
                                id={`guardians.${index}.relationship`}
                                name={`guardians.${index}.relationship`}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Selecione...</option>
                                <option value="pai">Pai</option>
                                <option value="mãe">Mãe</option>
                                <option value="avô">Avô</option>
                                <option value="avó">Avó</option>
                                <option value="tio">Tio</option>
                                <option value="tia">Tia</option>
                                <option value="irmão">Irmão</option>
                                <option value="irmã">Irmã</option>
                                <option value="tutor">Tutor Legal</option>
                                <option value="outro">Outro</option>
                              </Field>
                              <ErrorMessage 
                                name={`guardians.${index}.relationship`} 
                                component="div" 
                                className="mt-1 text-sm text-red-600" 
                              />
                            </div>
                            
                            {/* Telefone 1 do responsável */}
                            <div>
                              <label 
                                htmlFor={`guardians.${index}.phone1`} 
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Telefone Principal*
                              </label>
                              <Field
                                id={`guardians.${index}.phone1`}
                                name={`guardians.${index}.phone1`}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="text"
                                    value={formatPhone(field.value)}
                                    onChange={(e) => {
                                      setFieldValue(`guardians.${index}.phone1`, formatPhone(e.target.value));
                                    }}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                )}
                              />
                              <ErrorMessage 
                                name={`guardians.${index}.phone1`} 
                                component="div" 
                                className="mt-1 text-sm text-red-600" 
                              />
                            </div>
                            
                            {/* Telefone 2 do responsável */}
                            <div>
                              <label 
                                htmlFor={`guardians.${index}.phone2`} 
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Telefone Adicional
                              </label>
                              <Field
                                id={`guardians.${index}.phone2`}
                                name={`guardians.${index}.phone2`}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="text"
                                    value={formatPhone(field.value)}
                                    onChange={(e) => {
                                      setFieldValue(`guardians.${index}.phone2`, formatPhone(e.target.value));
                                    }}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                )}
                              />
                            </div>
                            
                            {/* Telefone 3 do responsável */}
                            <div>
                              <label 
                                htmlFor={`guardians.${index}.phone3`} 
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Telefone Trabalho
                              </label>
                              <Field
                                id={`guardians.${index}.phone3`}
                                name={`guardians.${index}.phone3`}
                                render={({ field }) => (
                                  <input
                                    {...field}
                                    type="text"
                                    value={formatPhone(field.value)}
                                    onChange={(e) => {
                                      setFieldValue(`guardians.${index}.phone3`, formatPhone(e.target.value));
                                    }}
                                    placeholder="(00) 00000-0000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                )}
                              />
                            </div>
                            
                            {/* Permissões do responsável */}
                            <div className="md:col-span-2 mt-4">
                              <span className="block text-sm font-medium text-gray-700 mb-3">
                                Permissões
                              </span>
                              
                              <div className="flex flex-col space-y-2">
                                <label className="inline-flex items-center">
                                  <Field
                                    type="checkbox"
                                    name={`guardians.${index}.permissions.canPickup`}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Pode buscar o aluno
                                  </span>
                                </label>
                                
                                <label className="inline-flex items-center">
                                  <Field
                                    type="checkbox"
                                    name={`guardians.${index}.permissions.receiveNotifications`}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Receber notificações
                                  </span>
                                </label>
                                
                                <label className="inline-flex items-center">
                                  <Field
                                    type="checkbox"
                                    name={`guardians.${index}.permissions.authorizeActivities`}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2"
                                  />
                                  <span className="text-sm text-gray-700">
                                    Autorizar atividades externas
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {values.guardians.length < 3 && (
                        <button
                          type="button"
                          onClick={() => push({
                            fullName: '',
                            cpf: '',
                            email: '',
                            phone1: '',
                            phone2: '',
                            phone3: '',
                            relationship: '',
                            permissions: {
                              canPickup: true,
                              receiveNotifications: true,
                              authorizeActivities: true,
                            }
                          })}
                          className="flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <FiPlusCircle className="mr-1" /> Adicionar Responsável
                        </button>
                      )}
                    </div>
                  )}
                </FieldArray>
              </div>
              
              {/* Botão de submissão */}
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSave className="mr-2" />
                  {isSubmitting ? 'Salvando...' : 'Salvar Aluno'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    );
  };
  
  export default StudentForm;