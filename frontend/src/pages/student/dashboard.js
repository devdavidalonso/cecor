import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  HiAcademicCap, 
  HiClock, 
  HiDocumentText, 
  HiCheckCircle,
  HiX,
  HiExclamation
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { handleApiError } from '../../lib/errorHandler';
import { courseService, enrollmentService } from '../../lib/api';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatCard from '../../components/dashboard/StatCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { error: showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [stats, setStats] = useState({
    activeEnrollments: 0,
    completedEnrollments: 0,
    totalHours: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar matrículas e cursos em paralelo
        const [enrollmentsData, coursesData] = await Promise.all([
          enrollmentService.getStudentEnrollments(),
          courseService.getAvailableCourses()
        ]);
        
        setEnrollments(enrollmentsData);
        
        // Filtrar cursos onde o aluno não está matriculado
        setAvailableCourses(coursesData.filter(course => !course.is_enrolled));
        
        // Calcular estatísticas
        const activeEnrollments = enrollmentsData.filter(e => e.status === 'ativa').length;
        const completedEnrollments = enrollmentsData.filter(e => e.status === 'concluida').length;
        
        // Calcular total de horas dos cursos ativos
        const totalHours = enrollmentsData
          .filter(e => e.status === 'ativa')
          .reduce((total, enrollment) => total + (enrollment.course?.workload || 0), 0);
        
        setStats({
          activeEnrollments,
          completedEnrollments,
          totalHours,
        });
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [showError]);

  // Formatador de datas
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Componente de status da matrícula
  const EnrollmentStatus = ({ status }) => {
    let color, icon, text;
    
    switch (status) {
      case 'ativa':
        color = 'text-green-600 bg-green-100';
        icon = <HiCheckCircle className="h-5 w-5" />;
        text = 'Ativa';
        break;
      case 'concluida':
        color = 'text-blue-600 bg-blue-100';
        icon = <HiDocumentText className="h-5 w-5" />;
        text = 'Concluída';
        break;
      case 'cancelada':
        color = 'text-red-600 bg-red-100';
        icon = <HiX className="h-5 w-5" />;
        text = 'Cancelada';
        break;
      default:
        color = 'text-yellow-600 bg-yellow-100';
        icon = <HiExclamation className="h-5 w-5" />;
        text = status;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}
        <span className="ml-1">{text}</span>
      </span>
    );
  };

  return (
    <ProtectedRoute roleRequired="aluno">
      <Layout title="Dashboard do Aluno | CECOR">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            
            {/* Greeting */}
            <div className="mt-2 mb-6">
              <p className="text-gray-600">
                Bem-vindo de volta, <span className="font-medium text-indigo-600">{user?.name}</span>!
              </p>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                  <StatCard
                    title="Cursos Ativos"
                    value={stats.activeEnrollments}
                    icon={HiAcademicCap}
                    linkTo="/student/enrollments"
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                  />
                  
                  <StatCard
                    title="Cursos Concluídos"
                    value={stats.completedEnrollments}
                    icon={HiCheckCircle}
                    linkTo="/student/enrollments?status=concluida"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                  
                  <StatCard
                    title="Carga Horária Total"
                    value={`${stats.totalHours}h`}
                    icon={HiClock}
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                  />
                </div>
                
                {/* Recent Enrollments Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Minhas Matrículas</h2>
                    <Link
                      href="/student/enrollments"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Ver todas
                    </Link>
                  </div>
                  
                  {enrollments.length === 0 ? (
                    <Card>
                      <div className="text-center py-8">
                        <HiAcademicCap className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma matrícula encontrada</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Você ainda não está matriculado em nenhum curso.
                        </p>
                        <div className="mt-6">
                          <Button
                            as={Link}
                            href="/student/courses"
                            variant="primary"
                          >
                            Explorar Cursos
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {enrollments.slice(0, 5).map((enrollment) => (
                          <li key={enrollment.id}>
                            <Link
                              href={`/student/enrollments/${enrollment.id}`}
                              className="block hover:bg-gray-50"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                      {enrollment.course?.name}
                                    </p>
                                  </div>
                                  <div className="ml-2 flex-shrink-0">
                                    <EnrollmentStatus status={enrollment.status} />
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      <HiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                      {enrollment.course?.workload}h
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>
                                      Início: {formatDate(enrollment.start_date)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Available Courses Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Cursos Disponíveis</h2>
                    <Link
                      href="/student/courses"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Ver todos
                    </Link>
                  </div>
                  
                  {availableCourses.length === 0 ? (
                    <Card>
                      <div className="text-center py-8">
                        <HiAcademicCap className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum curso disponível</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Não há cursos disponíveis para matrícula no momento.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableCourses.slice(0, 3).map((course) => (
                        <Card key={course.id}>
                          <div className="flex flex-col h-full">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">{course.name}</h3>
                            <p className="text-sm text-gray-500 mb-4 flex-grow line-clamp-3">
                              {course.description}
                            </p>
                            <div className="mt-auto">
                              <div className="flex items-center text-sm text-gray-500 mb-4">
                                <HiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                {course.workload}h
                              </div>
                              <Button
                                as={Link}
                                href={`/student/courses/${course.id}`}
                                variant="primary"
                                className="w-full"
                              >
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}