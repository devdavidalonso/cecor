// pages/FamilyInfo.js
import React, { useState } from 'react';
import FormLayout from '../components/FormLayout';
import TextInput from '../components/TextInput';
import RadioGroup from '../components/RadioGroup';
import { useForm } from '../contexts/FormContext';
import '../styles/FamilyInfo.css';

const FamilyInfo = () => {
  const { formData, updateFormData } = useForm();
  const [errors, setErrors] = useState({});
  
  const relationshipOptions = [
    { value: 'adult', label: 'Tenho maioridade' },
    { value: 'mother', label: 'Mãe' },
    { value: 'father', label: 'Pai' },
    { value: 'sibling', label: 'Irmã(o) maior de idade' },
    { value: 'grandparent', label: 'Avô/avó' },
    { value: 'uncle', label: 'Tio/tia' },
    { value: 'other', label: 'Outro:' }
  ];
  
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
    if (!formData.responsibleName) {
      newErrors.responsibleName = 'Por favor, informe o nome do responsável ou sua mãe.';
    }
    
    if (!formData.relationship) {
      newErrors.relationship = 'Por favor, selecione o nível de parentesco.';
    } else if (formData.relationship === 'other' && !formData.otherRelationship) {
      newErrors.otherRelationship = 'Por favor, especifique o parentesco.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return (
    <FormLayout 
      title="Dados da família e responsáveis"
      previousPage="/personal-info"
      nextPage="/additional-info"
      validateForm={validateForm}
    >
      <div className="family-info-form">
        <TextInput 
          label="Se você é menor, qual o nome do seu responsável? Se você é maior, qual o nome da sua mãe?"
          name="responsibleName"
          value={formData.responsibleName}
          onChange={(value) => handleChange('responsibleName', value)}
          required
          error={errors.responsibleName}
        />
        
        <div className="relationship-section">
          <label className="section-label">
            Qual o nível de parentesco com você?
            {errors.relationship && <span className="error-message">{errors.relationship}</span>}
          </label>
          
          <RadioGroup 
            name="relationship"
            options={relationshipOptions}
            value={formData.relationship}
            onChange={(value) => handleChange('relationship', value)}
            required
          />
          
          {formData.relationship === 'other' && (
            <TextInput 
              label="Especifique o parentesco:"
              name="otherRelationship"
              value={formData.otherRelationship}
              onChange={(value) => handleChange('otherRelationship', value)}
              required={formData.relationship === 'other'}
              error={errors.otherRelationship}
            />
          )}
        </div>
      </div>
    </FormLayout>
  );
};

export default FamilyInfo;