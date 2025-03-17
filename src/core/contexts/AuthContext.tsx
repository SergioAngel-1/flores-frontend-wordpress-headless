import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error checking authentication:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await apiLogin(identifier, password);
      setUser(loggedInUser);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Error al iniciar sesión. Por favor, verifica tus credenciales e intenta de nuevo.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiRegister(username, email, password);
      // No establecemos el usuario aquí porque normalmente se requiere verificación de correo
      // o aprobación del administrador antes de poder iniciar sesión
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        'Error al registrarse. Por favor, intenta con un correo o nombre de usuario diferente.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiLogout();
      setUser(null);
    } catch (err: any) {
      console.error('Error during logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
