import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Página não encontrada</h1>
      <p>A página que você está procurando não existe.</p>
      <button onClick={() => navigate('/')}>
        Voltar para o início
      </button>
    </div>
  );
};

export default NotFound;