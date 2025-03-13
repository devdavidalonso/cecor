import { useState } from 'react';
import Link from 'next/link';
import { 
  HiAcademicCap, 
  HiUser, 
  HiClock, 
  HiCalendar, 
  HiExclamationCircle,
  HiOutlineExclamationCircle
} from 'react-icons/hi';
import Button from '../common/Button';
import Card from '../common/Card';

const EnrollmentDetails = ({
  enrollment,
  isAdmin = false,
  onStatusChange,
  onDelete,
  loading = false,
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Formatador de data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Status com cores
  const getStatusStyles = (status) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'concluida':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusSubmit = () => {
    onStatusChange(newStatus);
    setShowStatusModal(false);
  };

  const handleDeleteSubmit = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  if (!enrollment) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Título e Ações */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {enrollment.course?.name || 'Matrícula'}
        </h1>
        
        {isAdmin && (
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => setShowStatusModal(true)}
              disabled={loading}
            >
              Alterar Status
            </Button>
            
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
            >
              Cancelar Matrícula
            </Button>
          </div>
        )}
      </div>
      
      {/* Status da Matrícula */}
      <div className={`border rounded-md p-4 ${getStatusStyles(enrollment.status)}`}>
        <div className="flex items-center">
          <HiExclamationCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">
            Status da Matrícula: {' '}
            {enrollment.status === 'ativa' ? 'Ativa' : 
             enrollment.status === 'concluida' ? 'Concluída' : 'Cancelada'}
          </span>
        </div>
      </div>
      
      {/* Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados do Curso */}
        <Card title="Dados do Curso">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nome do Curso</h3>
              <p className="mt-1 text-base text-gray-900">
                {enrollment.course?.name || 'Curso não disponível'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Carga Horária</h3>
              <p className="mt-1 text-base text-gray-900">
                {enrollment.course?.workload || 'N/A'} horas
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Horário</h3>
              <p className="mt-1 text-base text-gray-900">
                {enrollment.course?.start_time || 'N/A'} - {enrollment.course?.end_time || 'N/A'}
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <Button
                as={Link}
                href={isAdmin 
                  ? `/admin/courses/${enrollment.course?.id}` 
                  : `/student/courses/${enrollment.course?.id}`
                }
                variant="secondary"
                className="w-full"
              >
                Ver Detalhes do Curso
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Dados da Matrícula */}
        <Card title="Dados da Matrícula">
          <div className="space-y-4">
            {isAdmin && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Aluno</h3>
                <p className="mt-1 text-base text-gray-900 flex items-center">
                  <HiUser className="mr-1 h-4 w-4 text-gray-500" />
                  {enrollment.user?.name || 'Aluno não disponível'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {enrollment.user?.email || 'Email não disponível'}
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data de Início</h3>
              <p className="mt-1 text-base text-gray-900">
                {formatDate(enrollment.start_date)}
              </p>
            </div>
            
            {enrollment.end_date && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Término</h3>
                <p className="mt-1 text-base text-gray-900">
                  {formatDate(enrollment.end_date)}
                </p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Data de Matrícula</h3>
              <p className="mt-1 text-base text-gray-900">
                {formatDate(enrollment.created_at)}
              </p>
            </div>
            
            {isAdmin && enrollment.user && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  as={Link}
                  href={`/admin/users/${enrollment.user.id}`}
                  variant="secondary"
                  className="w-full"
                >
                  Ver Perfil do Aluno
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Modal de Alteração de Status */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Alterar Status da Matrícula
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Atual
                </label>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(enrollment.status)}`}>
                  {enrollment.status === 'ativa' ? 'Ativa' : 
                  enrollment.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novo Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Selecione um status</option>
                  <option value="ativa">Ativa</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="primary"
                    onClick={handleStatusSubmit}
                    disabled={!newStatus || loading}
                    isLoading={loading}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <HiOutlineExclamationCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
              Cancelar Matrícula
            </h3>
            
            <p className="text-gray-500 text-center mb-6">
              Tem certeza que deseja cancelar esta matrícula? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Voltar
              </Button>
              
              <Button
                variant="danger"
                onClick={handleDeleteSubmit}
                isLoading={loading}
                disabled={loading}
              >
                Cancelar Matrícula
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnrollmentDetails;