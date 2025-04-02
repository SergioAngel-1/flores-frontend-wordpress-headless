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

// Caché de productos inválidos (que sabemos que no existen)
const invalidProductIds = new Set<number>();

// Servicio para productos
const productService = {
  getAll: (params: ProductFilters = {}) => wooCommerceApi.get<Product[]>('/products', { params }),
  
  getById: (id: number, params = {}) => {
    // Si el ID es 0 o negativo, es un producto personalizado y no debemos consultar la API
    if (id <= 0 || !id) {
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

    // Si ya sabemos que este producto no existe, evitar la solicitud
    if (invalidProductIds.has(id)) {
      console.log(`Producto ${id} en caché como inválido, evitando solicitud`);
      return Promise.reject({
        response: {
          status: 404,
          data: {
            code: 'woocommerce_rest_product_invalid_id',
            message: 'ID no válido (desde caché)'
          }
        }
      });
    }
    
    return wooCommerceApi.get<Product>(`/products/${id}`, { params })
      .catch(error => {
        // Si el error es 404, añadir el ID a la lista de productos inválidos
        if (error.response && error.response.status === 404) {
          invalidProductIds.add(id);
          console.log(`Añadido producto ${id} a la caché de inválidos`);
        }
        return Promise.reject(error);
      });
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
