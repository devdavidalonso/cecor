import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../../../contexts/AuthContext';
import { useAlert } from '../../../../contexts/AlertContext';
import { handleApiError } from '../../../../lib/errorHandler';
import { courseService } from '../../../../lib/api';
import Layout from '../../../../components/common/Layout';
import ProtectedRoute from '../../../../components/common/ProtectedRoute';
import Card from '../../../../components/common/Card';
import Button from '../../../../components/common/Button';
import CourseForm from '../../../../components/courses/CourseForm';

export default function EditCourse() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [course, setCourse] = useState(null);

  // Carregar detalhes do curso quando o ID estiver disponível
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await courseService.getCourseById(id, true); // true para indicar que é admin
        setCourse(data);
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar dados do curso');
        router.push('/admin/courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, router, showError]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await courseService.updateCourse(id, formData);
      showSuccess('Curso atualizado com sucesso!');
      router.push(`/admin/courses/${id}`);
    } catch (error) {
      handleApiError(error, showError, 'Erro ao atualizar curso');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute roleRequired="admin">
      <Layout title={course ? `Editar ${course.name} | CECOR` : 'Editar Curso | CECOR'}>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navegação */}
            <div className="mb-6">
              <Button
                as={Link}
                href={`/admin/courses/${id}`}
                variant="secondary"
                className="flex items-center"
              >
                <HiArrowLeft className="mr-2" />
                Voltar para Detalhes do Curso
              </Button>
            </div>
            
            {/* Título */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                {course ? `Editar ${course.name}` : 'Editar Curso'}
              </h1>
              <p className="mt-2 text-gray-600">
                Atualize as informações do curso usando o formulário abaixo
              </p>
            </div>
            
            {/* Formulário */}
            <Card>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <CourseForm
                  course={course}
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