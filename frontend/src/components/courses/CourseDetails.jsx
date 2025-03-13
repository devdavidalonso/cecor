import { useState } from 'react';
import { 
  HiAcademicCap, 
  HiClock, 
  HiCalendar, 
  HiUserGroup, 
  HiCurrencyDollar,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import Button from '../common/Button';
import Card from '../common/Card';

const CourseDetails = ({
  course,
  isAdmin = false,
  isEnrolled = false,
  onEnroll,
  onDelete,
  enrollments = [],
  loading = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Formatar dias da semana
  const formatWeekDays = (weekDays) => {
    if (!weekDays) return 'Não especificado';
    
    const days = {
      '1': 'Segunda',
      '2': 'Terça',
      '3': 'Quarta',
      '4': 'Quinta',
      '5': 'Sexta',
      '6': 'Sábado',
      '7': 'Domingo'
    };
    
    return weekDays.split(',')
      .map(day => days[day.trim()])
      .join(', ');
  };

  // Cálculo de vagas disponíveis
  const calculateAvailableSpots = () => {
    if (!course) return 0;
    const activeEnrollments = enrollments.filter(e => e.status === 'ativa').length;
    return Math.max(0, course.max_students - activeEnrollments);
  };

  if (!course) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título e Botões */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          {isAdmin ? (
            <>
              <Button
                href={`/admin/courses/${course.id}/edit`}
                variant="primary"
              >
                Editar Curso
              </Button>
              
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Excluir Curso
              </Button>
            </>
          ) : (
            !isEnrolled && (
              <Button
                variant="primary"
                onClick={onEnroll}
                isLoading={loading}
                disabled={loading || calculateAvailableSpots() === 0}
              >
                {calculateAvailableSpots() === 0 ? 'Sem Vagas' : 'Matricular-se'}
              </Button>
            )
          )}
        </div>
      </div>
      
      {/* Informações Principais */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sobre o Curso</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {course.description || 'Nenhuma descrição disponível.'}
            </p>
          </div>
          
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Detalhes</h2>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700">
                <HiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" />
                <span>Carga Horária: <strong>{course.workload} horas</strong></span>
              </li>
              
              <li className="flex items-center text-gray-700">
                <HiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" />
                <span>Horário: <strong>{course.start_time || 'N/A'} - {course.end_time || 'N/A'}</strong></span>
              </li>
              
              <li className="flex items-center text-gray-700">
                <HiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" />
                <span>Dias: <strong>{formatWeekDays(course.week_days)}</strong></span>
              </li>
              
              <li className="flex items-center text-gray-700">
                <HiUserGroup className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" />
                <span>Vagas: <strong>{calculateAvailableSpots()} de {course.max_students} disponíveis</strong></span>
              </li>
              
              {course.duration && (
                <li className="flex items-center text-gray-700">
                  <HiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" />
                  <span>Duração: <strong>{course.duration} semanas</strong></span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </Card>
      
      {/* Confrimação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <HiOutlineExclamationCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
              Excluir Curso
            </h3>
            
            <p className="text-gray-500 text-center mb-6">
              Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              
              <Button
                variant="danger"
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                isLoading={loading}
                disabled={loading}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Status de Matrícula */}
      {isEnrolled && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <HiAcademicCap className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Você está matriculado neste curso.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;