// pages/Welcome.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import '../styles/Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const { goToStep } = useForm();

  const handleStart = () => {
    goToStep(1);
    navigate('/course-selection');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <img 
          src="/logo-cecor.png" 
          alt="CECOR Logo" 
          className="welcome-logo"
          onError={(e) => e.target.src = 'https://via.placeholder.com/250x150?text=CECOR'} 
        />
        <h1>CECOR - Formulário de Inscrição 2025</h1>
        <div className="welcome-content">
          <p className="welcome-message">Que bom que você está aqui!</p>
          
          <p>
            Responda <strong>todas</strong> as perguntas a seguir para realizar sua matrícula 
            nos cursos do CECOR.
          </p>
          
          <p>
            Se tiver alguma dúvida, mande uma mensagem ao nosso Instagram: 
            <a href="https://instagram.com/cecor.lardoalvorecer" target="_blank" rel="noopener noreferrer">
              cecor.lardoalvorecer
            </a>
          </p>
        </div>
        
        <button 
          className="btn btn-large btn-primary"
          onClick={handleStart}
        >
          Começar Inscrição
        </button>
      </div>
    </div>
  );
};

export default Welcome;
