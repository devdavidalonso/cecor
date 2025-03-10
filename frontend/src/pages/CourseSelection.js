// pages/CourseSelection.js
import React, { useState } from 'react';
import FormLayout from '../components/FormLayout';
import CourseCard from '../components/CourseCard';
import { useForm } from '../contexts/FormContext';
import '../styles/CourseSelection.css';

// Lista de cursos por horário
const courses = {
  morning10h: [
    { id: 'admin', title: 'Auxiliar administrativo', ageRequirement: '14 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'elderly', title: 'Cuidador de idoso', ageRequirement: '18 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'culinary', title: 'Culinária', ageRequirement: '12 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'it', title: 'Informática Básica', ageRequirement: 'livre', schedule: 'Sábados 10h', hasCertificate: false, period: 'por módulo' },
    { id: 'dev', title: 'Desenvolvimento de Sistemas', ageRequirement: '12 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'arduino', title: 'Arduino', ageRequirement: '15 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'english-kids', title: 'Inglês infantil', ageRequirement: 'livre', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'english-1', title: 'Inglês Básico 1', ageRequirement: '12 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'english-2', title: 'Inglês Básico 2', ageRequirement: '12 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'english-int', title: 'Inglês Intermediário 1', ageRequirement: '12 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'crochet', title: 'Tricô, crochê e bordado', ageRequirement: '11 anos', schedule: 'Sábados 10h', hasCertificate: true, period: 'anual' },
    { id: 'piano', title: 'Piano', ageRequirement: 'livre', schedule: 'Sábados 10h', hasCertificate: false, period: 'sem certificado' },
    { id: 'jiujitsu-10', title: 'Jiu-jitsu', ageRequirement: 'livre', schedule: 'Sábados 10h', hasCertificate: false, period: 'sem certificado' },
    { id: 'capoeira-10', title: 'Capoeira', ageRequirement: 'livre', schedule: 'Sábados 10h', hasCertificate: false, period: 'sem certificado' },
    { id: 'sewing', title: 'Corte e costura pequenos ajustes', ageRequirement: '12 anos', schedule: 'Sábados 10h', hasCertificate: false, period: 'sem certificado' },
    { id: 'woodwork', title: 'Marcenaria', ageRequirement: 'a confirmar', schedule: 'Sábados 10h', hasCertificate: false, period: 'a confirmar' }
  ],
  morning9h: [
    { id: 'citizenship', title: 'Cidadania', ageRequirement: 'livre', schedule: 'Sábados 9h', hasCertificate: false, period: 'sem certificado' },
    { id: 'piano-9', title: 'Piano', ageRequirement: 'livre', schedule: 'Sábados 9h', hasCertificate: false, period: 'sem certificado' },
    { id: 'guitar', title: 'Violão', ageRequirement: 'livre', schedule: 'Sábados 9h', hasCertificate: false, period: 'sem certificado' },
    { id: 'jiujitsu-9', title: 'Jiu-jitsu', ageRequirement: 'livre', schedule: 'Sábados 9h', hasCertificate: false, period: 'sem certificado' },
    { id: 'capoeira-9', title: 'Capoeira', ageRequirement: 'livre', schedule: 'Sábados 9h', hasCertificate: false, period: 'sem certificado' }
  ],
  afternoon: [
    { id: 'jiujitsu-afternoon', title: 'Jiu-jitsu', ageRequirement: 'livre', schedule: 'Sábados 14h', hasCertificate: false, period: 'sem certificado' }
  ],
  friday: [
    { id: 'painting', title: 'Pintura em tecido e Artesanato', ageRequirement: 'livre', schedule: 'Sexta 13h30 às 16h30', hasCertificate: false, period: 'sem certificado' }
  ],
  saturday: [
    { id: 'sewing-basic', title: 'Corte e Costura Básico', ageRequirement: '12 anos', schedule: '3ª feira 13h às 16h', hasCertificate: true, period: 'anual' }
  ]
};

const CourseSelection = () => {
  const { formData, updateFormData } = useForm();
  const [errors, setErrors] = useState({});
  
  const handleSelectCourse = (timeSlot, courseId) => {
    const fieldName = {
      'morning10h': 'coursesMorning10h',
      'morning9h': 'coursesMorning9h',
      'afternoon': 'coursesAfternoon',
      'friday': 'coursesFriday',
      'saturday': 'coursesSaturday'
    }[timeSlot];
    
    updateFormData({
      [fieldName]: formData[fieldName] === courseId ? null : courseId
    });
  };
  
  const validateForm = () => {
    const atLeastOneCourse = 
      formData.coursesMorning10h || 
      formData.coursesMorning9h || 
      formData.coursesAfternoon || 
      formData.coursesFriday || 
      formData.coursesSaturday;
      
    if (!atLeastOneCourse) {
      setErrors({ general: 'Por favor, selecione pelo menos um curso de interesse.' });
      return false;
    }
    
    setErrors({});
    return true;
  };
  
  return (
    <FormLayout 
      title="Seleção de Cursos"
      previousPage="/"
      nextPage="/personal-info"
      validateForm={validateForm}
    >
      <div className="course-selection">
        {errors.general && <div className="error-message general-error">{errors.general}</div>}
        
        <section className="course-section">
          <h3>Qual curso do CECOR você tem interesse em realizar aos sábados (10h)?</h3>
          <div className="course-grid">
            {courses.morning10h.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                selected={formData.coursesMorning10h === course.id}
                onSelect={() => handleSelectCourse('morning10h', course.id)}
              />
            ))}
          </div>
        </section>
        
        <section className="course-section">
          <h3>Qual curso do CECOR você tem interesse em realizar aos sábados (9h)?</h3>
          <div className="course-grid">
            {courses.morning9h.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                selected={formData.coursesMorning9h === course.id}
                onSelect={() => handleSelectCourse('morning9h', course.id)}
              />
            ))}
          </div>
        </section>
        
        <section className="course-section">
          <h3>Qual curso do CECOR você tem interesse em realizar aos sábados de tarde (14h)?</h3>
          <div className="course-grid">
            {courses.afternoon.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                selected={formData.coursesAfternoon === course.id}
                onSelect={() => handleSelectCourse('afternoon', course.id)}
              />
            ))}
          </div>
        </section>
        
        <section className="course-section">
          <h3>Qual curso do CECOR você tem interesse em realizar na 5ª feira (13h30 às 16h30)?</h3>
          <div className="course-grid">
            {courses.friday.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                selected={formData.coursesFriday === course.id}
                onSelect={() => handleSelectCourse('friday', course.id)}
              />
            ))}
          </div>
        </section>
        
        <section className="course-section">
          <h3>Qual curso do CECOR você tem interesse em realizar às 3ª feira (13h às 16h)?</h3>
          <div className="course-grid">
            {courses.saturday.map(course => (
              <CourseCard 
                key={course.id}
                course={course}
                selected={formData.coursesSaturday === course.id}
                onSelect={() => handleSelectCourse('saturday', course.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </FormLayout>
  );
};

export default CourseSelection;