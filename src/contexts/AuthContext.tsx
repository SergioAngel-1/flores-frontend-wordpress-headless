import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

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
  register: (username: string, email: string, password: string, phone?: string) => Promise<void>;
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
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (token) {
          // Configurar el token en los headers para todas las solicitudes
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Obtener datos del usuario
          const response = await axios.get(`${import.meta.env.VITE_WP_API_URL}/wp-json/wp/v2/users/me`);
          
          if (response.data) {
            setUser({
              id: response.data.id,
              name: response.data.name,
              email: response.data.email,
              avatar: response.data.avatar_urls?.['96'] || '',
              addresses: response.data.addresses || [],
              defaultAddress: response.data.defaultAddress || null,
              pending: response.data.pending || false,
              firstName: response.data.firstName || '',
              lastName: response.data.lastName || '',
              phone: response.data.phone || '',
              birthDate: response.data.birthDate || '',
              gender: response.data.gender || '',
              newsletter: response.data.newsletter || false,
              active: response.data.active || false
            });
            setIsAuthenticated(true);
            setIsPending(response.data.pending || false);
          }
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${import.meta.env.VITE_WP_API_URL}/wp-json/jwt-auth/v1/token`, {
        username: identifier,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Obtener datos del usuario
        const userResponse = await axios.get(`${import.meta.env.VITE_WP_API_URL}/wp-json/wp/v2/users/me`);
        
        setUser({
          id: userResponse.data.id,
          name: userResponse.data.name,
          email: userResponse.data.email,
          avatar: userResponse.data.avatar_urls?.['96'] || '',
          addresses: userResponse.data.addresses || [],
          defaultAddress: userResponse.data.defaultAddress || null,
          pending: userResponse.data.pending || false,
          firstName: userResponse.data.firstName || '',
          lastName: userResponse.data.lastName || '',
          phone: userResponse.data.phone || '',
          birthDate: userResponse.data.birthDate || '',
          gender: userResponse.data.gender || '',
          newsletter: userResponse.data.newsletter || false,
          active: userResponse.data.active || false
        });
        
        setIsAuthenticated(true);
        setIsPending(userResponse.data.pending || false);
        
        return true;
      }
      
      return false; // Si no hay token en la respuesta
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setIsPending(false);
  };

  const register = async (username: string, email: string, password: string, phone?: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await axios.post(`${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/register`, {
        username: email,
        email,
        password,
        name: username,
        phone
      });
      
      // No iniciamos sesión automáticamente porque el usuario debe ser aprobado por un administrador
    } catch (error) {
      console.error('Error al registrarse:', error);
      setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
      throw error;
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
      
      const response = await axios.post(
        `${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/user/addresses`,
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
      console.error('Error al guardar dirección:', error);
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
      
      const response = await axios.delete(
        `${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/user/addresses/${addressId}`
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
      console.error('Error al eliminar dirección:', error);
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
      
      const response = await axios.post(
        `${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/user/addresses/default/${addressId}`
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
      console.error('Error al establecer dirección predeterminada:', error);
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
      
      const response = await axios.post(`${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/user/profile`, profileData);
      
      if (response.data.success) {
        // Actualizar el usuario con los datos actualizados
        setUser(prev => {
          if (!prev) return null;
          
          return { ...prev, ...profileData };
        });
      } else {
        throw new Error('Error al actualizar el perfil');
      }
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
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
        setShowRegisterModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
