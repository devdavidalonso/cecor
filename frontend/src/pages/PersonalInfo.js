// pages/PersonalInfo.js
import React, { useState } from 'react';
import FormLayout from '../components/FormLayout';
import TextInput from '../components/TextInput';
import { useForm } from '../contexts/FormContext';
import '../styles/PersonalInfo.css';

const PersonalInfo = () => {
  const { formData, updateFormData } = useForm();
  const [errors, setErrors] = useState({});
  
  const handleChange = (field, value) => {
    updateFormData({
      [field]: value
    });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.fullName) {
      newErrors.fullName = 'Por favor, informe seu nome completo.';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'Por favor, informe sua data de nascimento.';
    } else {
      // Validate date format (dd/mm/yy)
      const datePattern = /^\d{2}\/\d{2}\/\d{2}$/;
      if (!datePattern.test(formData.birthDate)) {
        newErrors.birthDate = 'Formato de data inválido. Use dd/mm/aa.';
      }
    }
    
    if (!formData.cpf) {
      newErrors.cpf = 'Por favor, informe seu CPF.';
    } else {
      // Basic CPF format validation (full validation would be more complex)
      const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfPattern.test(formData.cpf)) {
        newErrors.cpf = 'Formato de CPF inválido. Use 000.000.000-00.';
      }
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Por favor, informe um telefone para contato.';
    }
    
    if (!formData.cep) {
      newErrors.cep = 'Por favor, informe seu CEP.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return (
    <FormLayout 
      title="Dados Pessoais"
      previousPage="/course-selection"
      nextPage="/family-info"
      validateForm={validateForm}
    >
      <div className="personal-info-form">
        <TextInput 
          label="Qual o seu nome completo?"
          name="fullName"
          value={formData.fullName}
          onChange={(value) => handleChange('fullName', value)}
          required
          error={errors.fullName}
        />
        
        <TextInput 
          label="Em que dia, mês e ano você nasceu? (Formato: dd/mm/aa)"
          name="birthDate"
          value={formData.birthDate}
          onChange={(value) => handleChange('birthDate', value)}
          required
          mask="date"
          error={errors.birthDate}
        />
        
        <TextInput 
          label="Informe o número do seu CPF (Só números)"
          name="cpf"
          value={formData.cpf}
          onChange={(value) => handleChange('cpf', value)}
          required
          mask="cpf"
          error={errors.cpf}
        />
        
        <TextInput 
          label="Qual seu telefone para contato?"
          name="phone"
          value={formData.phone}
          onChange={(value) => handleChange('phone', value)}
          required
          mask="phone"
          error={errors.phone}
        />
        
        <TextInput 
          label="Há outro número para contato? Qual é de quem é?"
          name="alternativePhone"
          value={formData.alternativePhone}
          onChange={(value) => handleChange('alternativePhone', value)}
          mask="phone"
        />
        
        <TextInput 
          label="Qual seu e-mail?"
          name="email"
          type="email"
          value={formData.email}
          onChange={(value) => handleChange('email', value)}
        />
        
        <TextInput 
          label="Qual seu CEP?"
          name="cep"
          value={formData.cep}
          onChange={(value) => handleChange('cep', value)}
          required
          mask="cep"
          error={errors.cep}
        />
        
        <TextInput 
          label="Qual seu endereço completo?"
          name="address"
          value={formData.address}
          onChange={(value) => handleChange('address', value)}
        />
      </div>
    </FormLayout>
  );
};

export default PersonalInfo;