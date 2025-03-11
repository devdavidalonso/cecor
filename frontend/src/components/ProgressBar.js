// components/ProgressBar.js
import React from 'react';

const ProgressBar = ({ current, total }) => {
  // Criar um array para os passos
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  
  // Calcular a porcentagem de progresso
  const progressPercentage = (current / total) * 100;
  
  return (
    <div className="py-6 px-4 bg-white border-b">
      <div className="max-w-4xl mx-auto">
        {/* Passos com números em desktop */}
        <div className="hidden md:flex justify-between mb-4 relative">
          {steps.map(step => (
            <div 
              key={step} 
              className="flex flex-col items-center z-10"
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  current > step 
                    ? 'bg-primary text-white' 
                    : current === step 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {current > step ? '✓' : step}
              </div>
              <div className={`mt-2 text-xs font-medium ${current >= step ? 'text-primary' : 'text-gray-500'}`}>
                {step === 1 && 'Início'}
                {step === 2 && 'Cursos'}
                {step === 3 && 'Dados Pessoais'}
                {step === 4 && 'Família'}
                {step === 5 && 'Informações'}
                {step === 6 && 'Confirmação'}
              </div>
            </div>
          ))}
          
          {/* Linha de conexão atrás dos círculos */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-in-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Barra de progresso em mobile */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          Página {current} de {total}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;