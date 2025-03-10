// pages/Confirmation.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import FormLayout from '../components/FormLayout';
import { useForm } from '../contexts/FormContext';
import '../styles/Confirmation.css';

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
      <div className="confirmation-page">
        <div className="confirmation-card">
          <h3>Revise suas informações</h3>
          
          <div className="confirmation-section">
            <h4>Cursos Selecionados</h4>
            <ul className="confirmation-list">
              <li>
                <strong>Sábados (10h):</strong> {findCourseName(formData.coursesMorning10h, courses)}
              </li>
              <li>
                <strong>Sábados (9h):</strong> {findCourseName(formData.coursesMorning9h, courses)}
              </li>
              <li>
                <strong>Sábados (14h):</strong> {findCourseName(formData.coursesAfternoon, courses)}
              </li>
              <li>
                <strong>Sexta (13h30-16h30):</strong> {findCourseName(formData.coursesFriday, courses)}
              </li>
              <li>
                <strong>Terça (13h-16h):</strong> {findCourseName(formData.coursesSaturday, courses)}
              </li>
            </ul>
          </div>
          
          <div className="confirmation-section">
            <h4>Dados Pessoais</h4>
            <ul className="confirmation-list">
              <li><strong>Nome:</strong> {formData.fullName}</li>
              <li><strong>Data de Nascimento:</strong> {formData.birthDate}</li>
              <li><strong>CPF:</strong> {formData.cpf}</li>
              <li><strong>Telefone:</strong> {formData.phone}</li>
              <li><strong>E-mail:</strong> {formData.email || 'Não informado'}</li>
              <li><strong>CEP:</strong> {formData.cep}</li>
              <li><strong>Endereço:</strong> {formData.address || 'Não informado'}</li>
            </ul>
          </div>
          
          <div className="confirmation-section">
            <h4>Dados Familiares</h4>
            <ul className="confirmation-list">
              <li><strong>Nome do Responsável/Mãe:</strong> {formData.responsibleName}</li>
              <li>
                <strong>Parentesco:</strong> {
                  formData.relationship === 'adult' ? 'Tenho maioridade' :
                  formData.relationship === 'mother' ? 'Mãe' :
                  formData.relationship === 'father' ? 'Pai' :
                  formData.relationship === 'sibling' ? 'Irmã(o) maior de idade' :
                  formData.relationship === 'grandparent' ? 'Avô/avó' :
                  formData.relationship === 'uncle' ? 'Tio/tia' :
                  formData.relationship === 'other' ? formData.otherRelationship : ''
                }
              </li>
            </ul>
          </div>
          
          <div className="confirmation-section">
            <h4>Informações Adicionais</h4>
            <ul className="confirmation-list">
              <li>
                <strong>Trabalhando atualmente:</strong> {
                  formData.isWorking === 'yes' ? 'Sim' : 
                  formData.isWorking === 'no' ? 'Não' : 'Não informado'
                }
                {formData.isWorking === 'yes' && ` - ${formData.profession}`}
              </li>
              <li>
                <strong>Estudando atualmente:</strong> {
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
                }`}
              </li>
              <li>
                <strong>Já fez cursos no CECOR:</strong> {
                  formData.previousCourses === 'yes' ? 'Sim' : 
                  formData.previousCourses === 'no' ? 'Não' : 'Não informado'
                }
                {formData.previousCourses === 'yes' && ` - ${formData.previousCoursesDetails}`}
              </li>
              <li><strong>Expectativas:</strong> {formData.expectations}</li>
            </ul>
          </div>
          
          <div className="confirmation-actions">
            <button 
              className="btn btn-lg btn-danger" 
              onClick={() => navigate('/personal-info')}
            >
              Editar Informações
            </button>
            
            <button 
              className="btn btn-lg btn-success" 
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