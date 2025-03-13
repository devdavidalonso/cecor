// src/pages/_app.js
import { useRouter } from 'next/router';
import { AuthProvider } from '../contexts/AuthContext';
import { AlertProvider } from '../contexts/AlertContext';
import Layout from '../components/common/Layout';
import AlertContainer from '../components/common/AlertContainer';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Verificar se a página atual é de autenticação
  const isAuthPage = router.pathname === '/login' || router.pathname === '/register';
  
  return (
    <AuthProvider>
      <AlertProvider>
        <Layout
          hideNavbar={isAuthPage}
          hideFooter={isAuthPage}
          title={pageProps.title || 'CECOR | Sistema de Gestão Educacional'}
        >
          <AlertContainer />
          <Component {...pageProps} />
        </Layout>
      </AlertProvider>
    </AuthProvider>
  );
}

export default MyApp;