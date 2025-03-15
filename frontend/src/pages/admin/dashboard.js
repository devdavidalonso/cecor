import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  HiAcademicCap, 
  HiUserGroup, 
  HiDocumentText, 
  HiClipboardList,
  HiPlusCircle,
  HiUserAdd,
  HiClock
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { handleApiError } from '../../lib/errorHandler';
import { userService, courseService, enrollmentService } from '../../lib/api';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import StatCard from '../../components/dashboard/StatCard';
import EnrollmentChart from '../../components/dashboard/EnrollmentChart';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { error: showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeEnrollments: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentEnrollments, setRecentEnrollments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados necessários para o dashboard
        const [users, courses, enrollments] = await Promise.all([
          userService.getAllUsers(),
          courseService.getAllCourses(),
          enrollmentService.getAllEnrollments(),
        ]);

        // Ponto de depuração para examinar as credenciais enviadas
        debugger;

        // Calcular estatísticas
        const totalUsers = users.length;
        const totalCourses = courses.length;
        const totalEnrollments = enrollments.length;
        const activeEnrollments =
          enrollments.length > 0
            ? enrollments.filter((e) => e.status === "ativa").length
            : 0;

        setStats({
          totalUsers,
          totalCourses,
          totalEnrollments,
          activeEnrollments,
        });

        if (users.length > 0 && sortedEnrollments.length > 0) {
          // Ordenar usuários por data de criação (mais recentes primeiro)
          const sortedUsers = [...users].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          // Ordenar matrículas por data de criação (mais recentes primeiro)
          const sortedEnrollments = [...enrollments].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );

          setRecentUsers(sortedUsers.slice(0, 5));
          setRecentEnrollments(sortedEnrollments.slice(0, 5));
        }
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

  return (
    <ProtectedRoute roleRequired="admin">
      {/* <Layout title="Dashboard Administrativo | CECOR"> */}
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Painel Administrativo</h1>
            
            {/* Greeting */}
            <div className="mt-2 mb-6">
              <p className="text-gray-600">
                Bem-vindo, <span className="font-medium text-indigo-600">{user?.name}</span>!
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  <StatCard
                    title="Total de Alunos"
                    value={stats.totalUsers}
                    icon={HiUserGroup}
                    linkTo="/admin/users"
                    iconBgColor="bg-indigo-100"
                    iconColor="text-indigo-600"
                  />
                  
                  <StatCard
                    title="Total de Cursos"
                    value={stats.totalCourses}
                    icon={HiAcademicCap}
                    linkTo="/admin/courses"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                  />
                  
                  <StatCard
                    title="Matrículas Ativas"
                    value={stats.activeEnrollments}
                    icon={HiClipboardList}
                    linkTo="/admin/enrollments"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                  />
                  
                  <StatCard
                    title="Total de Matrículas"
                    value={stats.totalEnrollments}
                    icon={HiDocumentText}
                    linkTo="/admin/enrollments"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Button
                    as={Link}
                    href="/admin/courses/new"
                    variant="primary"
                    className="flex items-center justify-center"
                  >
                    <HiPlusCircle className="mr-2 h-5 w-5" />
                    Novo Curso
                  </Button>
                  
                  <Button
                    as={Link}
                    href="/admin/users/new"
                    variant="primary"
                    className="flex items-center justify-center"
                  >
                    <HiUserAdd className="mr-2 h-5 w-5" />
                    Novo Usuário
                  </Button>
                  
                  <Button
                    as={Link}
                    href="/admin/enrollments/new"
                    variant="primary"
                    className="flex items-center justify-center"
                  >
                    <HiClipboardList className="mr-2 h-5 w-5" />
                    Nova Matrícula
                  </Button>
                </div>
                
                {/* Recent Users Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Usuários Recentes</h2>
                    <Link
                      href="/admin/users"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Ver todos
                    </Link>
                  </div>
                  
                  {recentUsers.length === 0 ? (
                    <Card>
                      <div className="text-center py-8">
                        <HiUserGroup className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum usuário encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Não há usuários registrados no sistema.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {recentUsers.map((user) => (
                          <li key={user.id}>
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="block hover:bg-gray-50"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                      {user.name}
                                    </p>
                                  </div>
                                  <div className="ml-2 flex-shrink-0">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      user.active 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {user.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      {user.email}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>
                                      Cadastrado em: {formatDate(user.created_at)}
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
                
                {/* Recent Enrollments Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Matrículas Recentes</h2>
                    <Link
                      href="/admin/enrollments"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Ver todas
                    </Link>
                  </div>
                  
                  {recentEnrollments.length === 0 ? (
                    <Card>
                      <div className="text-center py-8">
                        <HiClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma matrícula encontrada</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Não há matrículas registradas no sistema.
                        </p>
                      </div>
                    </Card>
                  ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {recentEnrollments.map((enrollment) => (
                          <li key={enrollment.id}>
                            <Link
                              href={`/admin/enrollments/${enrollment.id}`}
                              className="block hover:bg-gray-50"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                      {enrollment.user?.name} - {enrollment.course?.name}
                                    </p>
                                  </div>
                                  <div className="ml-2 flex-shrink-0">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      enrollment.status === 'ativa'
                                        ? 'bg-green-100 text-green-800'
                                        : enrollment.status === 'concluida'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-red-100 text-red-800'
                                    }`}>
                                      {enrollment.status === 'ativa' ? 'Ativa' : 
                                       enrollment.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                                    </span>
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
                                      Data: {formatDate(enrollment.start_date)}
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
                {/* Enrollment Charts */}
                <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Matrículas por Status">
                    <div className="mt-4 h-80">
                    <EnrollmentChart
                        type="pie"
                        height={250}
                        data={{
                        labels: ['Ativas', 'Concluídas', 'Canceladas'],
                        datasets: [
                            {
                            data: [
                                stats.activeEnrollments,
                                stats.totalEnrollments - stats.activeEnrollments - (stats.totalEnrollments * 0.1), // Exemplo
                                stats.totalEnrollments * 0.1, // Exemplo de 10% canceladas
                            ],
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 99, 132, 0.6)',
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 99, 132, 1)',
                            ],
                            borderWidth: 1,
                            },
                        ],
                        }}
                    />
                    </div>
                </Card>

                <Card title="Crescimento de Usuários (Últimos 6 meses)">
                    <div className="mt-4 h-80">
                    <EnrollmentChart
                        type="line"
                        height={250}
                        data={{
                        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                        datasets: [
                            {
                            label: 'Novos Usuários',
                            data: [12, 19, 3, 5, 2, 3].map(val => val * (stats.totalUsers / 20)), // Exemplo
                            fill: true,
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            borderColor: 'rgb(99, 102, 241)',
                            },
                        ],
                        }}
                    />
                    </div>
                </Card>
                </div>
              </>
            )}
          </div>
        </div>
      {/* </Layout> */}
    </ProtectedRoute>
  );
}