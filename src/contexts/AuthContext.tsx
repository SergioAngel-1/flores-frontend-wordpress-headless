import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/api';
import alertService from '../services/alertService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  showRegisterModal: boolean;
  setShowRegisterModal: (show: boolean) => void;
  loading: boolean;
  error: string | null;
  isPending: boolean; // Indica si el usuario actual está pendiente de aprobación
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Comprobar si hay un usuario autenticado al cargar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (await authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsPending(!!userData.pending);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // Si hay un error, limpiamos el estado
        setUser(null);
        setIsPending(false);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Intentando login con:', { identifier });
      const userData = await authService.login(identifier, password);
      
      console.log('Login exitoso:', userData);
      setUser(userData);
      setIsAuthenticated(true);
      setIsPending(userData.pending || false);
      setShowLoginModal(false);
      
      if (userData.pending) {
        alertService.warning('Tu cuenta está pendiente de aprobación por un administrador.');
      } else {
        alertService.success('Has iniciado sesión correctamente');
      }
    } catch (error: any) {
      console.error('Error en login:', error);
      setIsAuthenticated(false);
      setUser(null);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de error
        if (error.response.status === 403) {
          setError('Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.');
          alertService.error('Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.');
        } else {
          setError(error.response.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
          alertService.error(error.response.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
        }
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        setError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        alertService.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        // Ocurrió un error al configurar la solicitud
        setError(error.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
        alertService.error(error.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.register(username, email, password);
      // No iniciamos sesión automáticamente después del registro
      // porque el usuario queda pendiente de aprobación
      alertService.success('Registro exitoso. Tu cuenta está pendiente de aprobación por un administrador.');
      setShowRegisterModal(false);
    } catch (error: any) {
      console.error('Error en registro:', error);
      if (error.response) {
        setError(error.response.data?.message || 'Error al registrar usuario.');
        alertService.error(error.response.data?.message || 'Error al registrar usuario.');
      } else {
        setError('Error al registrar usuario. Inténtalo de nuevo.');
        alertService.error('Error al registrar usuario. Inténtalo de nuevo.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsPending(false);
    setIsAuthenticated(false);
    alertService.success('Has cerrado sesión correctamente');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        showLoginModal,
        setShowLoginModal,
        showRegisterModal,
        setShowRegisterModal,
        loading,
        error,
        isPending
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
