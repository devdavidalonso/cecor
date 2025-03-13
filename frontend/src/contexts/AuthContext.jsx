// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/router';

// Criar o contexto (importante inicializar com um valor padrão)
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

// AuthProvider com todas as funções necessárias
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    // Implementar função de login
    const login = async (credentials) => {
      try {
        console.log('Login com:', credentials);
        const userData = { id: 1, name: 'Usuário Teste', email: credentials.email, role: 'user' };
        setUser(userData);
        return { success: true };
      } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, error: error.message };
      }
    };
  
    // Implementar função de registro
    const register = async (userData) => {
      try {
        console.log('Registrando usuário:', userData);
        setUser({ id: 2, name: userData.name, email: userData.email, role: 'user' });
        return { success: true };
      } catch (error) {
        console.error('Erro no registro:', error);
        return { success: false, error: error.message };
      }
    };
  
    // Implementar logout
    const logout = () => {
      setUser(null);
      router.push('/login');
    };
  
    // Verificar se está autenticado
    const isAuthenticated = () => {
      return !!user;
    };
  
    // Verificar se é admin
    const isAdmin = () => {
      return user?.role === 'admin';
    };
  
    // Função para atualizar usuário
    const updateUser = (userData) => {
      setUser(userData);
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