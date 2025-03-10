import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="not-found-container">
      <h1>Página não encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <button 
        className="btn btn-primary" 
        onClick={() => navigate('/')}
      >
        Voltar para o início
      </button>
    </div>
  );
};

export default NotFound;