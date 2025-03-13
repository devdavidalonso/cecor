// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService, userService } from '../lib/api'; // Importe seus serviços

// Criar o contexto com valor padrão
const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  logout: () => {},
  isAuthenticated: () => false,
  isAdmin: () => false,
  updateUser: () => {},
});

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// AuthProvider com integração aos serviços reais
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verifica se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se estamos no browser e se existe token
        if (typeof window === 'undefined' || !localStorage.getItem('token')) {
          setLoading(false);
          return;
        }

        // Tentar verificar o token com timeout reduzido
        const tokenPromise = authService.verifyToken().catch(error => {
          console.warn('Erro ao verificar token:', error);
          return false;
        });
        
        const tokenValid = await Promise.race([
          tokenPromise,
          new Promise(resolve => setTimeout(() => resolve(false), 3000)) // 3s timeout
        ]);
        
        if (tokenValid) {
          try {
            const response = await authService.getCurrentUser();
            const userData = response?.data || response;
            if (userData) {
              setUser(userData);
            }
          } catch (userError) {
            console.error('Erro ao obter dados do usuário:', userError);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login integrada ao authService
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      
      if (response) {
        const userData = response.data?.user || response.data || response;
        setUser(userData);
        return { 
          success: true, 
          user: userData
        };
      } else {
        return { 
          success: false, 
          error: 'Resposta da API não contém dados do usuário' 
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Em desenvolvimento, podemos usar fallback para testes
      if (process.env.NODE_ENV !== 'production' && (error.message?.includes('Network Error') || !error.response)) {
        console.warn('API indisponível. Usando dados mockados para desenvolvimento.');
        
        // Simular dados de usuário para desenvolvimento
        const mockUser = { 
          id: 1, 
          name: credentials.email.split('@')[0], 
          email: credentials.email,
          profile: credentials.email.includes('admin') ? 'admin' : 'student',
          role: credentials.email.includes('admin') ? 'admin' : 'user'
        };
        
        // Simular token JWT
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', 'mock-token-for-development');
        }
        
        setUser(mockUser);
        return { success: true, user: mockUser };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Falha na autenticação. Verifique suas credenciais.'
      };
    }
  };

  // Função de registro integrada ao authService
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response) {
        const userInfo = response.data?.user || response.data || response;
        setUser(userInfo);
        return { 
          success: true, 
          user: userInfo
        };
      } else {
        return { 
          success: false, 
          error: 'Resposta da API não contém dados do usuário' 
        };
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Em desenvolvimento, podemos usar fallback para testes
      if (process.env.NODE_ENV !== 'production' && (error.message?.includes('Network Error') || !error.response)) {
        console.warn('API indisponível. Usando dados mockados para desenvolvimento.');
        
        // Simular dados de usuário para desenvolvimento
        const mockUser = { 
          id: Date.now(), 
          name: userData.name || userData.email.split('@')[0], 
          email: userData.email,
          profile: 'student',
          role: 'user'
        };
        
        // Simular token JWT
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', 'mock-token-for-development');
        }
        
        setUser(mockUser);
        return { success: true, user: mockUser };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Falha no registro. Tente novamente.'
      };
    }
  };

  // Função de logout
  const logout = () => {
    try {
      authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      router.push('/login');
    }
  };

  // Verificar se está autenticado
  const isAuthenticated = () => {
    return !!user;
  };

  // Verificar se é admin
  const isAdmin = () => {
    return user?.role === 'admin' || user?.profile === 'admin';
  };

  // Função para atualizar usuário
  const updateUser = async (userData) => {
    try {
      const response = await userService.updateProfile(userData);
      
      if (response) {
        const updatedData = response.data || response;
        setUser({...user, ...updatedData});
        return { success: true, user: updatedData };
      } else {
        return { success: false, error: 'Não foi possível atualizar os dados do usuário' };
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      
      // Em desenvolvimento, podemos simular a atualização
      if (process.env.NODE_ENV !== 'production' && (error.message?.includes('Network Error') || !error.response)) {
        console.warn('API indisponível. Simulando atualização para desenvolvimento.');
        
        const updatedUser = {...user, ...userData};
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Falha ao atualizar dados. Tente novamente.'
      };
    }
  };

  // Objeto de contexto com todas as funções
  const authContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    updateUser,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;