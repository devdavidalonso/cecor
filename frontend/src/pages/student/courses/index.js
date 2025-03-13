import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HiAcademicCap, HiSearch, HiCheck, HiX } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { handleApiError } from '../../../lib/errorHandler';
import { courseService, enrollmentService } from '../../../lib/api';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import CourseCard from '../../../components/courses/CourseCard';

export default function StudentCourses() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'enrolled', 'available'

  // Carregando cursos
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const data = await courseService.getAvailableCourses();
        setCourses(data);
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar cursos disponíveis');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, [showError]);

  // Matricular o aluno em um curso
  const handleEnroll = async (courseId) => {
    setEnrollingCourseId(courseId);
    try {
      await enrollmentService.enrollInCourse({ course_id: courseId });
      
      // Atualizar o estado local para mostrar que o aluno está matriculado
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === courseId 
            ? { ...course, is_enrolled: true } 
            : course
        )
      );
      
      showSuccess('Matrícula realizada com sucesso!');
    } catch (error) {
      handleApiError(error, showError, 'Erro ao realizar matrícula');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Filtrar cursos
  const getFilteredCourses = () => {
    return courses.filter(course => {
      // Filtro por termo de busca (nome ou descrição)
      const matchesSearch = 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro por status de matrícula
      const matchesFilter = 
        filter === 'all' ||
        (filter === 'enrolled' && course.is_enrolled) ||
        (filter === 'available' && !course.is_enrolled);
      
      return matchesSearch && matchesFilter;
    });
  };

  const filteredCourses = getFilteredCourses();

  return (
    <ProtectedRoute roleRequired="aluno">
      <Layout title="Cursos Disponíveis | CECOR">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Cursos Disponíveis</h1>
            
            <div className="mt-2 mb-6">
              <p className="text-gray-600">
                Explore os cursos disponíveis e matricule-se nos que interessar
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
                      Todos
                    </Button>
                    
                    <Button
                      variant={filter === 'enrolled' ? 'primary' : 'secondary'}
                      onClick={() => setFilter('enrolled')}
                    >
                      <HiCheck className="mr-1" /> 
                      Matriculados
                    </Button>
                    
                    <Button
                      variant={filter === 'available' ? 'primary' : 'secondary'}
                      onClick={() => setFilter('available')}
                    >
                      <HiAcademicCap className="mr-1" />
                      Disponíveis
                    </Button>
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
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={course.is_enrolled}
                    onEnroll={handleEnroll}
                    loading={enrollingCourseId === course.id}
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