// components/FormLayout.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import ProgressBar from './ProgressBar';
import '../styles/FormLayout.css';

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
    <div className="form-layout">
      <div className="form-header">
        <img 
          src="/logo-cecor.png" 
          alt="CECOR Logo" 
          className="logo-img"
          onError={(e) => e.target.src = 'https://via.placeholder.com/180x80?text=CECOR'} 
        />
        <h1>CECOR - Formulário de Inscrição 2025</h1>
      </div>
      
      <ProgressBar current={currentStep} total={totalSteps} />
      
      <div className="form-section">
        <h2>{title}</h2>
        <div className="form-content">
          {children}
        </div>
        
        <div className="form-navigation">
          {currentStep > 1 && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handlePrevious}
            >
              Voltar
            </button>
          )}
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleNext}
          >
            {currentStep === totalSteps ? 'Enviar' : 'Próximo'}
          </button>
        </div>
      </div>
      
      <div className="form-footer">
        <small>Nunca envie senhas pelo Formulário CECOR.</small>
        <div className="footer-links">
          <a href="/terms" target="_blank">Termos de Serviço</a>
          <span> - </span>
          <a href="/privacy" target="_blank">Política de Privacidade</a>
        </div>
      </div>
    </div>
  );
};

export default FormLayout;
