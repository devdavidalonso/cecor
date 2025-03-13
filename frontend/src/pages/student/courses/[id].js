import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../../contexts/AuthContext';
import { useAlert } from '../../../contexts/AlertContext';
import { handleApiError } from '../../../lib/errorHandler';
import { courseService, enrollmentService } from '../../../lib/api';
import Layout from '../../../components/common/Layout';
import ProtectedRoute from '../../../components/common/ProtectedRoute';
import CourseDetails from '../../../components/courses/CourseDetails';
import Button from '../../../components/common/Button';

export default function StudentCourseDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollments, setEnrollments] = useState([]);

  // Carregar detalhes do curso quando o ID estiver disponível
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await courseService.getCourseById(id);
        setCourse(data);
        setIsEnrolled(data.is_enrolled || false);
        
        // Buscar matrículas do curso para calcular vagas disponíveis
        if (data.enrollments) {
          setEnrollments(data.enrollments);
        }
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar detalhes do curso');
        router.push('/student/courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourseDetails();
  }, [id, router, showError]);

  // Matricular aluno no curso
  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await enrollmentService.enrollInCourse({ course_id: parseInt(id) });
      setIsEnrolled(true);
      showSuccess('Matrícula realizada com sucesso!');
    } catch (error) {
      handleApiError(error, showError, 'Erro ao realizar matrícula');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <ProtectedRoute roleRequired="aluno">
      <Layout title={course ? `${course.name} | CECOR` : 'Detalhes do Curso | CECOR'}>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navegação */}
            <div className="mb-6">
              <Button
                as={Link}
                href="/student/courses"
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
              <CourseDetails
                course={course}
                isEnrolled={isEnrolled}
                onEnroll={handleEnroll}
                enrollments={enrollments}
                loading={enrolling}
              />
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}