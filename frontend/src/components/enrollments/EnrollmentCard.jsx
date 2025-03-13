import Link from 'next/link';
import { HiAcademicCap, HiUser, HiClock, HiCalendar } from 'react-icons/hi';
import Button from '../common/Button';

const EnrollmentCard = ({
  enrollment,
  isAdmin = false,
}) => {
  // Determinar o link correto baseado no perfil do usuário
  const enrollmentLink = isAdmin
    ? `/admin/enrollments/${enrollment.id}`
    : `/student/enrollments/${enrollment.id}`;

  // Formatador de data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Renderizar status com cores diferentes
  const renderStatus = (status) => {
    let bgColor, textColor;
    
    switch (status) {
      case 'ativa':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'concluida':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'cancelada':
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        break;
      default:
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium ${bgColor} ${textColor} rounded-full`}>
        {status === 'ativa' ? 'Ativa' : 
         status === 'concluida' ? 'Concluída' : 'Cancelada'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900">
            {enrollment.course?.name || 'Curso não disponível'}
          </h3>
          {renderStatus(enrollment.status)}
        </div>
        
        <div className="mt-4 space-y-2">
          {isAdmin && (
            <div className="flex items-center text-sm text-gray-500">
              <HiUser className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>{enrollment.user?.name || 'Usuário não disponível'}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <HiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span>{enrollment.course?.workload || 'N/A'}h de carga horária</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <HiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
            <span>Início: {formatDate(enrollment.start_date)}</span>
          </div>
          
          {enrollment.end_date && (
            <div className="flex items-center text-sm text-gray-500">
              <HiCalendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
              <span>Término: {formatDate(enrollment.end_date)}</span>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <Button
            as={Link}
            href={enrollmentLink}
            variant="primary"
            className="w-full"
          >
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentCard;