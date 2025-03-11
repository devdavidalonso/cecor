import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';

const CourseSelection = () => {
  const { formData, updateFormData, nextStep } = useForm();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Carregar cursos da API
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    const fetchCursos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/cursos/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': window.location.origin, // Adicione o origin explicitamente
          },
          credentials: 'include', // Importante para CORS
          mode: 'cors' // Adicione este modo explicitamente
        });

        console.log('Resposta recebida:', response);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Erro na resposta:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      setCursos(data);       

      } catch (error) {
        console.log('Erro de CROs', error)
        console.error('Erro ao carregar cursos:', error);
        console.error('Erro completo ao buscar cursos:', error);
        console.error('Tipo de erro:', error.name);
        console.error('Mensagem de erro:', error.message);
        setError('Não foi possível carregar os cursos. Por favor, tente novamente mais tarde.');

        // Fallback com dados simulados para desenvolvimento
        setCursos([
          { id: 1, nome: 'Corte e Costura', descricao: 'Aprenda técnicas de corte e costura.', dia_semana: 'Segunda-feira', horario_inicio: '14:00', horario_fim: '16:00' },
          { id: 2, nome: 'Pintura', descricao: 'Técnicas de pintura em tela.', dia_semana: 'Quarta-feira', horario_inicio: '09:00', horario_fim: '11:00' },
          { id: 3, nome: 'Jiu-jitsu', descricao: 'Aulas de jiu-jitsu para iniciantes.', dia_semana: 'Sábado', horario_inicio: '15:00', horario_fim: '17:00' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    
    
    fetchCursos();
  }, []);

  const handleCourseSelect = (cursoId) => {
    updateFormData({ cursoSelecionado: cursoId });
    nextStep();
  };

  const handleSkip = () => {
    updateFormData({ cursoSelecionado: null });
    nextStep();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProgressBar currentStep={3} totalSteps={5} />
      
      <h1 className="text-2xl font-bold text-center mb-6">Escolha um Curso</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center">
          <p>Carregando cursos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map(curso => {
            // Transformar o curso da API em um objeto com a estrutura esperada pelo CourseCard
            const courseObject = {
              id: curso.id,
              title: curso.nome,
              description: curso.descricao,
              schedule: `${curso.dia_semana || 'Não definido'} | ${curso.horario_inicio || ''} - ${curso.horario_fim || ''}`,
              period: curso.periodo || 'Semestral', // Valor padrão
              hasCertificate: curso.certificado || false // Valor padrão
            };

            return (
              <CourseCard
                key={curso.id}
                course={courseObject}
                selected={formData.cursoSelecionado === curso.id}
                onSelect={handleCourseSelect}
              />
            );
          })}
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Voltar
        </button>
        <button 
          onClick={handleSkip}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Pular esta etapa
        </button>
      </div>
    </div>
  );
};

export default CourseSelection;