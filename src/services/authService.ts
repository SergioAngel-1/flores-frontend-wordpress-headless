import axios from 'axios';
import { User } from './apiConfig';
import alertService from './alertService';

// Servicio de autenticación de WordPress para el frontend
const authService = {
  // Iniciar sesión con WordPress usando JWT Auth
  login: async (identifier: string, password: string): Promise<User> => {
    try {
      console.log('Intentando login con JWT Auth');
      
      // Usamos JWT Auth plugin para WordPress
      const response = await axios.post('/wp-json/jwt-auth/v1/token', {
        username: identifier,
        password: password
      });
      
      console.log('Respuesta de autenticación JWT:', response.data);
      
      if (response.data && response.data.token) {
        // Guardamos el token JWT
        localStorage.setItem('jwt_token', response.data.token);
        
        return {
          id: response.data.user_id || 0,
          username: response.data.user_nicename || identifier,
          email: response.data.user_email || '',
          firstName: response.data.user_firstname || '',
          lastName: response.data.user_lastname || '',
          displayName: response.data.user_display_name || identifier,
          pending: false
        };
      }
      
      throw new Error('No se pudo obtener token JWT');
    } catch (error) {
      console.error('Error en el login:', error);
      
      // Manejo de errores específicos
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 403) {
          alertService.error('Credenciales inválidas. Por favor verifica tu usuario y contraseña.');
          throw new Error('Credenciales inválidas. Por favor verifica tu usuario y contraseña.');
        }
        
        if (error.response.data && error.response.data.message) {
          alertService.error(error.response.data.message);
        }
      }
      
      throw error;
    }
  },
  
  // Registro de usuario
  register: async (username: string, email: string, password: string, phone?: string): Promise<any> => {
    try {
      // Para el registro, necesitamos usar el endpoint personalizado en WordPress
      const userData = {
        username,
        email,
        password,
        phone: phone || ''
      };
      
      // Usamos el endpoint personalizado que debe estar configurado en WordPress
      const response = await axios.post('/wp-json/wp/v2/users/register', userData);
      console.log('Respuesta de registro:', response.data);
      
      if (response.data && response.data.success) {
        alertService.success('Registro exitoso. Tu cuenta está pendiente de aprobación.');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en el registro:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data && error.response.data.message) {
          alertService.error(error.response.data.message);
        } else {
          alertService.error('Error al registrar usuario. Por favor, intenta de nuevo más tarde.');
        }
      } else {
        alertService.error('Error al conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      throw error;
    }
  },
  
  // Comprobar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('jwt_token');
  },
  
  // Obtener el usuario actual
  getCurrentUser: async (): Promise<User> => {
    try {
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        throw new Error('No hay token JWT disponible');
      }
      
      // Primero validar el token
      await axios.post('/wp-json/jwt-auth/v1/token/validate', null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Si la validación es exitosa, obtenemos los datos del usuario
      const userResponse = await axios.get('/wp-json/wp/v2/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Datos del usuario obtenidos correctamente:', userResponse.data);
      
      return {
        id: userResponse.data.id,
        username: userResponse.data.username || userResponse.data.slug,
        email: userResponse.data.email || '',
        firstName: userResponse.data.first_name || '',
        lastName: userResponse.data.last_name || '',
        displayName: userResponse.data.name || userResponse.data.username,
        pending: userResponse.data.pending || false
      };
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      // Si hay error, limpiamos el token
      localStorage.removeItem('jwt_token');
      alertService.error('La sesión ha expirado. Por favor, inicia sesión nuevamente.');
      throw error;
    }
  },
  
  // Cerrar sesión
  logout: (): void => {
    localStorage.removeItem('jwt_token');
    // No mostramos alerta aquí, la mostrará el contexto
  }
};

export default authService;
