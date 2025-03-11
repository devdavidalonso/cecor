// pages/Welcome.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { nextStep } = useForm();

  const handleStart = () => {
    nextStep(1);
    navigate('/course-selection');
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gray-100">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full text-center">
        <img 
          src="/logo-cecor.jpeg" 
          alt="CECOR Logo" 
          className="h-24 mx-auto mb-6"
          onError={(e) => e.target.src = '/logo-cecor.jpeg'}
        />
        <h1 className="text-3xl font-bold text-primary mb-6">CECOR - Formulário de Inscrição 2025</h1>
        <div className="mb-8 text-left">
          <p className="text-xl font-semibold text-primary mb-4">Que bom que você está aqui!</p>
          
          <p className="mb-4">
            Responda <strong>todas</strong> as perguntas a seguir para realizar sua matrícula 
            nos cursos do CECOR.
          </p>
          
          <p>
            Se tiver alguma dúvida, mande uma mensagem ao nosso Instagram:{' '}
            <a 
              href="https://instagram.com/cecor.lardoalvorecer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              cecor.lardoalvorecer
            </a>
          </p>
        </div>
        
        <button 
          className="bg-primary hover:bg-primary/80 text-white font-bold py-3 px-6 rounded-md transition-colors"
          onClick={handleStart}
        >
          Começar Inscrição
        </button>
      </div>
    </div>
  );
};

export default Welcome;