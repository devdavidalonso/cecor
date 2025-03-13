import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { handleApiError } from '../../../lib/errorHandler';
import { enrollmentService, userService, courseService } from '../../../lib/api';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import EnrollmentForm from '../../../components/enrollments/EnrollmentForm';

export default function NewEnrollment() {
  const router = useRouter();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  // Carregar dados necessários para o formulário
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Buscar usuários e cursos em paralelo
        const [usersData, coursesData] = await Promise.all([
          userService.getAllUsers(),
          courseService.getAllCourses()
        ]);
        
        // Filtrar apenas usuários ativos e não administradores
        const activeStudents = usersData.filter(user => 
          user.active && user.profile !== 'admin'
        );
        
        setUsers(activeStudents);
        setCourses(coursesData);
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [showError]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await enrollmentService.enrollInCourse({
        user_id: parseInt(formData.user_id),
        course_id: parseInt(formData.course_id)
      });
      
      showSuccess('Matrícula criada com sucesso!');
      router.push('/admin/enrollments');
    } catch (error) {
      handleApiError(error, showError, 'Erro ao criar matrícula');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute roleRequired="admin">
      <Layout title="Nova Matrícula | CECOR">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navegação */}
            <div className="mb-6">
              <Button
                as={Link}
                href="/admin/enrollments"
                variant="secondary"
                className="flex items-center"
              >
                <HiArrowLeft className="mr-2" />
                Voltar para Matrículas
              </Button>
            </div>
            
            {/* Título */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Criar Nova Matrícula</h1>
              <p className="mt-2 text-gray-600">
                Matricule um aluno em um curso
              </p>
            </div>
            
            {/* Formulário */}
            <Card>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <EnrollmentForm
                  users={users}
                  courses={courses}
                  onSubmit={handleSubmit}
                  loading={submitting}
                />
              )}
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}