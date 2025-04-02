import { wooCommerceApi } from './apiConfig';
import { Product, Category } from '../types/woocommerce';

// Tipos específicos para filtros de productos
export interface ProductFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category?: number;
  tag?: number;
  status?: string;
  featured?: boolean;
  [key: string]: any;
}

// Servicio para productos
const productService = {
  getAll: (params: ProductFilters = {}) => wooCommerceApi.get<Product[]>('/products', { params }),
  
  getById: (id: number, params = {}) => {
    // Si el ID es 0 o negativo, es un producto personalizado y no debemos consultar la API
    if (id <= 0) {
      return Promise.reject({
        response: {
          status: 404,
          data: {
            code: 'custom_product',
            message: 'Este es un producto personalizado y no existe en WooCommerce'
          }
        }
      });
    }
    
    return wooCommerceApi.get<Product>(`/products/${id}`, { params });
  },
  
  getByCategory: (categoryId: number, params = {}) => 
    wooCommerceApi.get<Product[]>('/products', { 
      params: { 
        ...params,
        category: categoryId 
      } 
    }),
    
  search: (searchTerm: string, params = {}) => 
    wooCommerceApi.get<Product[]>('/products', { 
      params: { 
        ...params,
        search: searchTerm 
      },
      timeout: 15000
    }).catch(error => {
      // Si es un error 502, devolver un array vacío para evitar romper la UI
      if (error.response && error.response.status === 502) {
        console.log('Error 502 en búsqueda, devolviendo array vacío');
        return { data: [] };
      }
      // Para otros errores, permitir que se propaguen
      return Promise.reject(error);
    }),
};

// Servicio para categorías
export const categoryService = {
  getAll: (params = {}) => wooCommerceApi.get<Category[]>('/products/categories', { params }),
  getById: (id: number) => wooCommerceApi.get<Category>(`/products/categories/${id}`),
};

export default productService;
