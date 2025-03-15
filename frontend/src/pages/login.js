import { useState, useEffect, useRef } from 'react';  // Adicionado useRef
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import { handleApiError } from '../lib/errorHandler';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  const router = useRouter();
  
  // Rastrear se já mostramos a mensagem de sessão expirada
  const sessionMessageShown = useRef(false);

  // Verificar sessão expirada em um useEffect
  useEffect(() => {
    // Verificar se foi redirecionado por sessão expirada
    const { session } = router.query;
    
    // Só exibir a mensagem se ainda não tiver sido mostrada e o parâmetro existir
    if (session === 'expired' && !sessionMessageShown.current) {
      sessionMessageShown.current = true; // Marcar como mostrada
      
      // Mostrar mensagem apenas uma vez
      showError('Sua sessão expirou. Por favor, faça login novamente.');
      
      // Usar setTimeout para adiar a limpeza da URL
      setTimeout(() => {
        router.replace('/login', undefined, { shallow: true });
      }, 0);
    }
  }, [router.query, showError]); // Dependência mais específica - router.query em vez de router

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando for alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
     // Ponto de depuração para examinar as credenciais enviadas
     debugger;

    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await login(formData);
      
      // Se chegou aqui, o login foi bem-sucedido
      showSuccess('Login realizado com sucesso! Redirecionando...');
      
      // // Salvar token (verifica onde o token está na resposta)
      // if (response.token) {
      //   localStorage.setItem('token', response.token);
      // } else if (response.user && response.user.token) {
      //   localStorage.setItem('token', response.user.token);
      // }
      
      // Verificar perfil para redirecionamento
      const userProfile = response.user || {};
      if (userProfile.profile === 'admin' || userProfile.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error) {
      // Agora podemos usar a mensagem amigável diretamente
      if (error.friendlyMessage) {
        showError(error.friendlyMessage);
      } else {
        handleApiError(error, showError, 'Falha no login. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login | CECOR</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">CECOR</h1>
            <h2 className="text-3xl font-bold text-gray-900">
              Entre na sua conta
            </h2>
            <p className="mt-2 text-gray-600">
              Acesse o sistema de gestão educacional
            </p>
          </div>
          
          <Card>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
                autoFocus
              />
              
              <Input
                id="password"
                name="password"
                type="password"
                label="Senha"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                autoComplete="current-password"
              />
              
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={loading}
                  disabled={loading}
                >
                  Entrar
                </Button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Registre-se
                  </Link>
                </p>
              </div>
            </form>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} CECOR. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}