import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { HiArrowLeft, HiPencil } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { handleApiError } from '../../../lib/errorHandler';
import { courseService } from '../../../lib/api';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import CourseDetails from '../../../components/courses/CourseDetails';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

export default function AdminCourseDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);

  // Carregar detalhes do curso quando o ID estiver disponível
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await courseService.getCourseById(id, true); // true para indicar que é admin
        setCourse(data);
        
        // Buscar matrículas do curso se disponíveis
        if (data.enrollments) {
          setEnrollments(data.enrollments);
        }
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar detalhes do curso');
        router.push('/admin/courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [id, router, showError]);

  // Excluir curso
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await courseService.deleteCourse(id);
      showSuccess('Curso excluído com sucesso!');
      router.push('/admin/courses');
    } catch (error) {
      handleApiError(error, showError, 'Erro ao excluir curso');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute roleRequired="admin">
      <Layout title={course ? `${course.name} | CECOR` : 'Detalhes do Curso | CECOR'}>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navegação */}
            <div className="mb-6">
              <Button
                as={Link}
                href="/admin/courses"
                variant="secondary"
                className="flex items-center"
              >
                <HiArrowLeft className="mr-2" />
                Voltar para Cursos
              </Button>
            </div>
            
            {/* Conteúdo */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                <CourseDetails
                  course={course}
                  isAdmin={true}
                  enrollments={enrollments}
                  onDelete={handleDelete}
                  loading={deleting}
                />
                
                {/* Seção de Matrículas */}
                {enrollments.length > 0 && (
                  <div className="mt-8">
                    <Card title={`Matrículas (${enrollments.length})`}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aluno
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {enrollments.map((enrollment) => (
                              <tr key={enrollment.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {enrollment.user?.name || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {enrollment.user?.email || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(enrollment.start_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
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
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Link
                                    href={`/admin/enrollments/${enrollment.id}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    Ver Detalhes
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}