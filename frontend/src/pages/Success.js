// pages/Success.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import '../styles/Success.css';

const Success = () => {
  const navigate = useNavigate();
  const { resetForm } = useForm();
  
  const handleNewForm = () => {
    resetForm();
    navigate('/');
  };
  
  return (
    <div className="success-container">
      <div className="success-card">
        <img 
          src="/logo-cecor.png" 
          alt="CECOR Logo" 
          className="success-logo"
          onError={(e) => e.target.src = 'https://via.placeholder.com/250x150?text=CECOR'} 
        />
        
        <h1>INSCRIÇÃO FINALIZADA!</h1>
        
        <div className="success-message">
          <p>O início das aulas será dia 15.mar.25!</p>
          <p>Fique atento às publicações no local e em nosso Instagram <strong>cecor.lardoalvorecer</strong></p>
          <p>Até breve!!</p>
        </div>
        
        <div className="success-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleNewForm}
          >
            Fazer Nova Inscrição
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;