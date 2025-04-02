import { User } from './apiConfig';
import { authService as centralAuthService } from './api';
import alertService from './alertService';

// Servicio de autenticación que utiliza el servicio centralizado
const authService = {
  // Iniciar sesión con WordPress usando JWT Auth
  login: async (identifier: string, password: string): Promise<User> => {
    try {
      console.log('Utilizando servicio de autenticación centralizado');
      
      const userData = await centralAuthService.login(identifier, password);
      return userData;
    } catch (error) {
      console.error('Error en el login:', error);
      
      // Manejo de errores específicos
      if (error instanceof Error) {
        alertService.error(error.message || 'Error al iniciar sesión');
      }
      
      throw error;
    }
  },
  
  // Registro de usuario
  register: async (username: string, email: string, password: string, phone?: string, referralCode?: string): Promise<any> => {
    try {
      const response = await centralAuthService.register(username, email, password, phone, referralCode);
      return response;
    } catch (error) {
      console.error('Error en el registro:', error);
      
      if (error instanceof Error) {
        alertService.error(error.message || 'Error al registrar usuario');
      }
      
      throw error;
    }
  },
  
  // Comprobar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return centralAuthService.isAuthenticated();
  },
  
  // Obtener el usuario actual
  getCurrentUser: async (): Promise<User> => {
    try {
      const userData = await centralAuthService.getCurrentUser();
      return userData;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      throw error;
    }
  },
  
  // Cerrar sesión
  logout: (): void => {
    centralAuthService.logout();
    alertService.success('Sesión cerrada correctamente');
  }
};

export default authService;
