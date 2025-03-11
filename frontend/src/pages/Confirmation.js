// pages/Confirmation.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormLayout from '../components/FormLayout';
import { useForm } from '../contexts/FormContext';

// Função para buscar o nome do curso pelo ID
const findCourseName = (courseId, courses) => {
  if (!courseId) return 'Nenhum';
  
  for (const timeSlot in courses) {
    const found = courses[timeSlot].find(course => course.id === courseId);
    if (found) return found.title;
  }
  
  return 'Curso não encontrado';
};

// Lista de cursos (mesma do CourseSelection.js)
const courses = {
  morning10h: [
    { id: 'admin', title: 'Auxiliar administrativo' },
    { id: 'elderly', title: 'Cuidador de idoso' },
    // ... outros cursos
  ],
  // ... outros horários
};

const Confirmation = () => {
  const { formData, resetForm } = useForm();
  const navigate = useNavigate();
  
  const handleSubmit = () => {
    // Aqui você enviaria os dados para o backend
    console.log('Formulário enviado:', formData);
    
    // Navegar para a página de sucesso
    navigate('/success');
  };
  
  return (
    <FormLayout 
      title="Confirmação de Inscrição"
      previousPage="/additional-info"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b border-gray-200">
            Revise suas informações
          </h3>
          
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-3">Cursos Selecionados</h4>
            <ul className="space-y-2">
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Sábados (10h):</span> 
                <span>{findCourseName(formData.coursesMorning10h, courses)}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Sábados (9h):</span> 
                <span>{findCourseName(formData.coursesMorning9h, courses)}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Sábados (14h):</span> 
                <span>{findCourseName(formData.coursesAfternoon, courses)}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Sexta (13h30-16h30):</span> 
                <span>{findCourseName(formData.coursesFriday, courses)}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Terça (13h-16h):</span> 
                <span>{findCourseName(formData.coursesSaturday, courses)}</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-3">Dados Pessoais</h4>
            <ul className="space-y-2">
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Nome:</span> 
                <span>{formData.fullName}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Data de Nascimento:</span> 
                <span>{formData.birthDate}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">CPF:</span> 
                <span>{formData.cpf}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Telefone:</span> 
                <span>{formData.phone}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">E-mail:</span> 
                <span>{formData.email || 'Não informado'}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">CEP:</span> 
                <span>{formData.cep}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Endereço:</span> 
                <span>{formData.address || 'Não informado'}</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-3">Dados Familiares</h4>
            <ul className="space-y-2">
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Nome do Responsável/Mãe:</span> 
                <span>{formData.responsibleName}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-40 text-gray-600">Parentesco:</span> 
                <span>{
                  formData.relationship === 'adult' ? 'Tenho maioridade' :
                  formData.relationship === 'mother' ? 'Mãe' :
                  formData.relationship === 'father' ? 'Pai' :
                  formData.relationship === 'sibling' ? 'Irmã(o) maior de idade' :
                  formData.relationship === 'grandparent' ? 'Avô/avó' :
                  formData.relationship === 'uncle' ? 'Tio/tia' :
                  formData.relationship === 'other' ? formData.otherRelationship : ''
                }</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-3">Informações Adicionais</h4>
            <ul className="space-y-2">
              <li className="flex flex-col sm:flex-row">
                <span className="font-medium w-40 text-gray-600">Trabalhando atualmente:</span> 
                <span>{
                  formData.isWorking === 'yes' ? 'Sim' : 
                  formData.isWorking === 'no' ? 'Não' : 'Não informado'
                }
                {formData.isWorking === 'yes' && ` - ${formData.profession}`}</span>
              </li>
              <li className="flex flex-col sm:flex-row">
                <span className="font-medium w-40 text-gray-600">Estudando atualmente:</span> 
                <span>{
                  formData.isStudying === 'yes' ? 'Sim' : 
                  formData.isStudying === 'no' ? 'Não' : 'Não informado'
                }
                {formData.isStudying === 'yes' && ` - Período: ${
                  formData.studyPeriod === 'morning' ? 'Manhã' :
                  formData.studyPeriod === 'afternoon' ? 'Tarde' :
                  formData.studyPeriod === 'night' ? 'Noite' : ''
                }, Nível: ${
                  formData.studyLevel === 'elementary' ? 'Fundamental' :
                  formData.studyLevel === 'highschool' ? 'Médio' :
                  formData.studyLevel === 'college' ? 'Superior' : ''
                }`}</span>
              </li>
              <li className="flex flex-col sm:flex-row">
                <span className="font-medium w-40 text-gray-600">Já fez cursos no CECOR:</span> 
                <span>{
                  formData.previousCourses === 'yes' ? 'Sim' : 
                  formData.previousCourses === 'no' ? 'Não' : 'Não informado'
                }
                {formData.previousCourses === 'yes' && ` - ${formData.previousCoursesDetails}`}</span>
              </li>
              <li className="flex flex-col">
                <span className="font-medium text-gray-600 mb-1">Expectativas:</span> 
                <span className="text-gray-800">{formData.expectations}</span>
              </li>
            </ul>
          </div>
          
          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row justify-end gap-4">
            <button 
              className="px-6 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
              onClick={() => navigate('/personal-info')}
            >
              Editar Informações
            </button>
            
            <button 
              className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors" 
              onClick={handleSubmit}
            >
              Confirmar Inscrição
            </button>
          </div>
        </div>
      </div>
    </FormLayout>
  );
};

export default Confirmation;