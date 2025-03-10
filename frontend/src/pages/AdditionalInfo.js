// pages/AdditionalInfo.js
import React, { useState } from 'react';
import FormLayout from '../components/FormLayout';
import TextInput from '../components/TextInput';
import RadioGroup from '../components/RadioGroup';
import { useForm } from '../contexts/FormContext';
import '../styles/AdditionalInfo.css';

const AdditionalInfo = () => {
  const { formData, updateFormData } = useForm();
  const [errors, setErrors] = useState({});
  
  const yesNoOptions = [
    { value: 'yes', label: 'SIM' },
    { value: 'no', label: 'NÃO' }
  ];
  
  const periodOptions = [
    { value: 'morning', label: 'MANHÃ' },
    { value: 'afternoon', label: 'TARDE' },
    { value: 'night', label: 'NOITE' }
  ];
  
  const levelOptions = [
    { value: 'elementary', label: 'FUNDAMENTAL' },
    { value: 'highschool', label: 'MÉDIO' },
    { value: 'college', label: 'SUPERIOR' }
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
    if (formData.isWorking === null) {
      newErrors.isWorking = 'Por favor, informe se está trabalhando atualmente.';
    } else if (formData.isWorking === 'yes' && !formData.profession) {
      newErrors.profession = 'Por favor, informe sua profissão.';
    }
    
    if (formData.isStudying === null) {
      newErrors.isStudying = 'Por favor, informe se está estudando atualmente.';
    } else if (formData.isStudying === 'yes') {
      if (!formData.studyPeriod) {
        newErrors.studyPeriod = 'Por favor, informe o período em que estuda.';
      }
      if (!formData.studyLevel) {
        newErrors.studyLevel = 'Por favor, informe o nível de ensino.';
      }
    }
    
    if (formData.previousCourses === null) {
      newErrors.previousCourses = 'Por favor, informe se já fez cursos no CECOR.';
    } else if (formData.previousCourses === 'yes' && !formData.previousCoursesDetails) {
      newErrors.previousCoursesDetails = 'Por favor, informe quais cursos já fez.';
    }
    
    if (!formData.expectations) {
      newErrors.expectations = 'Por favor, compartilhe suas expectativas em relação ao curso.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  return (
    <FormLayout 
      title="Informações Adicionais"
      previousPage="/family-info"
      nextPage="/confirmation"
      validateForm={validateForm}
    >
      <div className="additional-info-form">
        <h3 className="section-header">Gostaríamos de conhecer um pouco mais dos nossos alunos!</h3>
        
        <div className="form-group">
          <label className="question-label">
            Você está trabalhando atualmente?
            {errors.isWorking && <span className="error-message">{errors.isWorking}</span>}
          </label>
          
          <RadioGroup 
            name="isWorking"
            options={yesNoOptions}
            value={formData.isWorking}
            onChange={(value) => handleChange('isWorking', value)}
            orientation="horizontal"
            required
          />
        </div>
        
        {formData.isWorking === 'yes' && (
          <TextInput 
            label="Qual sua profissão?"
            name="profession"
            value={formData.profession}
            onChange={(value) => handleChange('profession', value)}
            required={formData.isWorking === 'yes'}
            error={errors.profession}
          />
        )}
        
        <div className="form-group">
          <label className="question-label">
            Você está estudando atualmente?
            {errors.isStudying && <span className="error-message">{errors.isStudying}</span>}
          </label>
          
          <RadioGroup 
            name="isStudying"
            options={yesNoOptions}
            value={formData.isStudying}
            onChange={(value) => handleChange('isStudying', value)}
            orientation="horizontal"
            required
          />
        </div>
        
        {formData.isStudying === 'yes' && (
          <>
            <div className="form-group">
              <label className="question-label">
                Se você respondeu "SIM" na pergunta anterior, qual o período?
                {errors.studyPeriod && <span className="error-message">{errors.studyPeriod}</span>}
              </label>
              
              <RadioGroup 
                name="studyPeriod"
                options={periodOptions}
                value={formData.studyPeriod}
                onChange={(value) => handleChange('studyPeriod', value)}
                orientation="horizontal"
                required={formData.isStudying === 'yes'}
              />
            </div>
            
            <div className="form-group">
              <label className="question-label">
                Se você respondeu "SIM" na pergunta anterior, qual o nível do ensino?
                {errors.studyLevel && <span className="error-message">{errors.studyLevel}</span>}
              </label>
              
              <RadioGroup 
                name="studyLevel"
                options={levelOptions}
                value={formData.studyLevel}
                onChange={(value) => handleChange('studyLevel', value)}
                orientation="horizontal"
                required={formData.isStudying === 'yes'}
              />
            </div>
          </>
        )}
        
        <div className="form-group">
          <label className="question-label">
            Você já fez cursos/oficinas no CECOR?
            {errors.previousCourses && <span className="error-message">{errors.previousCourses}</span>}
          </label>
          
          <RadioGroup 
            name="previousCourses"
            options={yesNoOptions}
            value={formData.previousCourses}
            onChange={(value) => handleChange('previousCourses', value)}
            orientation="horizontal"
            required
          />
        </div>
        
        {formData.previousCourses === 'yes' && (
          <TextInput 
            label="Se você respondeu 'SIM' na pergunta acima, qual o curso/oficina você fez?"
            name="previousCoursesDetails"
            value={formData.previousCoursesDetails}
            onChange={(value) => handleChange('previousCoursesDetails', value)}
            required={formData.previousCourses === 'yes'}
            error={errors.previousCoursesDetails}
          />
        )}
        
        <TextInput 
          label="O espaço abaixo é para você sugerir algum curso que você ou alguém que você conhece faria, mas que não está na lista ou para você fazer alguma outra sugestão!"
          name="coursesSuggestion"
          value={formData.coursesSuggestion}
          onChange={(value) => handleChange('coursesSuggestion', value)}
        />
        
        <TextInput 
          label="Qual é a sua expectativa em relação ao(s) curso(s) que realizou inscrição?"
          name="expectations"
          value={formData.expectations}
          onChange={(value) => handleChange('expectations', value)}
          required
          error={errors.expectations}
        />
      </div>
    </FormLayout>
  );
};

export default AdditionalInfo;