import Link from 'next/link';
import { HiAcademicCap, HiClock, HiCalendar, HiUserGroup } from 'react-icons/hi';
import Button from '../common/Button';

const CourseCard = ({
  course,
  isAdmin = false,
  isEnrolled = false,
  onEnroll,
  loading = false,
}) => {
  // Determinar o link correto baseado no perfil do usuário
  const courseLink = isAdmin
    ? `/admin/courses/${course.id}`
    : `/student/courses/${course.id}`;

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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">
            {course.name}
          </h3>
          {isEnrolled && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              Matriculado
            </span>
          )}
        </div>
        
        <p className="mt-2 text-sm text-gray-500 line-clamp-3">
          {course.description || 'Sem descrição disponível.'}
        </p>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <HiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span>{course.workload}h de carga horária</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <HiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span>{formatWeekDays(course.week_days)} | {course.start_time} - {course.end_time}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <HiUserGroup className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span>Máximo de {course.max_students} alunos</span>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <Button
            as={Link}
            href={courseLink}
            variant="secondary"
            className="flex-1"
          >
            Ver Detalhes
          </Button>
          
          {!isAdmin && !isEnrolled && (
            <Button
              onClick={() => onEnroll && onEnroll(course.id)}
              variant="primary"
              className="flex-1"
              isLoading={loading}
              disabled={loading}
            >
              Matricular-se
            </Button>
          )}
          
          {isAdmin && (
            <Button
              as={Link}
              href={`/admin/courses/${course.id}/edit`}
              variant="primary"
              className="flex-1"
            >
              Editar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;