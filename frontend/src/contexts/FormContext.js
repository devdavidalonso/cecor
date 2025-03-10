import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Criar o contexto
const FormContext = createContext();

// Provedor do contexto
export const FormProvider = ({ children }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Dados pessoais
    nomeAluno: '',
    dataNascimento: '',
    endereco: '',
    
    // Contato
    telefone: '',
    email: '',
    
    // Responsável
    nomeResponsavel: '',
    parentesco: '',
    telefoneResponsavel: '',
    
    // Curso
    cursoSelecionado: null,
    
    // Informações adicionais
    observacoes: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Atualizar os dados do formulário
  const updateFormData = (newData) => {
    setFormData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  // Avançar para a próxima etapa
  const nextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  // Voltar para a etapa anterior
  const prevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  // Resetar o formulário
  const resetForm = () => {
    setFormData({
      nomeAluno: '',
      dataNascimento: '',
      endereco: '',
      telefone: '',
      email: '',
      nomeResponsavel: '',
      parentesco: '',
      telefoneResponsavel: '',
      cursoSelecionado: null,
      observacoes: ''
    });
    setCurrentStep(1);
  };

  // Enviar dados para a API
  const submitForm = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Preparar os dados no formato esperado pelo backend
      const alunoData = {
        nome: formData.nomeAluno,
        data_nascimento: formData.dataNascimento,
        endereco: formData.endereco,
        telefone: formData.telefone,
        email: formData.email,
        responsavel: formData.nomeResponsavel,
        parentesco: formData.parentesco,
        telefone_responsavel: formData.telefoneResponsavel,
        observacoes: formData.observacoes
      };

      // Enviar dados do aluno para a API
      const alunoResponse = await fetch('http://localhost:8080/api/alunos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alunoData),
      });

      if (!alunoResponse.ok) {
        throw new Error('Erro ao cadastrar aluno');
      }

      const alunoResult = await alunoResponse.json();
      
      // Se um curso foi selecionado, criar matrícula
      if (formData.cursoSelecionado) {
        const matriculaData = {
          aluno_id: alunoResult.id,
          curso_id: formData.cursoSelecionado,
          data_matricula: new Date().toISOString().split('T')[0],
          status: 'em_curso'
        };

        const matriculaResponse = await fetch('http://localhost:8080/api/matriculas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(matriculaData),
        });

        if (!matriculaResponse.ok) {
          throw new Error('Erro ao realizar matrícula');
        }
      }

      // Se tudo ocorreu bem, navegar para a página de sucesso
      navigate('/success');
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      setError(error.message || 'Ocorreu um erro ao enviar os dados. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Valores disponibilizados pelo contexto
  const contextValue = {
    formData,
    updateFormData,
    currentStep,
    nextStep,
    prevStep,
    resetForm,
    submitForm,
    isSubmitting,
    error
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm deve ser usado dentro de um FormProvider');
  }
  return context;
};