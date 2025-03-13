import { useRouter } from 'next/router';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, title = 'CECOR | Sistema de Gestão Educacional', hideNavbar = false, hideFooter = false }) => {
  const router = useRouter();
  
  // Verificar se a rota atual é de autenticação (login/registro)
  const isAuthPage = router.pathname === '/login' || router.pathname === '/register';
  
  // Por padrão, mostrar navbar e footer, exceto em páginas de autenticação
  const showNavbar = !hideNavbar && !isAuthPage;
  const showFooter = !hideFooter && !isAuthPage;
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Sistema de gestão educacional para administrar alunos, cursos e matrículas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex flex-col min-h-screen">
        {showNavbar && <Navbar />}
        
        <main className="flex-grow">
          {children}
        </main>
        
        {showFooter && <Footer />}
      </div>
    </>
  );
};

export default Layout;