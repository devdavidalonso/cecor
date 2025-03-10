// components/CourseCard.js
import React from 'react';
import '../styles/CourseCard.css';

const CourseCard = ({ course, selected, onSelect }) => {
  const {
    title,
    ageRequirement,
    schedule,
    hasCertificate,
    period,
    id
  } = course;

  return (
    <div 
      className={`course-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(id)}
    >
      <div className="course-header">
        <h3>{title}</h3>
        {ageRequirement && <span className="age-requirement">{ageRequirement}</span>}
      </div>
      
      <div className="course-info">
        <div className="info-item">
          <span className="info-label">Horário:</span>
          <span className="info-value">{schedule}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Período:</span>
          <span className="info-value">{period}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Certificado:</span>
          <span className="info-value">{hasCertificate ? 'Sim' : 'Não'}</span>
        </div>
      </div>
      
      <div className="selection-indicator">
        {selected ? 'Selecionado' : 'Clique para selecionar'}
      </div>
    </div>
  );
};

export default CourseCard;