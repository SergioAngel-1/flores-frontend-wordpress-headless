import axios from 'axios';
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
      const apiUrl = `${import.meta.env.VITE_WP_API_URL}/wp-json/floresinc/v1/menu`;
      console.log('URL de la API de menú:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        timeout: 10000, // 10 segundos de timeout
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        withCredentials: false // Importante para CORS en desarrollo
      });
      
      console.log('Respuesta del menú:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el menú:', error);
      
      // Mostrar información más detallada para depuración
      if (axios.isAxiosError(error)) {
        console.error('Detalles del error:', {
          mensaje: error.message,
          url: error.config?.url,
          método: error.config?.method,
          respuesta: error.response?.data,
          estado: error.response?.status
        });
      }
      
      // Devolver un array vacío en caso de error
      return [];
    }
  }
};

export default menuService;
