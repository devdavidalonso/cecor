// contexts/FormContext.js
import React, { createContext, useState, useContext } from 'react';

const FormContext = createContext();

export const useForm = () => useContext(FormContext);

export const FormProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    // Seleção de cursos
    coursesMorning10h: null,
    coursesMorning9h: null,
    coursesAfternoon: null,
    coursesFriday: null,
    coursesSaturday: null,
    
    // Dados pessoais
    fullName: '',
    birthDate: '',
    cpf: '',
    phone: '',
    alternativePhone: '',
    email: '',
    cep: '',
    address: '',
    
    // Dados familiares
    responsibleName: '',
    relationship: '',
    otherRelationship: '',
    
    // Informações adicionais
    isWorking: null,
    profession: '',
    isStudying: null,
    studyPeriod: '',
    studyLevel: '',
    previousCourses: null,
    previousCoursesDetails: '',
    coursesSuggestion: '',
    expectations: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const updateFormData = (newData) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const resetForm = () => {
    setFormData({
      coursesMorning10h: null,
      coursesMorning9h: null,
      coursesAfternoon: null,
      coursesFriday: null,
      coursesSaturday: null,
      fullName: '',
      birthDate: '',
      cpf: '',
      phone: '',
      alternativePhone: '',
      email: '',
      cep: '',
      address: '',
      responsibleName: '',
      relationship: '',
      otherRelationship: '',
      isWorking: null,
      profession: '',
      isStudying: null,
      studyPeriod: '',
      studyLevel: '',
      previousCourses: null,
      previousCoursesDetails: '',
      coursesSuggestion: '',
      expectations: ''
    });
    setCurrentStep(1);
  };

  return (
    <FormContext.Provider value={{
      formData,
      updateFormData,
      currentStep,
      totalSteps,
      nextStep,
      prevStep,
      goToStep,
      resetForm
    }}>
      {children}
    </FormContext.Provider>
  );
};