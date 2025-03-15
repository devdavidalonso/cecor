import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { handleApiError } from '../../../lib/errorHandler';
import { enrollmentService } from '../../../lib/api';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import EnrollmentDetails from '../../../components/enrollments/EnrollmentDetails';
import Button from '../../../components/common/Button';

export default function AdminEnrollmentDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [enrollment, setEnrollment] = useState(null);

  // Carregar detalhes da matrícula quando o ID estiver disponível
  useEffect(() => {
    const fetchEnrollmentDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await enrollmentService.getEnrollmentById(id);
        setEnrollment(data);
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar detalhes da matrícula');
        router.push('/admin/enrollments');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollmentDetails();
  }, [id, router, showError]);

  // Alterar status da matrícula
  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const updatedEnrollment = await enrollmentService.updateEnrollment(id, { status: newStatus });
      setEnrollment(updatedEnrollment);
      showSuccess(`Status da matrícula alterado para ${newStatus === 'ativa' ? 'Ativa' : newStatus === 'concluida' ? 'Concluída' : 'Cancelada'}`);
    } catch (error) {
      handleApiError(error, showError, 'Erro ao alterar status da matrícula');
    } finally {
      setUpdating(false);
    }
  };

  // Cancelar matrícula
  const handleDelete = async () => {
    setUpdating(true);
    try {
      await enrollmentService.deleteEnrollment(id);
      showSuccess('Matrícula cancelada com sucesso!');
      router.push('/admin/enrollments');
    } catch (error) {
      handleApiError(error, showError, 'Erro ao cancelar matrícula');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ProtectedRoute roleRequired="admin">
      {/* <Layout title="Gerenciar Matrícula | CECOR"> */}
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
            
            {/* Conteúdo */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <EnrollmentDetails
                enrollment={enrollment}
                isAdmin={true}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                loading={updating}
              />
            )}
          </div>
        </div>
      {/* </Layout> */}
    </ProtectedRoute>
  );
}