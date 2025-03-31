import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/apiConfig';
import { authService } from '../services/api';
import { AxiosError } from 'axios';
import logger from '../utils/logger';

// Tipo para las direcciones
export interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// Tipo para el usuario
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  addresses: Address[];
  defaultAddress: Address | null;
  pending: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  newsletter?: boolean;
  active?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string, phone?: string, referralCode?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  saveAddress: (address: Partial<Address>) => Promise<Address>;
  deleteAddress: (addressId: number) => Promise<void>;
  setDefaultAddress: (addressId: number) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  isPending: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  showRegisterModal: boolean;
  setShowRegisterModal: (show: boolean) => void;
  getCurrentUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        logger.info('AuthContext', 'Verificando autenticación...');
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          logger.info('AuthContext', 'No hay token almacenado');
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Configurar el token en los headers para todas las solicitudes
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Obtener datos del usuario
          logger.info('AuthContext', 'Obteniendo datos del usuario con token existente');
          const response = await api.get('/wp/v2/users/me');
          
          if (response.data) {
            logger.info('AuthContext', 'Datos del usuario obtenidos', response.data.id);
            
            const userData = {
              id: response.data.id,
              name: response.data.name,
              email: response.data.email || '', // Asegurarse de que el email no sea undefined
              avatar: response.data.avatar_urls?.['96'] || '',
              addresses: response.data.addresses || [],
              defaultAddress: response.data.defaultAddress || null,
              pending: response.data.pending || false,
              firstName: response.data.first_name || response.data.firstName || '',
              lastName: response.data.last_name || response.data.lastName || '',
              phone: response.data.phone || '',
              birthDate: response.data.birthDate || '',
              gender: response.data.gender || '',
              newsletter: response.data.newsletter || false,
              active: response.data.active || false
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            setIsPending(response.data.pending || false);
          }
        } catch (error) {
          logger.error('AuthContext', 'Error al obtener datos del usuario', error);
          // El token puede ser inválido o estar expirado
          logout();
        }
      } catch (error) {
        logger.error('AuthContext', 'Error general al verificar autenticación', error);
        logout(); // Limpiar token si hay error
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Función para obtener el usuario actual
  const getCurrentUser = async (): Promise<User | null> => {
    try {
      logger.info('AuthContext', 'Obteniendo datos del usuario actual');
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        logger.info('AuthContext', 'No hay token para obtener usuario');
        return null;
      }
      
      // Configurar el token en los headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Obtener datos del usuario
      const response = await api.get('/wp/v2/users/me');
      
      if (response.data) {
        const userData = {
          id: response.data.id,
          name: response.data.name,
          email: response.data.email || '',
          avatar: response.data.avatar_urls?.['96'] || '',
          addresses: response.data.addresses || [],
          defaultAddress: response.data.defaultAddress || null,
          pending: response.data.pending || false,
          firstName: response.data.first_name || response.data.firstName || '',
          lastName: response.data.last_name || response.data.lastName || '',
          phone: response.data.phone || '',
          birthDate: response.data.birthDate || '',
          gender: response.data.gender || '',
          newsletter: response.data.newsletter || false,
          active: response.data.active || false
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        setIsPending(response.data.pending || false);
        
        return userData;
      }
      
      return null;
    } catch (error) {
      logger.error('AuthContext', 'Error al obtener usuario actual', error);
      logout(); // Limpiar token si hay error
      return null;
    }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      logger.info('AuthContext', 'Iniciando sesión con:', { identifier });
      
      try {
        // Intentar el login normal
        const response = await authService.login(identifier, password);
        
        // Verificar que el token esté configurado correctamente
        const token = localStorage.getItem('authToken');
        if (!token) {
          logger.error('AuthContext', 'No se encontró token después del login');
          setError('Error en autenticación: Token no disponible');
          return false;
        }
        
        // Asegurar que el token esté configurado en los headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Actualizar el estado con los datos del usuario
        if (response && response.id) {
          setUser({
            id: response.id,
            name: response.displayName || response.username,
            email: response.email || '',
            avatar: '',
            addresses: [],
            defaultAddress: null,
            pending: response.pending || false,
            firstName: response.firstName || '',
            lastName: response.lastName || '',
            phone: response.phone || '',
            birthDate: response.birthDate || '',
            gender: response.gender || '',
            newsletter: response.newsletter || false,
            active: true
          });
          
          setIsAuthenticated(true);
          setIsPending(response.pending || false);
          logger.info('AuthContext', 'Usuario autenticado correctamente');
          return true;
        }
      } catch (loginError) {
        logger.error('AuthContext', 'Error en primera fase de login', loginError);
        
        // A pesar del error, verificar si tenemos un token
        // Esto puede ocurrir si WordPress devuelve un código 500 pero aún así establece el token
        const token = localStorage.getItem('authToken');
        
        if (token) {
          logger.warn('AuthContext', 'Error en login pero token existente, intentando recuperar sesión');
          
          // Configurar el token y verificar si es válido obteniendo datos del usuario
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Intentar obtener el perfil del usuario para verificar que el token es válido
            const userResponse = await api.get('/wp/v2/users/me');
            
            if (userResponse && userResponse.data && userResponse.data.id) {
              logger.info('AuthContext', 'Recuperación exitosa, token es válido');
              
              // Crear un objeto de usuario básico con los datos disponibles
              const wpUser = userResponse.data;
              setUser({
                id: wpUser.id,
                name: wpUser.name,
                email: wpUser.email || '',
                avatar: wpUser.avatar_urls?.['96'] || '',
                addresses: [],
                defaultAddress: null,
                pending: false,
                firstName: wpUser.first_name || '',
                lastName: wpUser.last_name || '',
                phone: '',
                birthDate: '',
                gender: '',
                newsletter: false,
                active: true
              });
              
              setIsAuthenticated(true);
              
              // ¡La recuperación funcionó!
              return true;
            }
          } catch (recoveryError) {
            logger.error('AuthContext', 'El token no es válido a pesar de existir', recoveryError);
            localStorage.removeItem('authToken');
            delete api.defaults.headers.common['Authorization'];
          }
        }
        
        // Si llegamos aquí, no pudimos recuperar la sesión
        setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
        return false;
      }
      
      // Si el flujo normal falló pero no lanzó una excepción
      setError('No se pudo completar el proceso de autenticación');
      return false;
    } catch (error) {
      logger.error('AuthContext', 'Error general al iniciar sesión', error);
      setError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setIsPending(false);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    phone?: string,
    referralCode?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.register(username, email, password, phone, referralCode);
      
      // No iniciamos sesión automáticamente porque el usuario debe ser aprobado por un administrador
    } catch (err: unknown) {
      logger.error('AuthContext', 'Error al registrarse', err);
      
      const axiosError = err as AxiosError<{message?: string}>;
      if (axiosError.response && axiosError.response.data) {
        // Verificar si hay un mensaje de error en la respuesta
        const errorMessage = axiosError.response.data.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.';
        setError(errorMessage);
      } else {
        setError('Error de conexión. Por favor, intenta más tarde.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Guardar o actualizar dirección
  const saveAddress = async (addressData: Partial<Address>): Promise<Address> => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar límite de 3 direcciones
      if (!addressData.id && user?.addresses && user.addresses.length >= 3) {
        throw new Error('Has alcanzado el límite máximo de 3 direcciones');
      }
      
      const response = await api.post(
        '/floresinc/v1/user/addresses',
        addressData
      );
      
      if (response.data.success) {
        // Actualizar el usuario con las nuevas direcciones
        setUser(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            addresses: response.data.addresses,
            defaultAddress: response.data.addresses.find((addr: Address) => addr.isDefault) || null
          };
        });
        
        return response.data.address;
      } else {
        throw new Error('Error al guardar la dirección');
      }
    } catch (error: any) {
      logger.error('AuthContext', 'Error al guardar dirección', error);
      setError(error.message || 'Error al guardar la dirección');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar dirección
  const deleteAddress = async (addressId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.delete(
        `/floresinc/v1/user/addresses/${addressId}`
      );
      
      if (response.data.success) {
        // Actualizar el usuario con las direcciones actualizadas
        setUser(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            addresses: response.data.addresses,
            defaultAddress: response.data.addresses.find((addr: Address) => addr.isDefault) || null
          };
        });
      } else {
        throw new Error('Error al eliminar la dirección');
      }
    } catch (error: any) {
      logger.error('AuthContext', 'Error al eliminar dirección', error);
      setError(error.message || 'Error al eliminar la dirección');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Establecer dirección predeterminada
  const setDefaultAddress = async (addressId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(
        `/floresinc/v1/user/addresses/default/${addressId}`
      );
      
      if (response.data.success) {
        // Actualizar el usuario con las direcciones actualizadas
        setUser(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            addresses: response.data.addresses,
            defaultAddress: response.data.addresses.find((addr: Address) => addr.isDefault) || null
          };
        });
      } else {
        throw new Error('Error al establecer la dirección predeterminada');
      }
    } catch (error: any) {
      logger.error('AuthContext', 'Error al establecer dirección predeterminada', error);
      setError(error.message || 'Error al establecer la dirección predeterminada');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info('AuthContext', 'Datos enviados a la API:', profileData); // Depuración
      
      // Usar el endpoint correcto que está registrado en user-profile-functions.php
      const response = await api.post('/floresinc/v1/user/profile', profileData);
      
      logger.info('AuthContext', 'Respuesta del servidor:', response.data); // Depuración
      
      if (response.data.success) {
        // Si el servidor devuelve los datos del usuario, usarlos directamente
        if (response.data.user) {
          setUser(prev => {
            if (!prev) return null;
            
            logger.info('AuthContext', 'Actualizando usuario con datos del servidor:', response.data.user); // Depuración
            
            return {
              ...prev,
              firstName: response.data.user.firstName,
              lastName: response.data.user.lastName,
              email: response.data.user.email,
              phone: response.data.user.phone,
              birthDate: response.data.user.birthDate,
              gender: response.data.user.gender,
              newsletter: response.data.user.newsletter,
              active: response.data.user.active
            };
          });
        } else {
          // Si no hay datos del usuario en la respuesta, intentar recargar
          try {
            const userResponse = await api.get('/wp/v2/users/me');
            
            if (userResponse.data) {
              setUser({
                id: userResponse.data.id,
                name: userResponse.data.name,
                email: userResponse.data.email,
                avatar: userResponse.data.avatar_urls?.['96'] || '',
                addresses: userResponse.data.addresses || [],
                defaultAddress: userResponse.data.defaultAddress || null,
                pending: userResponse.data.pending || false,
                firstName: userResponse.data.first_name || userResponse.data.firstName || '',
                lastName: userResponse.data.last_name || userResponse.data.lastName || '',
                phone: userResponse.data.phone || '',
                birthDate: userResponse.data.birthDate || '',
                gender: userResponse.data.gender || '',
                newsletter: userResponse.data.newsletter || false,
                active: userResponse.data.active || false
              });
            } else {
              // Si no podemos recargar los datos, al menos actualizamos con lo que enviamos
              setUser(prev => {
                if (!prev) return null;
                return { ...prev, ...profileData };
              });
            }
          } catch (error) {
            logger.error('AuthContext', 'Error al recargar datos del usuario', error);
            // Si falla la recarga, actualizamos con los datos enviados
            setUser(prev => {
              if (!prev) return null;
              return { ...prev, ...profileData };
            });
          }
        }
      } else {
        throw new Error('Error al actualizar el perfil');
      }
    } catch (error: any) {
      logger.error('AuthContext', 'Error al actualizar perfil', error);
      setError(error.message || 'Error al actualizar el perfil');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        register,
        loading,
        error,
        saveAddress,
        deleteAddress,
        setDefaultAddress,
        updateProfile,
        isPending,
        showLoginModal,
        setShowLoginModal,
        showRegisterModal,
        setShowRegisterModal,
        getCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
