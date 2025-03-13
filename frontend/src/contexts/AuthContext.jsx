// Modificar a função AuthProvider no arquivo src/contexts/AuthContext.jsx

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    // ... código existente ...
  
    // Adicionar esta função
    const updateUser = (userData) => {
      setUser(userData);
    };
  
    // Atualizar o objeto de contexto para incluir updateUser
    const authContextValue = {
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin,
      updateUser, // Adicionar esta linha
    };
  
    return (
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    );
  };