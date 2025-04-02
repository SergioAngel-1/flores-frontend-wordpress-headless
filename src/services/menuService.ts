import { api } from './apiConfig';
import { MenuCategory } from '../types/menu';

/**
 * Servicio para obtener datos del menú principal desde WordPress
 */
const menuService = {
  /**
   * Obtiene la estructura del menú principal desde WordPress
   * @returns Promise con los datos del menú
   */
  getMainMenu: async (): Promise<MenuCategory[]> => {
    try {
      console.log('Obteniendo menú desde WordPress...');
      
      const response = await api.get('/floresinc/v1/menu', {
        timeout: 10000 // 10 segundos de timeout
      });
      
      console.log('Respuesta del menú:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el menú:', error);
      
      // Mostrar información más detallada para depuración
      if (error instanceof Error) {
        console.error('Detalles del error:', {
          mensaje: error.message
        });
      }
      
      // Devolver un array vacío en caso de error
      return [];
    }
  }
};

export default menuService;
