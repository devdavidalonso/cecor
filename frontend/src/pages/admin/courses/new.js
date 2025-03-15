import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { handleApiError } from '../../../lib/errorHandler';
import { courseService } from '../../../lib/api';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import CourseForm from '../../../components/courses/CourseForm';

export default function NewCourse() {
  const router = useRouter();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      await courseService.createCourse(formData);
      showSuccess('Curso criado com sucesso!');
      router.push('/admin/courses');
    } catch (error) {
      handleApiError(error, showError, 'Erro ao criar curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute roleRequired="admin">
      {/* <Layout title="Novo Curso | CECOR"> */}
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
            
            {/* Título */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Criar Novo Curso</h1>
              <p className="mt-2 text-gray-600">
                Preencha o formulário abaixo para criar um novo curso
              </p>
            </div>
            
            {/* Formulário */}
            <Card>
              <CourseForm
                onSubmit={handleSubmit}
                loading={loading}
              />
            </Card>
          </div>
        </div>
      {/* </Layout> */}
    </ProtectedRoute>
  );
}