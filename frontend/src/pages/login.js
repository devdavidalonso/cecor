import { useState } from 'react';
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

  // Verifica se foi redirecionado por sessão expirada
  const { session } = router.query;
  
  if (session === 'expired' && typeof window !== 'undefined') {
    // Limpar o parâmetro da URL para não mostrar a mensagem novamente em refreshes
    router.replace('/login', undefined, { shallow: true });
    
    // Mostrar mensagem apenas uma vez
    showError('Sua sessão expirou. Por favor, faça login novamente.');
  }

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
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await login(formData);
      console.log(JSON.stringify(response.user))
      showSuccess('Login realizado com sucesso! Redirecionando...');
      
      // Redirecionar com base no perfil
      if (response.user.profile === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error) {
      handleApiError(error, showError, 'Falha no login. Verifique suas credenciais.');
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