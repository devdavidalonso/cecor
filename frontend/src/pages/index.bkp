import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  // Redirecionar usuários autenticados para o dashboard apropriado
  useEffect(() => {
    if (isAuthenticated() && user) {
      const dashboardPath = user.profile === 'admin' ? '/admin/dashboard' : '/student/dashboard';
      router.push(dashboardPath);
    }
  }, [isAuthenticated, user, router]);
  
  return (
    <>
      <Head>
        <title>CECOR | Sistema de Gestão Educacional</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white">
        {/* Hero Section */}
        <div className="relative pt-20 pb-32 flex content-center items-center justify-center">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center">
              <div className="w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
                <h1 className="text-5xl font-bold leading-tight mt-0 mb-2 text-indigo-800">
                  CECOR
                </h1>
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                  Sistema de Gestão Educacional
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-600 mb-12">
                  Gerencie alunos, cursos, matrículas e acompanhe o desempenho em uma plataforma completa e intuitiva.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    as={Link}
                    href="/login"
                    variant="primary"
                    size="lg"
                  >
                    Entrar
                  </Button>
                  
                  <Button
                    as={Link}
                    href="/register"
                    variant="secondary"
                    size="lg"
                  >
                    Registrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap">
              <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-indigo-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h6 className="text-xl font-semibold">Gestão de Cursos</h6>
                    <p className="mt-2 mb-4 text-gray-600">
                      Crie e gerencie cursos com todos os detalhes: carga horária, horários, professores e materiais.
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-indigo-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h6 className="text-xl font-semibold">Gestão de Alunos</h6>
                    <p className="mt-2 mb-4 text-gray-600">
                      Cadastro completo com dados pessoais, histórico, acompanhamento acadêmico e comunicação.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:pt-12 pt-6 w-full md:w-4/12 px-4 text-center">
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-8 shadow-lg rounded-lg">
                  <div className="px-4 py-5 flex-auto">
                    <div className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 mb-5 shadow-lg rounded-full bg-indigo-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <h6 className="text-xl font-semibold">Relatórios Avançados</h6>
                    <p className="mt-2 mb-4 text-gray-600">
                      Visualize dados e estatísticas importantes para uma gestão eficiente e tomada de decisões.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}