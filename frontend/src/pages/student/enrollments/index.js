import { useState, useEffect } from 'react';
import Head from 'next/head';
import { HiFilter, HiSearch, HiX } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { handleApiError } from '../../../lib/errorHandler';
import { enrollmentService } from '../../../lib/api';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import EnrollmentCard from '../../../components/enrollments/EnrollmentCard';

export default function StudentEnrollments() {
  const { user } = useAuth();
  const { error: showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'canceled'

  // Carregar matrículas
  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const data = await enrollmentService.getStudentEnrollments();
        setEnrollments(data);
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar matrículas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollments();
  }, [showError]);

  // Filtrar matrículas
  const getFilteredEnrollments = () => {
    return enrollments.filter(enrollment => {
      // Filtro por termo de busca (nome do curso)
      const matchesSearch = enrollment.course?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por status
      const matchesFilter = 
        filter === 'all' ||
        (filter === 'active' && enrollment.status === 'ativa') ||
        (filter === 'completed' && enrollment.status === 'concluida') ||
        (filter === 'canceled' && enrollment.status === 'cancelada');
      
      return matchesSearch && matchesFilter;
    });
  };

  const filteredEnrollments = getFilteredEnrollments();

  return (
    <ProtectedRoute roleRequired="aluno">
      <Layout title="Minhas Matrículas | CECOR">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Minhas Matrículas</h1>
            
            <div className="mt-2 mb-6">
              <p className="text-gray-600">
                Gerencie suas matrículas nos cursos
              </p>
            </div>
            
            {/* Filtros e Busca */}
            <div className="mt-6 mb-8">
              <Card>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0 flex flex-wrap gap-2">
                    <Button
                      variant={filter === 'all' ? 'primary' : 'secondary'}
                      onClick={() => setFilter('all')}
                    >
                      Todas
                    </Button>
                    
                    <Button
                      variant={filter === 'active' ? 'primary' : 'secondary'}
                      onClick={() => setFilter('active')}
                    >
                      Ativas
                    </Button>
                    
                    <Button
                      variant={filter === 'completed' ? 'primary' : 'secondary'}
                      onClick={() => setFilter('completed')}
                    >
                      Concluídas
                    </Button>
                    
                    <Button
                      variant={filter === 'canceled' ? 'primary' : 'secondary'}
                      onClick={() => setFilter('canceled')}
                    >
                      Canceladas
                    </Button>
                  </div>
                  
                  <div className="w-full md:w-64">
                    <div className="relative">
                      <Input
                        id="search"
                        name="search"
                        type="text"
                        placeholder="Buscar curso..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <HiSearch className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Lista de Matrículas */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <HiX className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma matrícula encontrada</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filter !== 'all'
                      ? 'Não foram encontradas matrículas com os filtros selecionados.'
                      : 'Você ainda não está matriculado em nenhum curso.'}
                  </p>
                  {!searchTerm && filter === 'all' && (
                    <div className="mt-6">
                      <Button
                        href="/student/courses"
                        variant="primary"
                      >
                        Explorar Cursos
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEnrollments.map(enrollment => (
                  <EnrollmentCard
                    key={enrollment.id}
                    enrollment={enrollment}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}