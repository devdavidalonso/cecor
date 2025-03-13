import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificações só acontecem do lado do cliente
    if (typeof window !== 'undefined') {
      // Aguardar o carregamento da autenticação
      if (!loading) {
        // Se não estiver autenticado, redirecionar para login
        if (!isAuthenticated()) {
          router.replace('/login');
          return;
        }

        // Se um perfil específico for necessário e o usuário não tiver esse perfil
        if (roleRequired && user?.profile !== roleRequired) {
          // Permitir acesso para admins mesmo que não seja o perfil requisitado
          if (user?.profile !== 'admin') {
            router.replace('/unauthorized');
            return;
          }
        }
      }
    }
  }, [loading, user, isAuthenticated, roleRequired, router]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (loading || !isAuthenticated()) {
    return <LoadingScreen />;
  }

  // Se passou por todas as verificações, renderizar o conteúdo protegido
  return children;
};

export default ProtectedRoute;