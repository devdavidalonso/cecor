// components/ProgressBar.js
import React from 'react';
import '../styles/ProgressBar.css';

const ProgressBar = ({ current, total }) => {
  // Criar um array para os passos
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  
  // Calcular a porcentagem de progresso
  const progressPercentage = (current / total) * 100;
  
  return (
    <div className="progress-container">
      <div className="progress-steps">
        {steps.map(step => (
          <div 
            key={step} 
            className={`progress-step ${current >= step ? 'active' : ''}`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && 'Início'}
              {step === 2 && 'Cursos'}
              {step === 3 && 'Dados Pessoais'}
              {step === 4 && 'Família'}
              {step === 5 && 'Informações'}
              {step === 6 && 'Confirmação'}
            </div>
          </div>
        ))}
      </div>
      <div className="progress-bar">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className="progress-text">
        Página {current} de {total}
      </div>
    </div>
  );
};

export default ProgressBar;