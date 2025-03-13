import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

export default function Unauthorized() {
  const { user } = useAuth();
  
  // Determinar para onde redirecionar com base no perfil
  const dashboardLink = user?.profile === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  
  return (
    <>
      <Head>
        <title>Acesso Negado | CECOR</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <svg 
                className="h-16 w-16 text-red-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          
          <p className="text-gray-600 mb-8">
            Você não tem permissão para acessar esta página. Verifique com o administrador se precisa de acesso adicional.
          </p>
          
          <div className="space-y-4">
            <Button
              as={Link}
              href={dashboardLink}
              variant="primary"
              className="w-full"
            >
              Voltar ao Dashboard
            </Button>
            
            <Button
              as={Link}
              href="/"
              variant="secondary"
              className="w-full"
            >
              Ir para Página Inicial
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}