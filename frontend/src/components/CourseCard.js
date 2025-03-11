// components/CourseCard.js
import React from 'react';

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
      className={`cursor-pointer rounded-lg overflow-hidden shadow-md p-5 bg-white transition-all duration-300 hover:shadow-lg ${selected ? 'border-2 border-primary ring-2 ring-primary/30' : 'border border-gray-200'}`}
      onClick={() => onSelect(id)}
    >
      <div className="mb-4 pb-3 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        {ageRequirement && <span className="inline-block mt-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{ageRequirement}</span>}
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex">
          <span className="text-gray-600 font-medium w-28">Horário:</span>
          <span className="text-gray-800">{schedule}</span>
        </div>
        
        <div className="flex">
          <span className="text-gray-600 font-medium w-28">Período:</span>
          <span className="text-gray-800">{period}</span>
        </div>
        
        <div className="flex">
          <span className="text-gray-600 font-medium w-28">Certificado:</span>
          <span className="text-gray-800">{hasCertificate ? 'Sim' : 'Não'}</span>
        </div>
      </div>
      
      <div className={`text-center py-2 mt-4 rounded ${selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
        {selected ? 'Selecionado' : 'Clique para selecionar'}
      </div>
    </div>
  );
};

export default CourseCard;