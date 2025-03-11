// components/FormLayout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import ProgressBar from './ProgressBar';

const FormLayout = ({ children, title, previousPage, nextPage, validateForm }) => {
  const { currentStep, totalSteps, nextStep, prevStep } = useForm();
  const navigate = useNavigate();

  const handleNext = () => {
    if (validateForm && !validateForm()) {
      return;
    }
    
    if (nextPage) {
      navigate(nextPage);
    }
    nextStep();
  };

  const handlePrevious = () => {
    if (previousPage) {
      navigate(previousPage);
    }
    prevStep();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="bg-white shadow-md py-4 px-6 flex flex-col items-center">
        <img 
          src="/logo-cecor.jpeg" 
          alt="CECOR Logo" 
          className="h-16 mb-2"
          onError={(e) => e.target.src = '/logo-cecor.jpeg'} 
        />
        <h1 className="text-2xl font-bold text-primary">CECOR - Formulário de Inscrição 2025</h1>
      </div>
      
      <ProgressBar current={currentStep} total={totalSteps} />
      
      <div className="flex-1 w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">{title}</h2>
          <div className="mb-8">
            {children}
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            {currentStep > 1 ? (
              <button 
                type="button" 
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={handlePrevious}
              >
                Voltar
              </button>
            ) : (
              <div></div> // Espaço vazio para manter o layout
            )}
            
            <button 
              type="button" 
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              onClick={handleNext}
            >
              {currentStep === totalSteps ? 'Enviar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
      
      <footer className="bg-white py-4 px-6 mt-auto border-t">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <small className="text-gray-600 mb-2 sm:mb-0">Nunca envie senhas pelo Formulário CECOR.</small>
          <div className="text-sm text-gray-600">
            <a href="/terms" target="_blank" className="text-primary hover:underline">Termos de Serviço</a>
            <span className="mx-2">-</span>
            <a href="/privacy" target="_blank" className="text-primary hover:underline">Política de Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FormLayout;