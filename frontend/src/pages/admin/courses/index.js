import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HiPlus, HiSearch, HiX, HiOutlineFilter } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { handleApiError } from '../../../lib/errorHandler';
import { courseService } from '../../../lib/api';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import CourseCard from '../../../components/courses/CourseCard';

export default function AdminCourses() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregando cursos
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getAllCourses();
        setCourses(data);
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar cursos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [showError]);

  // Filtrar cursos
  const getFilteredCourses = () => {
    return courses.filter(course => {
      // Filtro por termo de busca (nome ou descrição)
      return (
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  };

  const filteredCourses = getFilteredCourses();

  return (
    <ProtectedRoute roleRequired="admin">
      <Layout title="Gerenciar Cursos | CECOR">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Gerenciar Cursos</h1>
                <p className="mt-2 text-gray-600">
                  Gerencie todos os cursos do sistema
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Button
                  as={Link}
                  href="/admin/courses/new"
                  variant="primary"
                  className="flex items-center"
                >
                  <HiPlus className="mr-2" />
                  Novo Curso
                </Button>
              </div>
            </div>
            
            {/* Filtros e Busca */}
            <div className="mt-6 mb-8">
              <Card>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-lg font-medium text-gray-900">
                      {filteredCourses.length} 
                      {filteredCourses.length === 1 ? ' curso encontrado' : ' cursos encontrados'}
                    </h2>
                  </div>
                  
                  <div className="w-full md:w-64">
                    <div className="relative">
                      <Input
                        id="search"
                        name="search"
                        type="text"
                        placeholder="Buscar cursos..."
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
            
            {/* Lista de Cursos */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <HiX className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum curso encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Não foram encontrados cursos com os filtros selecionados.
                  </p>
                  <div className="mt-6">
                    <Button
                      as={Link}
                      href="/admin/courses/new"
                      variant="primary"
                    >
                      Criar Novo Curso
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isAdmin={true}
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